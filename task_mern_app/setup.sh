#!/bin/bash

# Setup script for VM
echo "Installing dependencies..."

# 1. Wait for APT
while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 2; done

# 2. Base packages
sudo apt-get update -y
sudo apt-get install -y curl gnupg nginx build-essential

# 3. Node.js
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

# 5. Nginx Config
NGINX_CONF="/etc/nginx/sites-available/mern"
sudo rm -f /etc/nginx/sites-enabled/*
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 6. Build
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend

echo "Setup done. To run the app:"
echo "cd backend && npm start"
