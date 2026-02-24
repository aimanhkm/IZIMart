import { ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, logout } from '@/lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const session = getSession();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const dashLink = session ? (session.role === 'admin' ? '/admin' : session.role === 'staff' ? '/staff' : '/member') : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <ShoppingCart className="w-7 h-7 text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-bold tracking-widest">
            <span className="gradient-text">IZI</span> <span className="warm-gradient-text">MART</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground font-sans mr-2">
                Hi, <span className="font-semibold text-foreground">{session.name}</span>
                <span className="ml-1 text-xs uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">{session.role}</span>
              </span>
              {dashLink && (
                <Button variant="ghost" size="sm" className="font-sans" onClick={() => navigate(dashLink)}>
                  Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" className="font-sans" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-sans" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" className="font-sans rounded-full" onClick={() => navigate('/signup')}>
                Join Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-border/50 bg-background/95 backdrop-blur-lg"
          >
            <div className="p-4 flex flex-col gap-2">
              {session ? (
                <>
                  <p className="text-sm text-muted-foreground font-sans mb-2">
                    Logged in as <span className="font-semibold text-foreground">{session.name}</span> ({session.role})
                  </p>
                  {dashLink && (
                    <Button variant="ghost" className="font-sans justify-start" onClick={() => { navigate(dashLink); setOpen(false); }}>
                      Dashboard
                    </Button>
                  )}
                  <Button variant="outline" className="font-sans justify-start" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="font-sans justify-start" onClick={() => { navigate('/login'); setOpen(false); }}>
                    Sign In
                  </Button>
                  <Button className="font-sans" onClick={() => { navigate('/signup'); setOpen(false); }}>
                    Join Now
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
