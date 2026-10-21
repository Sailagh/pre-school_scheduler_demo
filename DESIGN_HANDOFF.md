# Handoff: Preschool Schedule (Förskolans schema)

## Overview
A scheduling tool for a Swedish preschool (förskola). The principal (rektor) plans staff shifts per unit (avdelning), sees at a glance whether every hour has enough adults for the number of children, and is warned when a rule (rest, weekly hours, breaks, roles, special-needs coverage) is broken. Staff use a phone app to see their week, see who works when, report sick, ask for swaps, and ask colleagues to cover part of a shift. Substitutes (vikarier) get free shifts offered through the same app.

Three surfaces:
1. **Planner (iPad / desktop, 1440×~900 design canvas, scaled to fit)** — the main schedule.
2. **Settings** — general, import/export, staff, children & units, substitutes, rules.
3. **Phone app (iPhone, 402×874)** — staff view and substitute view.

The UI is bilingual (Swedish and English, toggled with **SV / EN** in the top bar). All names and data are made up.

## About the design files
The files in `web/` are **design references built in HTML**: working prototypes that show the intended look and behaviour. They are **not production code to copy directly**. Rebuild them in the target codebase's own environment (framework, state management, API layer) using its established patterns. If no codebase exists yet, pick a suitable stack. A sensible default is React + TypeScript for the planner and settings, and React Native or a responsive PWA for the phone app, with a server holding the real data and rule engine.

`.dc.html` files are a proprietary "Design Component" format: an HTML template with `{{ }}` holes plus a `class Component extends DCLogic` logic block. They open in a browser (they load `support.js`). Read them as a declarative template plus a React-class-like `renderVals()`. **`schedule-core-demo.js` holds all the domain logic** (data model, rule checks, staffing need, cover candidates, substitute cascade, hours accounting). It is the most valuable file to port, ideally to a shared TypeScript module or the backend.

`Schema Demo.html` is the single-file offline bundle of the whole prototype. Open it in any browser to click through.

## Fidelity
**High-fidelity** for layout, colour, typography, copy and interaction. Recreate it closely. The data model and rule engine are **functional mocks**. The logic is correct for the demo, but it runs client-side on one week's data in `localStorage`. The real system needs persistence, auth, multi-user concurrency and audit trails.

---

## Domain model (from `schedule-core-demo.js`)
Times are **minutes from midnight** (e.g. 390 = 06:30). Days are `0–4` = Mon–Fri. Weeks are ISO week numbers. The demo covers weeks **41–52**, in planning periods of **4 weeks** (`BLOCK_WEEKS`). The Staff page's time calendar shows **7-week blocks**, because real schedules are made in 7-week cycles. **Make the period length one configurable value**; the rest of the prototype still uses 4.

