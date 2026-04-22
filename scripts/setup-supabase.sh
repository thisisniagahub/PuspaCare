#!/bin/bash
# =============================================================
# PUSPA NGO — Supabase Database Setup Script
# =============================================================
# Run this ONCE to set up your Supabase PostgreSQL database.
#
# PREREQUISITES:
#   1. Create a Supabase project at https://supabase.com
#   2. Get your Database Connection String from:
#      Supabase Dashboard → Settings → Database → Connection string (URI)
#
# USAGE:
#   chmod +x scripts/setup-supabase.sh
#   ./scripts/setup-supabase.sh
# =============================================================

set -e

echo "🔍 PUSPA NGO — Supabase Database Setup"
echo "======================================="
echo ""

# Check for DATABASE_URL
if [ -z "$DIRECT_URL" ]; then
  echo "❌ DIRECT_URL not set!"
  echo ""
  echo "Please get your connection string from Supabase Dashboard:"
  echo "  1. Go to https://supabase.com/dashboard"
  echo "  2. Select your project"
  echo "  3. Settings → Database → Connection string"
  echo "  4. Copy the 'URI' format"
  echo ""
  echo "Then run:"
  echo "  export DIRECT_URL='postgresql://postgres.[ref]:[password]@aws-0-[region].supabase.com:5432/postgres'"
  echo "  export DATABASE_URL='postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true'"
  echo "  ./scripts/setup-supabase.sh"
  exit 1
fi

echo "✅ DIRECT_URL found"
echo "✅ DATABASE_URL found"
echo ""

# Step 1: Push schema to database
echo "📊 Step 1/2: Pushing Prisma schema to Supabase..."
npx prisma db push --accept-data-loss
echo "✅ Schema pushed!"
echo ""

# Step 2: Seed data
echo "🌱 Step 2/2: Seeding database with demo data..."
npx tsx prisma/seed.ts
echo "✅ Database seeded!"
echo ""

echo "🎉 Setup complete! Your Supabase database is ready."
echo ""
echo "For Vercel deployment, add these Environment Variables:"
echo "  DATABASE_URL = $DATABASE_URL"
echo "  DIRECT_URL  = $DIRECT_URL"
echo ""
echo "Also add (from Supabase Dashboard → Settings → API):"
echo "  NEXT_PUBLIC_SUPABASE_URL  = https://[project-ref].supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon-key]"
