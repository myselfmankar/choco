#!/bin/bash
# Kill any process on port 5005
sudo fuser -k 5005/tcp 2>/dev/null
cd backend && npm start
