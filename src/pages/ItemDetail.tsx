import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RulesOfEngagement } from '@/components/items/RulesOfEngagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockItems } from '@/data/mockData';
import { 
  MapPin, 
  DollarSign, 
  Truck, 
  Clock, 
  ArrowLeft,
  Phone,
  Mail,
  User,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRules, setShowRules] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  const item = mockItems.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Item not found</h1>
            <Button variant="outline" onClick={() => navigate('/browse')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusConfig = {
    open: { label: 'Available', variant: 'open' as const },
    claimed: { label: 'Claimed', variant: 'claimed' as const },
    done: { label: 'Completed', variant: 'done' as const },
  };

  const status = statusConfig[item.status];
  const daysAgo = Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  const handleClaim = () => {
    if (item.status === 'claimed') {
      setShowRules(true);
    } else {
      toast({
        title: "Claim request sent!",
        description: "The owner will be notified of your interest.",
      });
    }
  };

  const handleRulesConfirm = () => {
    setContactRevealed(true);
    setShowRules(false);
    toast({
      title: "Contact information revealed",
      description: "You can now contact the owner directly.",
    });
  };

  if (showRules) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 md:py-12">
          <div className="container">
            <Button 
              variant="ghost" 
              onClick={() => setShowRules(false)} 
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <RulesOfEngagement 
              onConfirm={handleRulesConfirm}
              ownerName={item.ownerName}
              sellerName={item.sellerName || 'Seller'}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card variant="elevated" className="overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Badge variant={status.variant} className="mb-3">{status.label}</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {item.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card variant="flat" className="bg-secondary/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <p className="font-semibold text-foreground">{item.location}</p>
                  </CardContent>
                </Card>
                
                <Card variant="flat" className="bg-secondary/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <DollarSign className="h-4 w-4" />
                      Minimum Price
                    </div>
                    <p className="font-semibold text-foreground">${item.minPrice}+</p>
                  </CardContent>
                </Card>
                
                <Card variant="flat" className="bg-secondary/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Truck className="h-4 w-4" />
                      Pickup
                    </div>
                    <p className="font-semibold text-foreground">
                      {item.pickupByBuyer ? 'Seller picks up' : 'Owner delivers'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="flat" className="bg-secondary/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Clock className="h-4 w-4" />
                      Posted
                    </div>
                    <p className="font-semibold text-foreground">
                      {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info (if revealed) */}
              {(contactRevealed || item.status === 'claimed') && contactRevealed && (
                <Card variant="elevated" className="border-success/20 bg-success/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Owner</p>
                        <p className="font-semibold text-foreground">{item.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold text-foreground">{item.ownerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold text-foreground">{item.ownerPhone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interested Sellers (for owner) */}
              {item.interestedSellers && item.interestedSellers.length > 0 && item.status === 'open' && (
                <Card variant="elevated">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Interested Sellers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.interestedSellers.map((seller) => (
                      <div key={seller.sellerId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{seller.sellerName}</p>
                            <p className="text-xs text-muted-foreground">
                              Interested {Math.floor((Date.now() - seller.interestedAt.getTime()) / (1000 * 60 * 60 * 24))}d ago
                            </p>
                          </div>
                        </div>
                        <Button variant="accent" size="sm">
                          Accept
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {item.status === 'open' && (
                  <Button variant="hero" size="lg" className="w-full" onClick={handleClaim}>
                    Claim This Item
                  </Button>
                )}
                
                {item.status === 'claimed' && !contactRevealed && (
                  <Button variant="hero" size="lg" className="w-full" onClick={handleClaim}>
                    View Contact Information
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
