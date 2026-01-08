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
import { Pencil, Trash2, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { portfolioSchema, PortfolioFormData } from '@/lib/validationSchemas';
import { sanitizeObject } from '@/lib/sanitize';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { deleteMediaSecure } from '@/lib/secureMediaUpload';

const categories = ['Photography', 'Video', 'Web Design', 'Branding', 'Social Media', 'Events'];

export default function PortfolioManager() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState('');
  const { toast } = useToast();

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      category: '',
      image_url: '',
      description: '',
    },
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        title: editingItem.title || '',
        category: editingItem.category || '',
        image_url: editingItem.image_url || '',
        description: editingItem.description || '',
      });
      setImageUrl(editingItem.image_url || '');
      setImagePath(editingItem.image_path || '');
    }
  }, [editingItem, form]);

  const loadPortfolio = async () => {
    const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
    if (data) setPortfolio(data);
  };

  const handleImageChange = (url: string, path: string) => {
    setImageUrl(url);
    setImagePath(path);
    form.setValue('image_url', url);
  };

  const handleSave = async (data: PortfolioFormData) => {
    try {
      setSaving(true);
      const sanitizedData = sanitizeObject(data);

      const portfolioData = {
        title: sanitizedData.title || '',
        category: sanitizedData.category || '',
        description: sanitizedData.description || '',
        image_url: imageUrl,
        image_path: imagePath,
      };

      if (editingItem?.id) {
        // If image path changed and old one exists, delete old image
        if (editingItem.image_path && editingItem.image_path !== imagePath && imagePath) {
          try {
            await deleteMediaSecure(editingItem.image_path, 'portfolio');
          } catch (error) {
            console.error('Failed to delete old image:', error);
          }
        }

        const { error } = await supabase
          .from('portfolio')
          .update(portfolioData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Portfolio item updated successfully' });
      } else {
        const { error } = await supabase.from('portfolio').insert([portfolioData]);
        if (error) throw error;
        toast({ title: 'Portfolio item created successfully' });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setImageUrl('');
      setImagePath('');
      form.reset();
      loadPortfolio();
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

  const handleDelete = async (id: string, imgPath?: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete image from storage if exists
      if (imgPath) {
        try {
          await deleteMediaSecure(imgPath, 'portfolio');
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }

      // Delete from database
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Portfolio item deleted' });
      loadPortfolio();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({
        title: '',
        category: '',
        image_url: '',
        description: '',
      });
      form.reset({
        title: '',
        category: '',
        image_url: '',
        description: '',
      });
      setImageUrl('');
      setImagePath('');
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Portfolio Manager</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MediaPicker
                  value={imageUrl || imagePath}
                  onChange={handleImageChange}
                  bucketType="portfolio"
                  label="Project Image"
                  placeholder="Upload or select a project image"
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Project description"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No portfolio items yet. Add your first item to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden h-full flex flex-col">
              {item.image_url ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start gap-2">
                  <span className="line-clamp-1 flex-1">{item.title}</span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item.id, item.image_path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <p className="text-sm text-primary mb-2">{item.category}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
