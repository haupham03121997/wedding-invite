-- give_hearts v2: trả về cả tổng chung lẫn sổ tim riêng của khách,
-- để UI tự khớp lại sau mỗi đợt thả (kể cả tim thả từ máy/phiên khác).
-- Chạy một lần trong Supabase Dashboard → SQL Editor.

-- đổi kiểu trả về (bigint → jsonb) nên phải drop trước, create or replace không đổi được
drop function if exists public.give_hearts(int, bigint);

create function public.give_hearts(n int, guest bigint default null)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with add as (
    select least(greatest(n, 1), 200) as v
  ),
  mine as (
    update public.guests g
    set hearts = g.hearts + (select v from add)
    where g.id = guest
    returning g.hearts
  ),
  total as (
    update public.hearts h
    set count = h.count + (select v from add)
    where h.id = 1
    returning h.count
  )
  select jsonb_build_object(
    'total', (select count from total),
    'mine',  (select hearts from mine)
  );
$$;
