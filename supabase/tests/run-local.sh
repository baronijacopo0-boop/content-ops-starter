#!/usr/bin/env bash
# Applies all migrations + seed to a throw-away local PostgreSQL database and runs the RLS tests.
# Usage: PGHOST=localhost PGUSER=postgres bash supabase/tests/run-local.sh
set -euo pipefail
DB="${TEST_DB:-flipai_test}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$DIR/tests/supabase-shim.sql"
for f in "$DIR"/migrations/*.sql; do
  echo "→ $(basename "$f")"
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$f"
done
echo "→ seed.sql"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$DIR/seed.sql" > /dev/null
psql -v ON_ERROR_STOP=1 -q -d "$DB" -c "select brand, category, median_price, avg_days_to_sell, demand_score, sales_count from public.market_prices where brand in ('Nike','Carhartt') and category = 'hoodie'"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$DIR/tests/rls.test.sql"
