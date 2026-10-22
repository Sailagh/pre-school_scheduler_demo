"""One solver run for the benchmark: python bench/one.py problem.json budget seed out.json

Runs in its own process so bench.py can limit it to a number of CPU cores. Writes the solution and the
seconds the solver took (wall clock, solving only).
"""

import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "solver"))
import schedule_solver  # noqa: E402

problem_path, budget, seed, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
with open(problem_path, encoding="utf-8") as f:
    problem = json.load(f)
schedule_solver.SEED = seed
start = time.perf_counter()
solution = schedule_solver.solve(problem, time_limit=budget, parallel=1)
wall = time.perf_counter() - start
solution["weeks"][0]["kept"] = problem["weeks"][0].get("kept", [])  # as the planner does
with open(out, "w", encoding="utf-8") as f:
    json.dump({"wall": wall, "solution": solution}, f)
