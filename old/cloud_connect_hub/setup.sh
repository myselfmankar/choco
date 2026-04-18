#!/bin/bash

# Configuration: Cloud-Connect Hub Deployment
# Purpose: Multi-Instance Connectivity & File Sharing (Q6, Q9, Q13, Q14, Q17)

echo "[SYSTEM] Initializing Inter-VM Infrastructure Setup..."

# 1. System Package Update
echo "[SYSTEM] Updating system package index..."
sudo apt-get update -y > /dev/null

# 2. Dependency Installation
echo "[PYTHON] Installing Flask and Requests libraries for P2P Relay..."
pip3 install flask requests --break-system-packages > /dev/null 2>&1

# 3. Secure Directory Orchestration
echo "[STORAGE] Creating secure upload and receipt directories..."
mkdir -p uploads received

# Question 6: Proper Access Permissions
echo "[SECURITY] Enforcing strict access controls on the 'received' repository..."
# Set 700 on the directory so only the owner can traverse it
chmod 700 received
# Set 600 default for current files
chmod 600 received/* 2>/dev/null || true

# 4. Networking Check (Simulated for Mock Test)
echo "[NETWORK] Validating internal communication ports..."
# Check if UFW is active and allow 8000/8001
if command -v ufw > /dev/null; then
    echo "[FIREWALL] Authorizing ports 8000 & 8001 for Peer-to-Peer traffic..."
    sudo ufw allow 8000/tcp > /dev/null
    sudo ufw allow 8001/tcp > /dev/null
fi

echo "[SYSTEM] Cloud-Connect Hub Setup Complete."
echo "[INFO] Manual Sync Peer IP: 127.0.0.1 (use Port 8001 for Node B simulation)"
echo "[INFO] Execution command: python3 app.py"
