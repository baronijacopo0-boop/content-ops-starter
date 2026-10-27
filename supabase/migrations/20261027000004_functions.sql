-- =====================================================================================
-- FLIP AI – business functions
-- =====================================================================================

-- Atomically marks an inventory item as sold: creates the sale, updates item + linked listings.
-- SECURITY INVOKER → all reads/writes go through the caller's RLS policies.
create or replace function public.mark_item_sold(
  p_item_id      uuid,
  p_sale_price   numeric,
  p_extra_costs  numeric default 0,
  p_sold_at      date default current_date,
  p_platform     text default 'vinted'
)
returns public.sales
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item       public.inventory_items;
  v_listing_id uuid;
  v_sale       public.sales;
begin
  if p_sale_price is null or p_sale_price < 0 then
    raise exception 'Prezzo di vendita non valido' using errcode = '22023';
  end if;

  select * into v_item
  from public.inventory_items
  where id = p_item_id and user_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Articolo non trovato' using errcode = 'P0002';
  end if;
  if v_item.status = 'sold' then
    raise exception 'Articolo già venduto' using errcode = 'P0001';
  end if;
  if p_sold_at < v_item.purchase_date then
    raise exception 'La data di vendita è precedente alla data di acquisto' using errcode = '22023';
  end if;

  select id into v_listing_id
  from public.listings
  where inventory_item_id = p_item_id and status <> 'sold'
  order by created_at desc
  limit 1;

  update public.inventory_items
  set status = 'sold', sold_price = p_sale_price, extra_costs = coalesce(p_extra_costs, 0), sold_at = p_sold_at
  where id = p_item_id;

  update public.listings set status = 'sold' where inventory_item_id = p_item_id;

  insert into public.sales (
    user_id, inventory_item_id, listing_id, product_name, brand, category,
    purchase_price, sale_price, extra_costs, purchased_at, sold_at, platform
  ) values (
    (select auth.uid()), v_item.id, v_listing_id, v_item.name, v_item.brand, v_item.category,
    v_item.purchase_price, p_sale_price, coalesce(p_extra_costs, 0), v_item.purchase_date, p_sold_at, coalesce(p_platform, 'vinted')
  )
  returning * into v_sale;

  return v_sale;
end;
$$;

revoke execute on function public.mark_item_sold(uuid, numeric, numeric, date, text) from public, anon;
grant execute on function public.mark_item_sold(uuid, numeric, numeric, date, text) to authenticated;

-- Live market metrics for a brand/category from comparables (average, median, range, speed, demand,
-- sales count, active listings, sell-through). Used by future real-data providers.
create or replace function public.market_metrics(p_brand text, p_category text, p_marketplace text default null)
returns table (
  avg_price numeric,
  median_price numeric,
  min_price numeric,
  max_price numeric,
  avg_days_to_sell numeric,
  sales_count bigint,
  listings_count bigint,
  sell_through_rate numeric,
  demand_score integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with base as (
    select * from public.market_items
    where lower(brand) = lower(p_brand)
      and category = p_category
      and (p_marketplace is null or marketplace = p_marketplace)
  ), agg as (
    select
      round(avg(sold_price), 2) as avg_price,
      round((percentile_cont(0.5) within group (order by sold_price))::numeric, 2) as median_price,
      min(sold_price) as min_price,
      max(sold_price) as max_price,
      round(avg(days_on_market) filter (where sold_price is not null), 1) as avg_days_to_sell,
      count(sold_price) as sales_count,
      count(*) - count(sold_price) as listings_count,
      round(count(sold_price)::numeric / nullif(count(*), 0) * 100, 1) as sell_through_rate
    from base
  )
  select agg.*,
    least(100, greatest(0, round(
      coalesce(sell_through_rate, 0) * 0.5
      + greatest(0, 100 - (coalesce(avg_days_to_sell, 30) - 3) * 2.2) * 0.5
    )))::integer as demand_score
  from agg;
$$;

grant execute on function public.market_metrics(text, text, text) to authenticated;

-- Aggregates market_items into market_prices for the given month. Run by a scheduled job / admin
-- (service_role only), e.g. `select public.refresh_market_prices();`
create or replace function public.refresh_market_prices(p_period_start date default date_trunc('month', now())::date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.market_prices as mp (
    marketplace, brand, category, model, period_start, avg_price, median_price, min_price, max_price,
    avg_days_to_sell, demand_score, sales_count, listings_count, sell_through_rate, updated_at
  )
  select
    marketplace, brand, category, null, p_period_start,
    round(avg(sold_price), 2),
    round((percentile_cont(0.5) within group (order by sold_price))::numeric, 2),
    min(sold_price),
    max(sold_price),
    round(avg(days_on_market) filter (where sold_price is not null), 1),
    least(100, greatest(0, round(
      coalesce(count(sold_price)::numeric / nullif(count(*), 0) * 100, 0) * 0.5
      + greatest(0, 100 - (coalesce(avg(days_on_market) filter (where sold_price is not null), 30) - 3) * 2.2) * 0.5
    )))::smallint,
    count(sold_price),
    count(*) - count(sold_price),
    round(count(sold_price)::numeric / nullif(count(*), 0) * 100, 1),
    now()
  from public.market_items
  group by marketplace, brand, category
  on conflict on constraint market_prices_unique do update set
    avg_price = excluded.avg_price,
    median_price = excluded.median_price,
    min_price = excluded.min_price,
    max_price = excluded.max_price,
    avg_days_to_sell = excluded.avg_days_to_sell,
    demand_score = excluded.demand_score,
    sales_count = excluded.sales_count,
    listings_count = excluded.listings_count,
    sell_through_rate = excluded.sell_through_rate,
    updated_at = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.refresh_market_prices(date) from public, anon, authenticated;
grant execute on function public.refresh_market_prices(date) to service_role;
