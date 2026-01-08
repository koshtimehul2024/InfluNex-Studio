import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { signIn, isAdmin, loading: authLoading, signOut, user, session, refreshAdminRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error, session: signInSession } = await signIn(email, password);
      console.debug('[AdminLogin] signIn returned', { error, signInSession });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid email or password",
        });
        setIsLoading(false);
        return;
      }

      // If sign-in did not create a session, fail fast
      if (!signInSession) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Could not create a session. Check your account or network and try again.',
        });
        setIsLoading(false);
        return;
      }

      // Signal that we've initiated a login and are waiting for AuthContext role check
      setLoginAttempted(true);

      toast({
        title: "Success",
        description: "Logging you in...",
      });

      // Do NOT navigate here; wait for AuthContext to finish role check
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.debug('[AdminLogin] effect', { loginAttempted, authLoading, isAdmin, user, session });
    if (!loginAttempted) return;

    // Still waiting for AuthContext to finish checking role
    if (authLoading) return;

    // If admin check is pending, wait (do not deny prematurely)
    if (isAdmin === null) return;

    // AuthContext finished loading; check admin flag
    if (isAdmin === true) {
      setIsLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    // If no user session present after auth finished, show error
    if (!user && !session) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'No active session found after sign-in. Please try again.',
      });
      setIsLoading(false);
      setLoginAttempted(false);
      return;
    }

    // Not an admin — show error, reset form state and sign out
    toast({
      variant: 'destructive',
      title: 'Access Denied',
      description: 'This account does not have admin access.',
    });

    setIsLoading(false);
    setLoginAttempted(false);
    signOut();
  }, [loginAttempted, authLoading, isAdmin, navigate, toast, signOut, user, session]);

  // Fallback and retry: if role check is pending for too long, try re-checking once, then fail
  useEffect(() => {
    if (!loginAttempted) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let failTimer: ReturnType<typeof setTimeout> | null = null;

    // If still pending after 7s, trigger a refresh of admin check
    retryTimer = setTimeout(() => {
      if (loginAttempted && isAdmin === null) {
        console.warn('[AdminLogin] retrying admin role check');
        refreshAdminRole().catch((err) => console.error('[AdminLogin] refreshAdminRole error', err));
      }
    }, 7000);

    // If still pending after 12s, show timeout and reset
    failTimer = setTimeout(() => {
      if (loginAttempted && isAdmin === null) {
        console.warn('[AdminLogin] login verification timed out', { authLoading, user, session });
        toast({
          variant: 'destructive',
          title: 'Login timed out',
          description: 'Verification is taking too long. Please try again or contact support.',
        });
        setIsLoading(false);
        setLoginAttempted(false);
      }
    }, 12000);

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (failTimer) clearTimeout(failTimer);
    };
  }, [loginAttempted, isAdmin, authLoading, session, user, toast, refreshAdminRole]);

  // If the global auth state becomes cleared while a login was in progress, reset local state
  useEffect(() => {
    if (loginAttempted && !user && !session) {
      console.debug('[AdminLogin] user cleared during login attempt, resetting local state');
      setIsLoading(false);
      setLoginAttempted(false);
    }
  }, [user, session, loginAttempted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-[var(--shadow-premium)]">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient-gold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="mt-4 text-center">
              <Link 
                to="/admin/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
