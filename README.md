# Förskolans schema – web demo

## Kom igång på din dator / Getting started on your computer

**Svenska**
1. Installera Python 3 en gång (gratis): https://www.python.org/downloads/. På Windows: kryssa i **"Add python.exe to PATH"** i installationen.
2. Hämta projektet: på GitHub, klicka **Code › Download ZIP** och packa upp filen (eller klona det med git).
3. Dubbelklicka på startfilen i mappen:
   - Windows: **Start-Windows.bat**
   - Mac: **Start-Mac.command** (första gången: högerklicka › Öppna, eftersom filen kommer från internet)
   - Linux: `./start.sh`
4. Första gången installeras OR-Tools (en minut eller två, kräver internet). Sedan öppnas schemat i webbläsaren.
5. Låt fönstret som öppnades vara öppet medan du testar. Stäng det för att avsluta.

Allt körs på din egen dator, på http://localhost:8000/. Inget skickas någon annanstans. Data sparas i webbläsaren; **Börja om** under Inställningar › Allmänt nollställer allt. Vill du prova telefonappen på en riktig telefon på samma wifi: starta med `python3 start.py --lan` och öppna adressen som skrivs ut.

**English**
1. Install Python 3 once (free): https://www.python.org/downloads/. On Windows, tick **"Add python.exe to PATH"** in the installer.
2. Get the project: on GitHub, click **Code › Download ZIP** and unzip it (or clone it with git).
3. Double-click the start file in the folder: **Start-Windows.bat** (Windows), **Start-Mac.command** (Mac; the first time right-click › Open, because the file comes from the internet), or `./start.sh` (Linux).
4. The first time, OR-Tools is installed (a minute or two, needs internet). Then the planner opens in the browser.
5. Keep the window that opened while you test. Close it to stop.

Everything runs on your own computer, at http://localhost:8000/; nothing is sent anywhere else. Data is kept in the browser; **Start over** under Settings › General resets it. To try the phone app on a real phone on the same Wi-Fi, start with `python3 start.py --lan` and open the address it prints.

---

Static web build of the design prototype (`DESIGN_HANDOFF.md`).

| Page | File |
|---|---|
| Landing | `web/index.html` |
| Planner (rektor, iPad/desktop) | `web/Schedule Demo.dc.html` |
| Phone app (staff + substitutes) | `web/Phone.dc.html` (`?me=p1`, `?me=s1`, `&lang=en`) |

Run locally: `python3 start.py` (above). It serves `web/` and the solver together on http://localhost:8000/. For only the static pages, `cd web && npx http-server -p 5173 -c-1` also works; "Make schedule" then uses the saved schedule.

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
- `solver/schedule_solver.py` builds the schedule with OR-Tools CP-SAT. The rules come from Settings › Rules (hours without a break, break length, the weekly limit, optional limits per day, minimum adults, number of breaks, rest), so changing a rule there changes what the solver does. Always: one shift a day of 4–9 hours inside the person's availability, planning in blocks of at least 30 minutes, an opener at opening and a closer at closing. Goals, most important first: enough adults every 15 minutes, a trained adult in the unit while a child with special needs is there, contract hours, wishes such as finishing early, planning hours, enough adults per unit, not more adults than needed.
- **The flexible week** (rule R2): no more than 40 hours a week, or up to 2 hours more if the next week is that much shorter (41 then 39). The planner warns when the next week isn't shorter. The solver only goes over when the children need it, and avoids it more strongly past one extra hour because it is tiring. Weeks are made in order, so a week after one that went over is made that much shorter.
- `solver/server.py` serves it over HTTP, together with the web pages. The planner calls `/solve` on the server it was loaded from; add `?solver=https://your-server` to the planner URL to use another address.
- If the solver can't be reached, the weeks are loaded from `web/solved-schedule.json`, a schedule OR-Tools made earlier for the demo's starting data, and the report says that special days were not included. So it also works on a static host with no server.

Run the solver by hand (what `start.py` does):

    python3 -m venv .venv && .venv/bin/pip install -r solver/requirements.txt
    .venv/bin/python solver/server.py          # http://localhost:8000

A week takes about 20 seconds (`SOLVER_TIME_LIMIT` sets the seconds per week).

Rebuild `web/solved-schedule.json` after changing the demo data or the solver (about 8 minutes; weeks are solved in order), then check it with the planner's own rules:

    .venv/bin/python solver/build_saved.py
    node solver/check_solution.mjs web/solved-schedule.json

## Tests

    node --test tests/core.test.mjs                    # shared logic, rules, saved schedule (seconds)
    .venv/bin/python -m unittest discover -s tests     # solver scenarios, checked with the planner's rules (~2 min)
    BASE=http://localhost:8000 node tests/e2e.cjs      # browser walkthrough; needs the demo running and Playwright

The solver scenarios (`tests/scenario.mjs`) are an ordinary week, special days, stricter rules from Settings, and a short-staffed week that uses the flexible week and evens it out the week after.

State lives in `localStorage` (`schema-demo-v5`), shared live between tabs of the same browser. Next steps: host the solver and share data across devices.
