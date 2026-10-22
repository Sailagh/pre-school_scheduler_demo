# How the demo handles sick days: a brief for review

This describes the sick-cover flow in the preschool scheduling demo "Förskolans schema" as it is built now, after the review in `sick-cover-feedback.md`. It is meant to be checked by someone who knows how Swedish municipalities staff preschools. All names and numbers in the demo are made up.

The flow is a description of the need and of how the work could flow, for Medvind/Visma to compare with their own functions for sick leave. It is not meant to replace Medvind.

**Where the code is:**
- `web/schedule-core-demo.js`: the block starting at `reportSick`, plus `personRules()` for the rule check.
- `web/Schedule Demo.dc.html`: the substitute desk.
- `web/Staff App.dc.html`: the phone.
- `tests/core.test.mjs`: tests for each step.

## Who does what

| Role | What they do here |
|---|---|
| Staff member (ordinarie personal) | Reports sick in the phone app (**Sjuk**), for the whole day or from a given time. The planner can also mark someone sick. |
| **Rektor** (the principal) | Works in **Vikarieförmedling** (the substitute desk) in the Rektor view. Covers in-house first, by asking colleagues. Decides how much is needed from outside and publishes it. |
| **Bemanning** (the staffing unit) | Works in the same desk in the Bemanning view. Handles published free shifts, compares offers and awards them. If a shift is not covered in time, picks the next step. The view shows one preschool, but is labelled so it is clear it could be shared by several. |
| Colleagues already working that day | Get a question on their phone (start earlier, stay later, or open or close instead) and answer **Ja** or **Nej**. |
| Substitutes (vikarier, a pool of 5 in the demo) | Get the call on their phone and offer the whole time, part of it, or say no, before a deadline. |

In the demo a simple switch at the top of the desk ("Visa som: Rektor / Bemanning") changes the view. There is no login.

## The flow, step by step

The flow follows the Contract Net Protocol: the need is announced, the agents answer with offers, and a manager awards. Here a person is the manager at each step.

> R. G. Smith, "The Contract Net Protocol: High-level communication and control in a distributed problem solver," *IEEE Transactions on Computers*, vol. C-29, no. 12, pp. 1104–1113, 1980.

### 1. Sick report → draft
- **What is reported:** a sick report covers the whole day, or starts at a given time ("went home sick at 11:00"; the phone has *Hela dagen* / *Från en tid*).
- **Partial days:** the person's shifts are split at that time. The hours before stay worked time, and only the rest of the shift becomes the free shift.
- **Draft:** the free shift is a `draft`, and nothing is sent yet. It keeps the sick time, the unit and what the time needs (opening, closing, an adult trained for special needs).
- **Undo:** taking the sick report back restores the person's day exactly as it was. It also undoes colleagues' changes.

### 2. Where are adults missing?
`shortfall()` compares the adults needed with the adults present for every 15 minutes:
- per unit, and for the whole preschool while the units are merged early and late;
- it ignores the shifts of people who are sick or on leave.

### 3. Cover from inside: ask colleagues (Rektor)
`internalOptions()` suggests up to 6 changes for colleagues who already work that day:
- start earlier or stay later to fill a gap (15 minutes to 3 hours), within their earliest and latest times;
- take over the opening or closing.

**Every suggestion is checked against the planner's rules** (`personRules`, the same code the planner uses for its "Att kontrollera" list). The suggestion is tried on a copy of the schedule, and kept only if it adds no rule warning. The checks are:
- rest between days;
- the weekly limit (with flex);
- the 4-week average;
- availability;
- the longest stretch of work without a break;
- break length and the number of breaks;
- the daily maximum, if that rule is on.

If a longer day would mean more than 5 hours without a break, the break is moved, or a new one is cut out of time with the children (`placeBreaks`). The day keeps its start, end and minutes. If no break fits, the change is not suggested. The text says what happens, for example "Tove Ek stannar till 13:30 i stället för 13:00 (+0,5 h), 0,5 h över avtalet denna vecka, med rast 10:30".

**Asking:**
- **Fråga** sends the suggestion to the colleague's phone ("Rektor frågar om du kan hjälpa till: Börja 06:00 i stället för 06:15 och öppna"). It shows the extra time and how far over contract it goes, and the colleague answers **Ja** or **Nej**.
- The desk shows each question's status: *Väntar på svar*, *Ja, inlagt i schemat*, *Nej*, *Dragen tillbaka*, *Går inte längre*.
- **Only a yes changes the schedule.** The yes is checked against the rules again, since the schedule may have changed. If it no longer fits, the question is marked *Går inte längre* with the reason.
- A no leaves the schedule and the gap as they were.
- A colleague who has been asked once is not suggested again for the same day.
- Rektor can still change the schedule by hand ("Eller ändra själv i schemat").

### 4. How much is needed from outside (Rektor)
- **Default window:** from the first to the last gap in the sick person's unit, inside their shift.
- **Limits:** never shorter than the **shortest substitute shift** (default 3 h, settable 1–8 h) and never outside the shift.
- **Adjusting:** Rektor can move it in 15-minute steps, choose **Hela passet**, or **Bara där det saknas nu**.
- **No gaps:** the case can be closed with **Klart utan vikarie**.

### 5. Publish (a human step, Rektor)
- **Publishing:** **Publicera till vikarier (n)** hands the shift to Bemanning and sends the call to every substitute who can take part of it. Eligible means all of these:
  - available that weekday;
  - trained or allowed to open or close, where the window needs it;
  - free for at least the shortest shift inside the window;
  - the rest rule is met.
