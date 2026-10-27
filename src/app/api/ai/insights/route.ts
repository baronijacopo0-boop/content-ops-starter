import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { guardAiRequest } from '@/lib/api/guard';
import type { InventoryItem, Sale } from '@/lib/domain/types';
import { categorySchema } from '@/lib/validation';
import { generateBusinessInsightsServer } from '@/services/ai/server';

export const dynamic = 'force-dynamic';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
const money = z.number().min(0).max(100_000);
// Only the fields used by the insight rules are accepted; arrays are bounded.
const itemSchema = z.object({
  name: z.string().max(120),
  brand: z.string().max(60),
  category: categorySchema,
  status: z.enum(['to_photograph', 'to_list', 'listed', 'reserved', 'sold']),
  purchasePrice: money,
  extraCosts: money,
  listedPrice: money.nullable(),
  purchaseDate: date,
  soldAt: date.nullable(),
});
const saleSchema = z.object({
  brand: z.string().max(60),
  category: categorySchema,
  purchasePrice: money,
  salePrice: money,
  extraCosts: money,
  purchasedAt: date,
  soldAt: date,
});
const schema = z.object({
  items: z.array(itemSchema).max(5000),
  sales: z.array(saleSchema).max(10000),
  goals: z
    .object({
      monthlyGoal: z.number().nullable().optional(),
      targetRoi: z.number().optional(),
      budget: z.number().nullable().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req, schema);
  if (!guard.ok) return guard.response;
  const { items, sales, goals } = guard.data;
  const result = await generateBusinessInsightsServer(
    items as unknown as InventoryItem[],
    sales as unknown as Sale[],
    goals,
  );
  return NextResponse.json(result);
}
