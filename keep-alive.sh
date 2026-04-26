#!/bin/bash
# Auto-restart dev server
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js dev server..."
  npx next dev -p 3000 2>&1
  echo "[$(date)] Server exited. Restarting in 2s..."
  sleep 2
done
