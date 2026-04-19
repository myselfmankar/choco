#!/bin/bash
# Kill any process on port 5000
sudo fuser -k 5000/tcp 2>/dev/null
cd backend && npm start
