import { useState } from 'react';
import { verifyRedemption, type Redemption, type User, type Voucher } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { QrCode, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QRScannerProps {
  staffId: string;
}

export default function QRScanner({ staffId }: QRScannerProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Redemption & { user: User; voucher: Voucher }) | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const data = await verifyRedemption(code.trim(), staffId);
      setResult(data);
      toast.success('Voucher verified successfully!');
      setCode('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold tracking-wider">SCAN QR CODE</h3>
              <p className="text-sm text-muted-foreground font-sans">Enter the member's QR code to verify</p>
            </div>
          </div>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-sans">QR Code Value</Label>
              <Input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. IZI-ABCD1234-..."
                className="font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full font-sans" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify Voucher'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Card className="glass-card max-w-md border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold tracking-wider text-lg">VERIFIED!</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-sans">Member</span>
                    <span className="font-bold font-sans">{result.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-sans">Phone</span>
                    <span className="font-sans">{result.user?.phone}</span>
                  </div>
                  <div className="border-t border-border/50 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-sans">Voucher</span>
                    <span className="font-bold font-sans">{result.voucher?.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-sans">Discount</span>
                    <span className="font-bold warm-gradient-text">{result.voucher?.discount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
