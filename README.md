# Ranu Salon — Online Booking

Real salon website for **Ranu Salon** (Sri Lanka): public booking + **mobile phone admin**.

Built to learn by doing, then put a live link on your CV.

## What this project is

| Who | What they do |
|-----|----------------|
| Customer | Opens site → Book Now → service → date/time → name/phone |
| Owner (phone) | Logs into `/admin` → confirm / cancel / reschedule / close days |

**Stack (learn these names for interviews):**

- **Next.js + React + TypeScript** — the website
- **Tailwind CSS** — styling
- **Supabase** — online database (bookings, services, closed days)
- Later: **Vercel** (live internet URL)

## Run on your PC (today — no accounts needed)

```bash
cd salon-booking
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Public site: `/` `/about` `/services` `/contact` `/book`
- Owner admin: `/admin/login`
- **Local admin password:** `ranu1234`  
  (change with env `ADMIN_PASSWORD` later)

## Easy places to edit later

| File | What |
|------|------|
| `src/lib/salon.config.ts` | Name, phone, hours, address, map, images |
| Admin → Services | Prices and durations |
| Admin → Closed | Days salon is shut |

## Project folders (plain English)

```
src/app/           → pages (Home, Book, Admin…)
src/app/api/       → server actions (save bookings, login…)
src/components/    → reusable UI pieces
src/lib/           → config, database helpers, slot logic
supabase/schema.sql → SQL that creates the tables
```

Copy `.env.example` → `.env.local` and add your Supabase keys (never commit `.env.local`).

## Learning path (what we do next)

1. ✅ Run locally and click through booking + admin  
2. ✅ Create **Supabase** project + keys in `.env.local`  
3. ✅ Run `supabase/schema.sql` in Supabase SQL Editor  
4. ✅ Create **GitHub** → push code  
5. Create **Vercel** → live URL for your friend + CV (add the same env vars there) 


