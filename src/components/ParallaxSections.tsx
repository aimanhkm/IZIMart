import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ShoppingCart, Award, Gift, Shield, Phone, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Phone,
    title: 'PHONE-BASED MEMBERSHIP',
    desc: 'Register with your phone number as IC. Quick, simple, no cards needed.',
    color: 'from-primary to-primary/70',
  },
  {
    icon: CreditCard,
    title: 'RM1 = 1 POINT',
    desc: 'Every ringgit you spend earns you a loyalty point. Watch your balance grow!',
    color: 'from-secondary to-accent',
  },
  {
    icon: Gift,
    title: 'EXCLUSIVE VOUCHERS',
    desc: 'Redeem your points for amazing discounts and exclusive member deals.',
    color: 'from-accent to-secondary',
  },
  {
    icon: Shield,
    title: 'STAFF MANAGED',
    desc: 'Our trained staff handle your membership at checkout — fast and reliable.',
    color: 'from-primary/80 to-primary',
  },
];

function FeatureSection({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const x = useTransform(scrollYProgress, [0, 0.5], [index % 2 === 0 ? -80 : 80, 0]);

  const Icon = feature.icon;

  return (
    <div ref={ref} className="parallax-section min-h-[60vh] flex items-center py-20">
      <motion.div style={{ y, opacity, x }} className="max-w-6xl mx-auto px-6 w-full">
        <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
          <motion.div
            className="flex-1 flex justify-center"
            whileInView={{ scale: [0.8, 1] }}
            transition={{ duration: 0.6 }}
          >
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl`}>
              <Icon className="w-16 h-16 md:w-20 md:h-20 text-primary-foreground" />
            </div>
          </motion.div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">{feature.title}</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed">{feature.desc}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const stats = [
    { value: '10K+', label: 'Members', icon: Award },
    { value: 'RM1=1PT', label: 'Earn Rate', icon: CreditCard },
    { value: '500+', label: 'Vouchers Redeemed', icon: Gift },
    { value: '24/7', label: 'Support', icon: ShoppingCart },
  ];

  return (
    <div ref={ref} className="parallax-section py-24 bg-primary/5">
      <motion.div style={{ scale, opacity }} className="max-w-6xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl font-bold text-center mb-16 tracking-wider gradient-text">
          WHY IZI MART?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl md:text-4xl font-bold tracking-wider">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-sans mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ParallaxSections() {
  return (
    <>
      {features.map((f, i) => (
        <FeatureSection key={f.title} feature={f} index={i} />
      ))}
      <StatsSection />
    </>
  );
}
