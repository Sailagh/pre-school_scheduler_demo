"""Builds web/solved-schedule.json: the demo's starting data solved week by week, in order, so each week
sees the hours of the week before.

Run:  .venv/bin/python solver/build_saved.py [seconds per week, default 40]
"""

import json
import os
import subprocess
import sys
import tempfile

from schedule_solver import solve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W0, W1 = 41, 52

if __name__ == "__main__":
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 40.0
    tmp, files, weeks = tempfile.mkdtemp(), [], []
    for w in range(W0, W1 + 1):
        problem = json.loads(subprocess.run(["node", os.path.join(ROOT, "solver", "export_problem.mjs"), str(w), *files],
                                            check=True, capture_output=True, text=True).stdout)
        result = solve(problem, time_limit=limit, parallel=1)
        print(f"week {w}: {result['weeks'][0]['status']}, cost {result['weeks'][0]['objective']:.0f}", file=sys.stderr)
        files.append(os.path.join(tmp, f"{w}.json"))
        with open(files[-1], "w") as f:
            json.dump(result, f)
        weeks += result["weeks"]
    with open(os.path.join(ROOT, "web", "solved-schedule.json"), "w") as f:
        json.dump({"weeks": weeks}, f, separators=(",", ":"))
