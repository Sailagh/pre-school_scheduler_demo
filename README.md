# Förskolans schema – web demo

Static web build of the design prototype (`DESIGN_HANDOFF.md`).

| Page | File |
|---|---|
| Landing | `web/index.html` |
| Planner (rektor, iPad/desktop) | `web/Schedule Demo.dc.html` |
| Phone app (staff + substitutes) | `web/Phone.dc.html` (`?me=p1`, `?me=s1`, `&lang=en`) |

Run locally:

    cd web && npx http-server -p 5173 -c-1

Changes from the prototype:
- React, ReactDOM and Babel are vendored in `web/vendor/` (same files and SRI hashes as the unpkg URLs) so the demo needs no script CDN.
- `Phone.dc.html` is new: the Staff App on its own page, full screen on a phone and in the iPhone bezel on a wide screen, with a person picker and SV/EN.

## Schedule solver (OR-Tools)

The demo starts with an empty schedule. The made-up staff, units, substitutes and children data are kept.

An empty week is dimmed with three choices in front of it: **Make a suggestion for me**, **Draw it myself** and **Copy last week**. **Make schedule** (also in the top bar) opens a form written for the person who does the scheduling, not for a programmer:

1. **Which weeks:** only this week, or 2, 4 or 7 weeks.
2. **Is anything different from usual:** staff hope to finish early (a concert), the preschool closes early (the day before a holiday), fewer children than usual (school break), someone is away (holiday or a course; saved to the person's leave in Settings). These are stored as `special` days in the state and shown as a ★ note on the day in the planner.
3. **What the schedule follows:** staff, days off, who may open and close, children and ratios, and the rules, read from Settings with links to change them, plus the order of priority when not everything fits.

After solving, a report says per week what worked and what did not, and why, e.g. who works after 17:00 on the concert day because children are still there (`scheduleReport()` in `web/schedule-core-demo.js`). **Undo the schedule** removes it in one step.

How it works:
- `solverProblem()` in `web/schedule-core-demo.js` describes each week for the solver: each person's contract and planning minutes, the days and times they can work, whether they may open or close, and the adults needed in every 15-minute slot (from the same children forecast the planner shows).
- `solver/schedule_solver.py` builds the schedule with OR-Tools CP-SAT. Hard rules: one shift a day of 4–9 hours inside the person's availability, 30-minute breaks, no more than 5 hours without a break, planning in blocks of at least 30 minutes, an opener at opening and a closer at closing. Goals, most important first: enough adults every 15 minutes, a trained adult in the unit while a child with special needs is there, contract hours, planning hours, enough adults per unit, and not more adults than needed.
- `solver/server.py` serves it over HTTP. The planner calls `http://localhost:8000/solve`; add `?solver=https://your-server` to the planner URL to use another address.
- If the solver can't be reached, the weeks are loaded from `web/solved-schedule.json`, a schedule OR-Tools made earlier for the demo's starting data, and the report says that special days were not included. So it also works on a static host with no server.

Run the solver:

    python3 -m venv .venv && .venv/bin/pip install -r solver/requirements.txt
    .venv/bin/python solver/server.py          # http://localhost:8000

A week takes about 20 seconds (`SOLVER_TIME_LIMIT` sets the seconds per week).

Rebuild `web/solved-schedule.json` after changing the demo data or the solver, then check it with the planner's own rules:

    node solver/export_problem.mjs | .venv/bin/python solver/solve_file.py 40 > web/solved-schedule.json
    node solver/check_solution.mjs web/solved-schedule.json

State lives in `localStorage` (`schema-demo-v5`), shared live between tabs of the same browser. Next steps: host the solver and share data across devices.
