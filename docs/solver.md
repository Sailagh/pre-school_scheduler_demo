# Schedule solver (OR-Tools)

The demo starts with an empty schedule. The made-up staff, units, substitutes and children data are kept.

An empty week is dimmed with three choices in front of it: **Make a suggestion for me**, **Draw it myself** and **Copy last week**. **Make schedule** (also in the top bar) opens a form written for the person who does the scheduling, not for a programmer:

1. **Which weeks:** only this week, or 2, 4 or 7 weeks. If a week already has shifts, choose **Keep them and fill in around them** (schedule a few people by hand and let OR-Tools do the rest) or **Start over**.
2. **Is anything different from usual:** staff hope to finish early (a concert), the preschool closes early (the day before a holiday), fewer children than usual (school break), someone is away (holiday or a course; saved to the person's leave in Settings), the preschool is closed (a public holiday; one click for those in the chosen weeks). These are stored as `special` days in the state and shown as a ★ note on the day in the planner.
3. **What the schedule follows:** staff, days off, who may open and close, children and ratios, and the rules, read from Settings with links to change them, plus the order of priority when not everything fits.

After solving, a report says per week what worked and what did not, and why, e.g. who works after 17:00 on the concert day because children are still there (`scheduleReport()` in `web/schedule-core-demo.js`). **Undo the schedule** removes it in one step.

How it works:
- `solverProblem()` in `web/schedule-core-demo.js` describes each week for the solver: each person's contract and planning minutes, the days and times they can work, whether they may open or close, and the adults needed in every 15-minute slot (from the same children forecast the planner shows).
- `solver/schedule_solver.py` builds the schedule with OR-Tools CP-SAT. The rules come from Settings › Rules (hours without a break, break length, the weekly limit, optional limits per day, minimum adults, number of breaks, rest), so changing a rule there changes what the solver does. Always: one shift a day of 4–9 hours inside the person's availability, planning in blocks of at least 30 minutes, an opener at opening and a closer at closing. Each person works in one unit a day, their own or, when a unit would otherwise be short, another. Goals, most important first: enough adults every 15 minutes in every unit, a trained adult in the unit while a child with special needs is there, contract hours, wishes such as finishing early, planning hours, enough adults per unit, not more adults than needed.
- **The flexible week** (rule R2): no more than 40 hours a week, or up to 2 hours more if the next week is that much shorter (41 then 39). The planner warns when the next week isn't shorter. The solver only goes over when the children need it, and avoids it more strongly past one extra hour because it is tiring. Weeks are made in order, so a week after one that went over is made that much shorter.
- `solver/server.py` serves it over HTTP, together with the web pages. The planner calls `/solve` on the server it was loaded from; add `?solver=https://your-server` to the planner URL to use another address.
- If the solver can't be reached, the weeks are loaded from `web/solved-schedule.json`, a schedule OR-Tools made earlier for the demo's starting data, and the report says that special days were not included. So it also works on a static host with no server.

Run the solver by hand (what `start.py` does):

    python3 -m venv .venv && .venv/bin/pip install -r solver/requirements.txt
    .venv/bin/python solver/server.py          # http://localhost:8000

One week takes roughly 40 seconds to two minutes, depending on the computer. The solver's limit is an amount of work, not seconds, so a slower computer takes longer but gives an equally good schedule (`SOLVER_TIME_LIMIT` scales the work per week; default 20).

Rebuild `web/solved-schedule.json` after changing the demo data or the solver (about 8 minutes; weeks are solved in order), then check it with the planner's own rules:

    .venv/bin/python solver/build_saved.py
    node solver/check_solution.mjs web/solved-schedule.json
