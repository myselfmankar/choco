# AURA Cloud Storage - VM Deployment Guide

Deploy your personal "Proper MERN" cloud storage system using this guide.

---

## Prerequisites
1. Ubuntu 22.04 VM.
2. Security Group allows Port 80 and Port 22.
3. Node, MongoDB, and Nginx will be handled by the script.

### Step 1: Transfer Files
```bash
scp -i your-key.pem -r "d:\insem\LP2\pcs_mern_app" ubuntu@<VM_IP>:~/
```

### Step 2: Automated Deployment
```bash
cd ~/pcs_mern_app
chmod +x setup.sh
./setup.sh
```

### Step 3: Launch Process
```bash
cd ~/pcs_mern_app/backend
pm2 start server.js --name "aura-api"
pm2 save
```

### Step 4: Access
Open `http://<YOUR_VM_PUBLIC_IP>` in your browser. 
The AURA dashboard will appear, allowing you to upload and manage files in the cloud.

---

## Troubleshooting
- **File Upload Limit**: Nginx and Backend are configured for up to **500MB** single file uploads. If you need more, adjust `client_max_body_size` in the Nginx config.
- **Port Conflicts**: This app uses **Port 5005** for the API. Ensure no other service is occupying this port on the VM.
