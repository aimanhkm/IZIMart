export type Role = 'user' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  points: number;
  createdAt: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discount: string;
  expiresAt: string;
  active: boolean;
  createdBy: string;
}

const USERS_KEY = 'izimart_users';
const VOUCHERS_KEY = 'izimart_vouchers';
const SESSION_KEY = 'izimart_session';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// Seed default admin
function seedDefaults() {
  const users = getUsers();
  if (!users.find(u => u.role === 'admin')) {
    users.push({
      id: 'admin1',
      name: 'Admin',
      email: 'admin@izimart.com',
      password: 'admin123',
      role: 'admin',
      phone: '0123456789',
      points: 0,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  if (!users.find(u => u.role === 'staff')) {
    users.push({
      id: 'staff1',
      name: 'Staff Member',
      email: 'staff@izimart.com',
      password: 'staff123',
      role: 'staff',
      phone: '0198765432',
      points: 0,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getVouchers(): Voucher[] {
  return JSON.parse(localStorage.getItem(VOUCHERS_KEY) || '[]');
}

export function saveVouchers(vouchers: Voucher[]) {
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
}

export function getSession(): User | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

export function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export function signup(name: string, email: string, password: string, phone: string, role: Role = 'user'): User {
  const users = getUsers();
  if (users.find(u => u.email === email)) throw new Error('Email already exists');
  const user: User = {
    id: genId(),
    name,
    email,
    password,
    role,
    phone,
    points: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function login(email: string, password: string): User {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  setSession(user.id);
  return user;
}

export function logout() {
  setSession(null);
}

export function addPoints(phone: string, amountRM: number): User {
  const users = getUsers();
  const user = users.find(u => u.phone === phone);
  if (!user) throw new Error('Member not found with this phone number');
  user.points += amountRM; // RM1 = 1 point
  saveUsers(users);
  return user;
}

export function createVoucher(v: Omit<Voucher, 'id'>): Voucher {
  const vouchers = getVouchers();
  const voucher: Voucher = { ...v, id: genId() };
  vouchers.push(voucher);
  saveVouchers(vouchers);
  return voucher;
}

export function updateVoucher(id: string, updates: Partial<Voucher>) {
  const vouchers = getVouchers();
  const idx = vouchers.findIndex(v => v.id === id);
  if (idx === -1) throw new Error('Voucher not found');
  vouchers[idx] = { ...vouchers[idx], ...updates };
  saveVouchers(vouchers);
  return vouchers[idx];
}

export function deleteVoucher(id: string) {
  const vouchers = getVouchers().filter(v => v.id !== id);
  saveVouchers(vouchers);
}

export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

export function deleteUser(id: string) {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

// Initialize
seedDefaults();
