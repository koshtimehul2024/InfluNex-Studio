import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'login_failed'
  | 'login_success'
  | 'logout'
  | 'password_reset_requested'
  | 'password_changed';

/**
 * Logs security events to the security_logs table via edge function
 * Note: Client-side logging is limited - most sensitive events are logged server-side
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  email: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    // For login_failed events, we use the submit-contact-like approach
    // by calling a dedicated logging endpoint or inserting directly if admin
    const { data: { session } } = await supabase.auth.getSession();
    
    // Only log if we have a session (for successful logins, password changes, etc.)
    // Failed logins are logged server-side in edge functions
    if (session) {
      // Type-safe insert
      const logEntry = {
        event_type: eventType,
        email,
        ip_address: 'client',
        user_agent: navigator.userAgent,
        details: details as any,
      };
      await supabase.from('security_logs').insert(logEntry);
    }
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error('Failed to log security event:', error);
  }
}
