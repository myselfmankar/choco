#!/bin/bash

# Configuration: Cloud Monitoring Deployment
# Purpose: Question 19 - Resource Monitoring Visualization

echo "[SYSTEM] Initializing Cloud Monitor Deployment Sequence..."

# 1. Update and Install System Dependencies
echo "[SYSTEM] Updating system package index..."
sudo apt-get update -y > /dev/null

echo "[SYSTEM] Installing Nginx and Python3-Pip..."
sudo apt-get install -y nginx python3-pip > /dev/null

# 2. Install Python Packages
echo "[PYTHON] Installing Flask and Psutil libraries..."
pip3 install flask psutil --break-system-packages > /dev/null 2>&1

# 3. Configure Nginx Reverse Proxy
echo "[NGINX] Purging existing site configurations to prevent port 80 conflicts..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/cloud_monitor

echo "[NGINX] Creating reverse proxy configuration for Port 80 -> Port 8000..."
sudo tee /etc/nginx/sites-available/cloud_monitor <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

echo "[NGINX] Activating configuration..."
sudo ln -s /etc/nginx/sites-available/cloud_monitor /etc/nginx/sites-enabled/

# 4. Finalize Deployment
echo "[NGINX] Testing configuration syntax..."
sudo nginx -t

echo "[NGINX] Restarting service..."
sudo systemctl restart nginx

echo "[SYSTEM] Deployment Sequence Complete."
echo "[INFO] Application is accessible on Public IP (Port 80)."
echo "[INFO] Execution command: python3 app.py"
