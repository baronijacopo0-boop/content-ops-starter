'use client';

/**
 * Local demo mode: used automatically when Supabase env vars are missing.
 * Data lives in the browser (localStorage) so the whole app is usable for development, demos and
 * testing without any backend. Not meant for production data – configure Supabase for that.
 */
import type {
  AppNotification,
  DealAnalysisRecord,
  InventoryItem,
  Listing,
  Profile,
  Sale,
  UserGoals,
  UserProfileBundle,
  UserSettings,
  Watchlist,
} from '@/lib/domain/types';
import { DEFAULT_SETTINGS, DEFAULT_TARGET_ROI } from '@/lib/domain/constants';
import { uid } from '@/lib/utils';
import type { AuthService, AuthUser, DataRepository, ProfileUpdate } from './repository';
import { buildDemoBundle } from './demo-seed';

const PREFIX = 'flipai:v1';
const USERS_KEY = `${PREFIX}:users`;
const SESSION_KEY = `${PREFIX}:session`;
const dbKey = (userId: string) => `${PREFIX}:db:${userId}`;

interface LocalUserRecord {
  id: string;
  email: string;
  fullName: string;
  salt: string;
  hash: string;
  createdAt: string;
}

interface LocalDb {
  profile: Profile;
  goals: UserGoals;
  settings: UserSettings;
  inventory: InventoryItem[];
  listings: Listing[];
  sales: Sale[];
  watchlists: Watchlist[];
  analyses: DealAnalysisRecord[];
  notifications: AppNotification[];
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error(
        'Spazio locale esaurito: elimina qualche foto o configura Supabase per salvare online.',
      );
    }
    throw e;
  }
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const listeners = new Set<(user: AuthUser | null, event: string) => void>();
function emit(user: AuthUser | null, event: string) {
  listeners.forEach((l) => l(user, event));
}

export const DEMO_ACCOUNT = { email: 'demo@flipai.app', password: 'demo1234', fullName: 'Alex Demo' };

export class LocalAuthService implements AuthService {
  readonly mode = 'local' as const;

  async getUser(): Promise<AuthUser | null> {
    const session = read<{ userId: string } | null>(SESSION_KEY, null);
    if (!session) return null;
    const user = read<LocalUserRecord[]>(USERS_KEY, []).find((u) => u.id === session.userId);
    return user ? { id: user.id, email: user.email, fullName: user.fullName } : null;
  }

  async signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    const users = read<LocalUserRecord[]>(USERS_KEY, []);
    if (users.some((u) => u.email === email.toLowerCase()))
      throw new Error('Esiste già un account con questa email.');
    const salt = uid();
    const record: LocalUserRecord = {
      id: uid(),
      email: email.toLowerCase(),
      fullName,
      salt,
      hash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    write(USERS_KEY, [...users, record]);
    write(dbKey(record.id), emptyDb(record));
    write(SESSION_KEY, { userId: record.id });
    emit({ id: record.id, email: record.email, fullName }, 'SIGNED_IN');
    return { needsEmailConfirmation: false };
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const user = read<LocalUserRecord[]>(USERS_KEY, []).find((u) => u.email === email.toLowerCase());
    if (!user || (await hashPassword(password, user.salt)) !== user.hash)
      throw new Error('Email o password non corretti.');
    write(SESSION_KEY, { userId: user.id });
    const authUser = { id: user.id, email: user.email, fullName: user.fullName };
    emit(authUser, 'SIGNED_IN');
    return authUser;
  }

  /** Creates (if needed) and signs into the demo account, pre-filled with demo data. */
  async signInDemo() {
    const exists = read<LocalUserRecord[]>(USERS_KEY, []).some((u) => u.email === DEMO_ACCOUNT.email);
    if (!exists) {
      await this.signUp(DEMO_ACCOUNT);
      const user = (await this.getUser())!;
      const repo = new LocalRepository(user.id);
      await repo.seedDemoData();
      await repo.updateProfileBundle({
        profile: {
          onboardingCompleted: true,
          mainCategory: 'streetwear',
          favoriteBrands: ['Nike', 'Carhartt', 'Ralph Lauren', 'The North Face'],
          username: 'alex.flips',
        },
        goals: { budget: 250, monthlyGoal: 500, targetRoi: 100 },
      });
      return user;
    }
    return this.signIn(DEMO_ACCOUNT);
  }

