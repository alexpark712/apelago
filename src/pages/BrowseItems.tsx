import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ItemCard } from '@/components/items/ItemCard';
import { mockItems } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, SlidersHorizontal, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { toast } = useToast();

  const openItems = mockItems.filter(item => item.status === 'open');

  const filteredItems = openItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || 
      item.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handleClaim = (itemId: string) => {
    toast({
      title: "Claim request sent!",
      description: "The owner will be notified of your interest.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-border bg-card">
          <div className="container py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <Badge variant="open">Seller View</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Browse Available Items
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Find items near you that owners want sold. Claim an item to connect with the owner and handle the sale.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-secondary/30 sticky top-16 z-40">
          <div className="container py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative sm:w-64">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City or ZIP..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Items Grid */}
        <section className="py-8 md:py-12">
          <div className="container">
            {filteredItems.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Showing {filteredItems.length} available item{filteredItems.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ItemCard item={item} onClaim={handleClaim} />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <Card variant="flat" className="text-center py-16">
                <CardContent>
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No items found
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your search or location filters to find available items.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
