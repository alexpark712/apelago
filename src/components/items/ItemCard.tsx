import { Item } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ItemCardProps {
  item: Item;
  showActions?: boolean;
  onClaim?: (itemId: string) => void;
}

export function ItemCard({ item, showActions = true, onClaim }: ItemCardProps) {
  const statusConfig = {
    open: { label: 'Available', variant: 'open' as const },
    claimed: { label: 'Claimed', variant: 'claimed' as const },
    done: { label: 'Completed', variant: 'done' as const },
  };

  const status = statusConfig[item.status];
  const daysAgo = Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="interactive" className="overflow-hidden group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {item.interestedSellers && item.interestedSellers.length > 0 && item.status === 'open' && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                {item.interestedSellers.length} interested
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{item.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-foreground font-semibold">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>${item.minPrice}+ min</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.pickupByBuyer ? (
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  Seller pickup
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  Owner delivers
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
          </div>

          {showActions && item.status === 'open' && (
            <div className="pt-2 flex gap-2">
              <Link to={`/item/${item.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                </Button>
              </Link>
              {onClaim && (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => onClaim(item.id)}
                >
                  Claim
                </Button>
              )}
            </div>
          )}

          {showActions && item.status === 'claimed' && (
            <div className="pt-2">
              <Link to={`/item/${item.id}`} className="w-full">
                <Button variant="secondary" className="w-full" size="sm">
                  View Match
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
