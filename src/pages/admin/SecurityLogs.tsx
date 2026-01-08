import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shield, AlertTriangle, CheckCircle, Info, RefreshCw, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SecurityLog {
  id: string;
  event_type: string;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: typeof Shield }> = {
  rate_limit_exceeded: { label: 'Rate Limit', variant: 'destructive', icon: AlertTriangle },
  invalid_input_attempt: { label: 'Invalid Input', variant: 'secondary', icon: AlertTriangle },
  contact_submission: { label: 'Contact Form', variant: 'default', icon: CheckCircle },
  admin_login_failed: { label: 'Login Failed', variant: 'destructive', icon: AlertTriangle },
  admin_unauthorized_access: { label: 'Unauthorized', variant: 'destructive', icon: AlertTriangle },
  admin_created: { label: 'Admin Created', variant: 'default', icon: CheckCircle },
  admin_deleted: { label: 'Admin Deleted', variant: 'secondary', icon: Info },
  login_success: { label: 'Login Success', variant: 'default', icon: CheckCircle },
  logout: { label: 'Logout', variant: 'outline', icon: Info },
  password_changed: { label: 'Password Changed', variant: 'default', icon: Shield },
  password_reset_requested: { label: 'Password Reset', variant: 'secondary', icon: Info },
};

export default function SecurityLogs() {
  const [eventFilter, setEventFilter] = useState<string>('all');

  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['security-logs', eventFilter],
    queryFn: async () => {
      let query = supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventFilter !== 'all') {
        query = query.eq('event_type', eventFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityLog[];
    },
  });

  const getEventConfig = (eventType: string) => {
    return EVENT_TYPE_CONFIG[eventType] || { 
      label: eventType.replace(/_/g, ' '), 
      variant: 'outline' as const, 
      icon: Info 
    };
  };

  const formatDetails = (details: Record<string, unknown>) => {
    if (!details || Object.keys(details).length === 0) return '-';
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  const uniqueEventTypes = logs 
    ? [...new Set(logs.map(log => log.event_type))]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Logs</h1>
          <p className="text-muted-foreground">
            Monitor authentication attempts and suspicious activity
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Recent Security Events</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getEventConfig(type).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            Last 100 security events are displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[140px]">Event Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const config = getEventConfig(log.event_type);
                    const Icon = config.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.email || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.ip_address || '-'}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {formatDetails(log.details)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
