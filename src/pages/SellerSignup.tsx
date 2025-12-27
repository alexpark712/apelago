import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  CheckCircle2, 
  Upload,
  FileText,
  User,
  Lock,
  Loader2
} from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function SellerSignup() {
  const [proofType, setProofType] = useState<'link' | 'screenshot'>('link');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [proofLink, setProofLink] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (!serviceArea) {
        throw new Error('Service area is required');
      }

      if (proofType === 'link' && !proofLink) {
        throw new Error('Proof link is required');
      }

      if (proofType === 'screenshot' && !proofFile) {
        throw new Error('Proof screenshot is required');
      }

      // Create user account
      const { error: signUpError } = await signUp(email, password, firstName, lastName, phone);

      if (signUpError) {
        let message = 'An error occurred during sign up.';
        if (signUpError.message.includes('User already registered')) {
          message = 'This email is already registered. Try signing in instead.';
        }
        throw new Error(message);
      }

      // Get the current user
      const { data: { user: newUser } } = await supabase.auth.getUser();

      if (!newUser) {
        throw new Error('Failed to get user after signup');
      }

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (proofType === 'screenshot' && proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const filePath = `${newUser.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('seller-proofs')
          .upload(filePath, proofFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('seller-proofs')
            .getPublicUrl(filePath);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Create seller record with waitlisted status
      const { error: sellerError } = await supabase
        .from('sellers')
        .insert({
          user_id: newUser.id,
          service_area: serviceArea,
          proof_link: proofType === 'link' ? proofLink : null,
          proof_screenshot_url: screenshotUrl,
          status: 'waitlisted',
          applied_at: new Date().toISOString(),
        });

      if (sellerError) {
        console.error('Seller creation error:', sellerError);
        throw new Error('Failed to create seller application');
      }

      // Add seller role
      await supabase
        .from('user_roles')
        .insert({ user_id: newUser.id, role: 'seller' });

      // Create admin notification
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'seller_application',
          title: 'New Seller Application',
          message: `${firstName} ${lastName} has applied to become a seller. Service area: ${serviceArea}`,
          related_user_id: newUser.id,
        });

      toast({
        title: "Application submitted!",
        description: "You're on the waitlist. We'll review your application and notify you within 24-48 hours.",
      });

      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Waitlist Notice */}
            <Card variant="flat" className="bg-warning/5 border-warning/20">
              <CardContent className="py-4">
                <p className="text-sm text-warning-foreground text-center">
                  <strong>Note:</strong> All seller applications are reviewed manually. You'll be placed on a waitlist until approved by an admin.
                </p>
              </CardContent>
            </Card>

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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="pl-10"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      At least 6 characters
                    </p>
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
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
                          value={proofLink}
                          onChange={(e) => setProofLink(e.target.value)}
                          required
                        />
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required
                        />
                        {proofFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <span className="text-sm">{proofFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload a screenshot of your marketplace profile
                            </p>
                          </>
                        )}
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
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
