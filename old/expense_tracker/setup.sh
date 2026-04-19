#!/bin/bash

# Xpense Hub - Setup Script
echo " Initializing Xpense Hub SaaS..."

# Check if MongoDB is running
if ! command -v mongod &> /dev/null
then
    echo "⚠️ MongoDB not found on system path. Please ensure it is running in Docker."
else
    echo "✅ MongoDB dependency checked."
fi

# Set up virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

source venv/Scripts/activate

echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo "✨ Setup complete! Run 'python app.py' to start the server."
python app.py