```ts
Unit (GROUPS)   { id, name, ages, open, close, ratio /*children per adult*/, max /*enrolled*/, sn /*special-needs kids*/ }
  g1 Blåbär  1–3 yrs 06:30–17:30 ratio 5
  g2 Lingon  3–4 yrs 06:15–18:00 ratio 7
  g3 Hjortron 4–5 yrs 06:00–18:30 ratio 10
Staff           { id, name, pct /*employment %*/, hours, group /*home unit*/, open, close /*may open/close*/, sn /*trained for special needs*/,
                  off: day[] /*fixed days off*/, earliest?, latest? /*availability*/, end? /*last week*/,
                  changes: [{from: week, pct}] /*future % changes, e.g. 75% from w.47*/, leave: [{w1,d1,w2,d2,kind:'vacation'|'leave'}],
                  phone, phoneSrc: 'app'|'manual', nonChild?: hours /*override of non-child target*/ }
Substitute      { id, name, phone, days: day[], sn, open, close, prefer: unitId[] /*preferred for*/, booked: [{week,day,from,to,where}] }
Shift           { id, staff, week, day, start, end, type: 'contact'|'break'|'planning'|'meeting', group, was? /*original owner if taken over*/, cover? /*covering for*/ }
Absence         { staff, week, day, from, to, reason: 'sick'|... }
Roles           roles["week-day"] = { open: staffId, close: staffId }
Merge (opening/closing unit)  { on, am: 450 /*07:30*/, pm: 960 /*16:00*/, ratio: 8, room: 'g3' }  – before am / after pm all children are together in one unit
SpecialNeedsKid { id, unit, days, from, to }   – only counts and times, never names
Request         { id, type: 'swap'|'unavail'|'sick'|'cover', staff, week, day, from?, to?, with?, reason? /*principal only*/,
                  status: 'pending'|'new'|'seen'|'approved'|'declined'|'open'|'matched'|'nobody', offered?: staffId[], declined?: staffId[], by? }
FreeShift       { id, staff /*sick person*/, week, day, from, to, group, needs:{open,close,sn},
                  status: 'offered'|'accepted'|'confirmed'|'nobody', stage: 'preferred'|'all', offered: subId[], declined: subId[], by?, clock, log: [{t,k,ids?,by?}] }
Rule            { id: 'r1'.., type, base, versions: [{ from: week, on, p: params }] }   – versioned by week so a law change can start "from week 47"
Note (inbox)    { id, to, key, p, at, read }
```

### Rules (codes shown in the UI as R1…)
| Code | type | Default | Check |
|---|---|---|---|
| R1 | rest | 11 h | rest between end of one day and start of next |
| R2 | week | 40 h, flex 2 h | max hours in a week; up to `flex` more if the next week is that much shorter (see *Schedule generation*) |
| R3 | avg | 40 h | average over the period |
| R4 | cont | 5 h | max continuous work without a break (gap ≥15 min resets) |
| R5 | breakLen | 15–30 min | break length |
| R6 | count | – | contract hours = contact + break + planning + meeting |
| R7 | openClose | – | someone opens and someone closes each day |
| R8 | avail | – | nobody works outside availability |
| R9 | absent | – | nobody works while absent |
| R10 | sn | – | a trained adult is in the unit while a special-needs child is there |
| user-added | breaks, dayMax, minStaff | see `ADDABLE` | e.g. "2 breaks of 15 min on days > 6 h" |

The ratio check (adults needed per unit per 15-minute slot = ceil(children/ratio), using the merged ratio during opening and closing) drives the **Barn / Behövs / I tjänst** rows. Every warning carries its rule code so the principal can see which rule fired. Each rule card in Settings explains in plain words what is checked.

### Hours accounting (`personWeek`, `nonChildTarget`)
- **Contract minutes** `C` = 40 h × employment % (adjusted for future `changes`, fixed days off, leave).
- **Non-child target** `N` = 5 h at 100% (default `prefs.nonChild`), scaled by %, overridable per person. **Child target** `A = C − N`. With children counts contact + breaks; without children counts planning + meetings.
- **Sick** days are *not* worked time. They are reported separately as sick hours and days (paid as sick pay after the waiting-day deduction; that goes to payroll as absence). Vacation and leave are counted in days.
- Substitutes have no contract; their hours appear separately in the export.

### Substitute cascade (sick report)
1. Staff presses **Sjuk** → absence is added → `makeFree()` turns the day's shifts into a **free shift** (time span, unit, needs: opens/closes/special-needs).
2. `route()` offers it first to eligible substitutes whose `prefer` includes the unit (`stage: 'preferred'`).
3. No answer in **15 min** (demo: "⏩ Hoppa fram 15 minuter") → offered to **all eligible** (`stage: 'all'`).
4. Eligible = available that weekday, has the training/role the shift needs, not booked or working then, rest rule (R1) OK. Excluded substitutes are listed with a reason.
5. First to press **Ta passet** → `accepted`; shifts are reassigned (`was` keeps the original owner). Principal **Bekräfta** → `confirmed`; the substitute gets an inbox note.
6. **Privacy:** colleagues see "Frånvarande", substitutes see "Ledigt pass". Only the person and the principal see "Sjuk".

