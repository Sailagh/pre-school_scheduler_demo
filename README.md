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

The demo starts with an empty schedule: no shifts and no opener/closer set. The made-up staff, units, substitutes and children data are kept, and an OR-Tools solver will fill in the schedule.

State lives in `localStorage` (`schema-demo-v5`), shared live between tabs of the same browser. Next step: backend with OR-Tools solver and shared data across devices.
