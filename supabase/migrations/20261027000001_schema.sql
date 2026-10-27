-- =====================================================================================
-- FLIP AI – core schema
-- Every user-owned table carries user_id → auth.users(id) and is protected by RLS
-- (see 20261027000002_rls.sql). Money is numeric(10,2), dates are `date`, timestamps timestamptz.
-- Enumerations are text + CHECK constraints so new marketplaces/categories can be added with a
-- simple migration (no enum type rewrites).
-- =====================================================================================

-- ---------- helpers ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- reference data (read-only for users) -------------------------------------
create table public.categories (
  id          text primary key,
  label       text not null,
  singular    text not null,
  base_price  numeric(10,2) not null check (base_price >= 0),
  speed_days  smallint not null check (speed_days > 0),
  sort_order  smallint not null default 0
);

create table public.brands (
  id                serial primary key,
  name              text not null unique,
  demand            smallint not null default 50 check (demand between 0 and 100),
  price_multiplier  numeric(5,2) not null default 1 check (price_multiplier > 0),
  tier              text not null default 'mass' check (tier in ('mass','premium','designer')),
  niches            text[] not null default '{}',
  created_at        timestamptz not null default now()
);

-- ---------- user profile, goals, settings --------------------------------------------
create table public.profiles (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  email                text,
  username             text check (username is null or username ~ '^[a-z0-9._]{3,30}$'),
  full_name            text check (char_length(full_name) <= 80),
  avatar_url           text check (char_length(avatar_url) <= 500),
  main_category        text check (main_category in ('streetwear','vintage','sport','designer','y2k','sneakers','other')),
  favorite_brands      text[] not null default '{}' check (cardinality(favorite_brands) <= 30),
  favorite_categories  text[] not null default '{}' check (cardinality(favorite_categories) <= 10),
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create unique index profiles_username_key on public.profiles (lower(username)) where username is not null;

create table public.user_goals (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  budget        numeric(10,2) check (budget >= 0),
  monthly_goal  numeric(10,2) check (monthly_goal >= 0),
  target_roi    numeric(6,2) not null default 100 check (target_roi between 0 and 1000),
  updated_at    timestamptz not null default now()
);

create table public.user_settings (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  deal_score_weights    jsonb not null default '{"priceVsMarket":30,"brandDemand":20,"roi":20,"sellSpeed":15,"condition":10,"size":5}'::jsonb,
  default_extra_costs   numeric(10,2) not null default 1.5 check (default_extra_costs >= 0),
  notify_hot_deals      boolean not null default true,
  notify_watchlist      boolean not null default true,
  preferred_marketplace text not null default 'vinted',
  updated_at            timestamptz not null default now()
);

-- ---------- inventory -----------------------------------------------------------------
create table public.inventory_items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 120),
  brand           text not null check (char_length(brand) between 1 and 60),
  category        text not null references public.categories (id),
  size            text not null default '' check (char_length(size) <= 20),
  condition       text not null check (condition in ('new_with_tags','new','very_good','good','fair')),
  purchase_price  numeric(10,2) not null check (purchase_price >= 0),
  purchase_date   date not null default current_date,
  source          text not null default '' check (char_length(source) <= 60),
  listed_price    numeric(10,2) check (listed_price >= 0),
  sold_price      numeric(10,2) check (sold_price >= 0),
  extra_costs     numeric(10,2) not null default 0 check (extra_costs >= 0),
  status          text not null default 'to_photograph'
                  check (status in ('to_photograph','to_list','listed','reserved','sold')),
  photos          text[] not null default '{}' check (cardinality(photos) <= 8),
  notes           text not null default '' check (char_length(notes) <= 1000),
  sold_at         date,
  profit          numeric(10,2) generated always as (sold_price - purchase_price - extra_costs) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint inventory_sold_consistency check (status <> 'sold' or (sold_price is not null and sold_at is not null))
);
create index inventory_items_user_idx on public.inventory_items (user_id, created_at desc);
create index inventory_items_user_status_idx on public.inventory_items (user_id, status);

-- ---------- listings (annunci) ----------------------------------------------------------
create table public.listings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  inventory_item_id  uuid references public.inventory_items (id) on delete set null,
  title              text not null check (char_length(title) between 1 and 120),
  description        text not null default '' check (char_length(description) <= 3000),
  brand              text not null default '' check (char_length(brand) <= 60),
  category           text not null references public.categories (id),
  size               text not null default '' check (char_length(size) <= 20),
  condition          text not null check (condition in ('new_with_tags','new','very_good','good','fair')),
  colors             text[] not null default '{}' check (cardinality(colors) <= 5),
  material           text not null default '' check (char_length(material) <= 80),
  style              text not null default '' check (char_length(style) <= 40),
  price              numeric(10,2) not null check (price >= 0),
  photos             text[] not null default '{}' check (cardinality(photos) <= 8),
  views              integer not null default 0 check (views >= 0),
  favorites          integer not null default 0 check (favorites >= 0),
  status             text not null default 'draft' check (status in ('draft','published','reserved','sold')),
  marketplace        text not null default 'vinted',
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index listings_user_idx on public.listings (user_id, created_at desc);
create index listings_item_idx on public.listings (inventory_item_id);

