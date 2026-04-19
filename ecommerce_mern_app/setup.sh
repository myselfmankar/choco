#!/bin/bash

# --- Ecommerce Store: Simple Unity VM Provisioning ---

echo "Starting Ecommerce App Unity Setup for VM..."

# 1. Wait for background APT tasks
wait_for_apt() {
    while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
        echo "Waiting for VM software updates to finish..."
        sleep 2
    done
}
wait_for_apt

# 2. Dependencies
sudo apt-get update -y
sudo apt-get install -y curl gnupg nginx build-essential

# 3. Node.js (v20)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. MongoDB
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update -y
    sudo apt-get install -y mongodb-org
    sudo systemctl enable --now mongod
fi

# 5. PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 6. Automated Nginx Configuration (Simple Old-Style Proxy)
echo "Configuring Nginx Reverse Proxy..."
NGINX_CONF="/etc/nginx/sites-available/mern_ecomm"
sudo rm -f /etc/nginx/sites-enabled/*

sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 7. Project Build & Start
PROJECT_DIR=$(pwd)
echo "Installing & Building..."

cd $PROJECT_DIR/backend && npm install
cd $PROJECT_DIR/frontend && npm install && npm run build

# Register with PM2 (Unity Mode: Backend serves UI)
pm2 delete ecomm-api 2>/dev/null
cd $PROJECT_DIR/backend
pm2 start server.js --name "ecomm-api"
pm2 save

echo "----------------------------------------------------"
echo "✅ SETUP COMPLETE! ECOMMERCE STORE IS LIVE."
echo "----------------------------------------------------"
echo "🌎 IP Address: Access your VM's public IP"
echo "⚙️  Architecture: Unity (Backend serves UI)"
echo "----------------------------------------------------"
