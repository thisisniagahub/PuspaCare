#!/bin/bash
while true; do
  cd /home/z/my-project
  npx next dev -p 3000 --webpack 2>&1
  echo "Server exited with code $?. Restarting in 2s..."
  sleep 2
done
