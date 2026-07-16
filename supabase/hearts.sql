-- Đồng bộ tổng tim "thả tim" giữa mọi khách.
-- Chạy một lần trong Supabase Dashboard → SQL Editor.

create table if not exists public.hearts (
  id int primary key,
  count bigint not null default 0
);
insert into public.hearts (id, count) values (1, 0) on conflict do nothing;

alter table public.hearts enable row level security;
create policy "ai cũng đọc được tổng tim" on public.hearts
  for select using (true);

-- Cộng tim qua RPC (security definer nên khách không cần quyền update trực tiếp).
-- Kẹp 1..200 mỗi lượt gửi để chặn spam quá đà.
create or replace function public.give_hearts(n int)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.hearts
  set count = count + least(greatest(n, 1), 200)
  where id = 1
  returning count;
$$;

-- Bật realtime để khách thấy tim của nhau ngay lập tức
alter publication supabase_realtime add table public.hearts;
