-- Chạy trong Supabase SQL Editor để thêm phần bình luận công khai trên trang Liên hệ.
-- Có thể chạy lại nhiều lần.

alter table public.contact_messages add column if not exists is_public boolean not null default true;

-- Cho phép mọi người xem tin đã công khai (RLS sẽ lọc theo is_public).
drop policy if exists "public read messages" on public.contact_messages;
create policy "public read messages" on public.contact_messages
  for select using (is_public = true or public.is_admin());

grant select on public.contact_messages to anon, authenticated;
grant update on public.contact_messages to authenticated;
