#!/bin/bash
cd "$(dirname "$0")"
[ -f logs/app.pid ] && kill $(cat logs/app.pid) 2>/dev/null && rm logs/app.pid
pkill -f "electron-vite" 2>/dev/null
echo "stopped"
