-- Khối gộp: bảng hearts + policy guests + cột hearts từng khách + RPC.
-- Idempotent: chạy lại nhiều lần không lỗi.

-- 1. Tổng tim chung
create table if not exists public.hearts (
  id int primary key,
  count bigint not null default 0
);
insert into public.hearts (id, count) values (1, 0) on conflict do nothing;

alter table public.hearts enable row level security;
drop policy if exists "ai cũng đọc được tổng tim" on public.hearts;
create policy "ai cũng đọc được tổng tim" on public.hearts
  for select using (true);

-- Bật realtime cho hearts (bọc DO để chạy lại không lỗi duplicate)
do $$
begin
  alter publication supabase_realtime add table public.hearts;
exception when duplicate_object then null;
end $$;

-- 2. Policy đọc bảng guests (?to=MÃ tra được tên khách)
alter table public.guests enable row level security;
drop policy if exists "đọc thông tin khách mời" on public.guests;
create policy "đọc thông tin khách mời" on public.guests
  for select using (true);

-- 3. Sổ tim riêng từng khách
alter table public.guests
  add column if not exists hearts bigint not null default 0;

-- 4. RPC: cộng tim vào sổ riêng của khách (nếu có) rồi cộng tổng chung
drop function if exists public.give_hearts(int);
drop function if exists public.give_hearts(int, bigint);

create or replace function public.give_hearts(n int, guest bigint default null)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.guests
  set hearts = hearts + least(greatest(n, 1), 200)
  where id = guest;

  update public.hearts
  set count = count + least(greatest(n, 1), 200)
  where id = 1
  returning count;
$$;
