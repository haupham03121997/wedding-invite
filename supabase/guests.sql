-- Khách mời có mã riêng trên URL (?to=AB12CD34), RSVP nối với khách qua guest_id.
-- Chạy một lần trong Supabase Dashboard → SQL Editor.

create table if not exists public.guests (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  side text not null check (side in ('Nhà trai', 'Nhà gái')),
  created_at timestamptz not null default now()
);

alter table public.guests enable row level security;
-- Ai có mã thì đọc được; anon key cũng liệt kê được cả bảng,
-- chấp nhận được với dữ liệu chỉ gồm tên khách mời đám cưới.
create policy "đọc thông tin khách mời" on public.guests
  for select using (true);

alter table public.rsvps
  add column if not exists guest_id bigint references public.guests (id);

-- Mỗi khách chỉ một RSVP (khách vãng lai guest_id null thì không giới hạn)
create unique index if not exists rsvps_one_per_guest
  on public.rsvps (guest_id)
  where guest_id is not null;

-- Thêm khách mẫu:
-- insert into public.guests (code, name, side) values
--   ('AB12CD34', 'Ngọc Anh', 'Nhà gái'),
--   ('XY98ZW76', 'Minh Khang', 'Nhà trai');
