import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, MapPin, Building2, Briefcase, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const careerSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  job_type: z.string().max(50).optional(),
  short_description: z.string().max(500).optional(),
  full_description: z.string().max(10000).optional(),
  display_order: z.number().min(0),
  is_published: z.boolean(),
});

type CareerFormData = z.infer<typeof careerSchema>;

interface Career {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  job_type: string | null;
  short_description: string | null;
  full_description: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'];

export default function CareersManager() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      job_type: 'Full-time',
      short_description: '',
      full_description: '',
      display_order: 0,
      is_published: false,
    },
  });

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    const { data } = await supabase
      .from('careers')
      .select('*')
      .order('display_order');
    if (data) setCareers(data);
  };

  const handleSave = async (data: CareerFormData) => {
    try {
      const careerData = {
        title: data.title,
        department: data.department || null,
        location: data.location || null,
        job_type: data.job_type || null,
        short_description: data.short_description || null,
        full_description: data.full_description || null,
        display_order: data.display_order,
        is_published: data.is_published,
      };

      if (editingCareer?.id) {
        const { error } = await supabase
          .from('careers')
          .update(careerData)
          .eq('id', editingCareer.id);
        if (error) throw error;
        toast({ title: 'Job updated successfully' });
      } else {
        const { error } = await supabase.from('careers').insert([careerData]);
        if (error) throw error;
        toast({ title: 'Job created successfully' });
      }

      closeDialog();
      loadCareers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job posting? This will also remove all applications for this job.')) return;
    try {
      await supabase.from('careers').delete().eq('id', id);
      toast({ title: 'Job deleted' });
      loadCareers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const togglePublished = async (id: string, currentValue: boolean) => {
    try {
      await supabase.from('careers').update({ is_published: !currentValue }).eq('id', id);
      loadCareers();
      toast({ title: currentValue ? 'Job unpublished' : 'Job published' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openDialog = (career?: Career) => {
    if (career) {
      setEditingCareer(career);
      form.reset({
        title: career.title,
        department: career.department || '',
        location: career.location || '',
        job_type: career.job_type || 'Full-time',
        short_description: career.short_description || '',
        full_description: career.full_description || '',
        display_order: career.display_order,
        is_published: career.is_published,
      });
    } else {
      setEditingCareer(null);
      form.reset({
        title: '',
        department: '',
        location: '',
        job_type: 'Full-time',
        short_description: '',
        full_description: '',
        display_order: careers.length,
        is_published: false,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCareer(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Career Management</h1>
          <p className="text-muted-foreground mt-1">Manage job postings for your careers page</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </Button>
      </div>

      {careers.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No job postings yet. Add your first job to display on the careers page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {careers.map((career) => (
            <Card key={career.id} className={!career.is_published ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{career.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {career.job_type && (
                        <Badge variant="outline" className="text-xs">
                          {career.job_type}
                        </Badge>
                      )}
                      <Badge variant={career.is_published ? 'default' : 'secondary'} className="text-xs">
                        {career.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublished(career.id, career.is_published)}
                    title={career.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {career.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  {career.department && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{career.department}</span>
                    </div>
                  )}
                  {career.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{career.location}</span>
                    </div>
                  )}
                </div>
                {career.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {career.short_description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(career)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(career.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCareer?.id ? 'Edit' : 'Add'} Job Posting</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Marketing Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Marketing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mumbai, India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief overview of the role (displayed in job cards)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed job description including responsibilities, requirements, benefits, etc."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between pt-6">
                      <FormLabel>Publish Job</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit">Save Job</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}