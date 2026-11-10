-- Run once in Supabase Dashboard > SQL Editor.
-- The app now uses ONLY public.users (no order_delivery_users table).

-- 1) Checklist sub-page permissions (route hrefs). NULL = legacy row => all pages.
alter table public.users
  add column if not exists allowed_checklist_pages jsonb;

-- 2) The app uses the public anon key, so RLS must allow it (skip if RLS is off / already set).
alter table public.users enable row level security;
drop policy if exists "users_all" on public.users;
create policy "users_all" on public.users for all using (true) with check (true);

-- 3) Root admin (only if missing). Change the password after first login.
insert into public.users
  (id, username, password, name, email, role, is_admin, status, allowed_pages, allowed_stages, avatar_color)
values
  ('USR-ADMIN', 'admin', 'admin123', 'Sainy Garg', 'admin@sainygargcouture.com', 'Admin', true, 'Active',
   '["dashboard","orders","stages","settings"]'::jsonb,
   '["material_check","embroidery_marking_cutting","embroidery_sample_approval","full_embroidery",
     "final_cutting_karigar_allotment","stitching_completed","first_qc_alterations_cleared",
     "finishing_final_qc_passed","trial_packing_pickup","final_trial_delivered_return"]'::jsonb,
   'bg-[#5B172E]')
on conflict (id) do nothing;

-- 4) Orders and master data tables (unchanged)
create table if not exists public.order_delivery_orders (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.order_delivery_orders enable row level security;
drop policy if exists "order_delivery_orders_all" on public.order_delivery_orders;
create policy "order_delivery_orders_all" on public.order_delivery_orders
  for all using (true) with check (true);

create table if not exists public.order_delivery_masters (
  kind        text not null,
  id          text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  primary key (kind, id)
);
alter table public.order_delivery_masters enable row level security;
drop policy if exists "order_delivery_masters_all" on public.order_delivery_masters;
create policy "order_delivery_masters_all" on public.order_delivery_masters
  for all using (true) with check (true);

-- 5) Refresh PostgREST schema cache
notify pgrst, 'reload schema';
