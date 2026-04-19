#!/bin/bash
# Kill any process on port 5004
sudo fuser -k 5004/tcp 2>/dev/null
cd backend && npm start
