import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Briefcase, 
  Image, 
  Gift, 
  MessageSquare,
  LogOut,
  Shield,
  Lock,
  FileWarning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Settings, label: 'Global Settings', path: '/admin/settings' },
  { icon: Settings, label: 'Home Content', path: '/admin/home-content' },
  { icon: Briefcase, label: 'Services', path: '/admin/services' },
  { icon: Image, label: 'Portfolio', path: '/admin/portfolio' },
  { icon: Gift, label: 'Offers', path: '/admin/offers' },
  { icon: Briefcase, label: 'Careers', path: '/admin/careers' },
  { icon: MessageSquare, label: 'Applications', path: '/admin/applications' },
  { icon: MessageSquare, label: 'Inquiries', path: '/admin/inquiries' },
  { icon: Shield, label: 'Admin Management', path: '/admin/admin-management' },
  { icon: FileWarning, label: 'Security Logs', path: '/admin/security-logs' },
  { icon: Lock, label: 'Change Password', path: '/admin/change-password' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient-gold">InfluNex</h1>
        <p className="text-sm text-muted-foreground">Admin Panel</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground mt-4"
        onClick={signOut}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </Button>
    </aside>
  );
}