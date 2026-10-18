#!/bin/sh
# Starts the schedule demo (Linux). Keep the terminal open while you use it.
cd "$(dirname "$0")" && exec python3 start.py "$@"