### Cover part of a shift (internal)
Staff picks a from/to range inside their shift and a reason, which only the principal sees. `coverCands()` sends it to colleagues who are present, available, not working then, and would not break R1–R4. The first yes → `matched`. The principal approves under **Notiser** → the shift is split, the colleague gets the covered piece (`cover` = original staff), and hours are recounted.

---

## Screens

### 1. Planner — `Schedule Demo.dc.html`
Fixed 1440 px wide canvas, scaled to fit the viewport with no page scroll. Font **IBM Plex Sans** (UI) and **IBM Plex Mono** (times and numbers).

- **Top bar** (height ~57 px, white, bottom border `#D3DDEA`): school name, week ‹ › with date range, Undo / Redo, Copy to next week, **▶ Demo**, **Sjuk och vikarier** (badge = active free shifts, `#D9A23A`), **Notiser** (badge), **Personalens telefon**, **Inställningar**, **SV/EN**. Buttons are 32 px tall, 6 px radius, 1 px `#C9D5E0` border, 13 px text.
- **Day tabs** Mon–Fri, with **unit tabs** (Alla / Blåbär B / Lingon L / Hjortron H, each with a coloured letter chip).
- **Warnings strip** "Att kontrollera" (`#EEF4F7` background, min-height 52 px): a count and a list of rule-coded warnings. Tapping one jumps to the shift. Show nothing extra when it is clear.
- **Left: staff roster** (~300 px). A search box, a sort control (A–Ö / fill / contract), and a legend (Med barn / Utan barn / Sjuk). Each row has the name, a unit chip, hours/contract, and a **two-part fill bar**:
  - Left segment (width = A/C): children time, filling red→green (`color-mix(in oklch, #6CC24A p%, #F59A93)`, full = `#6CC24A`). Sick time shows as red stripes (`#F2A9A3/#FBE3E1` 45°).
  - A **2 px solid `#1F2D3A` divider**.
  - Right segment: non-child time on `#ECE6F5`, filling `#8E6CCF` (`#5B3F9E` if over).
  - The whole bar turns `#E5534B` if total > contract. The tooltip shows exact numbers.
  - Tapping a name opens that person's single view and highlights them in the list.
- **Timeline grid**: 06:00–18:30 (`DS=360`, `DE=1110`), one row per person, 15-minute snapping. Shift blocks are coloured by type (table below), and they show unit chips and opener/closer markers. A **"Vikarie"** tag (`#FFF1CF` / `#6B5214`) marks substitutes.
  - **Ghost shifts:** when someone else took the shift, a dashed outline (`#B4C3D0`, hatched) shows the crossed-out original time and "→ New name". Hidden with `@media print`.
  - **Opening/closing unit label** above the grid, in the room unit's colour. Tap it to choose the unit from a dropdown. Drag its edges to change the 07:30 / 16:00 times in 15-minute steps.
- **Bottom rows:** Barn (children), Behövs (needed), I tjänst (on duty) per slot. Green `#E2F6D4` / `#2D6A1F` means enough, red `#FFDAD8` / `#8E2A27` too few, yellow `#FFF1CF` / `#6B5214` more than needed.
- **Floating card** (300 px, top-right): opens for a selected shift or person.
  - **Shift:** type (Barntid / Rast / Planering / Möte), a **Unit:** dropdown, start/end, delete.
  - **Person:** day picker, unit, opens/closes, "Sjukanmäl idag", and a link to edit them in Settings.
  - **Cover suggestions:** for uncovered sick time, staff who can take it and why others can't.
- **Interactions:**
  - Drag a block to move it in time; drag its left or right edge to resize.
  - Drag onto another person's row to reassign it. This is blocked in single-person view.
  - Drag from empty space to create a shift.
  - A break, planning or meeting block can be dragged anywhere in that person's working day: only the time with children closes up around it, other blocks stay put, and the day keeps its start, end and minutes of each kind. Dropped onto another block, it settles next to it.
  - Undo/Redo covers all edits.
