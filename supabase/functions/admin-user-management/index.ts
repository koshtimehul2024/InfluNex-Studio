import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security event types
const SECURITY_EVENTS = {
  ADMIN_LOGIN_FAILED: 'admin_login_failed',
  ADMIN_UNAUTHORIZED_ACCESS: 'admin_unauthorized_access',
  ADMIN_CREATED: 'admin_created',
  ADMIN_DELETED: 'admin_deleted',
  ADMIN_ACTION_FAILED: 'admin_action_failed',
};

// Log security event helper
async function logSecurityEvent(
  supabase: any,
  eventType: string,
  email: string | null,
  ipAddress: string,
  userAgent: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('security_logs').insert({
      event_type: eventType,
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });
    console.log(`Security event logged: ${eventType}`);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// =====================================================================
// SECURITY: Admin User Management Edge Function
// This function handles admin operations that require service role access
// All operations verify the caller is an authenticated admin first
// =====================================================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP and user agent for logging
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   req.headers.get('cf-connecting-ip') ||
                   'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Admin client (for privileged operations)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    
    // User client (to verify the caller's identity)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      await logSecurityEvent(adminClient, SECURITY_EVENTS.ADMIN_LOGIN_FAILED, null, clientIP, userAgent, {
        reason: 'missing_auth_header',
      });
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      await logSecurityEvent(adminClient, SECURITY_EVENTS.ADMIN_LOGIN_FAILED, null, clientIP, userAgent, {
        reason: 'invalid_token',
        error: userError?.message,
      });
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================================
    // SECURITY: Verify caller is an admin using server-side check
    // =====================================================================
    const { data: isAdmin, error: roleError } = await adminClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error('Admin verification failed for user:', user.id);
      await logSecurityEvent(adminClient, SECURITY_EVENTS.ADMIN_UNAUTHORIZED_ACCESS, user.email || null, clientIP, userAgent, {
        user_id: user.id,
        attempted_action: 'admin_access',
      });
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, email, password, targetUserId } = body;

    // =====================================================================
    // ACTION: Create new admin user
    // =====================================================================
    if (action === 'create_admin') {
      // Validate input
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate password strength
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters with letters and numbers' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check current admin count (max 2 admins)
      const { count: adminCount } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount && adminCount >= 2) {
        return new Response(
          JSON.stringify({ error: 'Maximum number of admins (2) reached' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if email already exists
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const emailExists = existingUsers?.users?.some(
        u => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the new admin user
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true
      });

      if (createError || !newUser?.user) {
        console.error('User creation error:', createError);
        return new Response(
          JSON.stringify({ error: createError?.message || 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Assign admin role
      const { error: roleInsertError } = await adminClient
        .from('user_roles')
        .insert({ user_id: newUser.user.id, role: 'admin' });

      if (roleInsertError) {
        // Rollback: delete the user if role assignment fails
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        console.error('Role assignment error:', roleInsertError);
        return new Response(
          JSON.stringify({ error: 'Failed to assign admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('New admin created successfully:', newUser.user.id);
      
      // Log admin creation
      await logSecurityEvent(adminClient, SECURITY_EVENTS.ADMIN_CREATED, email, clientIP, userAgent, {
        created_by: user.id,
        new_admin_id: newUser.user.id,
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin user created successfully',
          userId: newUser.user.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================================
    // ACTION: Delete admin user
    // =====================================================================
    if (action === 'delete_admin') {
      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: 'Target user ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Prevent self-deletion
      if (targetUserId === user.id) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete your own account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify target is an admin
      const { data: targetIsAdmin } = await adminClient
        .rpc('has_role', { _user_id: targetUserId, _role: 'admin' });

      if (!targetIsAdmin) {
        return new Response(
          JSON.stringify({ error: 'Target user is not an admin' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete the role first
      const { error: roleDeleteError } = await adminClient
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      if (roleDeleteError) {
        console.error('Role deletion error:', roleDeleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to remove admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete the user
      const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

      if (userDeleteError) {
        console.error('User deletion error:', userDeleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Admin deleted successfully:', targetUserId);
      
      // Log admin deletion
      await logSecurityEvent(adminClient, SECURITY_EVENTS.ADMIN_DELETED, null, clientIP, userAgent, {
        deleted_by: user.id,
        deleted_admin_id: targetUserId,
      });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Admin user deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================================
    // ACTION: List admin users
    // =====================================================================
    if (action === 'list_admins') {
      const { data: adminRoles, error: listError } = await adminClient
        .from('user_roles')
        .select('user_id, created_at')
        .eq('role', 'admin');

      if (listError) {
        return new Response(
          JSON.stringify({ error: 'Failed to list admins' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user details for each admin
      const admins = [];
      for (const role of adminRoles || []) {
        const { data: userData } = await adminClient.auth.admin.getUserById(role.user_id);
        if (userData?.user) {
          admins.push({
            id: userData.user.id,
            email: userData.user.email,
            created_at: role.created_at,
            is_current_user: userData.user.id === user.id
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, admins }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in admin-user-management function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
