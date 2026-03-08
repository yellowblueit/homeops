#!/bin/bash
set -e

echo "Running application migrations..."

MIGRATION_DIR="/app/migrations"

if [ -d "$MIGRATION_DIR" ]; then
  for f in "$MIGRATION_DIR"/*.sql; do
    if [ -f "$f" ]; then
      echo "Applying migration: $(basename "$f")"
      psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-supabase_admin}" --dbname "${POSTGRES_DB:-postgres}" -f "$f"
    fi
  done
  echo "All migrations applied successfully."
else
  echo "No migration directory found at $MIGRATION_DIR"
fi
