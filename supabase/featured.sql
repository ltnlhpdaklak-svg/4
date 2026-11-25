-- Chạy file này trong Supabase SQL Editor để thêm tính năng ghim sản phẩm lên đầu.
-- Có thể chạy lại nhiều lần không lỗi.

alter table public.products add column if not exists featured boolean not null default false;

create index if not exists products_featured_idx on public.products (featured);

grant select on public.products to anon, authenticated;
grant update on public.products to authenticated;
