from app import app

# Vercel requirements: entry point must export 'app'
# This file serves as the bridge for serverless functions
if __name__ == "__main__":
    app.run()
