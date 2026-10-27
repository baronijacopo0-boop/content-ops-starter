-- =====================================================================================
-- FLIP AI – Row Level Security
-- Rule: a user can only read and write rows where user_id = auth.uid().
-- Reference / market tables are readable by authenticated users and writable only by service_role.
-- `(select auth.uid())` is used instead of `auth.uid()` so Postgres evaluates it once per query.
-- =====================================================================================

alter table public.categories        enable row level security;
alter table public.brands            enable row level security;
alter table public.profiles          enable row level security;
alter table public.user_goals        enable row level security;
alter table public.user_settings     enable row level security;
alter table public.inventory_items   enable row level security;
alter table public.listings          enable row level security;
alter table public.sales             enable row level security;
alter table public.watchlists        enable row level security;
alter table public.watchlist_filters enable row level security;
alter table public.ai_generations    enable row level security;
alter table public.deal_analyses     enable row level security;
alter table public.notifications     enable row level security;
alter table public.market_items      enable row level security;
alter table public.market_prices     enable row level security;

-- ---------- privileges: nothing for anon, CRUD for authenticated (RLS still applies) --------
revoke all on all tables in schema public from anon;
grant select on public.categories, public.brands, public.market_items, public.market_prices to authenticated;
grant select, insert, update on public.profiles, public.user_goals, public.user_settings to authenticated;
grant select, insert, update, delete on
  public.inventory_items, public.listings, public.sales, public.watchlists, public.watchlist_filters,
  public.deal_analyses, public.notifications
  to authenticated;
grant select, insert, delete on public.ai_generations to authenticated;
grant usage on all sequences in schema public to authenticated;

-- ---------- reference & market data ---------------------------------------------------------
create policy "categories readable" on public.categories for select to authenticated using (true);
create policy "brands readable" on public.brands for select to authenticated using (true);
create policy "market items readable" on public.market_items for select to authenticated using (true);
create policy "market prices readable" on public.market_prices for select to authenticated using (true);

-- ---------- profile / goals / settings (one row per user, created by trigger) ---------------
create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own profile update" on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own goals select" on public.user_goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "own goals insert" on public.user_goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own goals update" on public.user_goals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own settings select" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "own settings insert" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own settings update" on public.user_settings for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------- inventory ------------------------------------------------------------------------
create policy "own inventory select" on public.inventory_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "own inventory insert" on public.inventory_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own inventory update" on public.inventory_items for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own inventory delete" on public.inventory_items for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- listings: may only reference the user's own inventory item ----------------------
create policy "own listings select" on public.listings for select to authenticated using ((select auth.uid()) = user_id);
create policy "own listings insert" on public.listings for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (inventory_item_id is null or exists (
    select 1 from public.inventory_items i where i.id = inventory_item_id and i.user_id = (select auth.uid())))
);
create policy "own listings update" on public.listings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (inventory_item_id is null or exists (
      select 1 from public.inventory_items i where i.id = inventory_item_id and i.user_id = (select auth.uid())))
  );
create policy "own listings delete" on public.listings for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- sales: may only reference the user's own item / listing -------------------------
create policy "own sales select" on public.sales for select to authenticated using ((select auth.uid()) = user_id);
create policy "own sales insert" on public.sales for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (inventory_item_id is null or exists (
    select 1 from public.inventory_items i where i.id = inventory_item_id and i.user_id = (select auth.uid())))
  and (listing_id is null or exists (
    select 1 from public.listings l where l.id = listing_id and l.user_id = (select auth.uid())))
);
create policy "own sales update" on public.sales for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own sales delete" on public.sales for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- watchlists & filters --------------------------------------------------------------
create policy "own watchlists select" on public.watchlists for select to authenticated using ((select auth.uid()) = user_id);
create policy "own watchlists insert" on public.watchlists for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own watchlists update" on public.watchlists for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own watchlists delete" on public.watchlists for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own watchlist filters select" on public.watchlist_filters for select to authenticated using ((select auth.uid()) = user_id);
create policy "own watchlist filters insert" on public.watchlist_filters for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = (select auth.uid()))
);
create policy "own watchlist filters update" on public.watchlist_filters for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own watchlist filters delete" on public.watchlist_filters for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- AI history, deal analyses, notifications -----------------------------------------
create policy "own ai generations select" on public.ai_generations for select to authenticated using ((select auth.uid()) = user_id);
create policy "own ai generations insert" on public.ai_generations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own ai generations delete" on public.ai_generations for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own deal analyses select" on public.deal_analyses for select to authenticated using ((select auth.uid()) = user_id);
create policy "own deal analyses insert" on public.deal_analyses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own deal analyses delete" on public.deal_analyses for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own notifications select" on public.notifications for select to authenticated using ((select auth.uid()) = user_id);
create policy "own notifications insert" on public.notifications for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own notifications update" on public.notifications for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own notifications delete" on public.notifications for delete to authenticated using ((select auth.uid()) = user_id);
