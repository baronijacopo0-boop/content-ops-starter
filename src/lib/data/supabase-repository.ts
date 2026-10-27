'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AppNotification,
  DealAnalysisRecord,
  InventoryItem,
  InventoryItemInput,
  Listing,
  ListingInput,
  MarkSoldInput,
  Sale,
  SaleInput,
  UserProfileBundle,
  Watchlist,
  WatchlistInput,
} from '@/lib/domain/types';
import { DEFAULT_SETTINGS, DEFAULT_TARGET_ROI, DEFAULT_WEIGHTS } from '@/lib/domain/constants';
import { appUrl, STORAGE_BUCKET } from '@/lib/config';
import { uid } from '@/lib/utils';
import type { AuthService, AuthUser, DataRepository, ProfileUpdate } from './repository';
import { buildDemoBundle } from './demo-seed';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

// ---------- row ↔ domain mappers ---------------------------------------------------------
const toInventory = (r: Row): InventoryItem => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  brand: r.brand,
  category: r.category,
  size: r.size,
  condition: r.condition,
  purchasePrice: Number(r.purchase_price),
  purchaseDate: r.purchase_date,
  source: r.source,
  listedPrice: num(r.listed_price),
  soldPrice: num(r.sold_price),
  extraCosts: Number(r.extra_costs),
  status: r.status,
  photos: r.photos ?? [],
  notes: r.notes ?? '',
  soldAt: r.sold_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const fromInventory = (i: Partial<InventoryItemInput>): Row =>
  strip({
    name: i.name,
    brand: i.brand,
    category: i.category,
    size: i.size,
    condition: i.condition,
    purchase_price: i.purchasePrice,
    purchase_date: i.purchaseDate,
    source: i.source,
    listed_price: i.listedPrice,
    sold_price: i.soldPrice,
    extra_costs: i.extraCosts,
    status: i.status,
    photos: i.photos,
    notes: i.notes,
  });

const toListing = (r: Row): Listing => ({
  id: r.id,
  userId: r.user_id,
  inventoryItemId: r.inventory_item_id,
  title: r.title,
  description: r.description,
  brand: r.brand,
  category: r.category,
  size: r.size,
  condition: r.condition,
  colors: r.colors ?? [],
  material: r.material,
  style: r.style,
  price: Number(r.price),
  photos: r.photos ?? [],
  views: r.views,
  favorites: r.favorites,
  status: r.status,
  marketplace: r.marketplace,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const fromListing = (l: Partial<ListingInput>): Row =>
  strip({
    inventory_item_id: l.inventoryItemId,
    title: l.title,
    description: l.description,
    brand: l.brand,
    category: l.category,
    size: l.size,
    condition: l.condition,
    colors: l.colors,
    material: l.material,
    style: l.style,
    price: l.price,
    photos: l.photos,
    views: l.views,
    favorites: l.favorites,
    status: l.status,
    marketplace: l.marketplace,
    published_at: l.publishedAt,
  });

const toSale = (r: Row): Sale => ({
  id: r.id,
  userId: r.user_id,
  inventoryItemId: r.inventory_item_id,
  listingId: r.listing_id,
  productName: r.product_name,
  brand: r.brand,
  category: r.category,
  purchasePrice: Number(r.purchase_price),
  salePrice: Number(r.sale_price),
  extraCosts: Number(r.extra_costs),
  purchasedAt: r.purchased_at,
  soldAt: r.sold_at,
  platform: r.platform,
  createdAt: r.created_at,
});

const fromSale = (s: SaleInput): Row => ({
  inventory_item_id: s.inventoryItemId,
  listing_id: s.listingId,
  product_name: s.productName,
  brand: s.brand,
  category: s.category,
  purchase_price: s.purchasePrice,
  sale_price: s.salePrice,
  extra_costs: s.extraCosts,
  purchased_at: s.purchasedAt,
  sold_at: s.soldAt,
  platform: s.platform,
});

const toWatchlist = (r: Row): Watchlist => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  query: r.query,
  brand: r.brand,
  category: r.category,
  size: r.size,
  condition: r.condition,
  maxPrice: num(r.max_price),
  minRoi: num(r.min_roi),
  minDealScore: num(r.min_deal_score),
  notify: r.notify,
  isActive: r.is_active,
  createdAt: r.created_at,
});

