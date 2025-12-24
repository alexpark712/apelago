import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  CheckCircle2, 
  Upload,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SellerSignup() {
  const [proofType, setProofType] = useState<'link' | 'screenshot'>('link');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Application submitted!",
      description: "We'll review your application and get back to you within 24-48 hours.",
    });

    setIsSubmitting(false);
    navigate('/');
  };

  const requirements = [
    { icon: Mail, text: 'Verified email address' },
    { icon: Phone, text: 'Verified phone number' },
    { icon: FileText, text: 'Proof of selling experience' },
    { icon: MapPin, text: 'Service area location' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <Badge variant="verified" className="mb-2">Seller Application</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Become a Seller
              </h1>
              <p className="text-muted-foreground">
                Join our network of vetted sellers and start earning.
              </p>
            </div>

            {/* Requirements */}
            <Card variant="flat" className="bg-success/5 border-success/20">
              <CardContent className="py-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requirements.map((req) => (
                    <div key={req.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <req.icon className="h-4 w-4 text-success" />
                      {req.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  We'll use this to verify your identity and selling experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Service Area *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, State or ZIP code"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You'll see items within a reasonable radius of this location
                    </p>
                  </div>

                  {/* Proof of Experience */}
                  <div className="space-y-4">
                    <Label>Proof of Selling Experience *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={proofType === 'link' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProofType('link')}
                        className="gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Profile Link
                      </Button>
                      <Button
                        type="button"
                        variant={proofType === 'screenshot' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProofType('screenshot')}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Screenshot
                      </Button>
                    </div>

                    {proofType === 'link' ? (
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://facebook.com/marketplace/profile/..."
                          className="pl-10"
                          required
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required
                        />
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload a screenshot of your marketplace profile
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Provide your Facebook Marketplace, OfferUp, or similar selling profile
                    </p>
                  </div>

                  {/* Submit */}
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Shield className="h-5 w-5 mr-2 animate-pulse" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Note */}
            <p className="text-center text-sm text-muted-foreground">
              We review applications within 24-48 hours. We may restrict sellers who repeatedly claim items without follow-through.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
