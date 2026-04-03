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

# ─── pm2 ─────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  info "Installing pm2 (process manager)…"
  npm install -g pm2
fi
success "pm2 ready"

# ─── Nginx ───────────────────────────────────────────────────────────────────
NGINX_CONF="/etc/nginx/sites-available/nexus_cloud"
info "Configuring Nginx reverse proxy…"
cat > "$NGINX_CONF" <<'EOF'
server {
    listen 80;
    server_name _;

    # Allow uploads up to 55 MB (server enforces 50 MB)
    client_max_body_size 55M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
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

# ─── Start app with pm2 ──────────────────────────────────────────────────────
info "Starting app with pm2…"
pm2 stop nexus-cloud 2>/dev/null || true
pm2 start server.js --name nexus-cloud
pm2 save
pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER" 2>/dev/null || true
success "App running via pm2 (auto-restarts on crash/reboot)"

# ─── Summary ─────────────────────────────────────────────────────────────────
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}  ✔ Setup complete!${NC}"
echo ""
echo "  App URL  →  http://${SERVER_IP}"
echo "  Logs     →  pm2 logs nexus-cloud"
echo "  Restart  →  pm2 restart nexus-cloud"
echo "  Status   →  pm2 status"
echo ""