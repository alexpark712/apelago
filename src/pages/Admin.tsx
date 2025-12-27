import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  Link as LinkIcon,
  Eye,
  Loader2
} from 'lucide-react';

interface SellerApplication {
  id: string;
  user_id: string;
  service_area: string | null;
  proof_link: string | null;
  proof_screenshot_url: string | null;
  status: string;
  applied_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  related_user_id: string | null;
}

export default function Admin() {
  const [sellers, setSellers] = useState<SellerApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchData();
    
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({
            title: 'New Notification',
            description: (payload.new as Notification).title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkAdminAndFetchData = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    await fetchData();
  };

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch waitlisted sellers
    const { data: sellersData } = await supabase
      .from('sellers')
      .select('*')
      .eq('status', 'waitlisted')
      .order('applied_at', { ascending: false });

    if (sellersData) {
      // Fetch profiles for each seller
      const sellersWithProfiles = await Promise.all(
        sellersData.map(async (seller) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('id', seller.user_id)
            .single();
          return { ...seller, profile };
        })
      );
      setSellers(sellersWithProfiles);
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (notificationsData) {
      setNotifications(notificationsData);
    }

    setIsLoading(false);
  };

  const handleApproveSeller = async (sellerId: string) => {
    setProcessingId(sellerId);

    const { error } = await supabase
      .from('sellers')
      .update({ 
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .eq('id', sellerId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve seller.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Seller Approved',
        description: 'The seller has been activated.',
      });
      setSellers(prev => prev.filter(s => s.id !== sellerId));
    }

    setProcessingId(null);
  };

  const handleRejectSeller = async (sellerId: string) => {
    setProcessingId(sellerId);

    // Delete the seller record since 'rejected' isn't a valid status
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', sellerId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject seller.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Seller Rejected',
        description: 'The application has been rejected.',
      });
      setSellers(prev => prev.filter(s => s.id !== sellerId));
    }

    setProcessingId(null);
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  Admin Console
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage seller applications and view notifications
                </p>
              </div>
              <Badge variant="verified" className="gap-1 w-fit">
                <Shield className="h-3 w-3" />
                Admin Access
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Applications</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{sellers.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unread Notifications</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {notifications.filter(n => !n.is_read).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bell className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Notifications</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{notifications.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="applications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
                <TabsTrigger value="applications" className="gap-2">
                  <Users className="h-4 w-4" />
                  Seller Applications ({sellers.length})
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications ({notifications.filter(n => !n.is_read).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sellers.length > 0 ? (
                  <div className="space-y-4">
                    {sellers.map((seller) => (
                      <Card key={seller.id} variant="elevated">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {seller.profile?.first_name} {seller.profile?.last_name}
                                </h3>
                                <Badge variant="pending">Waitlisted</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Email: {seller.profile?.email}</p>
                                {seller.profile?.phone && <p>Phone: {seller.profile.phone}</p>}
                                {seller.service_area && <p>Service Area: {seller.service_area}</p>}
                                <p>Applied: {new Date(seller.applied_at).toLocaleDateString()}</p>
                              </div>
                              {seller.proof_link && (
                                <a 
                                  href={seller.proof_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" />
                                  View Proof Link
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectSeller(seller.id)}
                                disabled={processingId === seller.id}
                                className="text-destructive hover:text-destructive"
                              >
                                {processingId === seller.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveSeller(seller.id)}
                                disabled={processingId === seller.id}
                              >
                                {processingId === seller.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" className="text-center py-12">
                    <CardContent>
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No pending applications
                      </h3>
                      <p className="text-muted-foreground">
                        All seller applications have been reviewed
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        variant={notification.is_read ? "flat" : "elevated"}
                        className={!notification.is_read ? "border-primary/20" : ""}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-muted' : 'bg-primary'}`} />
                              <div>
                                <h4 className="font-medium text-foreground">{notification.title}</h4>
                                {notification.message && (
                                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markNotificationRead(notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" className="text-center py-12">
                    <CardContent>
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No notifications
                      </h3>
                      <p className="text-muted-foreground">
                        You'll see updates here when sellers apply
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
