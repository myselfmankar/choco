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

# 5. Automated Nginx Configuration (Simple Old-Style Proxy)
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

# 6. Project Build
PROJECT_DIR=$(pwd)
echo "Installing & Building..."

cd $PROJECT_DIR/backend && npm install
cd $PROJECT_DIR/frontend && npm install && npm run build

# Make run.sh executable
chmod +x $PROJECT_DIR/run.sh

echo "----------------------------------------------------"
echo "✅ SETUP COMPLETE! ECOMMERCE STORE IS READY."
echo "----------------------------------------------------"
echo "👉 Run './run.sh' to start the application."
echo "----------------------------------------------------"
