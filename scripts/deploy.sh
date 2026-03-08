#!/bin/bash
# Home Maintenance Platform - Vultr VPS Deployment Script
# Run this on your Vultr VPS (Ubuntu 22.04+ recommended)
#
# Usage:
#   1. SSH into your Vultr VPS
#   2. Clone the repo: git clone <your-repo-url> /opt/home-maintenance
#   3. cd /opt/home-maintenance
#   4. chmod +x scripts/deploy.sh
#   5. sudo ./scripts/deploy.sh

set -e

# Auto-detect project directory (where this script lives)
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${DOMAIN:-}"

echo "============================================"
echo "  Home Maintenance Platform - Deployment"
echo "============================================"

# ---- 1. Install Docker if not present ----
if ! command -v docker &> /dev/null; then
  echo "[1/6] Installing Docker..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "  Docker installed."
else
  echo "[1/6] Docker already installed."
fi

# ---- 2. Install Node.js if not present (needed for key generation) ----
if ! command -v node &> /dev/null; then
  echo "[2/6] Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo "  Node.js installed."
else
  echo "[2/6] Node.js already installed."
fi

# ---- 3. Generate .env if it doesn't exist ----
if [ ! -f "$APP_DIR/.env" ]; then
  echo "[3/6] Generating .env file with Supabase keys..."
  cd "$APP_DIR"

  # Generate keys
  JWT_SECRET=$(openssl rand -hex 32)
  POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

  ANON_KEY=$(node -e "
const crypto = require('crypto');
const h = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
const p = Buffer.from(JSON.stringify({role:'anon',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000})).toString('base64url');
const s = crypto.createHmac('sha256','${JWT_SECRET}').update(h+'.'+p).digest('base64url');
console.log(h+'.'+p+'.'+s);
")

  SERVICE_ROLE_KEY=$(node -e "
const crypto = require('crypto');
const h = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
const p = Buffer.from(JSON.stringify({role:'service_role',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000})).toString('base64url');
const s = crypto.createHmac('sha256','${JWT_SECRET}').update(h+'.'+p).digest('base64url');
console.log(h+'.'+p+'.'+s);
")

  # Detect public IP
  PUBLIC_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")

  cat > "$APP_DIR/.env" <<ENVEOF
# ---- Supabase Core (auto-generated) ----
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
ANON_KEY=${ANON_KEY}
SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
POSTGRES_DB=postgres

# ---- Application URLs ----
APP_URL=http://${PUBLIC_IP}
PUBLIC_SUPABASE_URL=http://${PUBLIC_IP}:8000
PUBLIC_API_URL=http://${PUBLIC_IP}:3001

# ---- Frontend (Vite build args) ----
VITE_SUPABASE_URL=http://${PUBLIC_IP}:8000
VITE_SUPABASE_ANON_KEY=${ANON_KEY}
VITE_API_URL=http://${PUBLIC_IP}:3001

# ---- Anthropic (Claude AI) ----
ANTHROPIC_API_KEY=

# ---- SMTP (Email - configure for OTP and notifications) ----
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Home Maintenance <noreply@yourdomain.com>

# ---- OAuth (optional for UAT) ----
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
ENVEOF

  echo "  .env generated. Public IP: ${PUBLIC_IP}"
  echo "  IMPORTANT: Edit .env to add your ANTHROPIC_API_KEY and SMTP settings."
else
  echo "[3/6] .env already exists, skipping."
fi

# ---- 4. Set permissions ----
echo "[4/6] Setting file permissions..."
chmod +x "$APP_DIR/supabase/docker/init-migrations.sh"

# ---- 5. Open firewall ports ----
echo "[5/6] Configuring firewall..."
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp   # SSH
  ufw allow 80/tcp   # Frontend
  ufw allow 443/tcp  # Frontend HTTPS (future)
  ufw allow 8000/tcp # Supabase API (Kong)
  ufw allow 3000/tcp # Supabase Studio
  ufw allow 3001/tcp # Custom API
  ufw --force enable
  echo "  Firewall configured."
else
  echo "  ufw not found, skipping firewall config. Make sure ports 80, 3000, 3001, 8000 are open."
fi

# ---- 6. Build and start ----
echo "[6/6] Building and starting services..."
cd "$APP_DIR"
docker compose build
docker compose up -d

echo ""
echo "============================================"
echo "  Deployment complete!"
echo "============================================"
echo ""
echo "  Frontend:        http://${PUBLIC_IP:-YOUR_IP}"
echo "  Supabase API:    http://${PUBLIC_IP:-YOUR_IP}:8000"
echo "  Supabase Studio: http://${PUBLIC_IP:-YOUR_IP}:3000"
echo "  Custom API:      http://${PUBLIC_IP:-YOUR_IP}:3001"
echo ""
echo "  Next steps:"
echo "  1. Edit .env and add ANTHROPIC_API_KEY, SMTP, OAuth credentials"
echo "  2. Restart after .env changes: docker compose down && docker compose up -d"
echo "  3. Check logs: docker compose logs -f"
echo ""
