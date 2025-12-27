import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Users,
  TrendingUp,
  Loader2,
  MapPin,
  DollarSign
} from 'lucide-react';

interface Item {
  id: string;
  item_name: string | null;
  brand: string | null;
  location: string;
  min_price: number;
  photo_url: string;
  status: string;
  created_at: string;
}

interface SellerStatus {
  status: string;
  claims_used: number;
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);

    // Fetch user roles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesData) {
      setUserRoles(rolesData.map(r => r.role));
    }

    // Fetch user's items (as owner)
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (itemsData) {
      setItems(itemsData);
    }

    // Fetch seller status if applicable
    const { data: sellerData } = await supabase
      .from('sellers')
      .select('status, claims_used')
      .eq('user_id', user.id)
      .single();

    if (sellerData) {
      setSellerStatus(sellerData);
    }

    setIsLoading(false);
  };

  const openItems = items.filter(item => item.status === 'open');
  const claimedItems = items.filter(item => item.status === 'claimed');
  const doneItems = items.filter(item => item.status === 'done');

  const stats = [
    { label: 'Active Listings', value: openItems.length, icon: Package, color: 'text-primary' },
    { label: 'Pending Match', value: claimedItems.length, icon: Clock, color: 'text-warning' },
    { label: 'Completed', value: doneItems.length, icon: CheckCircle2, color: 'text-success' },
  ];

  const getStatusBadge = () => {
    if (userRoles.includes('admin')) {
      return <Badge variant="verified" className="gap-1"><CheckCircle2 className="h-3 w-3" />Admin</Badge>;
    }
    if (sellerStatus) {
      if (sellerStatus.status === 'active') {
        return <Badge variant="verified" className="gap-1"><CheckCircle2 className="h-3 w-3" />Verified Seller</Badge>;
      }
      if (sellerStatus.status === 'waitlisted') {
        return <Badge variant="pending" className="gap-1"><Clock className="h-3 w-3" />Seller Waitlisted</Badge>;
      }
    }
    if (userRoles.includes('owner')) {
      return <Badge variant="open" className="gap-1"><CheckCircle2 className="h-3 w-3" />Owner</Badge>;
    }
    return <Badge variant="secondary">User</Badge>;
  };

  if (loading || isLoading) {
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
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                {userRoles.includes('admin') && (
                  <Link to="/admin">
                    <Button variant="outline" className="gap-2">
                      <Users className="h-4 w-4" />
                      Admin Console
                    </Button>
                  </Link>
                )}
                <Link to="/post">
                  <Button variant="accent" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post Item
                  </Button>
                </Link>
              </div>
            </div>

            {/* Waitlist Notice */}
            {sellerStatus?.status === 'waitlisted' && (
              <Card variant="flat" className="bg-warning/5 border-warning/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <p className="text-sm text-foreground">
                      Your seller application is being reviewed. You'll be notified once approved.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Items Tabs */}
            <Tabs defaultValue="open" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="open" className="gap-2">
                  <Package className="h-4 w-4" />
                  Open ({openItems.length})
                </TabsTrigger>
                <TabsTrigger value="claimed" className="gap-2">
                  <Users className="h-4 w-4" />
                  Claimed ({claimedItems.length})
                </TabsTrigger>
                <TabsTrigger value="done" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Done ({doneItems.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="space-y-4">
                {openItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" className="text-center py-12">
                    <CardContent>
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No open listings
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Post your first item to get started
                      </p>
                      <Link to="/post">
                        <Button variant="accent">
                          <Plus className="h-4 w-4 mr-2" />
                          Post an Item
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="claimed" className="space-y-4">
                {claimedItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {claimedItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" className="text-center py-12">
                    <CardContent>
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No claimed items
                      </h3>
                      <p className="text-muted-foreground">
                        Items will appear here when a seller claims them
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="done" className="space-y-4">
                {doneItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doneItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <Card variant="flat" className="text-center py-12">
                    <CardContent>
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No completed sales yet
                      </h3>
                      <p className="text-muted-foreground">
                        Completed items will appear here
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

function ItemCard({ item }: { item: Item }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="open">Open</Badge>;
      case 'claimed':
        return <Badge variant="pending">Claimed</Badge>;
      case 'done':
        return <Badge variant="verified">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={item.photo_url} 
          alt={item.item_name || 'Item'} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(item.status)}
        </div>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-foreground mb-2">
          {item.item_name || 'Untitled Item'}
        </h3>
        {item.brand && (
          <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {item.min_price}+
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
