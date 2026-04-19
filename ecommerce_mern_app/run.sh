#!/bin/bash
# Kill any process on port 5002
sudo fuser -k 5002/tcp 2>/dev/null
cd backend && npm start
