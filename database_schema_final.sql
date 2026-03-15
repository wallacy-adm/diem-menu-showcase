-- Final target schema (normalized model)

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '📋',
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text not null,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  image_url text,
  image_thumb_url text,
  image_full_url text,
  active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  discount_percent numeric not null check (discount_percent >= 0 and discount_percent <= 100),
  start_at timestamptz not null default now(),
  end_at timestamptz not null default (now() + interval '7 days'),
  enabled boolean not null default true
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  slogan text not null,
  logo_url text,
  background_url text,
  address text,
  instagram text,
  whatsapp text,
  footer_note text
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_promotions_product_id on public.promotions(product_id);
create index if not exists idx_promotions_enabled on public.promotions(enabled);
