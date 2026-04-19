#!/bin/bash

# --- AURA Cloud Stack Control ---

case "$1" in
    start)
        pm2 start backend/server.js --name "aura-api"
        ;;
    stop)
        pm2 stop aura-api
        ;;
    logs)
        pm2 logs aura-api
        ;;
    status)
        pm2 status
        ;;
    monit)
        pm2 monit
        ;;
    *)
        echo "Usage: $0 {start|stop|logs|status|monit}"
        exit 1
esac

exit 0
