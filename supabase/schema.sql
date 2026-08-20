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

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table services enable row level security;
alter table bookings enable row level security;
alter table closed_days enable row level security;
alter table app_settings enable row level security;

-- Current menu (11 AM – 11 PM shop hours in app config)
insert into services (id, name, duration_minutes, price_lkr, is_active, description)
values
  ('svc-kids', 'Kids Haircut', 25, 400, true, 'Gentle cut for children.'),
  ('svc-beard', 'Beard Trim', 20, 450, true, 'Shape and clean up.'),
  ('svc-haircut', 'Adult Haircut', 30, 600, true, 'Classic cut and finish.'),
  ('svc-haircut-beard', 'Haircut + Beard', 45, 1000, true, 'Full cut with beard tidy.'),
  ('svc-head-massage', 'Head Massage', 30, 600, true, 'Relaxing head massage.'),
  ('svc-massage-cut-beard', 'Head Massage + Haircut + Beard', 75, 1400, true, 'Massage with full cut and beard.'),
  ('svc-color', 'Hair Color', 90, 2000, true, 'Starts from LKR 2000 — final price depends on colour.')
on conflict (id) do update set
  name = excluded.name,
  duration_minutes = excluded.duration_minutes,
  price_lkr = excluded.price_lkr,
  is_active = excluded.is_active,
  description = excluded.description;

-- Hide old sample services no longer on the menu
update services
set is_active = false
where id in ('svc-wash-style');
