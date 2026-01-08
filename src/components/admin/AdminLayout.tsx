import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useLoader } from '@/contexts/LoaderContext';

export function AdminLayout() {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    // Show loader while we're restoring session
    if (loading) {
      showLoader();
      return;
    }

    // Session restore done
    hideLoader();

    // If no user session at all, redirect to admin login
    if (!user) {
      navigate('/admin/login', { replace: true });
      return;
    }

    // If admin check still pending (null), do not redirect yet — allow background check to finish
    if (isAdmin === null) {
      return;
    }

    // If user exists but is not admin, redirect to home
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    // If at /admin root, redirect to dashboard
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, loading, user, navigate, location.pathname, showLoader, hideLoader]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a session but the admin role check is still pending, show a small inline loader
  if (user && isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If admin check completed and user is not admin, block access (effect will redirect)
  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}