-- =============================================================================
-- Office Cafeteria Management — initial schema, triggers, realtime, and RLS
-- Run in Supabase SQL Editor, or via `supabase db push` with the CLI.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- =============================================================================
-- TABLES
-- =============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text,
  role       text not null default 'user' check (role in ('user', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  price        numeric(10, 2) not null default 0 check (price >= 0),
  is_available boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  status           text not null default 'pending' check (status in ('pending', 'completed')),
  placed_at        timestamptz not null default now(),
  completed_at     timestamptz,
  duration_minutes integer
);

create table if not exists public.order_items (
  id       uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_id  uuid not null references public.items (id) on delete restrict,
  -- snapshot of price at purchase time so reports stay accurate if menu prices change
  unit_price numeric(10, 2) not null default 0,
  quantity integer not null default 1 check (quantity > 0)
);

-- Indexes that matter for the FIFO dashboard and analytics --------------------
create index if not exists idx_orders_pending_fifo
  on public.orders (placed_at)
  where status = 'pending';
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_item on public.order_items (item_id);

-- =============================================================================
-- ROLE HELPER (SECURITY DEFINER)
-- Reading the caller's role from inside an RLS policy on `profiles` would cause
-- infinite recursion. A SECURITY DEFINER function bypasses RLS for that lookup,
-- which is the standard way to break the cycle. search_path is pinned for safety.
-- =============================================================================

-- NB: named my_role() (not current_role) — current_role is a reserved SQL keyword.
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =============================================================================
-- TRIGGER: create a profile row on signup (default role 'user')
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- TRIGGER: stamp completion time + compute duration when an order completes
-- Runs server-side so the value can't be spoofed by the client.
-- =============================================================================

create or replace function public.handle_order_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and coalesce(old.status, '') <> 'completed' then
    new.completed_at     := now();
    new.duration_minutes := greatest(
      0,
      round(extract(epoch from (now() - old.placed_at)) / 60.0)
    )::int;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_completion on public.orders;
create trigger trg_order_completion
  before update on public.orders
  for each row execute function public.handle_order_completion();

-- =============================================================================
-- REALTIME: let the canteen dashboard subscribe to new/changed orders
-- =============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles    enable row level security;
alter table public.items       enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ---- profiles ---------------------------------------------------------------
-- A user sees their own profile; staff/admin see everyone (needed to show the
-- employee email on order cards and in reports).
create policy profiles_select_self_or_staff on public.profiles
  for select using (id = auth.uid() or public.is_staff_or_admin());

-- A user may update their own profile but NOT their role. The role-unchanged
-- check reads my_role() (SECURITY DEFINER) instead of a subquery on profiles,
-- which would otherwise re-trigger RLS and recurse.
create policy profiles_update_self_no_role on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());

-- Only admins can change roles (User Management panel).
create policy profiles_admin_update_any on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- items ------------------------------------------------------------------
-- Everyone signed in can read the menu; only admins write it.
create policy items_select_all on public.items
  for select using (auth.uid() is not null);
create policy items_admin_insert on public.items
  for insert with check (public.is_admin());
create policy items_admin_update on public.items
  for update using (public.is_admin()) with check (public.is_admin());
create policy items_admin_delete on public.items
  for delete using (public.is_admin());

-- ---- orders -----------------------------------------------------------------
-- Read: owner sees own orders; staff/admin see all (dashboard + reports).
create policy orders_select_own_or_staff on public.orders
  for select using (user_id = auth.uid() or public.is_staff_or_admin());

-- Insert: a user can only place an order for themselves, and only as 'pending'.
create policy orders_insert_own on public.orders
  for insert with check (user_id = auth.uid() and status = 'pending');

-- Update: only staff/admin flip orders to completed.
create policy orders_update_staff on public.orders
  for update using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- ---- order_items ------------------------------------------------------------
-- Read if the parent order is visible to you.
create policy order_items_select on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );

-- Insert only into your own order.
create policy order_items_insert_own on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- =============================================================================
-- SEED (optional) — a few menu items to start with
-- =============================================================================
insert into public.items (name, description, price, is_available) values
  ('Chicken Sandwich', 'Grilled chicken, lettuce, house mayo on sourdough', 4.50, true),
  ('Veg Pulao',        'Basmati rice with seasonal vegetables',            3.00, true),
  ('Masala Chai',      'Spiced milk tea',                                  0.80, true),
  ('Fresh Lime Soda',  'Sweet & salty, made to order',                     1.20, true)
on conflict do nothing;