const fromWatchlist = (w: Partial<WatchlistInput>): Row =>
  strip({
    name: w.name,
    query: w.query,
    brand: w.brand,
    category: w.category,
    size: w.size,
    condition: w.condition,
    max_price: w.maxPrice,
    min_roi: w.minRoi,
    min_deal_score: w.minDealScore,
    notify: w.notify,
    is_active: w.isActive,
  });

const toNotification = (r: Row): AppNotification => ({
  id: r.id,
  userId: r.user_id,
  type: r.type,
  title: r.title,
  body: r.body,
  data: r.data ?? {},
  readAt: r.read_at,
  createdAt: r.created_at,
});

function strip(row: Row): Row {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(translateError(res.error.message));
  return res.data as T;
}

function translateError(message: string) {
  if (/JWT|jwt|not authenticated/i.test(message)) return 'Sessione scaduta: effettua di nuovo il login.';
  if (/row-level security/i.test(message)) return 'Operazione non consentita.';
  if (/violates check constraint/i.test(message)) return 'Alcuni valori non sono validi.';
  if (/Failed to fetch|NetworkError/i.test(message)) return 'Connessione assente: riprova tra poco.';
  return message;
}

// ---------- auth ---------------------------------------------------------------------------
export class SupabaseAuthService implements AuthService {
  readonly mode = 'supabase' as const;
  constructor(private sb: SupabaseClient) {}

  private toUser(u: { id: string; email?: string; user_metadata?: Row } | null): AuthUser | null {
    return u ? { id: u.id, email: u.email ?? '', fullName: u.user_metadata?.full_name ?? null } : null;
  }

  async getUser() {
    const { data } = await this.sb.auth.getUser();
    return this.toUser(data.user);
  }

  async signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    const { data, error } = await this.sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${appUrl()}/auth/callback?next=/onboarding`,
      },
    });
    if (error)
      throw new Error(
        error.message.includes('registered') ? 'Esiste già un account con questa email.' : error.message,
      );
    // With "Confirm email" enabled no session is returned until the link is clicked.
    return { needsEmailConfirmation: !data.session };
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (/confirm/i.test(error.message))
        throw new Error('Conferma prima la tua email (controlla la casella di posta).');
      throw new Error('Email o password non corretti.');
    }
    return this.toUser(data.user)!;
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async requestPasswordReset(email: string) {
    const { error } = await this.sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl()}/auth/callback?next=/reset-password`,
    });
    if (error && !/rate limit/i.test(error.message)) throw new Error(error.message);
    if (error) throw new Error('Troppe richieste: riprova tra qualche minuto.');
  }

  async updatePassword(password: string) {
    const { error } = await this.sb.auth.updateUser({ password });
    if (error)
      throw new Error(
        /session/i.test(error.message)
          ? 'Link di reset non valido o scaduto. Richiedine uno nuovo.'
          : error.message,
      );
  }

  onAuthStateChange(cb: (user: AuthUser | null, event: string) => void) {
    const { data } = this.sb.auth.onAuthStateChange((event, session) =>
      cb(this.toUser(session?.user ?? null), event),
    );
    return () => data.subscription.unsubscribe();
  }
}

// ---------- data -----------------------------------------------------------------------------
export class SupabaseRepository implements DataRepository {
  readonly mode = 'supabase' as const;
  constructor(
    private sb: SupabaseClient,
    private userId: string,
  ) {}

  async getProfileBundle(): Promise<UserProfileBundle> {
    const [p, g, s] = await Promise.all([
      this.sb.from('profiles').select('*').eq('user_id', this.userId).maybeSingle(),
      this.sb.from('user_goals').select('*').eq('user_id', this.userId).maybeSingle(),
      this.sb.from('user_settings').select('*').eq('user_id', this.userId).maybeSingle(),
    ]);
    const profile = check(p) as Row | null;
    const goals = check(g) as Row | null;
    const settings = check(s) as Row | null;
    if (!profile) {
      // Trigger missed (e.g. user created before migrations): create rows lazily.
      const { data: auth } = await this.sb.auth.getUser();
      await this.sb.from('profiles').upsert({
        user_id: this.userId,
        email: auth.user?.email,
        full_name: auth.user?.user_metadata?.full_name ?? null,
      });
      await this.sb.from('user_goals').upsert({ user_id: this.userId });
      await this.sb.from('user_settings').upsert({ user_id: this.userId });
      return this.getProfileBundle();
    }
    return {
      profile: {
        id: profile.user_id,
        email: profile.email ?? '',
        username: profile.username,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        mainCategory: profile.main_category,
        favoriteBrands: profile.favorite_brands ?? [],
        favoriteCategories: profile.favorite_categories ?? [],
        onboardingCompleted: profile.onboarding_completed,
        createdAt: profile.created_at,
      },
      goals: {
        budget: num(goals?.budget),
        monthlyGoal: num(goals?.monthly_goal),
        targetRoi: num(goals?.target_roi) ?? DEFAULT_TARGET_ROI,
      },
      settings: {
        dealScoreWeights: { ...DEFAULT_WEIGHTS, ...(settings?.deal_score_weights ?? {}) },
        defaultExtraCosts: num(settings?.default_extra_costs) ?? DEFAULT_SETTINGS.defaultExtraCosts,
        notifyHotDeals: settings?.notify_hot_deals ?? true,
        notifyWatchlist: settings?.notify_watchlist ?? true,
        preferredMarketplace: settings?.preferred_marketplace ?? 'vinted',
      },
    };
  }

