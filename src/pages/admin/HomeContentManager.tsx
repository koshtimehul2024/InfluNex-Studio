import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Loader2, ImageIcon, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { deleteMediaSecure } from '@/lib/secureMediaUpload';

// Schemas
const logoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  type: z.enum(['customer', 'brand']),
  display_order: z.number().min(0),
  is_published: z.boolean(),
});

const statSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  value: z.string().min(1, "Value is required").max(20),
  display_order: z.number().min(0),
  is_published: z.boolean(),
});

type LogoFormData = z.infer<typeof logoSchema>;
type StatFormData = z.infer<typeof statSchema>;

interface HomeLogo {
  id: string;
  title: string;
  image_url: string | null;
  image_path: string | null;
  type: string;
  is_published: boolean;
  display_order: number;
}

interface HomeStat {
  id: string;
  label: string;
  value: string;
  is_published: boolean;
  display_order: number;
}

export default function HomeContentManager() {
  const [logos, setLogos] = useState<HomeLogo[]>([]);
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [editingLogo, setEditingLogo] = useState<HomeLogo | null>(null);
  const [editingStat, setEditingStat] = useState<HomeStat | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isStatDialogOpen, setIsStatDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [logoImagePath, setLogoImagePath] = useState('');
  const { toast } = useToast();

  const logoForm = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      title: '',
      type: 'customer',
      display_order: 0,
      is_published: true,
    },
  });

  const statForm = useForm<StatFormData>({
    resolver: zodResolver(statSchema),
    defaultValues: {
      label: '',
      value: '',
      display_order: 0,
      is_published: true,
    },
  });

  useEffect(() => {
    loadLogos();
    loadStats();
  }, []);

  const loadLogos = async () => {
    const { data } = await supabase.from('home_logos').select('*').order('display_order');
    if (data) setLogos(data);
  };

  const loadStats = async () => {
    const { data } = await supabase.from('home_stats').select('*').order('display_order');
    if (data) setStats(data);
  };

  const handleImageChange = (url: string, path: string) => {
    setLogoImageUrl(url);
    setLogoImagePath(path);
  };

  const handleSaveLogo = async (data: LogoFormData) => {
    try {
      setSaving(true);

      // If path changed and old one exists, delete old image
      if (editingLogo?.image_path && editingLogo.image_path !== logoImagePath && logoImagePath) {
        try {
          await deleteMediaSecure(editingLogo.image_path, 'logos');
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }

      const logoData = { 
        title: data.title,
        type: data.type,
        display_order: data.display_order,
        is_published: data.is_published,
        image_url: logoImageUrl, 
        image_path: logoImagePath 
      };

      if (editingLogo?.id) {
        const { error } = await supabase.from('home_logos').update(logoData).eq('id', editingLogo.id);
        if (error) throw error;
        toast({ title: 'Logo updated successfully' });
      } else {
        const { error } = await supabase.from('home_logos').insert([logoData]);
        if (error) throw error;
        toast({ title: 'Logo created successfully' });
      }

      closeLogoDialog();
      loadLogos();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async (id: string, imagePath?: string | null) => {
    if (!confirm('Delete this logo?')) return;
    try {
      if (imagePath) {
        try {
          await deleteMediaSecure(imagePath, 'logos');
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }
      await supabase.from('home_logos').delete().eq('id', id);
      toast({ title: 'Logo deleted' });
      loadLogos();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openLogoDialog = (logo?: HomeLogo) => {
    if (logo) {
      setEditingLogo(logo);
      logoForm.reset({
        title: logo.title,
        type: logo.type as 'customer' | 'brand',
        display_order: logo.display_order,
        is_published: logo.is_published,
      });
      setLogoImageUrl(logo.image_url || '');
      setLogoImagePath(logo.image_path || '');
    } else {
      setEditingLogo(null);
      logoForm.reset({ title: '', type: 'customer', display_order: logos.length, is_published: true });
      setLogoImageUrl('');
      setLogoImagePath('');
    }
    setIsLogoDialogOpen(true);
  };

  const closeLogoDialog = () => {
    setIsLogoDialogOpen(false);
    setEditingLogo(null);
    setLogoImageUrl('');
    setLogoImagePath('');
    logoForm.reset();
  };

  // Stat handlers
  const handleSaveStat = async (data: StatFormData) => {
    try {
      setSaving(true);
      const statData = {
        label: data.label,
        value: data.value,
        display_order: data.display_order,
        is_published: data.is_published,
      };
      
      if (editingStat?.id) {
        const { error } = await supabase.from('home_stats').update(statData).eq('id', editingStat.id);
        if (error) throw error;
        toast({ title: 'Stat updated successfully' });
      } else {
        const { error } = await supabase.from('home_stats').insert([statData]);
        if (error) throw error;
        toast({ title: 'Stat created successfully' });
      }
      closeStatDialog();
      loadStats();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm('Delete this stat?')) return;
    try {
      await supabase.from('home_stats').delete().eq('id', id);
      toast({ title: 'Stat deleted' });
      loadStats();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openStatDialog = (stat?: HomeStat) => {
    if (stat) {
      setEditingStat(stat);
      statForm.reset(stat);
    } else {
      setEditingStat(null);
      statForm.reset({ label: '', value: '', display_order: stats.length, is_published: true });
    }
    setIsStatDialogOpen(true);
  };

  const closeStatDialog = () => {
    setIsStatDialogOpen(false);
    setEditingStat(null);
    statForm.reset();
  };

  const togglePublished = async (table: 'home_logos' | 'home_stats', id: string, currentValue: boolean) => {
    try {
      await supabase.from(table).update({ is_published: !currentValue }).eq('id', id);
      if (table === 'home_logos') loadLogos();
      else loadStats();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Home Page Content</h1>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="logos" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logos
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage homepage statistics (Projects, Clients, etc.)</p>
            <Button onClick={() => openStatDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stat
            </Button>
          </div>

          {stats.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                No stats added yet. Add your first stat to display on the homepage.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.id} className={!stat.is_published ? 'opacity-50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-3xl font-bold text-gradient-gold">{stat.value}</div>
                        <CardTitle className="text-sm font-medium text-muted-foreground mt-1">
                          {stat.label}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={stat.is_published}
                          onCheckedChange={() => togglePublished('home_stats', stat.id, stat.is_published)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openStatDialog(stat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteStat(stat.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Logos Tab */}
        <TabsContent value="logos" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage customer and brand logos displayed on homepage</p>
            <Button onClick={() => openLogoDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Logo
            </Button>
          </div>

          {logos.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                No logos added yet. Add customer or brand logos to display on the homepage.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {logos.map((logo) => (
                <Card key={logo.id} className={`overflow-hidden ${!logo.is_published ? 'opacity-50' : ''}`}>
                  <div className="aspect-video bg-muted flex items-center justify-center p-4">
                    {logo.image_url ? (
                      <img 
                        src={logo.image_url} 
                        alt={logo.title} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium truncate">{logo.title}</span>
                      <Switch
                        checked={logo.is_published}
                        onCheckedChange={() => togglePublished('home_logos', logo.id, logo.is_published)}
                      />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${logo.type === 'customer' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {logo.type}
                    </span>
                    <div className="flex gap-1 mt-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => openLogoDialog(logo)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => handleDeleteLogo(logo.id, logo.image_path)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Logo Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLogo?.id ? 'Edit' : 'Add'} Logo</DialogTitle>
          </DialogHeader>
          <Form {...logoForm}>
            <form onSubmit={logoForm.handleSubmit(handleSaveLogo)} className="space-y-4">
              <FormField
                control={logoForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={logoForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MediaPicker
                value={logoImageUrl || logoImagePath}
                onChange={handleImageChange}
                bucketType="logos"
                label="Logo Image"
                placeholder="Upload or select a logo"
              />

              <FormField
                control={logoForm.control}
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
                control={logoForm.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Published</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeLogoDialog} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Logo'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stat Dialog */}
      <Dialog open={isStatDialogOpen} onOpenChange={setIsStatDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStat?.id ? 'Edit' : 'Add'} Stat</DialogTitle>
          </DialogHeader>
          <Form {...statForm}>
            <form onSubmit={statForm.handleSubmit(handleSaveStat)} className="space-y-4">
              <FormField
                control={statForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={statForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Projects Completed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={statForm.control}
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
                control={statForm.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Published</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeStatDialog} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Stat'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
