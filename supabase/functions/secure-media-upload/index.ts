import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types and buckets
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_BUCKETS = ['portfolio', 'logos'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Security event types
const SECURITY_EVENTS = {
  MEDIA_UPLOAD_SUCCESS: 'media_upload_success',
  MEDIA_UPLOAD_FAILED: 'media_upload_failed',
  MEDIA_DELETE_SUCCESS: 'media_delete_success',
  MEDIA_DELETE_FAILED: 'media_delete_failed',
  UNAUTHORIZED_ACCESS: 'media_unauthorized_access',
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
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID().slice(0, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'webp';
  return `${timestamp}-${random}.${extension}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      await logSecurityEvent(adminClient, SECURITY_EVENTS.UNAUTHORIZED_ACCESS, null, clientIP, userAgent, {
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

    // Get authenticated user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      await logSecurityEvent(adminClient, SECURITY_EVENTS.UNAUTHORIZED_ACCESS, null, clientIP, userAgent, {
        reason: 'invalid_token',
      });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: isAdmin } = await adminClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      await logSecurityEvent(adminClient, SECURITY_EVENTS.UNAUTHORIZED_ACCESS, user.email || null, clientIP, userAgent, {
        reason: 'not_admin',
        user_id: user.id,
      });
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const contentType = req.headers.get('content-type') || '';
    
    if (req.method === 'DELETE') {
      // Handle delete request
      const body = await req.json();
      const { path, bucket } = body;

      if (!path || !bucket || !ALLOWED_BUCKETS.includes(bucket)) {
        return new Response(
          JSON.stringify({ error: 'Invalid path or bucket' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete from storage
      const { error: deleteError } = await adminClient.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) {
        await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_DELETE_FAILED, user.email || null, clientIP, userAgent, {
          path, bucket, error: deleteError.message,
        });
        return new Response(
          JSON.stringify({ error: 'Failed to delete file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete from media_library
      await adminClient.from('media_library').delete().eq('path', path).eq('bucket', bucket);

      await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_DELETE_SUCCESS, user.email || null, clientIP, userAgent, {
        path, bucket,
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST' && contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const bucket = formData.get('bucket') as string;
      const folder = formData.get('folder') as string || '';

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
        return new Response(
          JSON.stringify({ error: 'Invalid bucket' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_UPLOAD_FAILED, user.email || null, clientIP, userAgent, {
          reason: 'invalid_mime_type', mime_type: file.type,
        });
        return new Response(
          JSON.stringify({ error: 'Invalid file type. Only JPG, PNG, WEBP allowed.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_UPLOAD_FAILED, user.email || null, clientIP, userAgent, {
          reason: 'file_too_large', size: file.size,
        });
        return new Response(
          JSON.stringify({ error: 'File size exceeds 2MB limit' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate secure filename
      const filename = generateFilename(file.name);
      const filePath = folder ? `${folder}/${filename}` : filename;

      // Upload to storage using service role (bypasses client-side RLS)
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_UPLOAD_FAILED, user.email || null, clientIP, userAgent, {
          reason: 'storage_error', error: uploadError.message,
        });
        return new Response(
          JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get public URL
      const { data: urlData } = adminClient.storage.from(bucket).getPublicUrl(filePath);

      // Record in media_library
      const { error: insertError } = await adminClient.from('media_library').insert({
        filename,
        original_filename: file.name,
        path: filePath,
        bucket,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.id,
      });

      if (insertError) {
        console.error('Failed to record media in library:', insertError);
        // Don't fail the upload, just log the error
      }

      await logSecurityEvent(adminClient, SECURITY_EVENTS.MEDIA_UPLOAD_SUCCESS, user.email || null, clientIP, userAgent, {
        path: filePath, bucket, size: file.size,
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          path: filePath,
          url: urlData.publicUrl,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request method' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in secure-media-upload:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
