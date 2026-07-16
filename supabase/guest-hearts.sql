-- Đếm số tim từng khách đã thả (khách nhận diện qua link mời ?to=MÃ).
-- Chạy một lần trong Supabase Dashboard → SQL Editor.

alter table public.guests
  add column if not exists hearts bigint not null default 0;

-- Thay RPC cũ bằng bản nhận thêm guest id (default null nên client cũ gọi vẫn chạy):
-- cộng vào sổ riêng của khách (nếu có) rồi cộng tổng chung, trả về tổng mới.
drop function if exists public.give_hearts(int);

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
