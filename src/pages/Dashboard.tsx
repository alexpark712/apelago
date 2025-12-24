import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemCard } from '@/components/items/ItemCard';
import { mockItems, currentUser } from '@/data/mockData';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [userRole] = useState<'owner' | 'seller'>(currentUser.role);

  // Filter items based on user role
  const ownerItems = mockItems.filter(item => 
    item.ownerName === 'Sarah Mitchell' // Demo: show Sarah's items
  );

  const openItems = ownerItems.filter(item => item.status === 'open');
  const claimedItems = ownerItems.filter(item => item.status === 'claimed');
  const doneItems = ownerItems.filter(item => item.status === 'done');

  const stats = [
    { label: 'Active Listings', value: openItems.length, icon: Package, color: 'text-primary' },
    { label: 'Pending Match', value: claimedItems.length, icon: Clock, color: 'text-warning' },
    { label: 'Completed', value: doneItems.length, icon: CheckCircle2, color: 'text-success' },
  ];

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
                  Welcome back, {currentUser.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={currentUser.isVerified ? 'verified' : 'pending'} className="gap-1">
                  {currentUser.isVerified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Pending Verification
                    </>
                  )}
                </Badge>
                <Link to="/post">
                  <Button variant="accent" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post Item
                  </Button>
                </Link>
              </div>
            </div>

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
                      <ItemCard key={item.id} item={item} showActions={false} />
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
                      <ItemCard key={item.id} item={item} showActions={true} />
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
                      <ItemCard key={item.id} item={item} showActions={false} />
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
