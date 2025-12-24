import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Shield, Users, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface RulesOfEngagementProps {
  onConfirm: () => void;
  ownerName: string;
  sellerName: string;
}

export function RulesOfEngagement({ onConfirm, ownerName, sellerName }: RulesOfEngagementProps) {
  const [confirmed, setConfirmed] = useState(false);

  const rules = [
    {
      icon: MapPin,
      title: 'Meet in Public',
      description: 'Always meet in a well-lit, public location. Police station parking lots are ideal.',
    },
    {
      icon: Users,
      title: 'Bring Someone',
      description: 'Consider bringing a friend or family member to the exchange.',
    },
    {
      icon: Phone,
      title: 'Communicate Clearly',
      description: 'Keep all communication respectful. Share contact details only as needed.',
    },
    {
      icon: Shield,
      title: 'Verify Before Paying',
      description: 'Inspect items thoroughly before any money changes hands.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Rules of Engagement</CardTitle>
          <p className="text-muted-foreground mt-2">
            {ownerName} and {sellerName} have been matched. Before proceeding, please review these safety guidelines.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <rule.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{rule.title}</h4>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Important Disclaimer</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  SellBridge acts as a connector only. We are not responsible for item condition, safety, payment, or any disputes. All transactions happen between you and the other party.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I have read and understand these safety guidelines. I acknowledge that SellBridge is not responsible for the transaction outcome.
              </span>
            </label>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!confirmed}
            onClick={onConfirm}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Confirm & View Contact Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
