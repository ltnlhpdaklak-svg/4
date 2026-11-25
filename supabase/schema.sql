-- 4EYEWEAR — schema cho web bán kính nội bộ lớp D26TDK1.
-- Chạy toàn bộ file này trong Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Bảng danh mục & sản phẩm
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  sale_price integer check (sale_price is null or sale_price >= 0),
  image_url text not null default '',
  stock integer not null default 0 check (stock >= 0),
  sold_count integer not null default 0,
  view_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hồ sơ người dùng: id khớp với auth.users.id
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  status text not null default 'Hoạt động',
  addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Tự tạo profile khi có tài khoản mới đăng ký qua Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Đơn hàng + sự kiện thống kê + tin nhắn liên hệ
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  order_code text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  recipient_name text not null default '',
  recipient_phone text not null default '',
  shipping_address text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  discount integer not null default 0,
  total_amount integer not null default 0,
  payment_method text not null default 'COD',
  payment_status text not null default 'Chưa thanh toán',
  status text not null default 'Chờ xác nhận',
  note text not null default '',
  stock_reserved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text not null default '',
  user_id uuid,
  product_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default '',
  message text not null,
  reply text not null default '',
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- Admin đổi nội dung liên hệ (link Zalo, email, hotline, giới thiệu nhóm).
create table if not exists public.contact_settings (
  id integer primary key default 1 check (id = 1),
  group_name text not null default 'Nhóm 4',
  intro text not null default '',
  zalo_link text not null default '',
  facebook_link text not null default '',
  email text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.contact_settings (id, group_name, intro)
values (1, 'Nhóm 4', 'Liên hệ với nhóm 4 để được hỗ trợ đặt hàng và giải đáp thắc mắc.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.events enable row level security;
alter table public.contact_messages enable row level security;
alter table public.contact_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Mọi người xem được danh mục/sản phẩm đang bán; chỉ admin sửa.
create policy "public read categories" on public.categories for select using (true);
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public read products" on public.products for select using (true);
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Hồ sơ: tự xem/sửa của mình, admin xem tất cả.
create policy "read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "update own profile" on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Đơn hàng: khách xem đơn của mình, admin xem/sửa tất cả, đã đăng nhập được tạo đơn.
create policy "read own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- Sự kiện: ghi từ client, chỉ admin đọc.
create policy "insert events" on public.events for insert with check (true);
create policy "admin read events" on public.events for select using (public.is_admin());

-- Liên hệ: ai cũng gửi được tin và xem link liên hệ; chỉ admin đọc/trả lời/sửa link.
create policy "public read contact settings" on public.contact_settings for select using (true);
create policy "admin write contact settings" on public.contact_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "insert contact messages" on public.contact_messages for insert with check (true);
create policy "admin read contact messages" on public.contact_messages for select using (public.is_admin());
create policy "admin reply contact messages" on public.contact_messages for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete contact messages" on public.contact_messages for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Dữ liệu ban đầu: CHỈ danh mục + sản phẩm. Không có đơn hàng, không có khách giả.
-- ---------------------------------------------------------------------------
insert into public.categories (id, name, slug, icon, description) values
  ('cat-kinh-ram', 'Kính râm', 'kinh-ram', 'Sun', 'Bảo vệ mắt khỏi nắng, phong cách thời trang.'),
  ('cat-kinh-can', 'Kính cận', 'kinh-can', 'Eye', 'Gọng và tròng cận, cắt theo độ.'),
  ('cat-gong-kinh', 'Gọng kính', 'gong-kinh', 'Glasses', 'Gọng kính thời trang cho mọi khuôn mặt.'),
  ('cat-kinh-the-thao', 'Kính thể thao', 'kinh-the-thao', 'Dumbbell', 'Kính ôm sát khi chạy bộ, đạp xe.'),
  ('cat-kinh-tre-em', 'Kính trẻ em', 'kinh-tre-em', 'Baby', 'Gọng dẻo, an toàn cho bé.'),
  ('cat-phu-kien', 'Phụ kiện', 'phu-kien', 'Sparkles', 'Hộp đựng, dây đeo và phụ kiện kính.')
on conflict (id) do nothing;

insert into public.products (id, category_id, name, slug, description, price, sale_price, image_url, stock, is_active) values
  ('p1', 'cat-kinh-ram', 'Kính râm Aviator gọng vàng', 'kinh-ram-aviator-vang', 'Gọng kim loại mạ vàng, tròng phân cực giảm chói.', 1290000, 990000, '/products/p1.svg', 25, true),
  ('p2', 'cat-kinh-ram', 'Kính râm Wayfarer đen', 'kinh-ram-wayfarer-den', 'Gọng nhựa dẻo nhẹ, chống tia UV400.', 890000, null, '/products/p2.svg', 40, true),
  ('p3', 'cat-kinh-ram', 'Kính râm tròn retro nâu', 'kinh-ram-tron-retro-nau', 'Gọng tròn phong cách retro, tròng nâu gradient.', 790000, 590000, '/products/p3.svg', 18, true),
  ('p4', 'cat-gong-kinh', 'Gọng kính vuông titan bạc', 'gong-kinh-vuong-titan-bac', 'Titan siêu nhẹ, đeo lâu không mỏi.', 1190000, null, '/products/p4.svg', 30, true),
  ('p5', 'cat-gong-kinh', 'Gọng kính tròn acetate xanh navy', 'gong-kinh-tron-acetate-xanh-navy', 'Acetate cao cấp, màu xanh navy trầm.', 690000, 549000, '/products/p5.svg', 12, true),
  ('p6', 'cat-gong-kinh', 'Gọng kính vuông acetate đỏ rượu', 'gong-kinh-vuong-acetate-do-ruou', 'Gọng acetate đỏ rượu, dáng vuông cá tính.', 850000, null, '/products/p6.svg', 0, false),
  ('p7', 'cat-kinh-can', 'Kính cận wayfarer hồng pastel', 'kinh-can-wayfarer-hong-pastel', 'Gọng nhẹ màu hồng pastel, cắt tròng theo độ.', 720000, 650000, '/products/p7.svg', 22, true),
  ('p8', 'cat-kinh-can', 'Kính cận vuông đen mỏng', 'kinh-can-vuong-den-mong', 'Gọng kim loại đen mỏng, tròng chống ánh sáng xanh.', 560000, null, '/products/p8.svg', 35, true),
  ('p9', 'cat-kinh-the-thao', 'Kính thể thao ôm sát xanh dương', 'kinh-the-thao-om-sat-xanh-duong', 'Thiết kế ôm sát khi chạy bộ và đạp xe.', 1490000, 1190000, '/products/p9.svg', 14, true),
  ('p10', 'cat-kinh-tre-em', 'Kính trẻ em tròn dẻo xanh lá', 'kinh-tre-em-tron-deo-xanh-la', 'Gọng silicone dẻo, có dây đeo điều chỉnh.', 350000, 290000, '/products/p10.svg', 50, true),
  ('p11', 'cat-kinh-tre-em', 'Kính trẻ em vuông vàng', 'kinh-tre-em-vuong-vang', 'Gọng nhựa dẻo màu vàng tươi.', 320000, null, '/products/p11.svg', 3, true),
  ('p12', 'cat-phu-kien', 'Hộp đựng kính cứng', 'hop-dung-kinh-cung', 'Hộp cứng chống va đập, lót nỉ mềm.', 120000, 99000, '/products/p12.svg', 60, true)
on conflict (id) do nothing;

-- Dọn dữ liệu giả nếu từng chạy bản demo trong cùng project Supabase.
delete from public.orders;
delete from public.events;
delete from public.contact_messages;
update public.products set sold_count = 0, view_count = 0;
