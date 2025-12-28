import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Loader2,
  Package,
  TrendingUp,
  UserCheck,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  facebook_marketplace_link: string | null;
  created_at: string;
}

interface Owner {
  id: string;
  profile: Profile;
  items_count: number;
  claims_count: number;
  items: Array<{
    id: string;
    item_name: string | null;
    brand: string | null;
    min_price: number;
    status: string;
    location: string;
    created_at: string;
    claims: Array<{
      id: string;
      status: string;
      seller_id: string;
      claimed_at: string;
    }>;
  }>;
}

interface SellerApplication {
  id: string;
  user_id: string;
  service_area: string | null;
  proof_link: string | null;
  proof_screenshot_url: string | null;
  status: string;
  applied_at: string;
  activated_at: string | null;
  claims_used: number;
  profile?: Profile;
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

interface Stats {
  totalOwners: number;
  totalSellers: number;
  activeSellers: number;
  waitlistedSellers: number;
  totalItems: number;
  openItems: number;
  claimedItems: number;
  doneItems: number;
  totalClaims: number;
  activeClaims: number;
}

export default function Admin() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [sellers, setSellers] = useState<SellerApplication[]>([]);
  const [waitlistedSellers, setWaitlistedSellers] = useState<SellerApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerApplication | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchData();
    
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

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

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

    // Fetch all profiles (potential owners)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all items with claims
    const { data: itemsData } = await supabase
      .from('items')
      .select(`
        *,
        claims (
          id,
          status,
          seller_id,
          claimed_at
        )
      `)
      .order('created_at', { ascending: false });

    // Fetch all sellers
    const { data: sellersData } = await supabase
      .from('sellers')
      .select('*')
      .order('applied_at', { ascending: false });

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Process owners with their items
    if (profilesData && itemsData) {
      const ownersMap = new Map<string, Owner>();
      
      profilesData.forEach(profile => {
        const ownerItems = itemsData.filter(item => item.owner_id === profile.id);
        const claimsCount = ownerItems.reduce((acc, item) => acc + (item.claims?.length || 0), 0);
        
        if (ownerItems.length > 0) {
          ownersMap.set(profile.id, {
            id: profile.id,
            profile: profile,
            items_count: ownerItems.length,
            claims_count: claimsCount,
            items: ownerItems.map(item => ({
              id: item.id,
              item_name: item.item_name,
              brand: item.brand,
              min_price: item.min_price,
              status: item.status,
              location: item.location,
              created_at: item.created_at,
              claims: item.claims || []
            }))
          });
        }
      });
      
      setOwners(Array.from(ownersMap.values()));
    }

    // Process sellers with profiles
    if (sellersData && profilesData) {
      const sellersWithProfiles = sellersData.map(seller => ({
        ...seller,
        profile: profilesData.find(p => p.id === seller.user_id)
      }));
      
      setSellers(sellersWithProfiles);
      setWaitlistedSellers(sellersWithProfiles.filter(s => s.status === 'waitlisted'));
    }

    // Set notifications
    if (notificationsData) {
      setNotifications(notificationsData);
    }

    // Calculate stats
    const totalOwners = owners.length || (profilesData?.length || 0);
    const totalSellers = sellersData?.length || 0;
    const activeSellers = sellersData?.filter(s => s.status === 'active').length || 0;
    const waitlisted = sellersData?.filter(s => s.status === 'waitlisted').length || 0;
    const totalItems = itemsData?.length || 0;
    const openItems = itemsData?.filter(i => i.status === 'open').length || 0;
    const claimedItems = itemsData?.filter(i => i.status === 'claimed').length || 0;
    const doneItems = itemsData?.filter(i => i.status === 'done').length || 0;
    
    let totalClaims = 0;
    let activeClaims = 0;
    itemsData?.forEach(item => {
      if (item.claims) {
        totalClaims += item.claims.length;
        activeClaims += item.claims.filter((c: any) => c.status === 'active').length;
      }
    });

