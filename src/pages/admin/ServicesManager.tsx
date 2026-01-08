import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Loader2, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { serviceSchema, ServiceFormData } from '@/lib/validationSchemas';
import { sanitizeObject } from '@/lib/sanitize';
import { MediaPicker } from '@/components/admin/MediaPicker';

export default function ServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPath, setBannerPath] = useState('');
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      slug: '',
      short_description: '',
      long_description: '',
      icon: '',
      banner_image: '',
      display_order: 0,
    },
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (editingService) {
      form.reset({
        title: editingService.title || '',
        slug: editingService.slug || '',
        short_description: editingService.short_description || '',
        long_description: editingService.long_description || '',
        icon: editingService.icon || '',
        banner_image: editingService.banner_image || '',
        display_order: editingService.display_order || 0,
      });
      setBannerUrl(editingService.banner_image || '');
      setBannerPath('');
    }
  }, [editingService, form]);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    if (data) setServices(data);
  };

  const handleBannerChange = (url: string, path: string) => {
    setBannerUrl(url);
    setBannerPath(path);
    form.setValue('banner_image', url);
  };

  const handleSave = async (data: ServiceFormData) => {
    try {
      setSaving(true);
      const sanitizedData = sanitizeObject(data);

      const serviceData = {
        ...sanitizedData,
        // Hybrid rule: database services start from 9 onwards
        display_order: Math.max(9, sanitizedData.display_order || 9),
        banner_image: bannerUrl,
      };

      if (editingService?.id) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        if (error) throw error;
        toast({ title: 'Service updated successfully' });
      } else {
        const { error } = await supabase.from('services').insert([serviceData as any]);
        if (error) throw error;
        toast({ title: 'Service created successfully' });
      }
      setIsDialogOpen(false);
      setEditingService(null);
      setBannerUrl('');
      setBannerPath('');
      form.reset();
      loadServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase.from('services').delete().eq('id', id);
      toast({ title: 'Service deleted' });
      loadServices();
    }
  };

  const openDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
    } else {
      const currentMax = services.reduce((max, s) => Math.max(max, s.display_order || 0), 0);
      const nextOrder = Math.max(9, currentMax + 1);

      setEditingService({
        title: '',
        slug: '',
        short_description: '',
        long_description: '',
        icon: '',
        banner_image: '',
        display_order: nextOrder,
      });

      form.reset({
        title: '',
        slug: '',
        short_description: '',
        long_description: '',
        icon: '',
        banner_image: '',
        display_order: nextOrder,
      });
      setBannerUrl('');
      setBannerPath('');
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services Manager</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService?.id ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Service title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="service-url-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <MediaPicker
                  value={bannerUrl}
                  onChange={handleBannerChange}
                  bucketType="portfolio"
                  label="Banner Image"
                  placeholder="Upload or select a banner image"
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Name (Lucide)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Camera, Globe, Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Service'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No services added yet. Add your first service to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              {service.banner_image && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={service.banner_image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{service.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(service)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{service.short_description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
