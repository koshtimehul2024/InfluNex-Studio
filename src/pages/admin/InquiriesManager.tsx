import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar } from 'lucide-react';

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInquiries(data);
  };

  const markAsViewed = async (id: string) => {
    await supabase.from('inquiries').update({ status: 'viewed' }).eq('id', id);
    loadInquiries();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inquiries</h1>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {inquiry.email}
                  </span>
                  {inquiry.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {inquiry.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
                {inquiry.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{inquiry.message}</p>
              {inquiry.status === 'new' && (
                <Button size="sm" onClick={() => markAsViewed(inquiry.id)}>
                  Mark as Viewed
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}