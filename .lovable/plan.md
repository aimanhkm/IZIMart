

# IZI MART — Voucher Redemption with QR Codes + Supabase Integration

## Overview

Three major changes: (1) connect to your self-hosted Supabase for persistent data, (2) add voucher claiming via QR code that staff scan, with full history, and (3) polish the overall design.

## 1. Supabase Connection

Your Supabase URL and anon key are public/client-side keys, so they can safely live in the codebase.

- Create `src/lib/supabase.ts` with `createClient` using your provided credentials
- Install `@supabase/supabase-js`
- **Database tables needed** (you'll need to create these in your Supabase dashboard):
  - `users` — id, name, email, password_hash, role, phone, points, created_at
  - `vouchers` — id, title, description, points_cost, discount, expires_at, active, created_by
  - `redemptions` — id, user_id, voucher_id, redeemed_at, qr_code, status ('pending' | 'verified'), verified_by
- Migrate all `localStorage` store functions to Supabase queries

## 2. Voucher Claiming with QR Code

**Member flow:**
- On MemberDashboard, each voucher card gets a "Claim" button (disabled if not enough points)
- Clicking "Claim" deducts points, creates a `redemption` record with status `pending`, and generates a unique QR code string (redemption ID encoded)
- Member sees a QR code displayed in a modal using a lightweight QR generator library (`qrcode.react`)
- Member can view their redemption history with status indicators

**Staff flow:**
- New "Scan QR" tab on StaffDashboard
- Staff enters/scans the QR code value (redemption ID)
- System looks up the redemption, verifies it's pending, marks it as `verified`
- Shows the voucher details and member info for confirmation

**History:**
- MemberDashboard gets a "My Redemptions" section showing all past claims with status (pending/verified) and date
- StaffDashboard gets a "Redemption History" tab showing all verified redemptions

## 3. Design Improvements

- Add particle/confetti effect on successful voucher claim
- Improve card hover animations with subtle glow effects
- Add gradient borders to glass cards
- Better color contrast and spacing throughout dashboards
- Add a "How It Works" animated stepper section on the landing page
- Smoother page transitions between routes

## Technical Details

- **QR Library**: `qrcode.react` — renders QR codes as SVG in the browser
- **Supabase client**: Direct queries from frontend (no edge functions needed for basic CRUD)
- **Auth**: Keep the existing email/password flow but store in Supabase `users` table instead of localStorage
- **Store refactor**: Convert all `store.ts` functions to async Supabase calls, wrap dashboard data fetching with React Query for caching
- **New files**:
  - `src/lib/supabase.ts` — client setup
  - `src/lib/store.ts` — refactored to use Supabase
  - `src/components/QRCodeModal.tsx` — displays QR for claimed voucher
  - `src/components/QRScanner.tsx` — staff input to verify redemption
  - Updated dashboards with new tabs/sections

## Migration Note

You will need to create the database tables in your Supabase instance. I'll provide the SQL schema to run in your Supabase SQL editor.

