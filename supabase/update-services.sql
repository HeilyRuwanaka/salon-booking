-- Run in Supabase → SQL Editor if tables already exist (updates prices/menu)
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

update services
set is_active = false
where id in ('svc-wash-style');
