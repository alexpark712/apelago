import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, DollarSign, Truck, CheckCircle2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function PostItem() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pickupBySeller, setPickupBySeller] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Item posted successfully!",
      description: "Your item is now visible to verified sellers in your area.",
    });

    setIsSubmitting(false);
    navigate('/dashboard');
  };

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
              <Badge variant="open" className="mb-2">Owner Flow</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Post an Item
              </h1>
              <p className="text-muted-foreground">
                List your item and let vetted sellers help you sell it.
              </p>
            </div>

            {/* Form */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Provide the basic information about your item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Item Photo *</Label>
                    <div 
                      className={`
                        relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
                        ${imagePreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                      `}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      {imagePreview ? (
                        <div className="relative aspect-video">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge variant="verified" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Photo added
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                            <Camera className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Vintage Leather Sofa"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City or ZIP code"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Minimum Price */}
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Acceptable Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minPrice"
                        type="number"
                        min="1"
                        placeholder="0"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The seller will try to get more than this amount
                    </p>
                  </div>

                  {/* Pickup Preference */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="pickup" className="cursor-pointer">Seller picks up item</Label>
                        <p className="text-sm text-muted-foreground">
                          {pickupBySeller ? 'The seller will come to you' : 'You will deliver to the seller'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pickup"
                      checked={pickupBySeller}
                      onCheckedChange={setPickupBySeller}
                    />
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
                        <Upload className="h-5 w-5 mr-2 animate-pulse" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Post Item
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Note */}
            <p className="text-center text-sm text-muted-foreground">
              By posting, you agree to our Terms of Service. SellBridge is a connector only and is not responsible for the sale outcome.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
