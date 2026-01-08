import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  // null = unknown/pending, true = is admin, false = not admin
  isAdmin: boolean | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; session: Session | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  // Force a re-check of the admin role (useful when a check timed out)
  refreshAdminRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminRole = async (userId: string) => {
    console.debug('[AuthContext] checkAdminRole start', { userId });

    // Mark pending while we check
    setIsAdmin(null);

    let settled = false;
    const timeoutMs = 7000;
    const timer = setTimeout(() => {
      if (!settled) {
        console.warn('[AuthContext] checkAdminRole timed out');
        setIsAdmin(false);
        settled = true;
      }
    }, timeoutMs);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (settled) return;

      console.debug('[AuthContext] checkAdminRole result', { data, error });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error checking admin role:', err);
      if (!settled) setIsAdmin(false);
    } finally {
      settled = true;
      clearTimeout(timer);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      console.debug('[AuthContext] bootstrap start');
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.debug('[AuthContext] bootstrap session', { session });
        if (cancelled) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Resolve loading (session restore done). Do not block rendering on admin role check.
        if (!cancelled) setLoading(false);

        if (session?.user) {
          // Start role check in background; it will update isAdmin when complete
          checkAdminRole(session.user.id).catch((err) => {
            console.error('[AuthContext] background checkAdminRole failed', err);
          });
        } else {
          // No session; explicit not admin
          setIsAdmin(false);
        }

        console.debug('[AuthContext] bootstrap end');
      } catch (err) {
        console.error('[AuthContext] bootstrap error', err);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    // Keep state in sync; IMPORTANT: wait for admin role check before clearing loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.debug('[AuthContext] onAuthStateChange', { event: _event, session });
      setLoading(true);
      try {
        setSession(session);
        setUser(session?.user ?? null);

        // Resolve loading quickly and perform role check in background
        setLoading(false);

        if (session?.user) {
          checkAdminRole(session.user.id).catch((err) => {
            console.error('[AuthContext] background checkAdminRole failed', err);
          });
        } else {
          setIsAdmin(false);
        }

        console.debug('[AuthContext] onAuthStateChange end');
      } catch (err) {
        console.error('[AuthContext] onAuthStateChange error', err);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Reset admin flag to unknown while we sign in
      setIsAdmin(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.debug('[AuthContext] signIn result', { data, error });

      // After sign-in, fetch session to ensure it's available
      const { data: sessionData } = await supabase.auth.getSession();
      console.debug('[AuthContext] post-signin session', { session: sessionData?.session });

      // Update local context immediately so UI can react faster
      setSession(sessionData?.session ?? null);
      setUser(sessionData?.session?.user ?? null);

      if (sessionData?.session?.user) {
        // Start role check in background
        checkAdminRole(sessionData.session.user.id).catch((err) => {
          console.error('[AuthContext] background checkAdminRole failed', err);
        });
      }

      // Return sign-in result
      return { error, session: sessionData?.session ?? null };
    } catch (err: any) {
      console.error('[AuthContext] signIn error', err);
      return { error: { message: err?.message || 'Unknown sign-in error' }, session: null };
    }
  };

  // Exposed helper to re-run the admin role check on demand
  const refreshAdminRole = async () => {
    if (session?.user) {
      await checkAdminRole(session.user.id);
    } else {
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create profile after signup with comprehensive error handling
      if (data.user) {
        let profileError = null;
        let retryCount = 0;
        const maxRetries = 1;

        // Attempt profile creation with retry logic
        while (retryCount <= maxRetries) {
          const { error: insertError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            name,
          });

          if (!insertError) {
            // Profile created successfully
            return { error: null };
          }

          profileError = insertError;
          retryCount++;

          // Wait before retry
          if (retryCount <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        // Profile creation failed after retries
        console.error('Profile creation failed after retries:', profileError);

        // Note: User rollback requires admin API which is only available server-side
        // The user is created but profile setup failed
        // They can still use the app, profile can be created later
        return {
          error: {
            message:
              'Account created but profile setup had issues. Please contact support if you experience problems.',
          },
        };
      }

      return { error: null };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: { message: 'An unexpected error occurred during signup.' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] signOut error', err);
    }

    // Clear all auth state and ensure loading is not left true
    setIsAdmin(null);
    setUser(null);
    setSession(null);
    setLoading(false);

    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut, refreshAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}