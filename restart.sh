#!/bin/bash
cd "$(dirname "$0")"
bash stop.sh
rm -f logs/*.log
bash start.sh