- **Notiser** panel (popover ~552 px wide, 20% larger than the old requests window): staff requests (swap / can't work / sick / cover), each with Godkänn / Neka, "Okej" for sick reports, and "Visa dagen". For cover requests it shows the reason (principal only), who it was sent to, and who accepted.
- **Sjuk och vikarier** drawer (right side, 600 px, full height under the top bar, closes with ×):
  - Tabs **Pågående (n)** / **Bekräftade (n)**.
  - Each free shift is an expandable card. Its header shows a unit chip, date and time, "Name sick → Substitute", and a status pill: Erbjudet `#FFF1CF`, Accepterat `#DDF1F5`, Bekräftat `#E2F6D4`, Ingen vikarie `#FFDAD8`.
  - Expanded, the card shows the needs tags, a 3-step progress bar (6 px), the status line, a timed log (mono times), "Kan inte ta passet" (name + reason in `#8E2A27`), and the buttons Bekräfta / ⏩ Skip 15 min / Visa i schemat.
- **▶ Demo autoplay**, six captioned steps in a dark caption card (`#1F2D3A`) at the bottom-left:
  1. Anna Lindqvist reports sick at 06:40.
  2. The shift becomes a free shift and is offered to the unit's preferred substitute (Karin for Hjortron).
  3. No answer, so it goes to everyone eligible.
  4. Sara Ek takes the shift on her phone.
  5. Accepted: Sara is in the schedule.
  6. Confirmed.

  Has a Stop / Klar button. Keep it as a sales/demo feature or drop it in production. If week 42 is empty, the demo first loads the saved OR-Tools schedule, and its captions use Anna's actual shift.

### 2. Settings — `Demo Settings.dc.html` (+ `Demo Settings Staff`, `Demo Settings Rules`)
A full-screen overlay with a **left side menu** (keep as designed) and a content column (max ~1000 px, padding 36/48 px). Section titles are 22 px/600, the subtitle 14 px `#5A6B7A`, and section labels 12 px uppercase `.06em` `#5A6B7A`. Content sits in bordered lists (1 px `#D3DDEA`, radius 8, rows 60 px min with 1 px `#E3EAF0` separators). The style is calm and consistent across sections.
- **Allmänt (General):** school name, language, time step for dragging, notifications, Börja om (reset demo).
- **Import och export:**
  - **Import:** staff from HR, child counts from the child register (no child names), each shown as a preview before anything changes. Note: the municipality system (Edlevo) currently exports **PDF**. Plan a parser for a text-based PDF layout, but prefer asking for CSV/Excel or an API.
  - **Export:** Excel / CSV / PDF / Calendar (ICS), for one week or the period. A "Timmar i filen" table lists staff total plus each substitute's hours.
- **Personal (Staff):** a list (sort by Namn / Avdelning / Avtal %) and a detail view per person:
  - **Tid och frånvaro:**
    - **Calendar:** two 7-week blocks side by side, with ‹ › arrows moving 7 weeks (about 35 weeks of history). Day cells are 20 px tall, colours below.
    - **Selected week:** tap a week to see its one-line stats: with children x / target, without children x / target, total / contract, sick, away.
    - **Summaries:** for the two visible blocks, or **Per månad** for the months in view (two per row).
    - **Note:** a line on how sick pay works.
  - **Anställning:**
    - **Telefon:** an input with "Från appen" / "Inskrivet här" source tag and a "Ring" tel: link.
    - **Contract:** employment %, with future changes ("75 % from w.47").
    - **Non-child time:** "Tid utan barn per vecka" stepper (0.5 h steps, "Använd standard" reset).
    - **End of employment.**
  - **Availability:** fixed days off, earliest and latest times.
  - **Leave:** vacation and other leave ahead of time.
  - **Roles:** may open, may close, trained for special needs.
- **Barn och avdelningar:** for each unit, opening hours, enrolled children and children per adult. On/off for the opening/closing unit, with room, times and ratio. Special-needs children are counts only: unit, days and times.
- **Vikarier:** a 5-person substitute pool table showing name and phone (plus any existing booking), training/role chips (Särskilt stöd / Får öppna / Får stänga), weekday toggles, and "Föredragen för" unit chips. All are toggleable.
- **Regler:** each rule has a code chip (R1…), the plain-words label, "how it is checked", an on/off toggle, parameter steppers, and **"gäller från vecka"** (versioning). "Lägg till regel" adds from `ADDABLE`.

### 3. Phone app — `Staff App.dc.html` (iPhone frame from `ios-frame.jsx`, 402×874)
Opened from **Personalens telefon** in the planner, with a person picker ("Telefon för") that includes substitutes.
- **Mitt schema (staff):**
  - A week strip with a mini bar per day showing when the shift is.
  - Today's times, shift parts and unit.
  - Action grid (2×2, 44 px buttons): **Sjuk** (red outline `#E8B4B1` / `#C2413D`), **Byt pass**, **Täck del av pass**, **Kan inte arbeta**.
  - A banner when colleagues ask for help.
- **Bottom bar:** *Mitt schema* and *Vem arbetar* with a round 60 px button between them, raised on a small white hill above the bar, with a simple person icon (round head, torso). It is teal; dark `#1F2D3A` with a light ring while its page is open.
- **Jag (the round button): overview and settings for the worker.**
  - Header: initials avatar, name, home unit, contract hours a week and %, and tags: may open, may close, trained for special needs, fixed days off, earliest/latest time.
  - **Week card** with ‹ › to move between weeks: hours scheduled of the week's target (the contract, less any extra hours from the week before), a progress bar (amber when over), a plain sentence (exactly your contract / X more, next week is that much shorter / X fewer / last week was longer so this one is shorter / no schedule yet), a mini bar per weekday with hours or Sick/Holiday/Off, and the split: with children, planning (of the planning target), meeting, break.
  - **Month card** (weeks whose Thursday is in the month): each week's hours of target with a bar, or "Not scheduled yet"; tapping a week shows it above. Total so far, and days sick / on holiday / away.
  - **Settings**, kept per person (`state.phonePrefs[id]`): requests to cover a shift (when off, `coverCands()` skips the person with "Does not want requests"), changes to my schedule, reminder the evening before. A note says the contract, unit and times are changed by the planner.
- **Vem arbetar:** everyone working that day grouped by unit, own unit first. Off and away people are listed at the bottom. Others' sickness shows as "Frånvarande".
- **Täck del av pass sheet:** From/To steppers (±15 min, clamped to own shift), reason chips (Läkarbesök / Tandläkare / Hämta barn / Annat) plus free text marked "Syns bara för rektor", a preview of who it goes to with rule explanation, and Skicka.
- **Inkorg:** "Kan du ta över?" offers with **Ta passet** / **Avböj**, then the status (waiting for principal / approved / declined). Below are notes (published weeks, changed shifts, approvals) and the person's own requests with their status.
- **Substitute view** (when the picked person is a substitute):
  - Dark header `#1F2D3A`.
  - **Erbjudanden:** "Ledigt pass" cards with day, a big mono time, unit chip, needs tags, sent time, and **Ta passet** / **Avböj** (48 px).
  - **Mina pass:** each day with range, unit, a Confirmed / Waiting badge, the shift parts, and "Du arbetar med" (colleagues in that unit with their times).
  - Inbox notes.

---

## Design tokens
**Type:** IBM Plex Sans 400/500/600/700, IBM Plex Mono 500/600. Sizes used: 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 28 px. Section labels are 12 px/600 uppercase, letter-spacing .06em.

**Neutrals:** ink `#1F2D3A` · secondary `#3C4B5A` · muted `#5A6B7A` · faint `#8796A5` · border strong `#C9D5E0` · border `#D3DDEA` · divider `#E3EAF0` · subtle bg `#EEF3F6` · panel bg `#F7FAFB` / `#F4F7F9` · strip bg `#EEF4F7` · white.

**Accent:** `#1F7D97` (primary buttons, links), hover `#16627A`, light `#EAF6F8` / `#DDF1F5`, border `#9FCFDB`, bright `#2B91AD`.

**Shift types:** Barntid (contact) `#CDECEF` / `#134E5E` · Rast (break) `#FFDAD8` / `#7A2A26` · Planering (planning) `#D8F4C0` / `#2F5A17` · Möte (meeting) `#D3DDEA` / `#2A3A52`.

**Units:** Blåbär B `#C9DDF5` / `#1E3F73` · Lingon L `#FFD3D0` / `#8E2A27` · Hjortron H `#FFE3B8` / `#7A4A0C`. Units must be data-driven; there will be more than three.

**Status:** ok `#E2F6D4` / `#2D6A1F` · under `#FFDAD8` / `#8E2A27` · over / warning `#FFF1CF` / `#6B5214` · error `#E5534B`, `#C2413D`, `#B33A35` · amber badge `#D9A23A`.

**Fill bar:** green `#6CC24A` · low `#F59A93` · non-child `#8E6CCF` on `#ECE6F5` · over `#5B3F9E` · sick stripes `#F2A9A3` / `#FBE3E1` · divider `#1F2D3A`.

**Calendar cells:** working `#9FD8DE` · sick `#F28C84` · vacation `#9DB8E8` · other leave `#E3CFA4` · fixed day off `#EEF3F6` · no shift white with an inset `#D3DDEA` ring · no data hatched `#F4F7F9`.

**Radius:** 3 (bar/cells), 4–6 (chips, buttons), 8 (inputs, lists, cards), 10–12 (panels, phone cards), 14 (demo caption), 999 (badges).

**Shadows:** popover `0 16px 40px rgba(15,30,45,.18)` · drawer `-16px 0 40px rgba(15,30,45,.12)` · selected-tab `0 1px 2px rgba(15,30,45,.12)` · selection ring `0 0 0 2px #1F2D3A` · warning ring `0 0 0 2px #D9534F`.

**Touch:** the planner is used on an iPad, so hit targets are at least 32 px in the top bar and at least 44 px on the phone. Use pointer events, not mouse events.

## State / backend requirements (production)
- Server-side persistence for units, staff, substitutes, shifts, absences, requests, free shifts, rules (versioned), and notes. The prototype stores everything in `localStorage` key `schema-demo-v5`.
- Run the rule engine server-side and share it with the client, so warnings are computed in one place.
- Real-time updates between the phone and planner (WebSocket or push). Push notifications to staff and substitutes. A real 15-minute timer for the cascade.
- Roles and privacy: the reasons for sickness and cover are visible only to the principal. Store no child names.
- Integrations: HR import, the child register (Edlevo, PDF or CSV), payroll export (worked hours, sick hours, substitute hours), and ICS export.
- Audit log of changes (who moved which shift when).

## Assets
No images or icons. The only glyphs are text characters (‹ › × ▶ ⏩ ▾ ▴). The fonts are IBM Plex Sans and Mono from Google Fonts. The iPhone frame in `ios-frame.jsx` is a prototype-only bezel.

## Files (`web/`, `solver/`, `tests/`)
- `Schedule Demo.dc.html` — planner, Notiser, Sjuk och vikarier drawer, demo autoplay; mounts settings and phone.
- `Demo Settings.dc.html` — settings shell and menu; General, Import/Export, Children & units, Substitutes.
- `Demo Settings Staff.dc.html` — staff list and person detail (calendar, hours, contract, availability, leave, roles, phone).
- `Demo Settings Rules.dc.html` — rules list, editing, versioning, add rule.
- `Staff App.dc.html` — phone app (staff + substitute views).
- `schedule-core-demo.js` — **domain model, seed data, rule engine, staffing need, cover/substitute logic, hours accounting, EN/SV strings, store with undo, drag controller.**
- `support.js` — runtime for `.dc.html` files (prototype only).
- `ios-frame.jsx` — phone bezel (prototype only).
- `Schema Demo.html` — self-contained offline build of the **original** prototype, before schedule generation was added; open it in a browser to click through.
- `Phone.dc.html` — the phone app on its own page (`?me=p1`, `?me=s1`, `&lang=en`). `index.html` — landing page.
- `solved-schedule.json` — weeks 41–52 solved ahead of time by OR-Tools for the demo data; used when the solver is not running.
- `solver/` — the OR-Tools solver (`schedule_solver.py`), a small HTTP server (`server.py`), and scripts to rebuild and check the saved schedule.
- `tests/` — tests for the shared logic, solver scenarios checked with the planner's own rules, and a browser walkthrough.

---

## Schedule generation with OR-Tools (added October 2026)

*A Swedish version of this section is in `DESIGN_HANDOFF.sv.md`.*

An empty week shows no warnings (they would only list what is missing). The demo starts with an empty schedule. Staff, units, substitutes and children data are made up and kept. The principal can have a schedule suggested, with the main design goal that **it must not feel like a black box**: the person scheduling (think of an experienced administrator, not a programmer) should see what the suggestion is based on, be able to say what is different this week, and get a plain explanation of the result.

### Empty week
When the week on screen has no shifts, the schedule is dimmed and a card in front of it offers:
- **Make a suggestion for me**: opens the *Make schedule* form.
- **Draw it myself**: removes the card for that week; shifts are drawn by hand as before.
- **Copy week N−1**: only shown when the week before has a schedule.

The **Make schedule** button in the top bar opens the same form at any time.

### The Make schedule form (right drawer, 600 px)
1. **Which weeks?** Only this week, or 2, 4 or 7 weeks (cut off at the last demo week). If a week already has shifts, the form names the people who have them and offers two choices: **Keep them and fill in around them** (default), where those people keep their shifts and an opener/closer already set stays, and everyone else is scheduled to cover what is still missing; or **Start over: replace the whole week** (can be undone). This lets the principal schedule a few people by hand and have the rest filled in.
2. **Is anything different from usual?** A list of special days and absences in the chosen weeks, each removable, and four buttons that open a short form (week, weekday buttons, time or percentage from a list, optional note):
   - *Staff hope to finish early*, e.g. a concert. A **wish**: the solver tries, and the report says who could not and why.
   - *The preschool closes early*, e.g. the day before a holiday. No children and no staff after that time; the closer works until then.
   - *Fewer children than usual*, e.g. a school break: about 25–90 % of the children. Fewer adults are needed.
   - *Someone is away*: holiday, or a course or other. Saved as leave on the person (Settings › Staff), one entry per run of days.
   - *The preschool is closed*, e.g. a public holiday: no children and nobody works all day, and contract hours for the week shrink as for a day of leave. Public holidays that fall on weekdays in the chosen weeks are offered as one-click buttons (in the demo period: Christmas Eve and Christmas Day). Someone with a shift on a closed day gets a warning; no opener or closer is needed.
   Special days are stored as `special: [{ id, kind: 'finishBy'|'closeEarly'|'fewer'|'closed', week, days[], time?, pct?, note }]` and shown as a ★ note on the day in the planner.
3. **What the schedule follows**, read from Settings with a link to change each part: staff (contract hours, fixed days off, who may open or close), children (per unit: number, ratio, opening hours, children who need a trained adult), the rules that are on, and the **order of priority** when not everything fits:
   1. enough adults with the children **in every unit** (not only in the preschool as a whole), and a trained adult for children who need special support;
   2. everyone's contract hours, going over the weekly limit only if the children need it;
   3. wishes such as finishing early;
   4. planning time.

The footer button says what will happen (“Make schedule for weeks 42–43”) and roughly how long it takes (about 40 s per week; longer on a slower computer). While it runs, a progress bar shows which week is being made and the schedule cannot be edited.

### The report
After solving, the drawer shows per week, with ✓ or !:
- enough adults all day in every unit, or the times with too few (and a hint: a substitute, or adjust by hand);
- who helped in another unit than their own, and on which days;
- other broken rules, as in *Things to check*;
- contract hours: everyone on target, or who works more (because the children needed it) and who gets less. Hours over contract one week (also for part-timers) are taken back the next week; the report says who got a shorter week to even out, and who could not because the children needed them;
- the flexible week: who works a little over the limit and how short the next week must be;
- less planning time than usual, and for whom;
- each special day: included, or for *finish early* how many finish in time and who stays (e.g. “Ida Forsberg (closes)”).

**Undo the schedule** removes everything that was made, in one step. If the solver could not be reached, the weeks are loaded from the saved schedule; a note says so, and special days are listed as *not included*.

### The flexible week (rule R2)
No more than 40 hours in a week, or up to `flex` hours more (default 2, settable 0–4 in Settings › Rules) if the **next** week is that much shorter: 41 then at most 39, 42 then at most 38.
- The planner warns on both weeks if the next week is not shorter, and above 40 + `flex` as a plain rule break.
- The solver only goes over when the children would otherwise have too few adults. Going over is tiring, so every quarter hour over costs, and doubly so past one extra hour.
- Weeks are made in order, so a week after a long one gets a lower target and cap. An already scheduled next week also limits how far a week may go over.

### How the solver works
- `solverProblem(state, weeks)` in `schedule-core-demo.js` turns the app's data into one self-contained problem per week. Per person: home unit, may open/close, trained for special needs, contract and planning minutes, available days, earliest/latest time, the weekly cap. Per day and 15-minute slot: adults needed (from the same children forecast and ratios the planner shows, adjusted for special days and the *minimum adults* rule), the closing slot, the finish-by slot, and the slots where a trained adult must be in a unit. The rules from Settings that are on are passed along.
- **No names, phone numbers, reasons for absence or notes are sent.** People are ids (`p1`); absences are only “not available that day”.
- `solver/schedule_solver.py` (OR-Tools CP-SAT) models every person-day as 15-minute slots of time with children, break or planning. Hard: one continuous shift of 4–9 h inside availability, breaks of the rule's length inside the shift (more if the *breaks* rule asks), no more than the rule's hours without a break, the optional daily limit, rest between days, planning in one block of at least 30 min, the weekly cap, an opener at opening and a closer at closing (or at an early closing). Each working day a person is in one unit, their own or another; helping elsewhere costs a little, so it happens only when a unit would otherwise be short. Every unit's need (outside the merged opening and closing hours) counts as strictly as the total. Everything else is a weighted cost, in the priority order above.
- It solves each day first with an even share of the week's hours, then the whole week from that starting point so hours can move between days; the week is kept only if it is better than the days put together.
- Each step gets a fixed amount of work (CP-SAT's deterministic time), not a number of seconds, so a slow computer reaches the same quality and just takes longer, with a generous clock limit as a safety net. With a seconds limit, a slow computer got much worse schedules.
- `solver/server.py` serves `POST /solve`. The page calls `http://localhost:8000` (or `?solver=…`).
- Every result is checked with the planner's own rule engine in the tests (`tests/`); the saved schedule for weeks 41–52 has no warnings and everyone gets their contract hours.

### What the demo does not do
It is a demo and a guide, not a product:
- no login or roles; anyone who opens it sees everything, including sick reasons;
- data lives only in the browser's local storage, and only made-up data belongs in it;
- the solver server has no access control or limits and is meant to run locally;
- the solver uses fixed weights; a real product would let the organisation tune them, and might add wishes per person (e.g. only some staff need to finish early) and fixed events such as a staff meeting.

See *State / backend requirements* above for what a real system needs.

