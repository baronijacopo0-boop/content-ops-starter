/**
 * Creates (or refreshes) a demo account on your Supabase project and fills it with demo data:
 * 15 inventory items, 30 sales over 6 months, listings, 5 watchlists, notifications.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY – run it only from your computer / server, never in the browser.
 *   npm run seed:demo            (reads .env.local)
 * Optional env: DEMO_EMAIL (default demo@flipai.app), DEMO_PASSWORD (default: random, printed once)
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { SupabaseRepository } from '../src/lib/data/supabase-repository';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.env.DEMO_EMAIL ?? 'demo@flipai.app';
const password = process.env.DEMO_PASSWORD ?? `Demo-${randomBytes(6).toString('hex')}1`;
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  let user = list.users.find((u) => u.email === email);
  if (user) {
    await admin.auth.admin.updateUserById(user.id, { password });
    console.log(`Demo user exists (${user.id}), password reset.`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Alex Demo' },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Demo user created (${user.id}).`);
  }

  const repo = new SupabaseRepository(admin, user.id);
  await repo.clearAllData();
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
  console.log(`\nDemo ready → email: ${email}  password: ${password}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
