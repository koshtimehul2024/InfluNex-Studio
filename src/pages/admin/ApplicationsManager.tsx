import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, FileText, Mail, Phone, Calendar, ExternalLink, User, Briefcase, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Application {
  id: string;
  career_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  resume_url: string | null;
  resume_path: string | null;
  status: string;
  created_at: string;
  career?: {
    title: string;
  } | null;
}

interface Career {
  id: string;
  title: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shortlisted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCareers();
    loadApplications();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [selectedCareer]);

  const loadCareers = async () => {
    const { data } = await supabase.from('careers').select('id, title').order('title');
    if (data) setCareers(data);
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('career_applications')
        .select(`
          *,
          career:careers(title)
        `)
        .order('created_at', { ascending: false });

      if (selectedCareer !== 'all') {
        query = query.eq('career_id', selectedCareer);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setApplications(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('career_applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Status updated' });
      loadApplications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, resumePath?: string | null) => {
    if (!confirm('Delete this application?')) return;
    try {
      if (resumePath) {
        await supabase.storage.from('resumes').remove([resumePath]);
      }
      await supabase.from('career_applications').delete().eq('id', id);
      toast({ title: 'Application deleted' });
      loadApplications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getResumeUrl = async (path: string) => {
    const { data } = await supabase.storage.from('resumes').createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage candidate applications</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCareer} onValueChange={setSelectedCareer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {careers.map((career) => (
                <SelectItem key={career.id} value={career.id}>{career.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications yet. Applications will appear here when candidates apply.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      {app.name}
                    </CardTitle>
                    {app.career && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate">{app.career.title}</span>
                      </div>
                    )}
                  </div>
                  <Badge className={statusColors[app.status]}>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${app.email}`} className="hover:text-primary truncate">
                      {app.email}
                    </a>
                  </div>
                  {app.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${app.phone}`} className="hover:text-primary">
                        {app.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(app.created_at), 'PPp')}</span>
                  </div>
                </div>

                {app.message && (
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">{app.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {app.resume_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getResumeUrl(app.resume_path!)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Resume
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                  
                  <Select
                    value={app.status}
                    onValueChange={(value) => updateStatus(app.id, value)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(app.id, app.resume_path)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}