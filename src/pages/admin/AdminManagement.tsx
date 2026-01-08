import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const adminSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 
      'Password must contain uppercase, lowercase, number, and special character'),
});

type AdminForm = z.infer<typeof adminSchema>;

interface Admin {
  id: string;
  email: string;
  is_current_user: boolean;
}

const PRIMARY_ADMIN_EMAIL = 'koshtimehul2022@gmail.com';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  // =====================================================================
  // SECURITY: Load admins via secure edge function
  // =====================================================================
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      const response = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list_admins' },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load admins');
      }

      if (response.data?.admins) {
        // Filter out master admin from display
        const filteredAdmins = response.data.admins.filter(
          (admin: Admin) => admin.email !== 'master@brandbooste.com'
        );
        setAdmins(filteredAdmins);
      }
    } catch (error: any) {
      console.error('Error loading admins:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin list",
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  // =====================================================================
  // SECURITY: Create admin via secure edge function (server-side)
  // =====================================================================
  const handleAddAdmin = async (data: AdminForm) => {
    setLoading(true);

    try {
      const response = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'create_admin',
          email: data.email,
          password: data.password,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create admin');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Admin account created successfully.",
      });

      form.reset();
      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create admin account",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================
  // SECURITY: Delete admin via secure edge function (server-side)
  // =====================================================================
  const handleDeleteAdmin = async () => {
    if (!deleteAdminId) return;

    setLoading(true);

    try {
      const response = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'delete_admin',
          targetUserId: deleteAdminId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete admin');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: "Admin removed successfully.",
      });

      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove admin",
      });
    } finally {
      setLoading(false);
      setDeleteAdminId(null);
    }
  };

  const isPrimaryAdmin = (email: string) => {
    return email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Management</h1>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Maximum 2 admins allowed. The primary admin cannot be removed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Admin</CardTitle>
            <CardDescription>
              Create a new admin account. Maximum 2 admins allowed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAdmin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          disabled={loading || admins.length >= 2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Strong password"
                          disabled={loading || admins.length >= 2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={loading || admins.length >= 2}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Admins ({admins.length}/2)</CardTitle>
            <CardDescription>
              Manage existing admin accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingAdmins ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : admins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No admins found
                </p>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        {isPrimaryAdmin(admin.email) && (
                          <p className="text-xs text-muted-foreground">Primary Admin</p>
                        )}
                        {admin.is_current_user && !isPrimaryAdmin(admin.email) && (
                          <p className="text-xs text-muted-foreground">You</p>
                        )}
                      </div>
                    </div>
                    {!isPrimaryAdmin(admin.email) && !admin.is_current_user && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteAdminId(admin.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this admin? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
