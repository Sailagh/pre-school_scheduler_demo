# Sick-cover flow: review feedback and change requests

Feedback on `sick-cover-review.md` (the brief describing the sick-cover flow in "Förskolans schema"). The flow is good and matches what the municipality told us. This file lists what to change, in priority order, and what to leave as documented limitations.

Relevant code: `web/schedule-core-demo.js` (block starting at `makeFree`, plus `shortfall()`, `internalOptions()`, `suggestOffers()`), `web/Schedule Demo.dc.html` (Vikarieförmedling desk), `web/Staff App.dc.html` (phone app).

## Keep as it is

- Internal cover first, then external substitutes.
- A person publishes and a person awards (human in the loop).
- Only eligible substitutes are asked (weekday availability, special-needs training, open/close rights, existing bookings, rest).
- Preferred substitute for the unit is suggested first.
- Partial offers, and the bar that shows what is still uncovered.
- Privacy: substitutes see only "Ledigt pass", colleagues see "Frånvarande", only the person and the principal see "Sjuk". The solver gets no names or absence reasons.
- Undo of a sick report.

## Change requests

### 1. Never create a schedule that breaks the Working Hours Act (highest priority)

Today only rest and the weekly limit are checked for internal extensions, and substitute shifts of 5 to 8 hours get no break of their own (brief, limits 4 and 5).

- Run the same rule check the planner uses on **every** internal suggestion and on **every** awarded substitute piece: rest between days, weekly limit, longest work without a break (default 5 h), daily maximum if set, break length.
- If extending a colleague's day means they would work more than 5 h without a break, move or add the break, or do not suggest that extension.
- Give every substitute piece longer than 5 h its own break, placed so no part of it exceeds 5 h without a break. If the sick person's break falls inside the piece, it may be kept if it satisfies this rule.
- Show a clear rule warning on the desk if a manual change breaks a rule, the same way the planner does.

Acceptance: no internal extension and no awarded substitute shift can be saved that fails the planner's rule check. Add a test for a 7 h substitute piece (gets a break) and for a colleague extended to 6 h without a break (blocked or break added).

### 2. Ask colleagues instead of changing their day directly

Today "Gör det" writes the extension straight into the schedule (brief, limit 2). The municipality's process, and what we described to them, is that colleagues are asked and the principal confirms.

- Turn each internal suggestion into a request sent to that colleague's phone app, using the same offer mechanism as for substitutes: the colleague sees the change (for example "Börja 06:00 i stället för 06:15 och öppna") and answers **Ja** or **Nej**.
- The desk shows the status per request: skickad, accepterad, avböjd.
- Only an accepted request is written into the schedule. The principal can still change the schedule by hand ("Eller ändra själv i schemat").
- Keep the extra time and "over contract" text visible to both the colleague and the desk.

Acceptance: an internal suggestion changes the schedule only after the colleague accepts. A declined request leaves the schedule unchanged and the gap remains.

### 3. Deadline and escalation

The key real-world problem is that the preschool opens at 06:00 but the administration only at 06:30, so cover must be found fast (brief, limit 6).

- Add a setting for a response deadline (for example "Svar senast 06:15").
- Show a countdown on the published card.
- When the deadline passes with the window not fully covered, show an escalation step with the next options, as a list the person picks from: send to the municipality's substitute portal (Open-E), ask a neighbouring preschool, other. In the demo this is a marked step, not a real integration.
- Keep the simulated-answer button for the demo.

### 4. Sick from a given time, not only whole days

"Went home sick at 11:00" is common (brief, limit 1).

- Let a sick report have a start time (default: whole day). The free shift then covers only the rest of the person's shift from that time.
- Hours worked before the start time stay as worked time.

### 5. Warn about late publishing and awarding

- Show a warning when publishing or awarding after the free shift has started, and when the start is very close (for example less than 30 minutes away). Do not block it.

## Leave as documented limitations (do not model)

These need HR or collective-agreement expertise. Keep them listed in the brief and in the handover document as open questions for the municipality:

- Mertid versus övertid, compensation and limits under the collective agreement (AB).
- Rules for booking hourly substitutes: minimum hours, notice, LAS consequences of repeated bookings.
- Fairness between substitutes, travel between preschools, continuity across days.
- Long sick leave planned as one block (several days are still one case per day).
- Which kind of staff is missing (barnskötare or förskollärare).

## Roles on the desk

From the meetings: the principal arranges cover in-house first. If that fails, a substitute is requested through the municipality's portal (staff call it Open-E), where an administrator in the staffing unit assigns someone.

- Show the two roles in the demo: **Rektor** (internal cover, can publish) and **Bemanning** (handles published shifts, can award). A simple role switch is enough; no login needed.
- The Bemanning view may list free shifts from several preschools. One preschool in the demo is fine, but label the view so it is clear it could be shared.

## Positioning (for the UI text and the handover document)

The municipality's Medvind administrator mentioned that Medvind has a newer function for sick leave, and was cautious about outside suggestions for changing the system. Present this flow as a description of the needs and of how the work could flow, for Medvind/Visma to compare against, not as a replacement for Medvind. Avoid wording like "replaces" or "instead of Medvind".

## Report reference

The flow follows the Contract Net Protocol. Cite: R. G. Smith, "The Contract Net Protocol: High-level communication and control in a distributed problem solver," IEEE Transactions on Computers, vol. C-29, no. 12, pp. 1104-1113, 1980.

## When done

Update `sick-cover-review.md` so the limits list matches what is now handled, and tell me what changed per item above.
