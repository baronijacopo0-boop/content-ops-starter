-- =====================================================================================
-- RIVENDO – link to the live marketplace listing + opt-in community sharing
-- Additive migration: existing rows keep working (external_url null, not shared).
-- =====================================================================================

alter table public.listings
  add column if not exists external_url text
    check (external_url is null or (char_length(external_url) <= 500 and external_url ~ '^https://')),
  add column if not exists shared_in_community boolean not null default false;

-- Sharing makes sense only for a live listing with a link to it.
alter table public.listings
  add constraint listings_share_requires_link
  check (not shared_in_community or external_url is not null);

create index if not exists listings_community_idx
  on public.listings (published_at desc)
  where shared_in_community and status = 'published';

-- Public, read-only view of listings other RIVENDO users chose to share.
-- SECURITY DEFINER so it can read across users, but it exposes ONLY the columns below:
-- no user id, no inventory link, no purchase price.
create or replace function public.community_listings(p_limit integer default 60)
returns table (
  id uuid,
  title text,
  brand text,
  category text,
  size text,
  condition text,
  price numeric,
  photo text,
  external_url text,
  published_at timestamptz,
  seller text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    l.id,
    l.title,
    l.brand,
    l.category,
    l.size,
    l.condition,
    l.price,
    l.photos[1],
    l.external_url,
    l.published_at,
    coalesce(p.username, 'reseller RIVENDO')
  from public.listings l
  left join public.profiles p on p.user_id = l.user_id
  where l.shared_in_community
    and l.status = 'published'
    and l.external_url is not null
    and l.user_id <> (select auth.uid())
  order by l.published_at desc nulls last
  limit least(greatest(p_limit, 1), 200);
$$;

revoke execute on function public.community_listings(integer) from public, anon;
grant execute on function public.community_listings(integer) to authenticated;
