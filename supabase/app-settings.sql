-- Admin password storage (hashed). Run once in Supabase → SQL Editor.

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;
