import { useState, useEffect } from 'react';
import { getSession, getUsers, updateUser, deleteUser, type User, type Role } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [users, setUsers] = useState(getUsers());
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' as Role });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'admin') navigate('/login');
  }, [session, navigate]);

  if (!session) return null;

  const refreshUsers = () => setUsers(getUsers());

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, phone: u.phone, role: u.role });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    updateUser(editUser.id, editForm);
    toast.success('Account updated');
    refreshUsers();
    setDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === session.id) {
      toast.error("You can't delete your own account");
      return;
    }
    deleteUser(id);
    toast.success('Account deleted');
    refreshUsers();
  };

  const renderTable = (role: Role) => {
    const filtered = users.filter(u => u.role === role);
    return (
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-sans">Name</TableHead>
              <TableHead className="font-sans">Email</TableHead>
              <TableHead className="font-sans">Phone</TableHead>
              <TableHead className="font-sans">Points</TableHead>
              <TableHead className="font-sans">Role</TableHead>
              <TableHead className="font-sans text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground font-sans">No {role}s found</TableCell></TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-sans font-medium">{u.name}</TableCell>
                <TableCell className="font-sans">{u.email}</TableCell>
                <TableCell className="font-sans">{u.phone}</TableCell>
                <TableCell className="font-sans">{u.points}</TableCell>
                <TableCell>
                  <span className="text-xs uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full font-sans">{u.role}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 gradient-text">ADMIN PANEL</h1>
          <p className="text-muted-foreground font-sans mb-8">Manage all staff and user accounts</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{users.filter(u => u.role === 'user').length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{users.filter(u => u.role === 'staff').length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" /> Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-wider">{users.filter(u => u.role === 'admin').length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="staff" className="space-y-6">
            <TabsList className="font-sans">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
            <TabsContent value="staff">{renderTable('staff')}</TabsContent>
            <TabsContent value="user">{renderTable('user')}</TabsContent>
            <TabsContent value="admin">{renderTable('admin')}</TabsContent>
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="tracking-wider">EDIT ACCOUNT</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-sans">Name</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Email</Label>
                  <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Phone</Label>
                  <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Role</Label>
                  <Select value={editForm.role} onValueChange={(v: Role) => setEditForm({ ...editForm, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-full font-sans">Save Changes</Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}
