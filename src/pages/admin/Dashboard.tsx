import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Image, Gift, MessageSquare, TrendingUp, Eye, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    services: 0,
    portfolio: 0,
    offers: 0,
    inquiries: 0,
    newInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentPortfolio, setRecentPortfolio] = useState<PortfolioItem[]>([]);
  const [monthlyVisits] = useState({
    current: 2847,
    previous: 2156,
    growth: 32,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadStats(), loadRecentData()]);
      // Add slight delay for smooth transition
      setTimeout(() => setIsLoading(false), 300);
    };
    loadData();
  }, []);

  const loadStats = async () => {
    const [servicesRes, portfolioRes, offersRes, inquiriesRes, newInquiriesRes] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('portfolio').select('id', { count: 'exact', head: true }),
      supabase.from('influencer_offers').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ]);

    setStats({
      services: servicesRes.count || 0,
      portfolio: portfolioRes.count || 0,
      offers: offersRes.count || 0,
      inquiries: inquiriesRes.count || 0,
      newInquiries: newInquiriesRes.count || 0,
    });
  };

  const loadRecentData = async () => {
    const [inquiriesRes, portfolioRes] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(4),
    ]);

    if (inquiriesRes.data) setRecentInquiries(inquiriesRes.data);
    if (portfolioRes.data) setRecentPortfolio(portfolioRes.data);
  };

  const statCards = [
    { icon: Briefcase, label: 'Total Services', value: stats.services, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Image, label: 'Portfolio Items', value: stats.portfolio, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Gift, label: 'Active Offers', value: stats.offers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: MessageSquare, label: 'New Inquiries', value: stats.newInquiries, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const quickActions = [
    { label: 'Add Portfolio Item', path: '/admin/portfolio', icon: Image },
    { label: 'Manage Services', path: '/admin/services', icon: Briefcase },
    { label: 'View Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { label: 'Update Settings', path: '/admin/settings', icon: TrendingUp },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Visits & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Monthly Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{monthlyVisits.current.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">+{monthlyVisits.growth}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((monthlyVisits.current / 5000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyVisits.previous.toLocaleString()} visits last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/50"
                    asChild
                  >
                    <Link to={action.path}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{action.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inquiries & Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Inquiries
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inquiries" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No inquiries yet</p>
              ) : (
                recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{inquiry.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{inquiry.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(inquiry.created_at), 'MMM d')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Recent Portfolio
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/portfolio" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {recentPortfolio.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 col-span-2">No portfolio items yet</p>
              ) : (
                recentPortfolio.map((item) => (
                  <div key={item.id} className="group relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        <p className="text-white/70 text-xs truncate">{item.category}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}