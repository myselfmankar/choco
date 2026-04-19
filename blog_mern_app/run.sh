#!/bin/bash
# Kill any process on port 5003
sudo fuser -k 5003/tcp 2>/dev/null
cd backend && npm start
