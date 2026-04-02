import subprocess
import os
import sys

def run_it(cmd):
    # Silent execution for a cleaner terminal
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def setup_rms():
    # 1. System Dependencies (Silent)
    run_it("sudo apt update")
    run_it("sudo apt install -y python3-pip nginx mongodb")

    # 2. Python Packages
    run_it("pip3 install flask pymongo")

    # 3. Automated Nginx Reverse Proxy Config
    nginx_conf = """server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}"""
    
    # Write config to sites-available
    with open("student_nginx.conf", "w") as f:
        f.write(nginx_conf)
    
    run_it("sudo mv student_nginx.conf /etc/nginx/sites-available/student_rms")
    run_it("sudo ln -sf /etc/nginx/sites-available/student_rms /etc/nginx/sites-enabled/")
    run_it("sudo rm -f /etc/nginx/sites-enabled/default")
    
    # Reload and Enable Services
    run_it("sudo systemctl restart nginx")
    run_it("sudo systemctl start mongodb")
    run_it("sudo systemctl enable mongodb")

    print("\n Setup Complete! All dependencies and Nginx are ready.")
    print(" To start the student server, run the following command:")
    print("     python3 app.py")

if __name__ == "__main__":
    setup_rms()
