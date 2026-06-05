#!/bin/bash
cd "$(dirname "$0")"
mkdir -p logs
echo $$ > logs/app.pid
bun run dev >> logs/app.log 2>&1
