#!/bin/bash

# --- Proper MERN Assignment: VM Provisioning Script (Student System) ---

echo "Starting Full MERN Stack Setup for VM..."

# 1. Wait for background APT tasks
wait_for_apt() {
    while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
        echo "Waiting for VM automated software updates to finish..."
        sleep 2
    done
}
wait_for_apt

# 2. System Update & Dependencies
echo " Updating system..."
sudo apt-get update -y
sudo apt-get install -y curl gnupg nginx build-essential

# 3. Node.js (v20)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. MongoDB Official Repository
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update -y
    sudo apt-get install -y mongodb-org
fi

# 5. Global Process Manager (PM2)
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -g pm2
fi

# 6. Automated Nginx Configuration for MERN
echo "Configuring Nginx Reverse Proxy..."
PROJECT_DIR=$(pwd)
NGINX_CONF="/etc/nginx/sites-available/mern_student"

# Delete existing default configs to prevent port 80 conflicts
sudo rm -f /etc/nginx/sites-enabled/*

sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;
    
    # 1. Serve built React frontend directly from disk
    root $PROJECT_DIR/frontend/dist;
    index index.html;
    
    # Allow client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 2. Proxy API requests to Node backend (Port 5001)
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 7. Start System Services
echo " Restarting System Services..."
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl enable mongod
sudo systemctl restart mongod

# 8. Project Dependency Installation & Build
echo " Installing backend dependencies..."
cd $PROJECT_DIR/backend
npm install

echo " Installing frontend dependencies & building..."
cd $PROJECT_DIR/frontend
npm install
npm run build

echo "Setup Complete! Your VM is ready."
echo ""
echo "Deployment Instructions:"
echo "1. Go to the backend folder: cd $PROJECT_DIR/backend"
echo "2. Start it using PM2: pm2 start server.js --name 'student-api'"
echo "3. Your app is now live on the VM's Public IP address!"
