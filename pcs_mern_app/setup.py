import subprocess

def run_it(cmd):
    # Silent execution for a cleaner terminal
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def setup_mern_storage():
    print(" MERN Cloud Storage: Zero-to-End Automation Starting...")

    # 1. System Dependencies (Silent)
    run_it("sudo apt update")
    run_it("sudo apt install -y nodejs npm nginx mongodb")

    # 2. Node.js Packages (Install from package.json)
    print(" Installing NPM dependencies...")
    run_it("npm install")

    # 3. Automated Nginx Reverse Proxy Config
    nginx_conf = """server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}"""
    
    # Write config to sites-available
    with open("mern_nginx.conf", "w") as f:
        f.write(nginx_conf)
    
    run_it("sudo mv mern_nginx.conf /etc/nginx/sites-available/mern_storage")
    run_it("sudo ln -sf /etc/nginx/sites-available/mern_storage /etc/nginx/sites-enabled/")
    run_it("sudo rm -f /etc/nginx/sites-enabled/default")
    
    # Reload and Enable Services
    run_it("sudo systemctl restart nginx")
    run_it("sudo systemctl start mongodb")
    run_it("sudo systemctl enable mongodb")

    print("\n Setup Complete! Node.js environment and Nginx are ready.")
    print(" To start the MERN server, run the following command:")
    print("   node server.js")

if __name__ == "__main__":
    setup_mern_storage()
