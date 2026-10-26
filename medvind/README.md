# Medvind base schedule (grundschema): import, export, schedule lines

Medvind stores a base schedule as an **N-week rotation**: one row per **schedule line** (schemarad), each tied to a unit
("1, Avd 1") or an extra line ("13 Extra"), one time range per weekday, and one week marked as the start week
("Vecka 4: Startvecka"). Its Excel export looks like that too, with the times typed by hand in mixed formats.

- **`medvind.py`** reads such an export and writes our schedule back in the same layout (needs `openpyxl`, which
  `start.py` installs). It reads `06.00-13.00`, `8-16.30`, `0630-1030`, `9-19`, `6,30-13` and the like; a typo it can
  make sense of (`6.3014.0`, a missing dash) is read and **flagged as guessed**; anything else is **flagged as unread
  and left out**. A line without a unit number ("6, Avd") is flagged too. Times are written back as `06.00-13.00`.

  ```
  .venv/bin/python medvind/medvind.py read  grundschema.xlsx > rotation.json
  .venv/bin/python medvind/medvind.py write rotation.json ut.xlsx
  ```

- **In the planner**: the **▦ Schemarader** tab next to the weekdays shows the schedule as schedule lines in a rotation
  of N weeks (1–8, from a chosen week), with hours per week and the average, a check against the rules, *Repeat to
  week 52*, *Export to Medvind (.xlsx)* and *Import from Medvind…*. The local server does the Excel part
  (`POST /medvind/read`, `POST /medvind/write`) and keeps nothing; an imported file is kept only in that browser.
- **`exempel-grundschema.xlsx`** (made by `make_example.py`) is an **invented** export in the same layout, with one typo
  and one unreadable cell, for trying the import. Real exports go in `private/`, which git ignores.

A day in a Medvind base schedule is one range from start to end, breaks included. Worked time is that range less the
unpaid breaks: 30 min for each stretch over 5 h (the break rules in Settings), i.e. one break on an ordinary day and
two on days over 10.5 h.

## Rule-check report

`report.mjs` writes a short Markdown report (English) for any imported rotation, using the planner's own rule checker
(`checkRotation`) and the rule values in Settings: what passes, what fails and where, how the file was read, and the
limits of the check. Keep reports on real data in `private/`.

```
.venv/bin/python medvind/medvind.py read private/grundschema.xlsx > private/rotation.json
node medvind/report.mjs private/rotation.json grundschema.xlsx > private/rule-check-report.md
```
