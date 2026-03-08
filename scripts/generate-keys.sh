#!/bin/bash
# Generate Supabase JWT keys for self-hosted deployment
# Requires: node (for JWT generation)

set -e

# Generate a random JWT secret (64 hex chars = 32 bytes)
JWT_SECRET=$(openssl rand -hex 32)

echo "Generating Supabase keys..."
echo ""

# Generate ANON_KEY (JWT with role: anon)
ANON_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
})).toString('base64url');
const signature = crypto.createHmac('sha256', '${JWT_SECRET}').update(header + '.' + payload).digest('base64url');
console.log(header + '.' + payload + '.' + signature);
")

# Generate SERVICE_ROLE_KEY (JWT with role: service_role)
SERVICE_ROLE_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
})).toString('base64url');
const signature = crypto.createHmac('sha256', '${JWT_SECRET}').update(header + '.' + payload).digest('base64url');
console.log(header + '.' + payload + '.' + signature);
")

# Generate a random Postgres password
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

echo "# ---- Generated Supabase Keys ----"
echo "JWT_SECRET=${JWT_SECRET}"
echo "ANON_KEY=${ANON_KEY}"
echo "SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo ""
echo "Add these to your .env file."
