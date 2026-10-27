import type {
  AppNotification,
  DealAnalysisRecord,
  InventoryItem,
  InventoryItemInput,
  Listing,
  ListingInput,
  MarkSoldInput,
  Profile,
  Sale,
  SaleInput,
  UserGoals,
  UserProfileBundle,
  UserSettings,
  Watchlist,
  WatchlistInput,
} from '@/lib/domain/types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface SignUpResult {
  /** True when the user must confirm the email before logging in (Supabase "Confirm email" enabled). */
  needsEmailConfirmation: boolean;
}

export interface AuthService {
  readonly mode: 'supabase' | 'local';
  getUser(): Promise<AuthUser | null>;
  signUp(input: { email: string; password: string; fullName: string }): Promise<SignUpResult>;
  signIn(input: { email: string; password: string }): Promise<AuthUser>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthStateChange(cb: (user: AuthUser | null, event: string) => void): () => void;
}

export interface ProfileUpdate {
  profile?: Partial<Omit<Profile, 'id' | 'email' | 'createdAt'>>;
  goals?: Partial<UserGoals>;
  settings?: Partial<UserSettings>;
}

/**
 * Data access contract used by every page. Two implementations:
 *  - SupabaseRepository: PostgreSQL + Storage, protected by Row Level Security.
 *  - LocalRepository: browser storage, used automatically when Supabase isn't configured (demo/dev).
 */
export interface DataRepository {
  readonly mode: 'supabase' | 'local';

  getProfileBundle(): Promise<UserProfileBundle>;
  updateProfileBundle(update: ProfileUpdate): Promise<UserProfileBundle>;

  listInventory(): Promise<InventoryItem[]>;
  createInventoryItem(input: InventoryItemInput): Promise<InventoryItem>;
  updateInventoryItem(id: string, patch: Partial<InventoryItemInput>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  /** Atomically: creates the sale, marks the item (and linked listings) as sold. */
  markItemSold(id: string, input: MarkSoldInput): Promise<Sale>;

  listListings(): Promise<Listing[]>;
  createListing(input: ListingInput): Promise<Listing>;
  updateListing(id: string, patch: Partial<ListingInput>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;

  listSales(): Promise<Sale[]>;
  createSale(input: SaleInput): Promise<Sale>;
  deleteSale(id: string): Promise<void>;

  listWatchlists(): Promise<Watchlist[]>;
  createWatchlist(input: WatchlistInput): Promise<Watchlist>;
  updateWatchlist(id: string, patch: Partial<WatchlistInput>): Promise<Watchlist>;
  deleteWatchlist(id: string): Promise<void>;

  saveDealAnalysis(input: Omit<DealAnalysisRecord, 'id' | 'userId' | 'createdAt'>): Promise<void>;
  listDealAnalyses(limit?: number): Promise<DealAnalysisRecord[]>;

  listNotifications(): Promise<AppNotification[]>;
  markNotificationsRead(ids: string[]): Promise<void>;
  createNotification(input: Pick<AppNotification, 'type' | 'title' | 'body' | 'data'>): Promise<void>;

  /** Uploads an (already validated & resized) image and returns a public URL or data URL. */
  uploadImage(file: Blob, fileName: string): Promise<string>;

  seedDemoData(): Promise<void>;
  clearAllData(): Promise<void>;
}
