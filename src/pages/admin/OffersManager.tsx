import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { offerSchema, OfferFormData } from '@/lib/validationSchemas';
import { sanitizeObject } from '@/lib/sanitize';

export default function OffersManager() {
  const [offers, setOffers] = useState<any[]>([]);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offer_title: '',
      offer_description: '',
      price: '',
      features: [],
      display_order: 0,
    },
  });

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    if (editingOffer) {
      form.reset({
        offer_title: editingOffer.offer_title || '',
        offer_description: editingOffer.offer_description || '',
        price: editingOffer.price || '',
        features: editingOffer.features || [],
        display_order: editingOffer.display_order || 0,
      });
    }
  }, [editingOffer, form]);

  const loadOffers = async () => {
    const { data } = await supabase
      .from('influencer_offers')
      .select('*')
      .order('display_order');
    if (data) setOffers(data);
  };

  const handleSave = async (data: OfferFormData) => {
    try {
      // Sanitize all inputs
      const sanitizedData = sanitizeObject(data);

      if (editingOffer?.id) {
        const { error } = await supabase
          .from('influencer_offers')
          .update(sanitizedData)
          .eq('id', editingOffer.id);
        if (error) throw error;
        toast({ title: 'Offer updated successfully' });
      } else {
        const { error } = await supabase.from('influencer_offers').insert([sanitizedData as any]);
        if (error) throw error;
        toast({ title: 'Offer created successfully' });
      }
      setIsDialogOpen(false);
      setEditingOffer(null);
      form.reset();
      loadOffers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      await supabase.from('influencer_offers').delete().eq('id', id);
      toast({ title: 'Offer deleted' });
      loadOffers();
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues('features') || [];
      form.setValue('features', [...currentFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    form.setValue('features', updatedFeatures);
  };

  const openDialog = (offer?: any) => {
    if (offer) {
      setEditingOffer(offer);
    } else {
      setEditingOffer({
        offer_title: '',
        offer_description: '',
        price: '',
        features: [],
        display_order: offers.length + 1,
      });
      form.reset({
        offer_title: '',
        offer_description: '',
        price: '',
        features: [],
        display_order: offers.length + 1,
      });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Influencer Offers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffer?.id ? 'Edit Offer' : 'Add New Offer'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="offer_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Offer title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offer_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Offer description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="$99/month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>Features</FormLabel>
                  <div className="flex space-x-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(form.watch('features') || []).map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                <Button type="submit" className="w-full">Save Offer</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{offer.offer_title}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog(offer)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-primary mb-2">{offer.price}</p>
              <p className="text-sm text-muted-foreground mb-4">{offer.offer_description}</p>
              {offer.features && offer.features.length > 0 && (
                <ul className="text-sm space-y-1">
                  {offer.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">• {feature}</li>
                  ))}
                  {offer.features.length > 3 && (
                    <li className="text-muted-foreground">• +{offer.features.length - 3} more</li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
