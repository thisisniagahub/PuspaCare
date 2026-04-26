#!/bin/bash
# =============================================================
# PUSPA NGO — Production Build Preparation (Vercel/Supabase)
# =============================================================
# Called by vercel.json buildCommand.
# Detects Supabase env vars → switches Prisma schema → builds.
#
# Supports two Supabase setups:
#   1. Vercel Supabase Integration (auto-sets SUPABASE_DB_URL)
#   2. Manual Supabase config (set DATABASE_URL + DIRECT_URL)
# =============================================================

set -e

echo "=== PUSPA NGO — Build Preparation ==="

# ── Auto-map Vercel Supabase Integration env vars ──
# If SUPABASE_DB_URL exists but DATABASE_URL doesn't, use it.
if [ -n "$SUPABASE_DB_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$SUPABASE_DB_URL"
  export DIRECT_URL="$SUPABASE_DB_URL"
  echo "[vercel-integration] Using SUPABASE_DB_URL as DATABASE_URL"
fi

# ── Detect Supabase (production) vs SQLite (local) ──
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "[prod] Supabase PostgreSQL detected"

  # Switch schema provider: sqlite → postgresql
  sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
  sed -i 's|// directUrl = env("DIRECT_URL")|directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  echo "[prod] Schema → PostgreSQL"

  npx prisma generate
  echo "[prod] Prisma client generated"

  npx next build
  echo "[prod] Next.js build complete"

  # Restore schema so git checkout stays clean
  sed -i 's/provider  = "postgresql"/provider  = "sqlite"/' prisma/schema.prisma
  sed -i 's|directUrl = env("DIRECT_URL")|// directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  echo "[prod] Schema restored to SQLite"
else
  echo "[local] No Supabase env — using SQLite"

  npx prisma generate
  npx next build
  echo "[local] Build complete"
fi

echo "=== Build finished ==="
