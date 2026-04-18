# MERN Task App - VM Deployment Guide

This guide details exactly how to deploy your "Proper MERN" Task Management Application on a fresh Cloud Virtual Machine.

---

## Prerequisites
1. A Linux Virtual Machine (Ubuntu 22.04 / 24.04 recommended).
2. Security Group allows Port 80 (HTTP) and Port 22 (SSH).
3. SSH Key file (`.pem`).

### Step 1: Transfer Application Files to the VM
Open a terminal window on your local machine and run:
```bash
scp -i /path/to/your-key.key -r "d:\insem\LP2\task_mern_app" ubuntu@<YOUR_VM_PUBLIC_IP>:~/
```

### Step 2: Connect to VM via SSH
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_VM_PUBLIC_IP>
```

---

## Deployment Option A: Using the Automated `setup.sh` 

Navigate into the transferred folder and run the script:
```bash
cd ~/task_mern_app
chmod +x setup.sh
./setup.sh
```

**Post-Setup Step:**
Once the script configures Nginx, MongoDB, and builds the React app, you just need to start the backend running in the background:
```bash
cd ~/task_mern_app/backend
pm2 start server.js --name "task-api"
pm2 save
```
Browse to `http://<YOUR_VM_PUBLIC_IP>` to see the app!

---

## Deployment Option B: Manual Execution 

### 1. System Update & Dependencies
```bash
sudo apt update
sudo apt install -y curl nginx
```

### 2. Install Node.js & MongoDB
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

### 3. Install & Build Application
```bash
cd ~/task_mern_app

cd backend
npm install
sudo npm install -g pm2

cd ../frontend
npm install
npm run build
```

### 4. Start Backend API
```bash
cd ~/task_mern_app/backend
pm2 start server.js --name "task-api"
```

### 5. Configure Nginx Reverse Proxy
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/mern_task
```
Paste the following, modifying `/home/ubuntu/task_mern_app` if your path is different:
```nginx
server {
    listen 80;
    server_name _;
    
    root /home/ubuntu/task_mern_app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Activate it:
```bash
sudo ln -s /etc/nginx/sites-available/mern_task /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```
Finished! Browsing to `http://<YOUR_VM_PUBLIC_IP>` will show your React Task Tracker synced with MongoDB.
