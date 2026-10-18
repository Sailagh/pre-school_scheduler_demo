"""Reads a solver problem as JSON on stdin and writes the solution as JSON to stdout."""

import json
import sys

from schedule_solver import solve

if __name__ == "__main__":
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 40.0
    result = solve(json.load(sys.stdin), time_limit=limit, parallel=1)
    for wk in result["weeks"]:
        print(f"week {wk['week']}: {wk['status']}, cost {wk['objective']:.0f}", file=sys.stderr)
    json.dump(result, sys.stdout, separators=(",", ":"))
