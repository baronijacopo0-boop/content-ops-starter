'use client';

import useSWR, { useSWRConfig } from 'swr';
import { useApp } from '@/components/providers/app-provider';
import type { DataRepository } from '@/lib/data';

type Lister<T> = (repo: DataRepository) => Promise<T>;

function useCollection<T>(name: string, lister: Lister<T>) {
  const { repo, user } = useApp();
  return useSWR<T>(repo && user ? [name, user.id] : null, () => lister(repo!));
}

export const useProfile = () => useCollection('profile', (r) => r.getProfileBundle());
export const useInventory = () => useCollection('inventory', (r) => r.listInventory());
export const useListings = () => useCollection('listings', (r) => r.listListings());
export const useSales = () => useCollection('sales', (r) => r.listSales());
export const useWatchlists = () => useCollection('watchlists', (r) => r.listWatchlists());
export const useNotifications = () => useCollection('notifications', (r) => r.listNotifications());
export const useDealAnalyses = () => useCollection('analyses', (r) => r.listDealAnalyses(8));

/** Revalidates one or more collections after a mutation. */
export function useRevalidate() {
  const { mutate } = useSWRConfig();
  const { user } = useApp();
  return (...names: string[]) =>
    Promise.all(names.map((n) => mutate((key) => Array.isArray(key) && key[0] === n && key[1] === user?.id)));
}
