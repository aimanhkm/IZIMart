import { useState, useEffect } from 'react';
import { getSession, getUsers, addPoints, getVouchers, createVoucher, updateVoucher, deleteVoucher, type Voucher } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Plus, Edit, Trash2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [vouchers, setVouchers] = useState(getVouchers());
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [vForm, setVForm] = useState({ title: '', description: '', pointsCost: '', discount: '', expiresAt: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!session || (session.role !== 'staff' && session.role !== 'admin')) navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = addPoints(phone, Number(amount));
      toast.success(`Added ${amount} points to ${user.name} (Total: ${user.points})`);
      setPhone('');
      setAmount('');
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCreateVoucher = () => {
    setEditVoucher(null);
    setVForm({ title: '', description: '', pointsCost: '', discount: '', expiresAt: '' });
    setDialogOpen(true);
  };

  const openEditVoucher = (v: Voucher) => {
    setEditVoucher(v);
    setVForm({ title: v.title, description: v.description, pointsCost: String(v.pointsCost), discount: v.discount, expiresAt: v.expiresAt });
    setDialogOpen(true);
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editVoucher) {
        updateVoucher(editVoucher.id, { ...vForm, pointsCost: Number(vForm.pointsCost) });
        toast.success('Voucher updated');
      } else {
        createVoucher({
          ...vForm,
          pointsCost: Number(vForm.pointsCost),
          active: true,
          createdBy: session.id,
        });
        toast.success('Voucher created');
      }
      setVouchers(getVouchers());
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = (id: string) => {
    deleteVoucher(id);
    setVouchers(getVouchers());
    toast.success('Voucher deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 gradient-text">STAFF DASHBOARD</h1>
          <p className="text-muted-foreground font-sans mb-8">Manage memberships and vouchers</p>

          <Tabs defaultValue="points" className="space-y-6">
            <TabsList className="font-sans">
              <TabsTrigger value="points">Add Points</TabsTrigger>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <Card className="glass-card max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 tracking-wider">
                    <Phone className="w-5 h-5 text-primary" /> ADD MEMBERSHIP POINTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPoints} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-sans">Phone Number (IC)</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0123456789" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-sans">Amount (RM) — RM1 = 1 Point</Label>
                      <Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" required />
                    </div>
                    <Button type="submit" className="w-full rounded-full font-sans">
                      <Award className="w-4 h-4 mr-2" /> Add Points
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vouchers">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-wider">VOUCHERS</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full font-sans" onClick={openCreateVoucher}>
                      <Plus className="w-4 h-4 mr-2" /> New Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="tracking-wider">{editVoucher ? 'EDIT VOUCHER' : 'NEW VOUCHER'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveVoucher} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-sans">Title</Label>
                        <Input value={vForm.title} onChange={e => setVForm({ ...vForm, title: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Description</Label>
                        <Input value={vForm.description} onChange={e => setVForm({ ...vForm, description: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-sans">Points Cost</Label>
                          <Input type="number" min="1" value={vForm.pointsCost} onChange={e => setVForm({ ...vForm, pointsCost: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-sans">Discount</Label>
                          <Input value={vForm.discount} onChange={e => setVForm({ ...vForm, discount: e.target.value })} placeholder="e.g. 10% OFF" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Expires At</Label>
                        <Input type="date" value={vForm.expiresAt} onChange={e => setVForm({ ...vForm, expiresAt: e.target.value })} required />
                      </div>
                      <Button type="submit" className="w-full rounded-full font-sans">{editVoucher ? 'Update' : 'Create'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="glass-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">Title</TableHead>
                      <TableHead className="font-sans">Discount</TableHead>
                      <TableHead className="font-sans">Points</TableHead>
                      <TableHead className="font-sans">Expires</TableHead>
                      <TableHead className="font-sans text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground font-sans">No vouchers yet</TableCell></TableRow>
                    ) : vouchers.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-sans font-medium">{v.title}</TableCell>
                        <TableCell className="font-sans">{v.discount}</TableCell>
                        <TableCell className="font-sans">{v.pointsCost}</TableCell>
                        <TableCell className="font-sans">{v.expiresAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditVoucher(v)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card className="glass-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">Name</TableHead>
                      <TableHead className="font-sans">Phone</TableHead>
                      <TableHead className="font-sans">Points</TableHead>
                      <TableHead className="font-sans">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUsers().filter(u => u.role === 'user').map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-sans font-medium">{u.name}</TableCell>
                        <TableCell className="font-sans">{u.phone}</TableCell>
                        <TableCell className="font-sans font-bold">{u.points}</TableCell>
                        <TableCell className="font-sans">{u.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
