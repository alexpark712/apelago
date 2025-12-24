import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowRight, 
  Package, 
  Users, 
  Shield, 
  CheckCircle2, 
  Zap,
  Camera,
  MapPin,
  DollarSign,
  Handshake
} from 'lucide-react';

const Index = () => {
  const ownerSteps = [
    { icon: Camera, title: 'Post Your Item', description: 'Upload a photo and set your minimum price' },
    { icon: Users, title: 'Get Matched', description: 'Vetted sellers will express interest' },
    { icon: Handshake, title: 'Connect & Sell', description: 'Meet your seller and complete the sale' },
  ];

  const sellerSteps = [
    { icon: Shield, title: 'Get Verified', description: 'Quick verification with selling proof' },
    { icon: MapPin, title: 'Browse Nearby', description: 'Find items in your area to sell' },
    { icon: DollarSign, title: 'Claim & Earn', description: 'Claim items and keep your profits' },
  ];

  const features = [
    { icon: Zap, title: 'Fast Matching', description: 'Get connected with sellers within hours' },
    { icon: Shield, title: 'Vetted Sellers', description: 'All sellers verified with selling history' },
    { icon: CheckCircle2, title: 'No Fees on Sales', description: 'Keep 100% of your sale proceeds' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-warm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]" />
          <div className="container relative py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-4 text-sm px-4 py-1.5">
                  Simple. Local. Trusted.
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight"
              >
                Connect with local sellers to{' '}
                <span className="text-primary">sell your items</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Don't have time to sell? We match you with vetted local sellers who handle everything. 
                Post your item, get matched, and let someone else do the selling.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/post">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    <Package className="h-5 w-5 mr-2" />
                    Post an Item
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/seller-signup">
                  <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                    <Users className="h-5 w-5 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="border-b border-border bg-card">
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 justify-center md:justify-start"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Owners */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="open" className="mb-4">For Owners</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Sell your items without the hassle
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Post once, get matched with a vetted seller, and let them handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {ownerSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card variant="elevated" className="text-center h-full">
                    <CardContent className="pt-8 pb-6 px-6 space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                        {index + 1}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/post">
                <Button variant="accent" size="lg">
                  Post Your First Item
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works - Sellers */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="verified" className="mb-4">For Sellers</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Turn your selling skills into income
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Browse local items, claim what you can sell, and keep your profits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {sellerSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card variant="elevated" className="text-center h-full">
                    <CardContent className="pt-8 pb-6 px-6 space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-success" />
                      </div>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                        {index + 1}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/seller-signup">
                <Button variant="success" size="lg">
                  Apply as a Seller
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <Card variant="elevated" className="gradient-hero text-primary-foreground overflow-hidden">
              <CardContent className="py-12 md:py-16 px-8 md:px-16 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--primary-glow)/0.3)_0%,_transparent_50%)]" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  <h2 className="font-display text-3xl md:text-4xl font-bold">
                    Ready to get started?
                  </h2>
                  <p className="text-primary-foreground/80 text-lg">
                    Join thousands of owners and sellers connecting locally. No complicated fees, no hassle.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/post">
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                        <Package className="h-5 w-5 mr-2" />
                        I Have Items to Sell
                      </Button>
                    </Link>
                    <Link to="/browse">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                        <Users className="h-5 w-5 mr-2" />
                        I Want to Sell Items
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
