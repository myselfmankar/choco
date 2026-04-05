import os
import psutil
import logging
from flask import Flask, jsonify, render_template, request
from multiprocessing import Process, cpu_count
# pip3 install flask psutil
# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [RESOURCE-MONITOR] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder='.')

# Global variable to track stress processes
stress_processes = []

def cpu_stresser():
    """Heavy computation to stress a single CPU core."""
    while True:
        # Perform redundant math logic
        x = 9999 * 9999
        x = x / 0.5
        pass

@app.route('/')
def index():
    """Serve the Monitoring Dashboard."""
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    """Fetch real-time system resource usage."""
    try:
        # CPU Usage (1 second interval for accuracy)
        cpu_pct = psutil.cpu_percent(interval=1)
        
        # Memory Usage
        mem = psutil.virtual_memory()
        
        # Network Usage (Bytes Sent / Received)
        net = psutil.net_io_counters()
        
        stats = {
            "cpu": cpu_pct,
            "memory": {
                "percent": mem.percent,
                "used": mem.used,
                "total": mem.total
            },
            "network": {
                "sent": net.bytes_sent,
                "recv": net.bytes_recv
            },
            "stress_active": len(stress_processes) > 0
        }
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error fetching system stats: {str(e)}")
        return jsonify({"error": "Failed to fetch stats"}), 500

@app.route('/api/stress/toggle', methods=['POST'])
def toggle_stress():
    """Start or stop the CPU stress engine on all cores."""
    global stress_processes
    
    try:
        if not stress_processes:
            # Start Stresser on all available cores
            logger.info(f"Initiating CPU stress test on {cpu_count()} cores.")
            for _ in range(cpu_count()):
                p = Process(target=cpu_stresser)
                p.daemon = True
                p.start()
                stress_processes.append(p)
            return jsonify({"status": "stresser_active", "cores": cpu_count()})
        else:
            # Stop Stresser
            logger.info("Terminating CPU stress test.")
            for p in stress_processes:
                p.terminate()
                p.join()
            stress_processes = []
            return jsonify({"status": "stresser_stopped"})
    except Exception as e:
        logger.error(f"Stress toggle failed: {str(e)}")
        return jsonify({"error": "Failed to toggle stress"}), 500

if __name__ == '__main__':
    logger.info("Initializing Cloud Monitor Server on port 8000.")
    app.run(host='0.0.0.0', port=8000, debug=False)
