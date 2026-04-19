#!/bin/bash
# Kill any process on port 5001
sudo fuser -k 5001/tcp 2>/dev/null
cd backend && npm start