  async updateProfileBundle(update: ProfileUpdate) {
    const ops: PromiseLike<{ error: { message: string } | null }>[] = [];
    if (update.profile) {
      const p = update.profile;
      ops.push(
        this.sb
          .from('profiles')
          .update(
            strip({
              username: p.username,
              full_name: p.fullName,
              avatar_url: p.avatarUrl,
              main_category: p.mainCategory,
              favorite_brands: p.favoriteBrands,
              favorite_categories: p.favoriteCategories,
              onboarding_completed: p.onboardingCompleted,
            }),
          )
          .eq('user_id', this.userId),
      );
    }
    if (update.goals) {
      const g = update.goals;
      ops.push(
        this.sb
          .from('user_goals')
          .update(strip({ budget: g.budget, monthly_goal: g.monthlyGoal, target_roi: g.targetRoi }))
          .eq('user_id', this.userId),
      );
    }
    if (update.settings) {
      const s = update.settings;
      ops.push(
        this.sb
          .from('user_settings')
          .update(
            strip({
              deal_score_weights: s.dealScoreWeights,
              default_extra_costs: s.defaultExtraCosts,
              notify_hot_deals: s.notifyHotDeals,
              notify_watchlist: s.notifyWatchlist,
              preferred_marketplace: s.preferredMarketplace,
            }),
          )
          .eq('user_id', this.userId),
      );
    }
    const results = await Promise.all(ops);
    for (const r of results) if (r.error) throw new Error(translateError(r.error.message));
    return this.getProfileBundle();
  }

  async listInventory() {
    return (
      check(
        await this.sb.from('inventory_items').select('*').order('created_at', { ascending: false }),
      ) as Row[]
    ).map(toInventory);
  }
  async createInventoryItem(input: InventoryItemInput) {
    return toInventory(
      check(
        await this.sb
          .from('inventory_items')
          .insert({ ...fromInventory(input), user_id: this.userId })
          .select()
          .single(),
      ),
    );
  }
  async updateInventoryItem(id: string, patch: Partial<InventoryItemInput>) {
    return toInventory(
      check(
        await this.sb.from('inventory_items').update(fromInventory(patch)).eq('id', id).select().single(),
      ),
    );
  }
  async deleteInventoryItem(id: string) {
    check(await this.sb.from('inventory_items').delete().eq('id', id));
  }
  async markItemSold(id: string, input: MarkSoldInput) {
    const res = await this.sb.rpc('mark_item_sold', {
      p_item_id: id,
      p_sale_price: input.salePrice,
      p_extra_costs: input.extraCosts,
      p_sold_at: input.soldAt,
      p_platform: input.platform,
    });
    return toSale(check(res) as Row);
  }

  async listListings() {
    return (
      check(await this.sb.from('listings').select('*').order('created_at', { ascending: false })) as Row[]
    ).map(toListing);
  }
  async createListing(input: ListingInput) {
    return toListing(
      check(
        await this.sb
          .from('listings')
          .insert({ ...fromListing(input), user_id: this.userId })
          .select()
          .single(),
      ),
    );
  }
  async updateListing(id: string, patch: Partial<ListingInput>) {
    return toListing(
      check(await this.sb.from('listings').update(fromListing(patch)).eq('id', id).select().single()),
    );
  }
  async deleteListing(id: string) {
    check(await this.sb.from('listings').delete().eq('id', id));
  }

