#!/bin/bash
while true; do
  cd /home/z/my-project
  NODE_OPTIONS="--max-old-space-size=1024" npx next dev -p 3000 2>&1
  echo "Server exited with code $?. Restarting in 2s..."
  sleep 2
done
