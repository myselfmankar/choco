# 🚀 AURA Cloud Storage: Deployment Guide

Follow these steps to deploy your modernized MERN stack on a Cloud VM (Azure, AWS, GCP).

## 1. Instance Setup
- **OS**: Ubuntu 22.04 LTS (Jammy)
- **Networking**: Open Ports **80** (HTTP) and **22** (SSH). 
- **Connect**: `ssh -i your-key.pem ubuntu@your-vm-ip`

## 2. One-Command Provisioning
Run the setup script. It handles Node.js, MongoDB, Nginx, PM2, and your build automatedly.

```bash
git clone <your-repo-url>
cd pcs_mern_app
sudo bash setup.sh
```

## 3. Simplified Management (Single Terminal)
You **do not** need multiple terminals. PM2 handles everything in the background.

- **Check Status**: `pm2 status`
- **View Live Logs**: `pm2 logs aura-api`
- **Restart Application**: `pm2 restart aura-api`
- **Stop Application**: `pm2 stop aura-api`

## 4. Database Administration (MongoDB)
To verify your data without a separate terminal, enter the Mongo Shell:
```bash
mongosh aura_db
```

### Useful Queries for Verification:
| Goal | Query |
| :--- | :--- |
| **List all files** | `db.files.find().pretty()` |
| **Count total files** | `db.files.countDocuments()` |
| **Find by name** | `db.files.find({ originalName: /resume/i })` |
| **Show storage used** | `db.files.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }])` |
| **Delete all data** | `db.files.deleteMany({})` |

## 5. Reverse Proxy Status
Nginx is already configured to serve your frontend. If you need to check its status:
- `sudo systemctl status nginx`
- `sudo tail -f /var/log/nginx/error.log`

---
**AURA Cloud** is optimized for low-latency, high-concurrency file management.
