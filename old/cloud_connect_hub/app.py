import os
import requests
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify

# Configuration: Cloud-Connect Standards
# Target: Questions 6, 9, 13, 14, 17

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [HUB-NODE] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Base Flask App
app = Flask(__name__, template_folder='.')

# Storage Directories
UPLOAD_DIR = 'uploads'
RECEIVED_DIR = 'received'
SYSTEM_LOG = 'system_connectivity.log'

for d in [UPLOAD_DIR, RECEIVED_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

def log_event(message):
    """Custom event logger for the real-time distributed log monitor (Q13)."""
    with open(SYSTEM_LOG, 'a') as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")
    logger.info(message)

@app.route('/')
def dashboard():
    """Serve the Professional White/Cream Dashboard UI."""
    return render_template('index.html')

@app.route('/api/status', methods=['POST'])
def check_peer_status():
    """Verify if the target peer instance is reachable on the local network."""
    target_ip = request.json.get('ip')
    target_port = request.json.get('port')
    try:
        # Simple health check endpoint on the target hub
        res = requests.get(f"http://{target_ip}:{target_port}/api/health", timeout=2)
        if res.status_code == 200:
            return jsonify({"status": "online"})
    except Exception:
        return jsonify({"status": "offline"})
    return jsonify({"status": "offline"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/transfer', methods=['POST'])
def transfer_to_peer():
    """Manual Secure Internal Transfer (Q17, Q9). Pusher role."""
    target_ip = request.form.get('target_ip')
    target_port = request.form.get('target_port')
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file selected for transfer"}), 400

    try:
        log_event(f"Initiating manual transfer to {target_ip}:{target_port} - File: {file.filename}")
        
        # Build the remote push request
        files = {'file': (file.filename, file.read(), file.content_type)}
        response = requests.post(
            f"http://{target_ip}:{target_port}/api/receive",
            files=files,
            timeout=10
        )

        if response.status_code == 200:
            log_event(f"Successful synchronization with peer: {file.filename}")
            return jsonify({"status": "Success", "details": "Object synchronized with remote instance"})
        else:
            log_event(f"Peer rejected transaction: Response code {response.status_code}")
            return jsonify({"error": "Remote peer rejected synchronization"}), 500

    except Exception as e:
        log_event(f"Critical synchronization failure: {str(e)}")
        return jsonify({"error": f"Connection lost during sync: {str(e)}"}), 500

@app.route('/api/receive', methods=['POST'])
def receive_from_peer():
    """Secure Receipt of objects from internal instances (Q6). Receiver role."""
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "Empty payload received"}), 400

    save_path = os.path.join(RECEIVED_DIR, file.filename)
    file.save(save_path)

    # Question 6: Secure Permission Logic
    # Apply chmod 600 (Owner Read/Write only)
    try:
        os.chmod(save_path, 0o600)
        log_event(f"Received secure object from peer: {file.filename} (Access restricted: 600)")
        return jsonify({"status": "Handshake Complete", "file": file.filename})
    except Exception as e:
        log_event(f"Permission enforcement failed: {str(e)}")
        return jsonify({"status": "Warning", "details": "File saved but permissions not restricted"}), 200

@app.route('/api/logs')
def get_system_logs():
    """Return the recent activity for the Remote Log Monitoring Dashboard (Q13, Q9)."""
    if not os.path.exists(SYSTEM_LOG):
        return jsonify({"logs": []})
    
    with open(SYSTEM_LOG, 'r') as f:
        # Read last 30 log lines
        lines = f.readlines()[-30:]
        return jsonify({"logs": [line.strip() for line in reversed(lines)]})

if __name__ == '__main__':
    log_event("Cloud-Connect Hub Node Initializing.")
    # Running on 0.0.0.0 ensures it accepts requests from within the Azure VPC
    app.run(host='0.0.0.0', port=8000, debug=False)
