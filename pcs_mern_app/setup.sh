#!/bin/bash

# --- AURA Cloud Storage: VM Provisioning Script ---

echo "Starting AURA MERN Stack Setup for VM..."

# 1. Wait for background APT tasks
wait_for_apt() {
    while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
        echo "Waiting for VM automated software updates to finish..."
        sleep 2
    done
}
wait_for_apt

# 2. System Update & Dependencies
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

# 5. Global Process Manager (PM2)
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 6. Automated Nginx Configuration for AURA
echo "Configuring Nginx Reverse Proxy..."
PROJECT_DIR=$(pwd)
NGINX_CONF="/etc/nginx/sites-available/mern_aura"

sudo rm -f /etc/nginx/sites-enabled/*

sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;
    
    # Serve built React frontend directly
    root $PROJECT_DIR/frontend/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to Node backend (Port 5005)
    location /api/ {
        proxy_pass http://127.0.0.1:5005;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Adjust for large file uploads
        client_max_body_size 500M;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 7. Start System Services
sudo systemctl restart nginx
sudo systemctl restart mongod

# 8. Project Dependency Installation & Build
echo "Installing backend dependencies..."
cd $PROJECT_DIR/backend
npm install

echo "Installing frontend dependencies & building..."
cd $PROJECT_DIR/frontend
npm install
npm run build

# 9. Start AURA suite
echo "Starting AURA Core Services..."
cd $PROJECT_DIR
npm install concurrently
pm2 start backend/server.js --name "aura-api"

# 10. Save PM2 list so it persists on reboot
pm2 save

echo "----------------------------------------------------"
echo "✅ SETUP COMPLETE! AURA CLOUD IS LIVE."
echo "----------------------------------------------------"
echo "🌎 Frontend: Serve by Nginx on Port 80"
echo "⚙️  Backend: Managed by PM2 (aura-api)"
echo ""
echo "Manage your stack with these commands:"
echo " - View status: pm2 status"
echo " - View logs:   pm2 logs aura-api"
echo " - Restart all: pm2 restart all"
echo " - DB Access:   mongosh aura_db"
echo "----------------------------------------------------"