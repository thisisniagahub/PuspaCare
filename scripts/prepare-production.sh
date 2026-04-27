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

restore_sqlite_schema() {
  if grep -q 'provider  = "postgresql"' prisma/schema.prisma 2>/dev/null; then
    sed -i 's/provider  = "postgresql"/provider  = "sqlite"/' prisma/schema.prisma
  fi

  if grep -q '^[[:space:]]*directUrl = env("DIRECT_URL")' prisma/schema.prisma 2>/dev/null; then
    sed -i 's|directUrl = env("DIRECT_URL")|// directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  fi
}

trap restore_sqlite_schema EXIT

echo "=== PUSPA NGO — Build Preparation ==="

# ── Auto-map hosted Postgres/Supabase env vars ──
# Some integrations set POSTGRES_* but old manual DATABASE_URL/DIRECT_URL values may
# still contain placeholder instructions. Treat placeholders as unset so production
# does not silently fall back to SQLite.
is_database_url_usable() {
  echo "$1" | grep -Eiq '^(postgres|postgresql|file):'
}

is_placeholder_value() {
  echo "$1" | grep -Eiq 'Settings[[:space:]]*(→|->)[[:space:]]*Database|Project[[:space:]]*(→|->)|Transaction pooler URI|Direct connection URI|anon public key|publishable key|Project URL'
}

if [ -n "$DATABASE_URL" ] && { is_placeholder_value "$DATABASE_URL" || ! is_database_url_usable "$DATABASE_URL"; }; then
  unset DATABASE_URL
  echo "[vercel-integration] Ignoring placeholder DATABASE_URL"
fi

if [ -n "$DIRECT_URL" ] && { is_placeholder_value "$DIRECT_URL" || ! is_database_url_usable "$DIRECT_URL"; }; then
  unset DIRECT_URL
  echo "[vercel-integration] Ignoring placeholder DIRECT_URL"
fi

if [ -n "$POSTGRES_PRISMA_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$POSTGRES_PRISMA_URL"
  echo "[vercel-integration] Using POSTGRES_PRISMA_URL as DATABASE_URL"
elif [ -n "$SUPABASE_DB_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$SUPABASE_DB_URL"
  echo "[vercel-integration] Using SUPABASE_DB_URL as DATABASE_URL"
elif [ -n "$POSTGRES_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$POSTGRES_URL"
  echo "[vercel-integration] Using POSTGRES_URL as DATABASE_URL"
fi

if [ -n "$POSTGRES_URL_NON_POOLING" ] && [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$POSTGRES_URL_NON_POOLING"
  echo "[vercel-integration] Using POSTGRES_URL_NON_POOLING as DIRECT_URL"
elif [ -n "$SUPABASE_DB_URL" ] && [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$SUPABASE_DB_URL"
elif [ -n "$POSTGRES_URL" ] && [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$POSTGRES_URL"
fi

# Supabase's Vercel integration exposes SUPABASE_* names, while the app reads
# NEXT_PUBLIC_SUPABASE_* during the Next.js build.
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && is_placeholder_value "$NEXT_PUBLIC_SUPABASE_URL"; then
  unset NEXT_PUBLIC_SUPABASE_URL
  echo "[vercel-integration] Ignoring placeholder NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && is_placeholder_value "$NEXT_PUBLIC_SUPABASE_ANON_KEY"; then
  unset NEXT_PUBLIC_SUPABASE_ANON_KEY
  echo "[vercel-integration] Ignoring placeholder NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

if [ -n "$SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
  echo "[vercel-integration] Using SUPABASE_URL as NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  echo "[vercel-integration] Using NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as NEXT_PUBLIC_SUPABASE_ANON_KEY"
elif [ -n "$SUPABASE_ANON_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
  echo "[vercel-integration] Using SUPABASE_ANON_KEY as NEXT_PUBLIC_SUPABASE_ANON_KEY"
elif [ -n "$SUPABASE_PUBLISHABLE_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_PUBLISHABLE_KEY"
  echo "[vercel-integration] Using SUPABASE_PUBLISHABLE_KEY as NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

# ── Detect Supabase/Postgres (production) vs SQLite (local) ──
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -iq "postgres"; then
  echo "[prod] Supabase PostgreSQL detected"

  # Switch schema provider: sqlite → postgresql
  sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
  
  # Enable directUrl if DIRECT_URL is available
  if [ -n "$DIRECT_URL" ]; then
    sed -i 's|// directUrl = env("DIRECT_URL")|directUrl = env("DIRECT_URL")|' prisma/schema.prisma
    echo "[prod] directUrl enabled for connection pooling"
  fi
  
  echo "[prod] Schema → PostgreSQL"

  ./node_modules/.bin/prisma generate
  echo "[prod] Prisma client generated"

  # Check if we should skip build (useful for debugging)
  if [ "$SKIP_NEXT_BUILD" = "true" ]; then
    echo "[prod] Skipping next build as requested"
  else
    npx next build
    echo "[prod] Next.js build complete"
  fi

  # Restore schema so git checkout stays clean
  sed -i 's/provider  = "postgresql"/provider  = "sqlite"/' prisma/schema.prisma
  sed -i 's|directUrl = env("DIRECT_URL")|// directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  echo "[prod] Schema restored to SQLite"
else
  echo "[local] No Supabase env — using SQLite"

  ./node_modules/.bin/prisma generate
  npx next build
  if command -v bun >/dev/null 2>&1; then
    bun run scripts/prepare-standalone.ts
  else
    echo "[local] bun not found — skipping standalone asset preparation"
  fi
  echo "[local] Build complete"
fi

echo "=== Build finished ==="
