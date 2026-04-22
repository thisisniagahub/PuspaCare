#!/bin/bash
# =============================================================
# PUSPA NGO — Production Build Preparation
# =============================================================
# This script prepares the Prisma schema for Supabase PostgreSQL
# before building for Vercel deployment.
#
# USAGE (run before Vercel deploy):
#   chmod +x scripts/prepare-production.sh
#   ./scripts/prepare-production.sh
#
# The script will:
#   1. Check if Supabase environment variables are set
#   2. Copy the schema with PostgreSQL provider
#   3. Run Prisma generate
#   4. Run Next.js build
# =============================================================

set -e

echo "🔧 PUSPA NGO — Production Build Preparation"
echo "============================================"
echo ""

# Check if we're in production mode (Supabase)
if [ -n "$DIRECT_URL" ] && [[ "$DIRECT_URL" == postgresql* ]]; then
  echo "✅ Supabase environment detected"
  
  # Update schema to use PostgreSQL
  echo "📝 Switching to PostgreSQL provider..."
  sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
  sed -i 's|// directUrl = env("DIRECT_URL")|directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  
  echo "📊 Running Prisma generate..."
  npx prisma generate
  
  echo "🏗️ Building Next.js..."
  npx next build
  
  # Restore SQLite schema for local dev
  echo "📝 Restoring SQLite schema for local development..."
  sed -i 's/provider  = "postgresql"/provider  = "sqlite"/' prisma/schema.prisma
  sed -i 's|directUrl = env("DIRECT_URL")|// directUrl = env("DIRECT_URL")|' prisma/schema.prisma
  npx prisma generate
  
  echo ""
  echo "🎉 Build complete! Production artifacts ready."
else
  echo "⚠️  No Supabase environment detected. Running local build..."
  echo "   (Set DATABASE_URL and DIRECT_URL for Supabase production)"
  echo ""
  
  npx prisma generate
  npx next build
  
  echo ""
  echo "✅ Local build complete."
fi
