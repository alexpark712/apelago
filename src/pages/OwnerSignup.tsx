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
  Mail, 
  Lock, 
  User, 
  Phone, 
  Link as LinkIcon, 
  CheckCircle2, 
  Loader2,
  Facebook,
  Shield
} from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const facebookLinkSchema = z.string().url('Please enter a valid URL').refine(
  (url) => url.includes('facebook.com') || url.includes('fb.com'),
  'Please enter a valid Facebook Marketplace link'
);

export default function OwnerSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookLink, setFacebookLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      facebookLinkSchema.parse(facebookLink);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Create the user account
    const { error: signUpError } = await signUp(email, password, firstName, lastName, phone);

    if (signUpError) {
      let message = 'An error occurred during sign up.';
      if (signUpError.message.includes('User already registered')) {
        message = 'This email is already registered. Try signing in instead.';
      }
      
      toast({
        title: 'Sign Up Failed',
        description: message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Update profile with Facebook link
      await supabase
        .from('profiles')
        .update({ facebook_marketplace_link: facebookLink })
        .eq('id', user.id);

      // Add owner role
      await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'owner' });
    }

    toast({
      title: 'Account created!',
      description: 'Welcome to Apelago. You can now post items for sale.',
    });

    setIsSubmitting(false);
    navigate('/dashboard');
  };

  const requirements = [
    { icon: Mail, text: 'Verified email address' },
    { icon: Facebook, text: 'Facebook Marketplace profile link' },
    { icon: Shield, text: 'Identity verification' },
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
              <Badge variant="open" className="mb-2">Owner Registration</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Register as an Owner
              </h1>
              <p className="text-muted-foreground">
                Create an account to list items and connect with verified sellers.
              </p>
            </div>

            {/* Requirements */}
            <Card variant="flat" className="bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {requirements.map((req) => (
                    <div key={req.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <req.icon className="h-4 w-4 text-primary" />
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
                  We'll use this to verify your identity
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

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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

                  {/* Facebook Marketplace Link */}
                  <div className="space-y-2">
                    <Label htmlFor="facebookLink">Facebook Marketplace Profile *</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="facebookLink"
                        placeholder="https://facebook.com/marketplace/profile/..."
                        className="pl-10"
                        value={facebookLink}
                        onChange={(e) => setFacebookLink(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This helps verify your identity and builds trust with sellers
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Create Owner Account
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Note */}
            <p className="text-center text-sm text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
