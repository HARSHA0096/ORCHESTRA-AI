#!/bin/bash
set -e
echo "🌱 Seeding database..."
pnpm db:seed
echo "✅ Seeding complete!"
