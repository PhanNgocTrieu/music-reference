#!/usr/bin/env bash
set -e

# ── 1. Copy env ───────────────────────────────────────────────────────────────
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✔  Created .env.local from .env.example"
else
  echo "–  .env.local already exists, skipping"
fi

# ── 2. Start Docker services ──────────────────────────────────────────────────
echo "▶  Starting Docker services..."
docker compose up -d
echo "✔  Services running"

# ── 3. Wait for Postgres to be ready ─────────────────────────────────────────
echo "⏳ Waiting for Postgres..."
until docker compose exec -T postgres pg_isready -U music -q; do
  sleep 1
done
echo "✔  Postgres ready"

# ── 4. Run migrations ─────────────────────────────────────────────────────────
echo "▶  Running migrations..."
pnpm db:migrate
echo "✔  Migrations applied"

# ── 5. Seed sample data ───────────────────────────────────────────────────────
echo "▶  Seeding database..."
pnpm db:seed

echo ""
echo "✅  Setup complete. Run 'pnpm dev' to start the dev server."
