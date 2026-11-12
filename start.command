#!/bin/bash
# Double-click to run Crumbs & Paws locally at http://localhost:5173
cd "$(dirname "$0")"
PORT=5173
if ! lsof -i :$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
  sleep 1
fi
open "http://localhost:$PORT"
echo "Crumbs & Paws is running at http://localhost:$PORT — close this window to keep it running, or press Ctrl+C."
wait
