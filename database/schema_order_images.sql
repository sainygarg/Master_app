-- Order photos live in Supabase Storage; orders keep only the image URLs.
-- Run once in the Supabase SQL editor.

-- 1) Public bucket for order design / inspiration photos
insert into storage.buckets (id, name, public)
values ('order-images', 'order-images', true)
on conflict (id) do update set public = true;

-- 2) Policies (the app uses the anon key with its own login)
drop policy if exists "order-images read"   on storage.objects;
drop policy if exists "order-images insert" on storage.objects;
drop policy if exists "order-images update" on storage.objects;
drop policy if exists "order-images delete" on storage.objects;

create policy "order-images read"   on storage.objects for select using (bucket_id = 'order-images');
create policy "order-images insert" on storage.objects for insert with check (bucket_id = 'order-images');
create policy "order-images update" on storage.objects for update using (bucket_id = 'order-images');
create policy "order-images delete" on storage.objects for delete using (bucket_id = 'order-images');

-- 3) Faster list loading (orders are read newest-first)
create index if not exists order_delivery_orders_created_at_idx
  on order_delivery_orders (created_at desc);

-- 4) See how heavy existing orders are (rows still holding base64 photos)
-- select id, pg_column_size(data) as bytes
-- from order_delivery_orders order by bytes desc limit 20;
