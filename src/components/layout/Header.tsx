import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Menu, X, Package, Users, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/browse', label: 'Browse Items', icon: Package },
    { path: '/post', label: 'Post Item', icon: null },
    { path: '/seller-signup', label: 'Become a Seller', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">Apelago</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/post">
                    <Button variant="accent" size="sm">Post an Item</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border bg-background"
        >
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.path) ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/post" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="accent" className="w-full">Post an Item</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
