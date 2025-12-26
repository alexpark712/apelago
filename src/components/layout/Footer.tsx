import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">Apelago</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting item owners with vetted local sellers. Simple, secure matching.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">For Owners</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/post" className="hover:text-foreground transition-colors">Post an Item</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse Items</Link></li>
              <li><Link to="/seller-signup" className="hover:text-foreground transition-colors">Become a Seller</Link></li>
              <li><Link to="/seller-guidelines" className="hover:text-foreground transition-colors">Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/safety" className="hover:text-foreground transition-colors">Safety Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Apelago. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Apelago is a connector service, not a broker. We are not responsible for item condition, safety, or payment.
          </p>
        </div>
      </div>
    </footer>
  );
}
