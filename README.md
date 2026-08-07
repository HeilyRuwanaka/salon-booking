# Ranu Salon — Online Booking

Real salon website for **Ranu Salon** (Sri Lanka): public booking + **mobile phone admin**.

**Live site:** [https://salon-booking-seven-rho.vercel.app](https://salon-booking-seven-rho.vercel.app)

Built to learn by doing — put the live link on your CV.

## What this project is

| Who | What they do |
|-----|----------------|
| Customer | Opens site → Book Now → service → date/time → name/phone |
| Owner (phone) | Logs into `/admin` → confirm / cancel / reschedule / close days |

**Stack (learn these names for interviews):**

- **Next.js + React + TypeScript** — the website
- **Tailwind CSS** — styling
- **Supabase** — online database (bookings, services, closed days)
- **GitHub + Vercel** — code hosting + live URL

## Run on your PC

```bash
cd salon-booking
npm install
cp .env.example .env.local   # then paste your real Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Public: `/` `/about` `/services` `/contact` `/book`
- Shop QR poster: `/qr` (print for the door)
- Owner admin: `/admin/login`
- **Admin password:** set `ADMIN_PASSWORD` in `.env.local` **and** in Vercel → Project → Settings → Environment Variables (same value both places). After changing Vercel, Redeploy.

## Easy places to edit later

| File / place | What |
|--------------|------|
| `src/lib/salon.config.ts` | Name, phone, hours, address, map, about text, reviews, images, live URL |
| Admin → Services | Prices and durations |
| Admin → Closed | Days salon is shut |
| Vercel env | `ADMIN_PASSWORD`, Supabase keys |

## Project folders (plain English)

```
src/app/           → pages (Home, Book, QR, Admin…)
src/app/api/       → server routes (save bookings, login…)
src/components/    → reusable UI pieces
src/lib/           → config, database helpers, slot logic
supabase/schema.sql → SQL that creates the tables
```

Never commit `.env.local` (secrets stay on your PC / Vercel only).

## Learning path

1. ✅ Run locally and click through booking + admin  
2. ✅ Supabase project + schema  
3. ✅ GitHub + Vercel live URL  
4. ✅ Homepage trust sections + printable `/qr`  
5. ⬜ Replace placeholders with real address, photos, reviews from the owner  

## Interview one-liner

> I built a live booking site for a friend’s salon who only has a phone: customers book online (or scan a QR at the door), he confirms and can close days when sick — Next.js, Supabase, and Vercel.
