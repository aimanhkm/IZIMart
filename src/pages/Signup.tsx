import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, setSession } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = signup(name, email, password, phone);
      setSession(user.id);
      toast.success('Welcome to IZI MART!');
      navigate('/member');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl tracking-widest gradient-text">JOIN NOW</CardTitle>
              <CardDescription className="font-sans">Become an IZI MART member today</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-sans">Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Phone Number (IC)</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0123456789" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full rounded-full font-sans font-semibold">Create Account</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground font-sans mt-4">
                Already a member?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
