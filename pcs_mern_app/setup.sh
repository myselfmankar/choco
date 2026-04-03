#!/bin/bash
set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR]${NC}   $*"; exit 1; }

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║   NEXUS Cloud — Setup Script         ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ─── Root check ──────────────────────────────────────────────────────────────
[[ "$EUID" -ne 0 ]] && error "Please run as root: sudo bash setup.sh"

# ─── Node version check ──────────────────────────────────────────────────────
info "Checking Node.js version…"
if command -v node &>/dev/null; then
  NODE_VER=$(node -e "process.exit(parseInt(process.version.slice(1)))" 2>/dev/null; echo $?)
  # Use a version string approach instead
  NODE_MAJOR=$(node -e "console.log(parseInt(process.version.split('.')[0].replace('v','')))")
  if [[ "$NODE_MAJOR" -lt 18 ]]; then
    warn "Node.js $NODE_MAJOR found — v18+ required. Installing via NodeSource…"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  else
    success "Node.js v$NODE_MAJOR detected"
  fi
else
  info "Node.js not found. Installing v20 LTS…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# ─── Wait for apt lock ───────────────────────────────────────────────────────
wait_for_apt() {
  while fuser /var/lib/dpkg/lock-frontend &>/dev/null 2>&1; do
    warn "Waiting for apt lock to release…"
    sleep 3
  done
}

wait_for_apt
info "Updating system packages…"
apt-get update -y -qq
apt-get install -y -qq gnupg curl apt-transport-https ca-certificates \
  software-properties-common nginx

# ─── MongoDB ─────────────────────────────────────────────────────────────────
if ! command -v mongod &>/dev/null; then
  info "Installing MongoDB 7.0…"
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y -qq
  apt-get install -y -qq mongodb-org
  success "MongoDB installed"
else
  success "MongoDB already installed"
fi

# ─── package.json check ──────────────────────────────────────────────────────
if [[ ! -f package.json ]]; then
  warn "No package.json found — initialising…"
  npm init -y
fi

# ─── npm dependencies ────────────────────────────────────────────────────────
info "Installing npm dependencies…"
npm install express mongoose multer cors 2>&1 | tail -3
success "npm dependencies installed"

# ─── Nginx ───────────────────────────────────────────────────────────────────
NGINX_CONF="/etc/nginx/sites-available/nexus_cloud"
info "Configuring Nginx reverse proxy…"
cat > "$NGINX_CONF" <<'EOF'
server {
    listen 80;
    server_name _;
    
    # Allow uploads up to 505 MB (matching your 500MB server cap)
    client_max_body_size 505M;
    
    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 120s;
    }
}
EOF

# Clean up ALL existing sites to avoid Port 80 conflicts with your other 4 assignments
rm -f /etc/nginx/sites-enabled/*
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && success "Nginx config valid" || error "Nginx config invalid — check logs"

# ─── Start services ──────────────────────────────────────────────────────────
info "Starting MongoDB…"
systemctl daemon-reload
systemctl enable mongod
# Only start if not already running
systemctl is-active --quiet mongod || systemctl start mongod
success "MongoDB running"

info "Starting Nginx…"
systemctl enable nginx
systemctl restart nginx
success "Nginx running"

# ─── Summary ─────────────────────────────────────────────────────────────────
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}  ✔ Setup complete!${NC}"
echo ""
echo "  App URL  →  http://${SERVER_IP}"
echo ""
echo "  To start the server, run: "
echo "  node server.js"
echo ""