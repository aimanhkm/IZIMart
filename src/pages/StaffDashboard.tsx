import { useState, useEffect } from "react";
import {
  getSession,
  getUsers,
  addPoints,
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getRedemptionHistory,
  signup,
  type Voucher,
  type User,
  type Redemption,
} from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Phone,
  Plus,
  Edit,
  Trash2,
  Award,
  QrCode,
  History,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import QRScanner from "@/components/QRScanner";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [session, setSessionData] = useState<User | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [vouchers, setVouchersList] = useState<Voucher[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [vForm, setVForm] = useState({
    title: "",
    description: "",
    points_cost: "",
    discount: "",
    expires_at: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [mForm, setMForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await getSession();
    if (!user || (user.role !== "staff" && user.role !== "admin")) {
      navigate("/login");
      return;
    }
    setSessionData(user);
    const [v, u, r] = await Promise.all([
      getVouchers(),
      getUsers(),
      getRedemptionHistory(),
    ]);
    setVouchersList(v);
    setMembers(u.filter((u) => u.role === "user"));
    setRedemptions(r);
    setLoading(false);
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await addPoints(phone, Number(amount));
      toast.success(
        `Added ${amount} points to ${user.name} (Total: ${user.points})`,
      );
      setPhone("");
      setAmount("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCreateVoucher = () => {
    setEditVoucher(null);
    setVForm({
      title: "",
      description: "",
      points_cost: "",
      discount: "",
      expires_at: "",
    });
    setDialogOpen(true);
  };

  const openEditVoucher = (v: Voucher) => {
    setEditVoucher(v);
    setVForm({
      title: v.title,
      description: v.description,
      points_cost: String(v.points_cost),
      discount: v.discount,
      expires_at: v.expires_at,
    });
    setDialogOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editVoucher) {
        await updateVoucher(editVoucher.id, {
          ...vForm,
          points_cost: Number(vForm.points_cost),
        });
        toast.success("Voucher updated");
      } else {
        await createVoucher({
          ...vForm,
          points_cost: Number(vForm.points_cost),
          active: true,
          created_by: session!.id,
        });
        toast.success("Voucher created");
      }
      await loadData();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteVoucher(id);
    toast.success("Voucher deleted");
    await loadData();
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(
        mForm.name,
        mForm.email,
        mForm.password,
        mForm.phone,
        "user",
      );
      toast.success("Member added successfully");
      setMForm({ name: "", phone: "", email: "", password: "" });
      setMemberDialogOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading || !session)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 gradient-text">
            STAFF DASHBOARD
          </h1>
          <p className="text-muted-foreground font-sans mb-8">
            Manage memberships, vouchers & QR verification
          </p>

          <Tabs defaultValue="points" className="space-y-6">
            <TabsList className="font-sans">
              <TabsTrigger value="points">
                <Award className="w-4 h-4 mr-1" /> Points
              </TabsTrigger>
              <TabsTrigger value="scan">
                <QrCode className="w-4 h-4 mr-1" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-1" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <Card className="glass-card max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 tracking-wider">
                    <Phone className="w-5 h-5 text-primary" /> ADD MEMBERSHIP
                    POINTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPoints} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-sans">Phone Number (IC)</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0123456789"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-sans">
                        Amount (RM) — RM1 = 1 Point
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-full font-sans"
                    >
                      <Award className="w-4 h-4 mr-2" /> Add Points
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scan">
              <QRScanner staffId={session.id} />
            </TabsContent>

            <TabsContent value="vouchers">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-wider">VOUCHERS</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="rounded-full font-sans"
                      onClick={openCreateVoucher}
                    >
                      <Plus className="w-4 h-4 mr-2" /> New Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="tracking-wider">
                        {editVoucher ? "EDIT VOUCHER" : "NEW VOUCHER"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveVoucher} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-sans">Title</Label>
                        <Input
                          value={vForm.title}
                          onChange={(e) =>
                            setVForm({ ...vForm, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Description</Label>
                        <Input
                          value={vForm.description}
                          onChange={(e) =>
                            setVForm({ ...vForm, description: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-sans">Points Cost</Label>
                          <Input
                            type="number"
                            min="1"
                            value={vForm.points_cost}
                            onChange={(e) =>
                              setVForm({
                                ...vForm,
                                points_cost: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-sans">Discount</Label>
                          <Input
                            value={vForm.discount}
                            onChange={(e) =>
                              setVForm({ ...vForm, discount: e.target.value })
                            }
                            placeholder="e.g. 10% OFF"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Expires At</Label>
                        <Input
                          type="date"
                          value={vForm.expires_at}
                          onChange={(e) =>
                            setVForm({ ...vForm, expires_at: e.target.value })
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-full font-sans"
                      >
                        {editVoucher ? "Update" : "Create"}
                      </Button>
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
                      <TableHead className="font-sans text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground font-sans"
                        >
                          No vouchers yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      vouchers.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-sans font-medium">
                            {v.title}
                          </TableCell>
                          <TableCell className="font-sans">
                            {v.discount}
                          </TableCell>
                          <TableCell className="font-sans">
                            {v.points_cost}
                          </TableCell>
                          <TableCell className="font-sans">
                            {v.expires_at}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditVoucher(v)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(v.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-wider">MEMBERS</h2>
                <Dialog
                  open={memberDialogOpen}
                  onOpenChange={setMemberDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="rounded-full font-sans">
                      <Plus className="w-4 h-4 mr-2" /> Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="tracking-wider">
                        NEW MEMBER
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-sans">Name</Label>
                        <Input
                          value={mForm.name}
                          onChange={(e) =>
                            setMForm({ ...mForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Email</Label>
                        <Input
                          type="email"
                          value={mForm.email}
                          onChange={(e) =>
                            setMForm({ ...mForm, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Phone</Label>
                        <Input
                          type="tel"
                          value={mForm.phone}
                          onChange={(e) =>
                            setMForm({ ...mForm, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-sans">Password</Label>
                        <Input
                          type="password"
                          value={mForm.password}
                          onChange={(e) =>
                            setMForm({ ...mForm, password: e.target.value })
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full rounded-full font-sans"
                      >
                        Create Member
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

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
                    {members.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-sans font-medium">
                          {u.name}
                        </TableCell>
                        <TableCell className="font-sans">{u.phone}</TableCell>
                        <TableCell className="font-sans font-bold">
                          {u.points}
                        </TableCell>
                        <TableCell className="font-sans">{u.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <h2 className="text-2xl font-bold tracking-wider mb-4">
                REDEMPTION HISTORY
              </h2>
              <Card className="glass-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">Member</TableHead>
                      <TableHead className="font-sans">Voucher</TableHead>
                      <TableHead className="font-sans">Discount</TableHead>
                      <TableHead className="font-sans">Status</TableHead>
                      <TableHead className="font-sans">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground font-sans"
                        >
                          No redemptions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      redemptions.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-sans font-medium">
                            {r.user?.name || "—"}
                          </TableCell>
                          <TableCell className="font-sans">
                            {r.voucher?.title || "—"}
                          </TableCell>
                          <TableCell className="font-sans font-bold warm-gradient-text">
                            {r.voucher?.discount || "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-sans font-medium ${
                                r.status === "verified"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-accent/10 text-accent-foreground"
                              }`}
                            >
                              {r.status === "verified"
                                ? "✓ Verified"
                                : "⏳ Pending"}
                            </span>
                          </TableCell>
                          <TableCell className="font-sans text-sm">
                            {new Date(r.redeemed_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
