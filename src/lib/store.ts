import supabase from './supabase';

export type Role = 'user' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  points: number;
  created_at: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  discount: string;
  expires_at: string;
  active: boolean;
  created_by: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  voucher_id: string;
  redeemed_at: string;
  qr_code: string;
  status: 'pending' | 'verified';
  verified_by: string | null;
  // joined fields
  voucher?: Voucher;
  user?: User;
}

const SESSION_KEY = 'izimart_session';

// Session management (kept in localStorage for simplicity)
export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

// ---- Users ----

export async function getSession(): Promise<User | null> {
  const id = getSessionId();
  if (!id) return null;
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function signup(name: string, email: string, password: string, phone: string, role: Role = 'user'): Promise<User> {
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) throw new Error('Email already exists');
  
  const { data, error } = await supabase.from('users').insert({
    name, email, password, role, phone, points: 0,
  }).select().single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
  if (error || !data) throw new Error('Invalid email or password');
  setSession(data.id);
  return data;
}

export function logout() {
  setSession(null);
}

export async function addPoints(phone: string, amountRM: number): Promise<User> {
  const { data: user, error: findErr } = await supabase.from('users').select('*').eq('phone', phone).single();
  if (findErr || !user) throw new Error('Member not found with this phone number');
  
  const newPoints = user.points + amountRM;
  const { data, error } = await supabase.from('users').update({ points: newPoints }).eq('id', user.id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Vouchers ----

export async function getVouchers(): Promise<Voucher[]> {
  const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getActiveVouchers(): Promise<Voucher[]> {
  const { data } = await supabase.from('vouchers').select('*').eq('active', true);
  return data || [];
}

export async function createVoucher(v: Omit<Voucher, 'id'>): Promise<Voucher> {
  const { data, error } = await supabase.from('vouchers').insert(v).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVoucher(id: string, updates: Partial<Voucher>): Promise<Voucher> {
  const { data, error } = await supabase.from('vouchers').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVoucher(id: string) {
  const { error } = await supabase.from('vouchers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Redemptions ----

function generateQRCode(): string {
  return 'IZI-' + Math.random().toString(36).slice(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
}

export async function claimVoucher(userId: string, voucherId: string): Promise<Redemption> {
  // Get user and voucher
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
  const { data: voucher } = await supabase.from('vouchers').select('*').eq('id', voucherId).single();
  
  if (!user || !voucher) throw new Error('User or voucher not found');
  if (user.points < voucher.points_cost) throw new Error('Not enough points');
  
  // Deduct points
  const { error: pointsErr } = await supabase.from('users').update({ points: user.points - voucher.points_cost }).eq('id', userId);
  if (pointsErr) throw new Error(pointsErr.message);
  
  // Create redemption
  const qr_code = generateQRCode();
  const { data, error } = await supabase.from('redemptions').insert({
    user_id: userId,
    voucher_id: voucherId,
    qr_code,
    status: 'pending',
  }).select().single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  const { data } = await supabase
    .from('redemptions')
    .select('*, voucher:vouchers(*)')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false });
  return data || [];
}

export async function verifyRedemption(qrCode: string, staffId: string): Promise<Redemption & { user: User; voucher: Voucher }> {
  const { data: redemption, error } = await supabase
    .from('redemptions')
    .select('*, voucher:vouchers(*), user:users(*)')
    .eq('qr_code', qrCode)
    .single();
  
  if (error || !redemption) throw new Error('Invalid QR code');
  if (redemption.status === 'verified') throw new Error('This voucher has already been verified');
  
  // Mark as verified
  const { error: updateErr } = await supabase
    .from('redemptions')
    .update({ status: 'verified', verified_by: staffId })
    .eq('id', redemption.id);
  
  if (updateErr) throw new Error(updateErr.message);
  
  return { ...redemption, status: 'verified', verified_by: staffId };
}

export async function getRedemptionHistory(): Promise<Redemption[]> {
  const { data } = await supabase
    .from('redemptions')
    .select('*, voucher:vouchers(*), user:users(*)')
    .order('redeemed_at', { ascending: false });
  return data || [];
}

// Seed defaults (run once)
export async function seedDefaults() {
  const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
  if (!admins || admins.length === 0) {
    await supabase.from('users').insert({
      name: 'Admin',
      email: 'admin@izimart.com',
      password: 'admin123',
      role: 'admin',
      phone: '0123456789',
      points: 0,
    });
  }
  
  const { data: staff } = await supabase.from('users').select('id').eq('role', 'staff');
  if (!staff || staff.length === 0) {
    await supabase.from('users').insert({
      name: 'Staff Member',
      email: 'staff@izimart.com',
      password: 'staff123',
      role: 'staff',
      phone: '0198765432',
      points: 0,
    });
  }
}

// Initialize
seedDefaults();