  async listSales() {
    return (
      check(await this.sb.from('sales').select('*').order('sold_at', { ascending: false })) as Row[]
    ).map(toSale);
  }
  async createSale(input: SaleInput) {
    return toSale(
      check(
        await this.sb
          .from('sales')
          .insert({ ...fromSale(input), user_id: this.userId })
          .select()
          .single(),
      ),
    );
  }
  async deleteSale(id: string) {
    check(await this.sb.from('sales').delete().eq('id', id));
  }

  async listWatchlists() {
    return (
      check(await this.sb.from('watchlists').select('*').order('created_at', { ascending: false })) as Row[]
    ).map(toWatchlist);
  }
  async createWatchlist(input: WatchlistInput) {
    return toWatchlist(
      check(
        await this.sb
          .from('watchlists')
          .insert({ ...fromWatchlist(input), user_id: this.userId })
          .select()
          .single(),
      ),
    );
  }
  async updateWatchlist(id: string, patch: Partial<WatchlistInput>) {
    return toWatchlist(
      check(await this.sb.from('watchlists').update(fromWatchlist(patch)).eq('id', id).select().single()),
    );
  }
  async deleteWatchlist(id: string) {
    check(await this.sb.from('watchlists').delete().eq('id', id));
  }

  async saveDealAnalysis(input: Omit<DealAnalysisRecord, 'id' | 'userId' | 'createdAt'>) {
    check(
      await this.sb.from('deal_analyses').insert({
        user_id: this.userId,
        product_name: input.productName,
        brand: input.brand,
        category: input.category,
        asking_price: input.askingPrice,
        deal_score: input.dealScore,
        verdict: input.verdict,
        result: input.result,
      }),
    );
  }
  async listDealAnalyses(limit = 10): Promise<DealAnalysisRecord[]> {
    const rows = check(
      await this.sb.from('deal_analyses').select('*').order('created_at', { ascending: false }).limit(limit),
    ) as Row[];
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      productName: r.product_name,
      brand: r.brand,
      category: r.category,
      askingPrice: Number(r.asking_price),
      dealScore: r.deal_score,
      verdict: r.verdict,
      result: r.result,
      createdAt: r.created_at,
    }));
  }

  async listNotifications() {
    return (
      check(
        await this.sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      ) as Row[]
    ).map(toNotification);
  }
  async markNotificationsRead(ids: string[]) {
    if (!ids.length) return;
    check(
      await this.sb
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids)
        .is('read_at', null),
    );
  }

  async createNotification(input: Pick<AppNotification, 'type' | 'title' | 'body' | 'data'>) {
    check(await this.sb.from('notifications').insert({ user_id: this.userId, ...input }));
  }

  async uploadImage(file: Blob, fileName: string) {
    const ext = (fileName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${this.userId}/${uid()}.${ext}`;
    const { error } = await this.sb.storage.from(STORAGE_BUCKET).upload(path, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    });
    if (error)
      throw new Error(
        /size/i.test(error.message)
          ? 'Immagine troppo grande (max 5 MB).'
          : `Upload fallito: ${error.message}`,
      );
    return this.sb.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async seedDemoData() {
    const bundle = buildDemoBundle(new Date(), uid);
    const own = (r: Row) => ({ ...r, user_id: this.userId });
    check(
      await this.sb
        .from('inventory_items')
        .insert(
          bundle.inventory.map((i) =>
            own({ id: i.id, ...fromInventory(i), sold_at: i.soldAt, created_at: i.createdAt }),
          ),
        ),
    );
    check(
      await this.sb
        .from('listings')
        .insert(bundle.listings.map((l) => own({ id: l.id, ...fromListing(l), created_at: l.createdAt }))),
    );
    check(
      await this.sb
        .from('sales')
        .insert(bundle.sales.map((s) => own({ id: s.id, ...fromSale(s), created_at: s.createdAt }))),
    );
    check(
      await this.sb
        .from('watchlists')
        .insert(
          bundle.watchlists.map((w) => own({ id: w.id, ...fromWatchlist(w), created_at: w.createdAt })),
        ),
    );
    check(
      await this.sb.from('notifications').insert(
        bundle.notifications.map((n) =>
          own({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            data: n.data,
            read_at: n.readAt,
            created_at: n.createdAt,
          }),
        ),
      ),
    );
  }

  async clearAllData() {
    // Order matters because of FKs (set null) – sales first keeps history consistent.
    for (const table of [
      'sales',
      'listings',
      'inventory_items',
      'watchlists',
      'deal_analyses',
      'notifications',
      'ai_generations',
    ]) {
      check(await this.sb.from(table).delete().eq('user_id', this.userId));
    }
  }
}
