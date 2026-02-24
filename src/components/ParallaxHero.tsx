import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ShoppingCart, Star, Gift, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FloatingItem = ({ children, delay, x, y }: { children: React.ReactNode; delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute text-primary/20"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

export default function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const navigate = useNavigate();

  return (
    <div ref={ref} className="parallax-section min-h-[100vh] flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Floating grocery items */}
      <FloatingItem delay={0} x={10} y={15}><ShoppingCart size={60} /></FloatingItem>
      <FloatingItem delay={0.5} x={80} y={10}><Star size={50} /></FloatingItem>
      <FloatingItem delay={1} x={85} y={60}><Gift size={55} /></FloatingItem>
      <FloatingItem delay={1.5} x={5} y={70}><Users size={45} /></FloatingItem>
      <FloatingItem delay={0.8} x={50} y={5}><ShoppingCart size={40} /></FloatingItem>
      <FloatingItem delay={2} x={20} y={85}><Star size={35} /></FloatingItem>

      <motion.div style={{ y: y1, opacity, scale }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Trolley icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1.2, bounce: 0.4 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30">
            <ShoppingCart className="w-14 h-14 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-7xl md:text-9xl font-bold tracking-wider mb-2"
        >
          <span className="gradient-text">IZI</span>{' '}
          <span className="warm-gradient-text">MART</span>
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground mb-4 font-sans font-light tracking-wide"
        >
          Your Smart Membership Supermarket
        </motion.p>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-base text-muted-foreground/70 mb-10 font-sans max-w-lg mx-auto"
        >
          Earn points with every purchase — RM1 = 1 Point. Redeem exclusive vouchers and enjoy member-only deals.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button size="lg" className="text-lg px-8 py-6 rounded-full font-sans font-semibold" onClick={() => navigate('/signup')}>
            Join Now
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full font-sans font-semibold border-primary/30 hover:bg-primary/5" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ y: y2 }}
          className="mt-16"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full mx-auto flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