- **Unanswered questions:** questions to colleagues that are still unanswered are withdrawn.
- **Deadline:** a **response deadline** is set: publishing time + a setting (Inställningar › Vikarier › *Svarstid för vikarier*, 15 minutes by default).
- **Automatic publishing:** a note on the card says a real system could publish automatically, without this step.
- **Late warning:** if the shift has already started, or starts in less than 30 minutes, a warning says so. It does not block.

### 6. Offers (substitutes' phones)
- **What they see:** "Ledigt pass" with the day, time, unit and needs, and when they are free inside it.
- **Answers:**
  - **Erbjud hela tiden**;
  - **En del av tiden** (from/to, at least the shortest shift);
  - **Kan inte**.
- **Changing:** an offer can be changed until someone is awarded the shift.

### 7. Award (a human step, Bemanning)
- **The desk shows:** the deadline with a countdown ("Svar senast 06:59 · 11 min kvar"), and each offer with a bar for what it covers.
- **Suggestion:** a combination is ticked (`suggestOffers()`): one offer covering everything, preferred substitute first; otherwise offers added by how much uncovered time each adds. The card says what the chosen offers leave uncovered.
- **Rule check before awarding (`awardIssues`):**
  - each winner takes the sick person's time inside their offer, as time with the children;
  - a piece longer than 5 hours gets its own break, placed so no part is longer than 5 hours. The sick person's break is kept if it already does that;
  - if awarding would break a rule, the desk lists why and **Tilldela** is refused.
- **After awarding:** winners get "Passet är ditt", the others a thank-you.
- **Late warning:** the same warning as at publishing, if it is late.

### 8. Not covered in time: next step (Bemanning)
When the deadline has passed, nobody could be asked, or everyone has answered, and the offers still leave time uncovered, the desk shows **"5. Inte täckt i tid: nästa steg"**. The choices are:
- **Skicka till kommunens vikarieportal (Open-E)**;
- **Fråga en förskola i närheten**;
- **Annat, till exempel ringa in någon**.

The choice is logged. In the demo it is a marked step, not a real integration. For the demo there are also buttons to simulate substitutes' answers and to jump to the deadline.

## Rule warnings on the desk
The desk shows the planner's current rule warnings for everyone involved in the case: colleagues who said yes and substitutes who were awarded. So a manual change in the schedule that breaks a rule shows up on the desk too.

Substitutes are now part of the planner's rule check. Before, only regular staff were checked.

## Privacy
- Substitutes see only "Ledigt pass", never who is sick or why.
- Colleagues see "Frånvarande". A colleague who is asked to help sees only "En kollega är sjuk", not who.
- Only the person and the principal see "Sjuk".
- The demo has no login, so in practice whoever opens it sees everything.
- The schedule solver gets no names, no phone numbers and no absence reasons.

## Hours and pay
- **Sick time:** not worked time. It is shown as sick hours and sick days. A partial sick day counts its hours before the start time as worked, and the rest as sick.
- **Substitutes:** have no contract. Their hours appear separately in the export.
- **Extra time inside:** counted as worked time and shown as hours over contract.

## What changed after the review

| Feedback item | Now |
|---|---|
| 1. Never break the Working Hours Act | Every internal suggestion and every award is checked with the planner's rule check. Breaks are moved or added, or the change is not suggested; an award that breaks a rule is refused. Substitute pieces over 5 h get a break. The desk shows rule warnings for the people involved. Tests: a 7 h substitute piece gets a break; a colleague's longer day gets a break or is not suggested. |
| 2. Ask colleagues | Suggestions are questions to the colleague's phone (Ja/Nej). The desk shows the status. Only a yes is written; a no leaves the gap. |
| 3. Deadline and escalation | Settable deadline, countdown, and a next-step list (Open-E portal, a preschool nearby, other) when it is not covered in time. Simulated answers kept. |
| 4. Sick from a given time | The phone has *Hela dagen* / *Från en tid*. Hours before stay worked. |
| 5. Late warnings | A warning when publishing or awarding after the shift has started or within 30 minutes of it. Not blocking. |
| Roles on the desk | *Visa som: Rektor / Bemanning*. Bemanning's view is labelled as one that could be shared by several preschools. |
| Positioning | The desk and the documents describe the flow as something to compare with Medvind's own functions, not a replacement. |
| Report reference | Smith (1980), above. |

## Limits that remain
These need HR or collective-agreement expertise. They are kept as open questions for the municipality and are not modelled:
1. **Mertid and övertid.** "Over contract" does not tell mertid (part-time staff working more) from övertid (full-time), and no compensation or limits under the collective agreement (AB) are applied.
2. **Booking hourly substitutes.** No rules for minimum hours, notice, or LAS consequences of repeated bookings.
3. **Matching.** No fairness between substitutes, no travel between preschools, no continuity across days.
4. **Long sick leave.** Planned one day at a time: several days are one case per day.
5. **Kind of staff.** It does not consider which kind of staff is missing (barnskötare or förskollärare).

Two simplifications in the demo:
- **Deadline clock:** the deadline counts down in real minutes from the moment of publishing, while the demo's own story times start at 06:40.
- **"Today":** the late warning is only shown for a sick report made for the same day.

## Questions for review
- Is 15 minutes a sensible default deadline, and should it depend on how soon the shift starts?
- Should the next step after the deadline be automatic (for example, always send to Open-E), or always a person's choice?
- When a colleague says yes, should Rektor confirm before it goes into the schedule, or is the colleague's yes enough?
- What does the collective agreement (AB) say about asking someone to start earlier or stay later at short notice?