    setStats({
      totalOwners: new Set(itemsData?.map(i => i.owner_id) || []).size,
      totalSellers,
      activeSellers,
      waitlistedSellers: waitlisted,
      totalItems,
      openItems,
      claimedItems,
      doneItems,
      totalClaims,
      activeClaims
    });

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
      setWaitlistedSellers(prev => prev.filter(s => s.id !== sellerId));
      setSellers(prev => prev.map(s => 
        s.id === sellerId ? { ...s, status: 'active', activated_at: new Date().toISOString() } : s
      ));
    }

    setProcessingId(null);
  };

  const handleRejectSeller = async (sellerId: string) => {
    setProcessingId(sellerId);

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
      setWaitlistedSellers(prev => prev.filter(s => s.id !== sellerId));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Open</Badge>;
      case 'claimed':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Claimed</Badge>;
      case 'done':
        return <Badge className="bg-success/10 text-success border-success/20">Done</Badge>;
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'waitlisted':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Waitlisted</Badge>;
      case 'paused':
        return <Badge className="bg-muted text-muted-foreground">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                  Central hub for managing users, items, and applications
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 w-fit">
                <Shield className="h-3 w-3" />
                Admin Access
              </Badge>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Owners</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stats.totalOwners}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Sellers</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {stats.activeSellers}
                          <span className="text-sm font-normal text-muted-foreground ml-1">/ {stats.totalSellers}</span>
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <UserCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stats.totalItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Open Items</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stats.openItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Apps</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stats.waitlistedSellers}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="owners" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Owners</span>
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{owners.length}</span>
                </TabsTrigger>
                <TabsTrigger value="sellers" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Sellers</span>
                  {waitlistedSellers.length > 0 && (
                    <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">{waitlistedSellers.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items by Status */}
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Items by Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <span className="text-sm font-medium">Open</span>
                          <span className="font-bold text-primary">{stats?.openItems || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                          <span className="text-sm font-medium">Claimed</span>
                          <span className="font-bold text-warning">{stats?.claimedItems || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                          <span className="text-sm font-medium">Done</span>
                          <span className="font-bold text-success">{stats?.doneItems || 0}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sellers Overview */}
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-primary" />
                          Sellers Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                          <span className="text-sm font-medium">Active</span>
                          <span className="font-bold text-success">{stats?.activeSellers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                          <span className="text-sm font-medium">Waitlisted</span>
                          <span className="font-bold text-warning">{stats?.waitlistedSellers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">Total Claims</span>
                          <span className="font-bold text-foreground">{stats?.totalClaims || 0}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="shadow-card md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bell className="h-5 w-5 text-primary" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {notifications.slice(0, 5).length > 0 ? (
                          <div className="space-y-3">
                            {notifications.slice(0, 5).map((notification) => (
                              <div 
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                  notification.is_read ? 'bg-muted/50' : 'bg-primary/5 border border-primary/10'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-muted-foreground' : 'bg-primary'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground">{notification.title}</p>
                                  {notification.message && (
                                    <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">No recent activity</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Owners Tab */}
              <TabsContent value="owners" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : owners.length > 0 ? (
                  <div className="space-y-4">
                    {owners.map((owner) => (
                      <Card key={owner.id} className="shadow-card">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {owner.profile.first_name} {owner.profile.last_name}
                                </h3>
                                <Badge variant="outline">{owner.items_count} items</Badge>
                                {owner.claims_count > 0 && (
                                  <Badge className="bg-warning/10 text-warning border-warning/20">
                                    {owner.claims_count} claims
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {owner.profile.email}
                                </span>
                                {owner.profile.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {owner.profile.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Joined {new Date(owner.profile.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOwner(owner)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No owners yet
                      </h3>
                      <p className="text-muted-foreground">
                        Owners will appear here once they post items
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Sellers Tab */}
              <TabsContent value="sellers" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Pending Applications */}
                    {waitlistedSellers.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-warning" />
                          Pending Applications ({waitlistedSellers.length})
                        </h3>
                        {waitlistedSellers.map((seller) => (
                          <Card key={seller.id} className="shadow-card border-warning/20">
                            <CardContent className="pt-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">
                                      {seller.profile?.first_name} {seller.profile?.last_name}
                                    </h3>
                                    {getStatusBadge(seller.status)}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {seller.profile?.email}
                                    </p>
                                    {seller.profile?.phone && (
                                      <p className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {seller.profile.phone}
                                      </p>
                                    )}
                                    {seller.service_area && (
                                      <p className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {seller.service_area}
                                      </p>
                                    )}
                                    <p className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Applied: {new Date(seller.applied_at).toLocaleDateString()}
                                    </p>
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
                    )}

                    {/* All Sellers */}
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        All Sellers ({sellers.length})
                      </h3>
                      {sellers.filter(s => s.status !== 'waitlisted').length > 0 ? (
                        <div className="space-y-4">
                          {sellers.filter(s => s.status !== 'waitlisted').map((seller) => (
                            <Card key={seller.id} className="shadow-card">
                              <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-foreground">
                                        {seller.profile?.first_name} {seller.profile?.last_name}
                                      </h3>
                                      {getStatusBadge(seller.status)}
                                      <Badge variant="outline">{seller.claims_used} claims</Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {seller.profile?.email}
                                      </span>
                                      {seller.service_area && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {seller.service_area}
                                        </span>
                                      )}
                                      {seller.activated_at && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          Active since {new Date(seller.activated_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedSeller(seller)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Profile
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="text-center py-12">
                          <CardContent>
                            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                              No active sellers yet
                            </h3>
                            <p className="text-muted-foreground">
                              Approved sellers will appear here
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`shadow-soft ${!notification.is_read ? 'border-primary/20' : ''}`}
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
                  <Card className="text-center py-12">
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

      {/* Owner Detail Dialog */}
      <Dialog open={!!selectedOwner} onOpenChange={() => setSelectedOwner(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Owner Profile
            </DialogTitle>
            <DialogDescription>
              View owner details and their posted items
            </DialogDescription>
          </DialogHeader>
          {selectedOwner && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Profile Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">
                    {selectedOwner.profile.first_name} {selectedOwner.profile.last_name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedOwner.profile.email}
                    </p>
                    {selectedOwner.profile.phone && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedOwner.profile.phone}
                      </p>
                    )}
                    {selectedOwner.profile.facebook_marketplace_link && (
                      <a 
                        href={selectedOwner.profile.facebook_marketplace_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Facebook Marketplace Profile
                      </a>
                    )}
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(selectedOwner.profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Posted Items ({selectedOwner.items_count})
                  </h4>
                  <div className="space-y-2">
                    {selectedOwner.items.map((item) => (
                      <div key={item.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {item.item_name || item.brand || 'Unnamed Item'}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>${item.min_price}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.claims.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {item.claims.length} claim(s) - {item.claims.filter(c => c.status === 'active').length} active
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Seller Detail Dialog */}
      <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Seller Profile
            </DialogTitle>
            <DialogDescription>
              View seller details and activity
            </DialogDescription>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">
                    {selectedSeller.profile?.first_name} {selectedSeller.profile?.last_name}
                  </h3>
                  {getStatusBadge(selectedSeller.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {selectedSeller.profile?.email}
                  </p>
                  {selectedSeller.profile?.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {selectedSeller.profile.phone}
                    </p>
                  )}
                  {selectedSeller.service_area && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedSeller.service_area}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedSeller.claims_used}</p>
                  <p className="text-sm text-muted-foreground">Claims Used</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {selectedSeller.activated_at 
                      ? Math.floor((Date.now() - new Date(selectedSeller.activated_at).getTime()) / (1000 * 60 * 60 * 24))
                      : '-'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                {selectedSeller.proof_link && (
                  <a 
                    href={selectedSeller.proof_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    View Proof Link
                  </a>
                )}
                {selectedSeller.proof_screenshot_url && (
                  <a 
                    href={selectedSeller.proof_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Proof Screenshot
                  </a>
                )}
              </div>

              {/* Dates */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Applied: {new Date(selectedSeller.applied_at).toLocaleString()}</p>
                {selectedSeller.activated_at && (
                  <p>Activated: {new Date(selectedSeller.activated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
