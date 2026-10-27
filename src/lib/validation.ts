import { z } from 'zod';
import {
  CATEGORIES,
  CONDITIONS,
  INVENTORY_STATUSES,
  LISTING_STATUSES,
  MARKETPLACES,
} from '@/lib/domain/constants';
import { sanitizeText } from '@/lib/utils';
import type {
  Condition,
  InventoryStatus,
  ItemCategory,
  ListingStatus,
  MarketplaceId,
} from '@/lib/domain/types';

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const conditionValues = CONDITIONS.map((c) => c.value) as [string, ...string[]];
const marketplaceValues = MARKETPLACES.map((m) => m.value) as [string, ...string[]];

/** Text field: sanitized, trimmed and length-limited. */
export const text = (max = 200) =>
  z
    .string()
    .max(max * 2)
    .transform((s) => sanitizeText(s, max));
const requiredText = (max = 200, msg = 'Campo obbligatorio') =>
  z
    .string()
    .transform((s) => sanitizeText(s, max))
    .pipe(z.string().min(1, msg));
const money = z.coerce
  .number({ message: 'Inserisci un numero' })
  .min(0, 'Non può essere negativo')
  .max(100_000, 'Valore troppo alto');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida');

export const categorySchema = z.enum(categoryValues as [ItemCategory, ...ItemCategory[]]);
export const conditionSchema = z.enum(conditionValues as [Condition, ...Condition[]]);
export const marketplaceSchema = z.enum(marketplaceValues as [MarketplaceId, ...MarketplaceId[]]);

export const emailSchema = z.string().trim().toLowerCase().email('Email non valida').max(254);
export const passwordSchema = z
  .string()
  .min(8, 'Almeno 8 caratteri')
  .max(72, 'Massimo 72 caratteri')
  .regex(/[A-Za-z]/, 'Deve contenere almeno una lettera')
  .regex(/[0-9]/, 'Deve contenere almeno un numero');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Inserisci la password'),
});
export const registerSchema = z
  .object({
    fullName: requiredText(80, 'Inserisci il tuo nome'),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Le password non coincidono', path: ['confirm'] });
export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: 'Le password non coincidono', path: ['confirm'] });

export const dealInputSchema = z.object({
  name: text(120).optional(),
  brand: requiredText(60, 'Inserisci il brand'),
  category: categorySchema,
  condition: conditionSchema,
  size: text(20).default('M'),
  price: z.coerce.number().positive('Il prezzo deve essere maggiore di 0').max(50_000),
  extraCosts: money.optional(),
  targetRoi: z.coerce.number().min(0).max(1000).optional(),
  weights: z
    .object({
      priceVsMarket: z.number().min(0).max(100),
      brandDemand: z.number().min(0).max(100),
      roi: z.number().min(0).max(100),
      sellSpeed: z.number().min(0).max(100),
      condition: z.number().min(0).max(100),
      size: z.number().min(0).max(100),
    })
    .optional(),
  marketplace: marketplaceSchema.optional(),
});

export const inventoryItemSchema = z.object({
  name: requiredText(120, 'Inserisci il nome del capo'),
  brand: requiredText(60, 'Inserisci il brand'),
  category: categorySchema,
  size: text(20),
  condition: conditionSchema,
  purchasePrice: money,
  purchaseDate: isoDate,
  source: text(60),
  listedPrice: money.nullable(),
  extraCosts: money,
  status: z.enum(INVENTORY_STATUSES.map((s) => s.value) as [InventoryStatus, ...InventoryStatus[]]),
  photos: z.array(z.string().max(2_000_000)).max(8),
  notes: text(1000),
});

export const listingSchema = z.object({
  inventoryItemId: z.string().nullable(),
  title: requiredText(120, 'Inserisci un titolo'),
  description: text(3000),
  brand: text(60),
  category: categorySchema,
  size: text(20),
  condition: conditionSchema,
  colors: z.array(text(30)).max(5),
  material: text(80),
  style: text(40),
  price: money,
  photos: z.array(z.string().max(2_000_000)).max(8),
  views: z.number().int().min(0),
  favorites: z.number().int().min(0),
  status: z.enum(LISTING_STATUSES.map((s) => s.value) as [ListingStatus, ...ListingStatus[]]),
  marketplace: marketplaceSchema,
  publishedAt: z.string().nullable(),
});

export const markSoldSchema = z.object({
  salePrice: z.coerce.number().positive('Inserisci il prezzo di vendita').max(100_000),
  extraCosts: money,
  soldAt: isoDate,
  platform: marketplaceSchema,
});

export const watchlistSchema = z.object({
  name: requiredText(80, 'Dai un nome alla ricerca'),
  query: text(120),
  brand: text(60).nullable(),
  category: categorySchema.nullable(),
  size: text(20).nullable(),
  condition: conditionSchema.nullable(),
  maxPrice: money.nullable(),
  minRoi: z.coerce.number().min(0).max(1000).nullable(),
  minDealScore: z.coerce.number().min(0).max(100).nullable(),
  notify: z.boolean(),
  isActive: z.boolean(),
});

export const listingAttributesSchema = z.object({
  category: categorySchema,
  brand: text(60),
  colors: z.array(text(30)).max(5),
  size: text(20).nullable(),
  condition: conditionSchema.nullable(),
  material: text(80).nullable(),
  style: text(40).nullable(),
  graphic: text(80).nullable(),
  model: text(60).nullable().optional(),
  defects: z.array(text(120)).max(10),
});

export const imageAnalysisInputSchema = z.object({
  images: z
    .array(
      z.object({
        name: text(120),
        // ~1.5MB base64 per resized image
        dataUrl: z
          .string()
          .max(2_000_000)
          .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, 'Formato immagine non valido')
          .optional(),
        dominantColors: z.array(text(30)).max(5),
      }),
    )
    .min(1, 'Carica almeno una foto')
    .max(8, 'Massimo 8 foto'),
  hints: z
    .object({ brand: text(60).optional(), category: categorySchema.optional(), size: text(20).optional() })
    .optional(),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Dati non validi';
}

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
