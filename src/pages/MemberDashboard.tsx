import { getSession, getActiveVouchers, claimVoucher, getUserRedemptions, type User, type Voucher, type Redemption } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Gift, Phone, Ticket, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import QRCodeModal from '@/components/QRCodeModal';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [session, setSessionData] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ open: boolean; redemption: Redemption | null; voucher: Voucher | null }>({ open: false, redemption: null, voucher: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await getSession();
    if (!user) { navigate('/login'); return; }
    setSessionData(user);
    const [v, r] = await Promise.all([getActiveVouchers(), getUserRedemptions(user.id)]);
    setVouchers(v);
    setRedemptions(r);
    setLoading(false);
  };

  const handleClaim = async (voucher: Voucher) => {
    if (!session) return;
    setClaiming(voucher.id);
    try {
      const redemption = await claimVoucher(session.id, voucher.id);
      toast.success('Voucher claimed! Show the QR code at checkout.');
      setQrModal({ open: true, redemption, voucher });
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setClaiming(null);
    }
  };

  if (loading || !session) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 gradient-text">MY MEMBERSHIP</h1>
          <p className="text-muted-foreground font-sans mb-8">Welcome back, {session.name}!</p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> My Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider gradient-text">{session.points}</div>
                <p className="text-xs text-muted-foreground font-sans">points available</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Phone (IC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-sans">{session.phone}</div>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> Redeemed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{redemptions.length}</div>
                <p className="text-xs text-muted-foreground font-sans">vouchers claimed</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Vouchers */}
          <h2 className="text-2xl font-bold tracking-wider mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" /> AVAILABLE VOUCHERS
          </h2>
          {vouchers.length === 0 ? (
            <p className="text-muted-foreground font-sans mb-8">No vouchers available right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {vouchers.map(v => (
                <motion.div key={v.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="glass-card hover:shadow-lg hover:shadow-primary/10 transition-all">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg tracking-wide">{v.title}</h3>
                          <p className="text-sm text-muted-foreground font-sans">{v.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold warm-gradient-text">{v.discount}</div>
                          <div className="text-xs text-muted-foreground font-sans">{v.points_cost} pts</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleClaim(v)}
                        disabled={session.points < v.points_cost || claiming === v.id}
                        className="w-full rounded-full font-sans"
                        size="sm"
                      >
                        {claiming === v.id ? 'Claiming...' : session.points < v.points_cost ? `Need ${v.points_cost - session.points} more pts` : '🎉 Claim Voucher'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Redemption History */}
          <h2 className="text-2xl font-bold tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> MY REDEMPTIONS
          </h2>
          {redemptions.length === 0 ? (
            <p className="text-muted-foreground font-sans">No redemptions yet. Claim a voucher above!</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {redemptions.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="glass-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setQrModal({ open: true, redemption: r, voucher: r.voucher || null })}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.status === 'verified' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                            {r.status === 'verified' ? <CheckCircle className="w-5 h-5 text-primary" /> : <Clock className="w-5 h-5 text-accent" />}
                          </div>
                          <div>
                            <p className="font-bold font-sans text-sm">{r.voucher?.title || 'Voucher'}</p>
                            <p className="text-xs text-muted-foreground font-sans">
                              {new Date(r.redeemed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-sans font-medium ${
                            r.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
                          }`}>
                            {r.status === 'verified' ? '✓ Used' : '⏳ Pending'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <QRCodeModal
        open={qrModal.open}
        onClose={() => setQrModal({ open: false, redemption: null, voucher: null })}
        redemption={qrModal.redemption}
        voucherTitle={qrModal.voucher?.title}
        voucherDiscount={qrModal.voucher?.discount}
      />
    </div>
  );
}
