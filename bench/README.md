# How long does a good schedule take? (benchmark)

The solver makes one week with different **work budgets** (its `time_limit`, "seconds per week on a typical computer"),
for four scenarios (an ordinary week, special days, two staff away, children from Edlevo) and three random seeds.
Each result is checked with the planner's own rules. A run is **satisfactory** when nothing shows under
*Att kontrollera* and everyone is within 15 minutes of their contract hours, the bar the solver tests use.

## On your own computer
- **Windows:** start the demo once with `Start-Windows.bat` (installs OR-Tools), then double-click
  **`Benchmark-Windows.bat`**. It takes 1–2 hours; leave the computer alone meanwhile. Afterwards `report.html` opens,
  and the results are in `bench/results/` (one CSV per computer). Send that folder to compare computers.
- **Mac/Linux:** `.venv/bin/python bench/bench.py`, then `.venv/bin/python bench/report.py`.
- Short check first (about 3 minutes): add `--quick`.

Scoring uses Node.js, like the tests. Without it, the time and the solver's cost are still recorded and the solutions
are kept in `bench/results/solutions/`, so they can be scored later on another computer.

## Options
`--scenarios`, `--budgets`, `--seeds`, `--name`, and on Linux `--cores 1 2` to run as if the computer had fewer cores
(`taskset`). A stopped run continues where it left off. `bench/problems/` holds the four week problems, made from the
demo's invented data with `node tests/scenario.mjs problem <scenario> <week>`.