  async signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    emit(null, 'SIGNED_OUT');
  }

  async requestPasswordReset(email: string) {
    // No email server in local mode: the reset page is reachable directly.
    const exists = read<LocalUserRecord[]>(USERS_KEY, []).some((u) => u.email === email.toLowerCase());
    if (exists) write(`${PREFIX}:reset`, { email: email.toLowerCase(), at: Date.now() });
  }

  async updatePassword(password: string) {
    const users = read<LocalUserRecord[]>(USERS_KEY, []);
    const session = read<{ userId: string } | null>(SESSION_KEY, null);
    const reset = read<{ email: string; at: number } | null>(`${PREFIX}:reset`, null);
    const target = users.find((u) =>
      session
        ? u.id === session.userId
        : reset && u.email === reset.email && Date.now() - reset.at < 3_600_000,
    );
    if (!target) throw new Error('Link di reset non valido o scaduto. Richiedine uno nuovo.');
    target.salt = uid();
    target.hash = await hashPassword(password, target.salt);
    write(USERS_KEY, users);
    window.localStorage.removeItem(`${PREFIX}:reset`);
  }

  onAuthStateChange(cb: (user: AuthUser | null, event: string) => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
}

function emptyDb(user: LocalUserRecord): LocalDb {
  return {
    profile: {
      id: user.id,
      email: user.email,
      username: null,
      fullName: user.fullName,
      avatarUrl: null,
      mainCategory: null,
      favoriteBrands: [],
      favoriteCategories: [],
      onboardingCompleted: false,
      createdAt: user.createdAt,
    },
    goals: { budget: null, monthlyGoal: null, targetRoi: DEFAULT_TARGET_ROI },
    settings: DEFAULT_SETTINGS,
    inventory: [],
    listings: [],
    sales: [],
    watchlists: [],
    analyses: [],
    notifications: [],
  };
}

const now = () => new Date().toISOString();
const byDateDesc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

export class LocalRepository implements DataRepository {
  readonly mode = 'local' as const;
  constructor(private userId: string) {}

  private load(): LocalDb {
    const db = read<LocalDb | null>(dbKey(this.userId), null);
    if (!db) throw new Error('Sessione locale non valida: effettua di nuovo il login.');
    return db;
  }
  private save(db: LocalDb) {
    write(dbKey(this.userId), db);
  }
  private mutate<T>(fn: (db: LocalDb) => T): T {
    const db = this.load();
    const result = fn(db);
    this.save(db);
    return result;
  }

  async getProfileBundle(): Promise<UserProfileBundle> {
    const db = this.load();
    return { profile: db.profile, goals: db.goals, settings: { ...DEFAULT_SETTINGS, ...db.settings } };
  }

  async updateProfileBundle(update: ProfileUpdate) {
    return this.mutate((db) => {
      if (update.profile) db.profile = { ...db.profile, ...update.profile };
      if (update.goals) db.goals = { ...db.goals, ...update.goals };
      if (update.settings) db.settings = { ...db.settings, ...update.settings };
      return { profile: db.profile, goals: db.goals, settings: db.settings };
    });
  }

  async listInventory() {
    return [...this.load().inventory].sort(byDateDesc);
  }
  async createInventoryItem(input: Parameters<DataRepository['createInventoryItem']>[0]) {
    return this.mutate((db) => {
      const item: InventoryItem = {
        soldPrice: null,
        ...input,
        id: uid(),
        userId: this.userId,
        soldAt: null,
        createdAt: now(),
        updatedAt: now(),
      };
      db.inventory.push(item);
      return item;
    });
  }
  async updateInventoryItem(id: string, patch: Parameters<DataRepository['updateInventoryItem']>[1]) {
    return this.mutate((db) => {
      const item = db.inventory.find((i) => i.id === id);
      if (!item) throw new Error('Articolo non trovato');
      Object.assign(item, patch, { updatedAt: now() });
      return item;
    });
  }
  async deleteInventoryItem(id: string) {
    this.mutate((db) => {
      db.inventory = db.inventory.filter((i) => i.id !== id);
      db.listings.forEach((l) => l.inventoryItemId === id && (l.inventoryItemId = null));
      db.sales.forEach((s) => s.inventoryItemId === id && (s.inventoryItemId = null));
    });
  }
  async markItemSold(id: string, input: Parameters<DataRepository['markItemSold']>[1]) {
    return this.mutate((db) => {
      const item = db.inventory.find((i) => i.id === id);
      if (!item) throw new Error('Articolo non trovato');
      if (item.status === 'sold') throw new Error('Articolo già venduto');
      const listing = db.listings.find((l) => l.inventoryItemId === id && l.status !== 'sold');
      Object.assign(item, {
        status: 'sold',
        soldPrice: input.salePrice,
        extraCosts: input.extraCosts,
        soldAt: input.soldAt,
        updatedAt: now(),
      });
      db.listings.forEach(
        (l) => l.inventoryItemId === id && Object.assign(l, { status: 'sold', updatedAt: now() }),
      );
      const sale: Sale = {
        id: uid(),
        userId: this.userId,
        inventoryItemId: id,
        listingId: listing?.id ?? null,
        productName: item.name,
        brand: item.brand,
        category: item.category,
        purchasePrice: item.purchasePrice,
        salePrice: input.salePrice,
        extraCosts: input.extraCosts,
        purchasedAt: item.purchaseDate,
        soldAt: input.soldAt,
        platform: input.platform,
        createdAt: now(),
      };
      db.sales.push(sale);
      return sale;
    });
  }

