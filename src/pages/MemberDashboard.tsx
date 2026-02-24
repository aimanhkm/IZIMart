import { getSession, getVouchers } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Gift, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const vouchers = getVouchers().filter(v => v.active);

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 gradient-text">MY MEMBERSHIP</h1>
          <p className="text-muted-foreground font-sans mb-8">Welcome back, {session.name}!</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> My Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{session.points}</div>
                <p className="text-xs text-muted-foreground font-sans">points earned</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Phone (IC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-sans">{session.phone}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" /> Available Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{vouchers.length}</div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold tracking-wider mb-4">AVAILABLE VOUCHERS</h2>
          {vouchers.length === 0 ? (
            <p className="text-muted-foreground font-sans">No vouchers available right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {vouchers.map(v => (
                <motion.div key={v.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg tracking-wide">{v.title}</h3>
                          <p className="text-sm text-muted-foreground font-sans">{v.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold warm-gradient-text">{v.discount}</div>
                          <div className="text-xs text-muted-foreground font-sans">{v.pointsCost} pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
