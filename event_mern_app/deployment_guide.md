# MERN Event Registration - VM Deployment Guide

This guide details how to deploy the **Paintball Ops Registration System** on a Cloud VM (AWS/GC/Azure).

---

## Prerequisites
1. Ubuntu 22.04 VM.
2. Security Group allows Port 80 and Port 22.

### Step 1: Transfer Application
Run from your local machine:
```bash
scp -i your-key.pem -r "d:\insem\LP2\event_mern_app" ubuntu@<VM_IP>:~/
```

### Step 2: Automated Deployment (Recommended)
Connect to VM and run:
```bash
cd ~/event_mern_app
chmod +x setup.sh
./setup.sh
```

**Final Activation:**
```bash
cd ~/event_mern_app/backend
pm2 start server.js --name "event-api"
pm2 save
```

---

## Step 3: Manual Deployment (If needed)

### 1. Environment Setup
```bash
sudo apt update && sudo apt install -y curl nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs mongodb-org
```

### 2. Build Frontend
```bash
cd ~/event_mern_app/frontend
npm install
npm run build
```

### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/mern_event
```
Paste configuration:
```nginx
server {
    listen 80;
    server_name _;
    root /home/ubuntu/event_mern_app/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ {
        proxy_pass http://127.0.0.1:5004;
    }
}
```
`sudo ln -s /etc/nginx/sites-available/mern_event /etc/nginx/sites-enabled/`  
`sudo systemctl restart nginx`

---

## Step 4: Verification
Visit `http://<YOUR_VM_PUBLIC_IP>` in your browser.
Test the form and ensure your name appears in the **Deployment Roster** at the bottom.
