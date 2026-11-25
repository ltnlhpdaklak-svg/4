-- Ví chơi Baccarat ẩn. Chạy trong Supabase SQL Editor, có thể chạy lại nhiều lần.
-- Mỗi tài khoản nhận 1.000.000 khi vào lần đầu. Admin có tiền vô hạn (giá trị -1).

create table if not exists public.baccarat_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 1000000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.baccarat_wallets enable row level security;

drop policy if exists "read own wallet" on public.baccarat_wallets;
drop policy if exists "insert own wallet" on public.baccarat_wallets;
drop policy if exists "update own wallet" on public.baccarat_wallets;

create policy "read own wallet" on public.baccarat_wallets
  for select using (auth.uid() = user_id or public.is_admin());
create policy "insert own wallet" on public.baccarat_wallets
  for insert with check (auth.uid() = user_id);
create policy "update own wallet" on public.baccarat_wallets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.baccarat_wallets to authenticated;
