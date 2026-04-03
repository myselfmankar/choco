#!/bin/bash

# --- Assignment 15: Task Dashboard Zero-to-End Setup ---

echo " Starting Task Dashboard Setup ..."

wait_for_apt() {
    while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
        echo " Waiting for other software updates to finish..."
        sleep 2
    done
}

wait_for_apt

echo " Updating system and installing core tools..."
sudo apt-get update -y
sudo apt-get install -y gnupg curl apt-transport-https ca-certificates software-properties-common python3-pip nginx

if ! command -v mongod &> /dev/null; then
    echo " Adding MongoDB repository..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update -y
    sudo apt-get install -y mongodb-org
fi

echo " Installing Python dependencies..."
pip3 install flask pymongo --break-system-packages 2>/dev/null || pip3 install flask pymongo

echo " Configuring Nginx Reverse Proxy..."
NGINX_CONF="/etc/nginx/sites-available/todo_app"
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Clean up ALL existing sites to avoid Port 80 conflicts
sudo rm -f /etc/nginx/sites-enabled/*
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

echo " Starting services..."
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl enable mongod
sudo systemctl start mongod

echo ""
echo " Setup Complete! Everything is ready."
echo " To start the Task server, run:"
echo "   python3 app.py"
