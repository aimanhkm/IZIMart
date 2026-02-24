import Navbar from '@/components/Navbar';
import ParallaxHero from '@/components/ParallaxHero';
import ParallaxSections from '@/components/ParallaxSections';
import { ShoppingCart } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function Footer() {
  return (
    <footer className="bg-primary/5 border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-widest">
            <span className="gradient-text">IZI</span> <span className="warm-gradient-text">MART</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-sans">
          © 2026 IZI MART. Your Smart Membership Supermarket.
        </p>
      </div>
    </footer>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParallaxHero />
      <ParallaxSections />
      <Footer />
    </div>
  );
};

export default Index;