  async listListings() {
    return [...this.load().listings].sort(byDateDesc);
  }
  async createListing(input: Parameters<DataRepository['createListing']>[0]) {
    return this.mutate((db) => {
      const listing: Listing = {
        ...input,
        id: uid(),
        userId: this.userId,
        createdAt: now(),
        updatedAt: now(),
      };
      db.listings.push(listing);
      return listing;
    });
  }
  async updateListing(id: string, patch: Parameters<DataRepository['updateListing']>[1]) {
    return this.mutate((db) => {
      const listing = db.listings.find((l) => l.id === id);
      if (!listing) throw new Error('Annuncio non trovato');
      Object.assign(listing, patch, { updatedAt: now() });
      return listing;
    });
  }
  async deleteListing(id: string) {
    this.mutate((db) => {
      db.listings = db.listings.filter((l) => l.id !== id);
      db.sales.forEach((s) => s.listingId === id && (s.listingId = null));
    });
  }

  async listSales() {
    return [...this.load().sales].sort((a, b) => b.soldAt.localeCompare(a.soldAt));
  }
  async createSale(input: Parameters<DataRepository['createSale']>[0]) {
    return this.mutate((db) => {
      const sale: Sale = { ...input, id: uid(), userId: this.userId, createdAt: now() };
      db.sales.push(sale);
      return sale;
    });
  }
  async deleteSale(id: string) {
    this.mutate((db) => {
      db.sales = db.sales.filter((s) => s.id !== id);
    });
  }

  async listWatchlists() {
    return [...this.load().watchlists].sort(byDateDesc);
  }
  async createWatchlist(input: Parameters<DataRepository['createWatchlist']>[0]) {
    return this.mutate((db) => {
      const w: Watchlist = { ...input, id: uid(), userId: this.userId, createdAt: now() };
      db.watchlists.push(w);
      return w;
    });
  }
  async updateWatchlist(id: string, patch: Parameters<DataRepository['updateWatchlist']>[1]) {
    return this.mutate((db) => {
      const w = db.watchlists.find((x) => x.id === id);
      if (!w) throw new Error('Watchlist non trovata');
      Object.assign(w, patch);
      return w;
    });
  }
  async deleteWatchlist(id: string) {
    this.mutate((db) => {
      db.watchlists = db.watchlists.filter((w) => w.id !== id);
    });
  }

  async saveDealAnalysis(input: Parameters<DataRepository['saveDealAnalysis']>[0]) {
    this.mutate((db) => {
      db.analyses.unshift({ ...input, id: uid(), userId: this.userId, createdAt: now() });
      db.analyses = db.analyses.slice(0, 50);
    });
  }
  async listDealAnalyses(limit = 10) {
    return this.load().analyses.slice(0, limit);
  }

  async listNotifications() {
    return [...this.load().notifications].sort(byDateDesc);
  }
  async markNotificationsRead(ids: string[]) {
    this.mutate((db) =>
      db.notifications.forEach((n) => ids.includes(n.id) && !n.readAt && (n.readAt = now())),
    );
  }

  async createNotification(input: Parameters<DataRepository['createNotification']>[0]) {
    this.mutate((db) => {
      db.notifications.unshift({ ...input, id: uid(), userId: this.userId, readAt: null, createdAt: now() });
      db.notifications = db.notifications.slice(0, 50);
    });
  }

  async uploadImage(file: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Impossibile leggere il file'));
      reader.readAsDataURL(file);
    });
  }

  async seedDemoData() {
    const bundle = buildDemoBundle(new Date(), uid);
    this.mutate((db) => {
      const own = <T extends object>(x: T) => ({ ...x, userId: this.userId });
      db.inventory.push(...bundle.inventory.map(own));
      db.listings.push(...bundle.listings.map(own));
      db.sales.push(...bundle.sales.map(own));
      db.watchlists.push(...bundle.watchlists.map(own));
      db.notifications.push(...bundle.notifications.map(own));
    });
  }

  async clearAllData() {
    this.mutate((db) => {
      db.inventory = [];
      db.listings = [];
      db.sales = [];
      db.watchlists = [];
      db.analyses = [];
      db.notifications = [];
    });
  }
}