-- ---------- sales (vendite) ---------------------------------------------------------------
create table public.sales (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  inventory_item_id  uuid references public.inventory_items (id) on delete set null,
  listing_id         uuid references public.listings (id) on delete set null,
  product_name       text not null check (char_length(product_name) between 1 and 120),
  brand              text not null default '',
  category           text not null references public.categories (id),
  purchase_price     numeric(10,2) not null check (purchase_price >= 0),
  sale_price         numeric(10,2) not null check (sale_price >= 0),
  extra_costs        numeric(10,2) not null default 0 check (extra_costs >= 0),
  purchased_at       date not null,
  sold_at            date not null,
  platform           text not null default 'vinted',
  -- profit = sale − purchase − extra ; ROI = profit / purchase × 100
  profit             numeric(10,2) generated always as (sale_price - purchase_price - extra_costs) stored,
  roi                numeric(8,1) generated always as (
                       case when purchase_price > 0
                            then round((sale_price - purchase_price - extra_costs) / purchase_price * 100, 1)
                       end) stored,
  days_to_sell       integer generated always as (sold_at - purchased_at) stored,
  created_at         timestamptz not null default now(),
  constraint sales_dates check (sold_at >= purchased_at)
);
create index sales_user_idx on public.sales (user_id, sold_at desc);

-- ---------- watchlists ------------------------------------------------------------------
create table public.watchlists (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 80),
  query            text not null default '' check (char_length(query) <= 120),
  brand            text check (char_length(brand) <= 60),
  category         text references public.categories (id),
  size             text check (char_length(size) <= 20),
  condition        text check (condition in ('new_with_tags','new','very_good','good','fair')),
  max_price        numeric(10,2) check (max_price >= 0),
  min_roi          numeric(6,2) check (min_roi >= 0),
  min_deal_score   smallint check (min_deal_score between 0 and 100),
  notify           boolean not null default true,
  is_active        boolean not null default true,
  last_checked_at  timestamptz,
  created_at       timestamptz not null default now()
);
create index watchlists_user_idx on public.watchlists (user_id, created_at desc);

-- Extensible key/operator/value filters (future: marketplaces, colors, keywords exclusions...).
create table public.watchlist_filters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  watchlist_id  uuid not null references public.watchlists (id) on delete cascade,
  field         text not null check (char_length(field) <= 40),
  operator      text not null check (operator in ('eq','neq','lte','gte','contains','in')),
  value         jsonb not null,
  created_at    timestamptz not null default now()
);
create index watchlist_filters_watchlist_idx on public.watchlist_filters (watchlist_id);

-- ---------- AI ------------------------------------------------------------------------
create table public.ai_generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('image_analysis','listing','deal_analysis','insights','advice')),
  engine      text not null default 'mock',
  model       text,
  input       jsonb not null default '{}'::jsonb,
  output      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index ai_generations_user_idx on public.ai_generations (user_id, created_at desc);

create table public.deal_analyses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_name  text not null default '' check (char_length(product_name) <= 120),
  brand         text not null,
  category      text not null references public.categories (id),
  asking_price  numeric(10,2) not null check (asking_price >= 0),
  deal_score    smallint not null check (deal_score between 0 and 100),
  verdict       text not null,
  result        jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index deal_analyses_user_idx on public.deal_analyses (user_id, created_at desc);

-- ---------- notifications ---------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type        text not null check (type in ('hot_deal','watchlist_match','stock_alert','system')),
  title       text not null check (char_length(title) <= 120),
  body        text not null default '' check (char_length(body) <= 500),
  data        jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- market intelligence (shared, read-only for users) ----------------------------
-- Comparable items from any provider (official API, authorized integration, manual/CSV import).
create table public.market_items (
  id              uuid primary key default gen_random_uuid(),
  marketplace     text not null,
  external_id     text not null,
  title           text not null,
  brand           text not null,
  category        text not null references public.categories (id),
  model           text,
  size            text,
  condition       text check (condition in ('new_with_tags','new','very_good','good','fair')),
  price           numeric(10,2) not null check (price >= 0),
  sold_price      numeric(10,2) check (sold_price >= 0),
  days_on_market  integer check (days_on_market >= 0),
  listed_at       timestamptz,
  sold_at         timestamptz,
  image_url       text,
  url             text,
  created_at      timestamptz not null default now(),
  unique (marketplace, external_id)
);
create index market_items_lookup_idx on public.market_items (brand, category);

-- Aggregated metrics per brand/category/model and period (filled by refresh_market_prices()).
create table public.market_prices (
  id                 uuid primary key default gen_random_uuid(),
  marketplace        text not null,
  brand              text not null,
  category           text not null references public.categories (id),
  model              text,
  period_start       date not null,
  avg_price          numeric(10,2),
  median_price       numeric(10,2),
  min_price          numeric(10,2),
  max_price          numeric(10,2),
  avg_days_to_sell   numeric(6,1),
  demand_score       smallint check (demand_score between 0 and 100),
  sales_count        integer not null default 0,
  listings_count     integer not null default 0,
  sell_through_rate  numeric(5,1),
  updated_at         timestamptz not null default now(),
  constraint market_prices_unique unique nulls not distinct (marketplace, brand, category, model, period_start)
);

-- ---------- updated_at triggers ------------------------------------------------------------
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger user_goals_updated_at before update on public.user_goals for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();
create trigger inventory_items_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();
create trigger listings_updated_at before update on public.listings for each row execute function public.set_updated_at();

-- ---------- new user bootstrap --------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80))
  on conflict (user_id) do nothing;
  insert into public.user_goals (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
