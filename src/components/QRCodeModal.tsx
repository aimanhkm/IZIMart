import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import type { Redemption } from '@/lib/store';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  redemption: Redemption | null;
  voucherTitle?: string;
  voucherDiscount?: string;
}

export default function QRCodeModal({ open, onClose, redemption, voucherTitle, voucherDiscount }: QRCodeModalProps) {
  if (!redemption) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="tracking-wider text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            VOUCHER CLAIMED!
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex flex-col items-center gap-4 py-4"
        >
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG
              value={redemption.qr_code}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-wider">{voucherTitle}</p>
            <p className="text-lg font-bold warm-gradient-text">{voucherDiscount}</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-3 w-full">
            <p className="text-xs text-muted-foreground font-sans mb-1">QR Code</p>
            <p className="font-mono text-sm font-bold tracking-wider break-all">{redemption.qr_code}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
            <CheckCircle className="w-4 h-4 text-primary" />
            Show this QR code to staff at checkout
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
