-- RLS / business-logic tests. Run with supabase/tests/run-local.sh (any failure raises an exception).
\set ON_ERROR_STOP on
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice"}'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev', '{"full_name":"Bob"}');

-- trigger created profile/goals/settings
do $$ begin
  assert (select count(*) from public.profiles) = 2, 'profiles not created by trigger';
  assert (select count(*) from public.user_goals) = 2, 'goals not created by trigger';
  assert (select target_roi from public.user_goals where user_id = '11111111-1111-1111-1111-111111111111') = 100, 'default target ROI';
end $$;

-- ---------------- as Alice
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

insert into public.inventory_items (name, brand, category, size, condition, purchase_price, purchase_date)
values ('Felpa Nike', 'Nike', 'hoodie', 'M', 'very_good', 10, current_date - 20);

do $$
declare v_id uuid; v_sale public.sales;
begin
  select id into v_id from public.inventory_items limit 1;
  v_sale := public.mark_item_sold(v_id, 30, 2, current_date, 'vinted');
  assert v_sale.profit = 18, format('profit expected 18 got %s', v_sale.profit);
  assert v_sale.roi = 180, format('roi expected 180 got %s', v_sale.roi);
  assert v_sale.days_to_sell = 20, 'days to sell';
  assert (select status from public.inventory_items where id = v_id) = 'sold', 'item not marked sold';
  begin
    perform public.mark_item_sold(v_id, 30, 0, current_date, 'vinted');
    raise exception 'double sale should fail';
  exception when sqlstate 'P0001' then null;
  end;
end $$;

insert into public.watchlists (name, brand, max_price) values ('Nike < 15', 'Nike', 15);
update public.profiles set onboarding_completed = true, favorite_brands = array['Nike'] where user_id = '11111111-1111-1111-1111-111111111111';

-- reference data visible
do $$ begin
  assert (select count(*) from public.categories) = 10, 'categories readable';
  assert (select count(*) from public.brands) > 10, 'brands readable';
end $$;

-- storage: own folder ok
insert into storage.objects (bucket_id, name) values ('item-photos', '11111111-1111-1111-1111-111111111111/a.jpg');

-- ---------------- as Bob
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

do $$ begin
  assert (select count(*) from public.inventory_items) = 0, 'Bob can see Alice inventory!';
  assert (select count(*) from public.sales) = 0, 'Bob can see Alice sales!';
  assert (select count(*) from public.watchlists) = 0, 'Bob can see Alice watchlists!';
  assert (select count(*) from public.profiles) = 1, 'Bob must see only his profile';
end $$;

-- Bob cannot update/delete Alice rows (0 rows affected)
do $$
declare n int;
begin
  update public.inventory_items set purchase_price = 0; get diagnostics n = row_count;
  assert n = 0, 'Bob updated Alice inventory!';
  delete from public.sales; get diagnostics n = row_count;
  assert n = 0, 'Bob deleted Alice sales!';
end $$;

-- Bob cannot insert rows for Alice
do $$ begin
  begin
    insert into public.inventory_items (user_id, name, brand, category, condition, purchase_price)
    values ('11111111-1111-1111-1111-111111111111', 'x', 'x', 'hoodie', 'good', 1);
    raise exception 'insert for another user should fail';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Bob cannot reference Alice's item in a sale (cross-tenant FK)
do $$
declare v_alice_item uuid;
begin
  reset role;
  select id into v_alice_item from public.inventory_items where user_id = '11111111-1111-1111-1111-111111111111' limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);
  begin
    insert into public.sales (inventory_item_id, product_name, category, purchase_price, sale_price, purchased_at, sold_at)
    values (v_alice_item, 'x', 'hoodie', 1, 2, current_date, current_date);
    raise exception 'cross-tenant reference should fail';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.mark_item_sold(v_alice_item, 99, 0, current_date, 'vinted');
    raise exception 'Bob sold Alice item!';
  exception when sqlstate 'P0002' then null;
  end;
end $$;

-- Bob cannot upload into Alice's storage folder
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('item-photos', '11111111-1111-1111-1111-111111111111/hack.jpg');
    raise exception 'storage cross-folder upload should fail';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Users cannot write reference/market data
do $$ begin
  begin
    insert into public.brands (name) values ('Fake');
    raise exception 'brand insert should fail';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------- anon has no access
set local role anon;
do $$ begin
  begin
    perform count(*) from public.inventory_items;
    raise exception 'anon read should fail';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
rollback;
\echo 'RLS tests passed ✔'
