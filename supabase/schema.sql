-- Ranu Salon tables — run once in Supabase → SQL Editor → New query → Run

create table if not exists services (
  id text primary key,
  name text not null,
  duration_minutes integer not null,
  price_lkr integer not null,
  is_active boolean not null default true,
  description text
);

create table if not exists bookings (
  id text primary key,
  service_id text not null references services (id),
  customer_name text not null,
  customer_phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists closed_days (
  id text primary key,
  date date not null unique,
  reason text
);

-- Server uses the secret key (bypasses RLS). Keep tables locked to the public anon key.
alter table services enable row level security;
alter table bookings enable row level security;
alter table closed_days enable row level security;

-- Seed starter services (safe to re-run)
insert into services (id, name, duration_minutes, price_lkr, is_active, description)
values
  ('svc-haircut', 'Haircut', 30, 800, true, 'Classic cut and finish.'),
  ('svc-haircut-beard', 'Haircut + Beard Trim', 45, 1200, true, 'Full cut with beard tidy.'),
  ('svc-beard', 'Beard Trim', 20, 500, true, 'Shape and clean up.'),
  ('svc-kids', 'Kids Haircut', 25, 600, true, 'Gentle cut for children.'),
  ('svc-wash-style', 'Wash & Style', 40, 1000, true, 'Shampoo, cut touch-up, and style.'),
  ('svc-color', 'Hair Color (basic)', 90, 3500, true, 'Sample service — update price with owner later.')
on conflict (id) do nothing;
