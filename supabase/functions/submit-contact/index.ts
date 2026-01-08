import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "koshtimehul2022@gmail.com";
const RATE_LIMIT_SECONDS = 60;

// Security event types
const SECURITY_EVENTS = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_INPUT: 'invalid_input_attempt',
  CONTACT_SUBMISSION: 'contact_submission',
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
// SECURITY: HTML Entity Escaping to prevent XSS/HTML Injection
// =====================================================================
function escapeHtml(text: string): string {
  if (!text) return '';
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return text.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char] || char);
}

// =====================================================================
// SECURITY: Input Sanitization - Remove dangerous patterns
// =====================================================================
function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, 'data-blocked:');
  
  // Trim and limit length
  return sanitized.trim().substring(0, 5000);
}

// =====================================================================
// SECURITY: Email Validation
// =====================================================================
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// =====================================================================
// SECURITY: Phone Validation (optional field)
// =====================================================================
function isValidPhone(phone: string | null): boolean {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\+\-\(\)\.]+$/;
  return phoneRegex.test(phone) && phone.length <= 20;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with SERVICE ROLE KEY (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP address and user agent for rate limiting and logging
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Contact form submission from IP:', clientIP);

    // =====================================================================
    // SECURITY: Server-side Rate Limiting (enforced via service role)
    // =====================================================================
    const { data: rateLimitData, error: rateLimitError } = await supabaseClient
      .from('contact_rate_limit')
      .select('last_submission_at')
      .eq('ip_address', clientIP)
      .maybeSingle();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Rate limit check error:', rateLimitError);
      throw rateLimitError;
    }

    // Enforce rate limit strictly server-side
    if (rateLimitData) {
      const lastSubmission = new Date(rateLimitData.last_submission_at);
      const now = new Date();
      const secondsSinceLastSubmission = (now.getTime() - lastSubmission.getTime()) / 1000;

      if (secondsSinceLastSubmission < RATE_LIMIT_SECONDS) {
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - secondsSinceLastSubmission);
        console.log(`Rate limit enforced for IP ${clientIP}. Wait: ${remainingSeconds}s`);
        
        // Log rate limit violation
        await logSecurityEvent(supabaseClient, SECURITY_EVENTS.RATE_LIMIT_EXCEEDED, null, clientIP, userAgent, {
          remaining_seconds: remainingSeconds,
        });
        
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Please wait before sending another inquiry. Try again in ${remainingSeconds} seconds.`,
            remainingSeconds
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  const { name, email, phone, message, service, user_type } = body;

    // =====================================================================
    // SECURITY: Strict Input Validation
    // =====================================================================
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      await logSecurityEvent(supabaseClient, SECURITY_EVENTS.INVALID_INPUT, email || null, clientIP, userAgent, {
        reason: 'invalid_name',
        provided_length: name?.length || 0,
      });
      return new Response(
        JSON.stringify({ error: 'Name must be between 2 and 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      await logSecurityEvent(supabaseClient, SECURITY_EVENTS.INVALID_INPUT, email || null, clientIP, userAgent, {
        reason: 'invalid_email',
      });
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Message is now optional - only validate if provided
    if (message && typeof message === 'string' && message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message must not exceed 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all inputs before storing
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone ? sanitizeInput(phone.trim()) : null;
    const sanitizedMessage = message ? sanitizeInput(message.trim()) : null;
    const sanitizedService = service ? sanitizeInput(String(service).trim()) : null;
    const sanitizedUserType = user_type ? sanitizeInput(String(user_type).trim()) : null;

    // =====================================================================
    // Store inquiry in database (using service role - bypasses RLS)
    // =====================================================================
    const { data: inquiryData, error: inquiryError } = await supabaseClient
      .from('inquiries')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage || 'No message provided',
        user_type: sanitizedUserType,
        status: 'new'
      })
      .select()
      .single();

    if (inquiryError) {
      console.error('Inquiry insert error:', inquiryError);
      throw inquiryError;
    }

    console.log('Inquiry created successfully:', inquiryData.id);

    // Log successful contact submission
    await logSecurityEvent(supabaseClient, SECURITY_EVENTS.CONTACT_SUBMISSION, sanitizedEmail, clientIP, userAgent, {
      inquiry_id: inquiryData.id,
      has_phone: !!sanitizedPhone,
    });

    // Update rate limit (using service role - bypasses RLS)
    const { error: updateError } = await supabaseClient
      .from('contact_rate_limit')
      .upsert({
        ip_address: clientIP,
        last_submission_at: new Date().toISOString(),
      }, {
        onConflict: 'ip_address'
      });

    if (updateError) {
      console.error('Rate limit update error:', updateError);
      // Don't fail the request if rate limit update fails
    }

    // =====================================================================
    // SECURITY: Send email with HTML-escaped content
    // =====================================================================
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;
    let emailError = null;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const timestamp = new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone: 'Asia/Kolkata'
        });

        // SECURITY: Escape ALL user input before embedding in HTML
        const safeName = escapeHtml(sanitizedName);
        const safeEmail = escapeHtml(sanitizedEmail);
        const safePhone = sanitizedPhone ? escapeHtml(sanitizedPhone) : null;
        const safeMessage = sanitizedMessage ? escapeHtml(sanitizedMessage).replace(/\n/g, '<br>') : 'No message provided';
        const safeService = sanitizedService ? escapeHtml(sanitizedService) : null;
        const safeUserType = sanitizedUserType ? escapeHtml(sanitizedUserType) : null;

        const emailResponse = await resend.emails.send({
          from: 'InfluNex Studio <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `🔔 New Inquiry from ${safeName} - InfluNex Studio`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0E0E0E; color: #ffffff; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #F2C94C; font-size: 28px; margin: 0;">InfluNex Studio</h1>
                  <p style="color: #888; margin-top: 5px;">New Contact Form Submission</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%); border: 1px solid #333; border-radius: 12px; padding: 30px;">
                  <h2 style="color: #F2C94C; font-size: 20px; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 15px;">
                    📬 New Inquiry Details
                  </h2>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; color: #888; width: 100px;">Name:</td>
                      <td style="padding: 12px 0; color: #fff; font-weight: 600;">${safeName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #888;">Email:</td>
                      <td style="padding: 12px 0;">
                        <a href="mailto:${safeEmail}" style="color: #F2C94C; text-decoration: none;">${safeEmail}</a>
                      </td>
                    </tr>
                    ${safePhone ? `
                    <tr>
                      <td style="padding: 12px 0; color: #888;">Phone:</td>
                      <td style="padding: 12px 0;">
                        <a href="tel:${safePhone}" style="color: #F2C94C; text-decoration: none;">${safePhone}</a>
                      </td>
                    </tr>
                    ` : ''}
                    ${safeUserType ? `
                    <tr>
                      <td style="padding: 12px 0; color: #888;">User Type:</td>
                      <td style="padding: 12px 0; color: #fff;">${safeUserType}</td>
                    </tr>
                    ` : ''}
                    ${safeService ? `
                    <tr>
                      <td style="padding: 12px 0; color: #888;">Service:</td>
                      <td style="padding: 12px 0; color: #fff;">${safeService}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 12px 0; color: #888;">Submitted:</td>
                      <td style="padding: 12px 0; color: #999; font-size: 14px;">${timestamp}</td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                    <p style="color: #888; margin: 0 0 10px 0;">Message:</p>
                    <div style="background: #0a0a0a; border-radius: 8px; padding: 20px; color: #ddd; line-height: 1.6;">
                      ${safeMessage}
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://influnex.studio/admin/inquiries" style="display: inline-block; background: linear-gradient(135deg, #F2C94C 0%, #d4a93a 100%); color: #0E0E0E; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View in Dashboard
                  </a>
                </div>
                
                <p style="text-align: center; color: #555; font-size: 12px; margin-top: 30px;">
                  © ${new Date().getFullYear()} InfluNex Studio. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log('Email notification sent:', emailResponse);
        emailSent = true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown email error';
        console.error('Email send error:', err);
        emailError = errorMessage;
        // Don't fail the request if email fails - inquiry is already saved
      }
    } else {
      console.log('RESEND_API_KEY not configured, skipping email notification');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Contact form submitted successfully',
        data: { id: inquiryData.id },
        emailSent,
        emailError
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in submit-contact function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
