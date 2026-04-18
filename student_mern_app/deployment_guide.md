# MERN Student App - VM Deployment Guide

This guide details exactly how to deploy your "Proper MERN" Student Record System on a fresh Cloud Virtual Machine.

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

---

### Step 2: Transfer your Application Files to the VM
You need to transfer the `student_mern_app` folder to the remote VM. 

Open a NEW terminal window on your local machine and run:
```bash
scp -i /path/to/your-key.pem -r "d:\insem\LP2\student_mern_app" ubuntu@<YOUR_VM_PUBLIC_IP>:~/
```
*(Once transferred, go back to your SSH terminal).*

---

## Deployment Option A: Using the Automated `setup.sh` (The Easy Way)

Once inside the VM, navigate into your project folder and run the script:

```bash
cd ~/student_mern_app
chmod +x setup.sh
./setup.sh
```

**What this automated script does:**
1. Installs Node.js, MongoDB, PM2, and Nginx.
2. Configures Nginx to serve your React Frontend on port 80 and proxy `/api/*` to your Express Backend (**Port 5001**).
3. Installs `npm` dependencies for both folders and builds the React app for production.

**Post-Setup Step:**
After the script completes, you just need to start the backend running in the background:
```bash
cd ~/student_mern_app/backend
pm2 start server.js --name "student-api"
pm2 save
```
**Done!** Browse to `http://<YOUR_VM_PUBLIC_IP>` to see the app.

---

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
cd ~/student_mern_app

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
Use PM2 to start the background Express process on port 5001:
```bash
cd ~/student_mern_app/backend
pm2 start server.js --name "student-api"
```

### 5. Configure Nginx Reverse Proxy
Replace the default Ubuntu Nginx page with your application.

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/mern_student
```

Paste the following configuration into the NGINX editor. **Make sure to replace `/home/ubuntu/student_mern_app` with your actual absolute path!**

```nginx
server {
    listen 80;
    server_name _;
    
    # Serve the optimized React build
    root /home/ubuntu/student_mern_app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy the API requests entirely to Node (Port 5001)
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save (Ctrl+O, Enter) and Exit (Ctrl+X). Then activate the config:
```bash
sudo ln -s /etc/nginx/sites-available/mern_student /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**Done!** Browse to `http://<YOUR_VM_PUBLIC_IP>` to see the app.
