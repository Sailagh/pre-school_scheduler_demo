"""How long does it take to make a good schedule? Runs the solver with different work budgets and scores each result
with the planner's own rule checker.

    python bench/bench.py                 the standard run: 4 scenarios, budgets 2.5-80, 3 seeds, all cores (1-3 h)
    python bench/bench.py --quick         a short check: an ordinary week, budgets 5-20, one seed (about 3 min)
    python bench/bench.py --cores 1 2 4   also as if the computer had fewer cores (Linux only, uses taskset)

Use the demo's own Python (.venv/bin/python or .venv\\Scripts\\python.exe), which has OR-Tools. Results go to
bench/results/<computer>.csv, one row per run, and a run that stops can be started again: finished runs are skipped.
Scoring needs Node.js (as for the tests); without it, the time and the solver's cost are still recorded and the
solutions are kept in bench/results/solutions/ so they can be scored later. Then: python bench/report.py

The budget is the solver's time_limit: "seconds per week on a typical computer". The solver limits work, not
seconds, so a faster computer finishes the same budget sooner; the wall-clock seconds are what is measured here.
"""

import argparse
import csv
import json
import os
import platform
import re
import shutil
import socket
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "bench")
SCENARIOS = {"base": 42, "special": 42, "lingon": 42, "edlevo": 43}
FIELDS = ["computer", "cpu", "logical_cpus", "cores", "python", "ortools", "scenario", "week", "budget", "seed",
          "wall_s", "status", "objective", "warnings", "staffing_warnings", "rule_warnings", "hours_off_people",
          "hours_off_max_min", "planning_short_h", "satisfactory"]


def cpu_name():
    try:
        if sys.platform.startswith("linux"):
            with open("/proc/cpuinfo") as f:
                return re.search(r"model name\s*:\s*(.*)", f.read()).group(1).strip()
        if sys.platform == "darwin":
            return subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip()
        if sys.platform == "win32":
            out = subprocess.run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_Processor).Name"], capture_output=True, text=True).stdout
            return out.strip().splitlines()[0] if out.strip() else platform.processor()
    except Exception:
        pass
    return platform.processor() or "unknown"


def score(scenario, problem, sol_path):
    """The planner's view of a solution (tests/scenario.mjs check), or None without Node.js."""
    if not shutil.which("node"):
        return None
    r = subprocess.run(["node", os.path.join(ROOT, "tests", "scenario.mjs"), "check", scenario, sol_path], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr)
    (wk,) = json.loads(r.stdout)
    off = [abs(wk["hours"][p] - wk["contract"][p]) for p in wk["hours"]]
    planned = {}
    for x in wk["shifts"]:
        if x["type"] in ("planning", "meeting"):
            planned[x["staff"]] = planned.get(x["staff"], 0) + x["end"] - x["start"]
    short = sum(max(0, p["planning"] - planned.get(p["id"], 0)) for p in problem["weeks"][0]["staff"])
    warn = wk["warnings"]
    return {"warnings": len(warn), "staffing_warnings": sum(w["kind"] == "staffing" for w in warn),
            "rule_warnings": sum(w["kind"] != "staffing" for w in warn), "hours_off_people": sum(x > 15 for x in off),
            "hours_off_max_min": max(off), "planning_short_h": round(short / 60, 2),
            "satisfactory": int(not warn and all(x <= 15 for x in off))}


def main():
    ap = argparse.ArgumentParser(description="Time to a good schedule.")
    ap.add_argument("--quick", action="store_true")
    ap.add_argument("--scenarios", nargs="+", default=list(SCENARIOS))
    ap.add_argument("--budgets", nargs="+", type=float, default=[2.5, 5, 10, 20, 40, 80])
    ap.add_argument("--seeds", nargs="+", type=int, default=[1, 2, 3])
    ap.add_argument("--cores", nargs="+", type=int, default=[0], help="0 = all cores")
    ap.add_argument("--name", default=socket.gethostname(), help="name of this computer in the results")
    a = ap.parse_args()
    if a.quick:
        a.scenarios, a.budgets, a.seeds = ["base"], [5, 10, 20], [1]
    if any(c for c in a.cores) and not shutil.which("taskset"):
        sys.exit("--cores needs taskset (Linux). On this computer, leave it out to use all cores.")
    import ortools
    os.makedirs(os.path.join(HERE, "results", "solutions"), exist_ok=True)
    out = os.path.join(HERE, "results", re.sub(r"[^\w.-]+", "_", a.name) + ".csv")
    done = set()
    if os.path.exists(out):
        with open(out, newline="") as f:
            done = {(r["scenario"], float(r["budget"]), int(r["seed"]), r["cores"]) for r in csv.DictReader(f)}
    base = {"computer": a.name, "cpu": cpu_name(), "logical_cpus": os.cpu_count(), "python": platform.python_version(), "ortools": ortools.__version__}
    runs = [(s, b, seed, c) for s in a.scenarios for b in a.budgets for seed in a.seeds for c in a.cores]
    print(f"{base['cpu']}, {base['logical_cpus']} logical CPUs. {len(runs)} runs, results in {out}", flush=True)
    for i, (scenario, budget, seed, cores) in enumerate(runs, 1):
        key = (scenario, budget, seed, str(cores or "all"))
        if key in done:
            continue
        week = SCENARIOS[scenario]
        problem_path = os.path.join(HERE, "problems", f"{scenario}-{week}.json")
        with open(problem_path, encoding="utf-8") as f:
            problem = json.load(f)
        raw = os.path.join(HERE, "results", "solutions", f"{a.name}-{scenario}-b{budget:g}-s{seed}-c{cores or 'all'}.json")
        cmd = [sys.executable, os.path.join(HERE, "one.py"), problem_path, str(budget), str(seed), raw]
        if cores:
            cmd = ["taskset", "-c", f"0-{cores - 1}"] + cmd
        subprocess.run(cmd, check=True)
        with open(raw, encoding="utf-8") as f:
            res = json.load(f)
        sol = os.path.join(HERE, "results", "solutions", "last-solution.json")
        with open(sol, "w", encoding="utf-8") as f:
            json.dump(res["solution"], f)
        q = score(scenario, problem, sol) or {}
        wk = res["solution"]["weeks"][0]
        row = {**base, "cores": cores or "all", "scenario": scenario, "week": week, "budget": budget, "seed": seed,
               "wall_s": round(res["wall"], 1), "status": wk["status"], "objective": round(wk["objective"]), **q}
        new = not os.path.exists(out)
        with open(out, "a", newline="") as f:
            w = csv.DictWriter(f, FIELDS)
            if new:
                w.writeheader()
            w.writerow(row)
        print(f"[{i}/{len(runs)}] {scenario} budget {budget:g} seed {seed} cores {cores or 'all'}: {row['wall_s']} s, "
              f"cost {row['objective']}" + (f", {q['warnings']} warnings, {q['hours_off_people']} people off their hours"
                                             f"{', satisfactory' if q['satisfactory'] else ''}" if q else ""), flush=True)


if __name__ == "__main__":
    main()
