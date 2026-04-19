# MERN Blog Application - VM Deployment Guide

This guide details exactly how to deploy your "Proper MERN" Blog Application on a fresh Cloud Virtual Machine (such as AWS EC2, GCP, or Azure). 

---

## Prerequisites
1. You have launched a Virtual Machine (Ubuntu 22.04 / 24.04 recommended).
2. You have configured the **Security Group / Firewall** to allow Traffic on **Port 80 (HTTP)** and **Port 22 (SSH)**.
3. You have your SSH Key file (`.pem`).

### Step 1: Connect to your VM via SSH

Open your local terminal and run:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_VM_PUBLIC_IP>
```
*(Replace `ubuntu` with `root`, `ec2-user`, or your specific cloud provider's default username).*

---

### Step 2: Transfer your Application Files to the VM
You need to transfer the `blog_mern_app` folder to the remote VM. 

Open a NEW terminal window on your local machine and run:
```bash
scp -i /path/to/your-key.pem -r "d:\insem\LP2\blog_mern_app" ubuntu@<YOUR_VM_PUBLIC_IP>:~/
```
*(Once transferred, go back to your SSH terminal).*

---

## ✅ One-Terminal Deployment (Automated)

Run the setup script. It handles Node.js, MongoDB, Nginx, PM2, and your build automatedly.

```bash
cd folder_name
sudo bash setup.sh
```

**Your app is now live!** The script automatically registers the backend with PM2 and serves the frontend on Port 80.

## 📊 Management Commands
Use these from a single terminal:
- `pm2 status`: Check if services are running.
- `pm2 logs`: View real-time activity.
- `mongosh <db_name>`: Access the database.

## 🔎 Useful MongoDB Queries
- List all entries: `db.collection.find().pretty()`
- Count entries: `db.collection.countDocuments()`
- Delete all data: `db.collection.deleteMany({})`

## Deployment Option B: Manual Execution (Without `setup.sh`)

If the faculty wants to see raw terminal commands without automation, run these step-by-step:

### 1. System Update & Dependencies
```bash
sudo apt update
sudo apt install -y curl nginx
```

### 2. Install Node.js & MongoDB
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --batch --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

### 3. Install & Build Application
```bash
cd ~/blog_mern_app

# Backend
cd backend
npm install
sudo npm install -g pm2

# Frontend
cd ../frontend
npm install
npm run build
```

### 4. Start the Backend API
Use PM2 to start the background Express process so it survives SSH disconnects:
```bash
cd ~/blog_mern_app/backend
pm2 start server.js --name "blog-api"
```

### 5. Configure Nginx Reverse Proxy
By default, Nginx displays an Ubuntu welcome page. Replace it with your application.

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/mern_blog
```

Paste the following configuration into the NGINX editor. **Make sure to replace `/home/ubuntu/blog_mern_app` with your actual absolute path!**

```nginx
server {
    listen 80;
    server_name _;
    
    # Serve the optimized React build
    root /home/ubuntu/blog_mern_app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy the API requests entirely to Node
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save (Ctrl+O, Enter) and Exit (Ctrl+X). Then activate the config:
```bash
sudo ln -s /etc/nginx/sites-available/mern_blog /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**Done!** Browse to `http://<YOUR_VM_PUBLIC_IP>` to see the app.
