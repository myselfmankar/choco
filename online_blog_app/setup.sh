#!/bin/bash

# --- Assignment 7: Online Blog Zero-to-End Setup ---

echo " Starting Blog App Setup ..."

# 1. Wait for any background APT locks (common on fresh VMs)
wait_for_apt() {
    while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
        echo " Waiting for other software updates to finish..."
        sleep 2
    done
}

wait_for_apt

# 2. System Update & Dependencies
echo " Updating system and installing core tools..."
sudo apt-get update -y
sudo apt-get install -y gnupg curl apt-transport-https ca-certificates software-properties-common python3-pip nginx

# 3. MongoDB Official Repository (Robust for 22.04/24.04)
if ! command -v mongod &> /dev/null; then
    echo "🍃 Adding MongoDB repository..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update -y
    sudo apt-get install -y mongodb-org
fi

# 4. Python Packages
echo " Installing Python dependencies..."
pip3 install flask pymongo --break-system-packages 2>/dev/null || pip3 install flask pymongo

# 5. Automated Nginx Configuration
echo " Configuring Nginx Reverse Proxy..."
NGINX_CONF="/etc/nginx/sites-available/blog_app"
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 6. Service Refresh
echo " Starting services..."
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl enable mongod
sudo systemctl start mongod

echo ""
echo " Setup Complete! Everything is ready."
echo " To start the blog server, run:"
echo "   python3 app.py"
