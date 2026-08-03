#!/bin/bash
set -e

echo "🎵 Orchestra AI - Setup Script"
echo "================================"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

# Run migrations
echo "📋 Running database migrations..."
npx prisma migrate dev --schema=prisma/schema.prisma

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed

echo ""
echo "✅ Setup complete!"
echo "Run 'pnpm dev' to start the development server."
