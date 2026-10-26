#!/bin/bash
# Double-click to start the schedule demo (Mac). Keep the window open while you use it.
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 behövs. Hämta det från https://www.python.org/downloads/"
  echo "(Python 3 is needed. Get it from https://www.python.org/downloads/)"
  read -p "Tryck Enter för att stänga. "; exit 1
fi
python3 start.py "$@"
