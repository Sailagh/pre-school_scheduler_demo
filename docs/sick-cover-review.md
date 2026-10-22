# How the demo handles sick days: a brief for review

This describes the sick-cover flow in the preschool scheduling demo "Förskolans schema" as it is built now, so it can be checked by someone who knows how Swedish municipalities staff preschools. All names and numbers in the demo are made up.

The code is in `web/schedule-core-demo.js` (the block starting at `makeFree`), the desk is in `web/Schedule Demo.dc.html`, and the substitute's phone is in `web/Staff App.dc.html`.

## Who does what

| Role | What they do here |
|---|---|
| Staff member (ordinarie personal) | Reports sick in the phone app (**Sjuk**). The planner can also mark someone sick. |
| Whoever arranges cover | Works in **Vikarieförmedling** (the substitute desk). This may be the principal (rektor) or a staffing function for several preschools, not necessarily the person who makes the schedule. |
| Colleagues already working that day | Can be asked to start earlier or stay later. In the demo the person at the desk applies this directly. The colleague is not asked first. |
| Substitutes (vikarier, a pool of 5 in the demo) | Get the call in the phone app and offer the whole time, part of it, or say no. |

## The flow, step by step

The flow is built like a call for proposals (a "contract net"): the need is published, substitutes answer with offers, and a person chooses.

### 1. Sick report → draft
- A sick report always covers the **whole day**: an absence from 00:00 to 24:00.
- That day's shifts become one **free shift** with status `draft`. Nothing is sent to anyone yet.
- The free shift keeps:
  - the full sick time (`full`);
  - the sick person's unit (`group`);
  - what the time needs (`needs`): opening, closing, an adult trained for special needs (särskilt stöd).
- Opening or closing counts as needed only if the sick person had that role that day **and** the window still includes the start or end of the shift.
- Special needs counts as needed only if the sick person is trained for it and a child needing it is in that unit then.

### 2. Where are adults missing?
- `shortfall()` compares adults needed with adults present for every 15 minutes of the day.
- Needed adults come from the children forecast, or from Edlevo booking counts, and the ratio of children per adult.
- It works per unit, and for the whole preschool while the units are merged in the early morning and late afternoon.
- It shows the result as time ranges with how many adults are missing. The shifts of people who are sick or on leave do not count.

### 3. Cover from inside (optional)
`internalOptions()` suggests up to 6 changes for colleagues who already work that day:
- **Start earlier** or **stay later** to fill a gap in the sick person's unit:
  - between 15 minutes and 3 hours of extra time;
  - only if the gap is next to their shift (within an hour);
  - inside their own earliest/latest times.
- **Take over opening or closing** if the sick person had it:
  - first from people who may do it and are already there then, at no extra time;
  - otherwise from someone who starts or ends within 2 hours of it.
- **Checks on every suggestion:**
  - rest between working days (default 11 h);
  - the weekly limit (default 40 h, plus a flex of 2 h if the next week is that much shorter).

  The text says how much over contract it puts the person that week. Example: "Peter Lindgren börjar 06:00 i stället för 06:15 och öppnar (+0,3 h), 0,3 h över avtalet denna vecka".
- **Order:** role take-overs first, then people from the same unit, then the least overtime, then the least extra time.
- **"Gör det"** writes the change into the schedule as extra time with the children in the sick person's unit, and the opening or closing role if one is included. The time needed from outside is then worked out again.
- The person can also change the schedule by hand ("Eller ändra själv i schemat").

### 4. How much is needed from outside
- **Default window:** from the first to the last gap in the sick person's unit, inside their shift. It is never shorter than the **shortest substitute shift** (default 3 h, settable 1–8 h) and never outside the shift.
- **If there are no gaps:** the window is the whole shift, and the person can close the case with **"Klart utan vikarie"** (status `covered`).
- **Adjusting:** the person can move the window in 15-minute steps, choose **"Hela passet"** (whole shift), or **"Bara där det saknas nu"** (work out the gaps again after moving colleagues).

### 5. Publish (a human step)
- A person presses **"Publicera till vikarier (n)"**. Status becomes `open`.
- **Who is asked:** substitutes who meet all of these:
  - available that weekday;
  - trained for special needs, and allowed to open or close, if the window needs it;
  - free for at least the shortest substitute shift inside the window (not working or booked elsewhere then);
  - the rest rule is met.

  A substitute who is busy for part of the window is still asked for the part they could take.
- **Who is not asked:** listed on the card with the reason (for example "Inte utbildad för särskilt stöd", "Arbetar redan då").
- **Note on the card:** a real system could publish automatically without this step. The demo keeps a person in the loop on purpose.

### 6. Offers from substitutes (phone app)
- **What the substitute sees:** "Ledigt pass" (free shift) with the day, the time, the unit and the needs, and when they are free inside it ("Du är ledig hela tiden" / "Du kan 10:30–13:30").
- **Answers:**
  - **"Erbjud hela tiden"**: the whole time, or the whole of their free part;
  - **"En del av tiden"**: their own from/to, at least the shortest substitute shift;
  - **"Kan inte"**: no.
- **Changing:** they can change the offer until someone is awarded the shift.

### 7. Award (a human step)
- The desk lists the offers with a bar showing what each covers. It ticks a suggestion (`suggestOffers()`):
  - one offer that covers the whole window, from a preferred substitute for that unit first;
  - otherwise offers added one at a time by how much uncovered time each adds.
- The card says what the chosen offers still leave uncovered. The person can change the choice.
- **"Tilldela (n)"** (status `awarded`) splits the sick person's shifts at the offer boundaries. Each winner takes over the sick person's shift pieces inside their offer:
  - planning and meeting time becomes time with the children;
  - **a break inside the offer goes to the substitute as it was**;
  - time not covered by any chosen offer stays uncovered.
- **Notes:** winners get "Passet är ditt", the others get a thank-you note.

### 8. Undo
Taking the sick report back gives the person their day back and removes the extra time added for colleagues.

## Privacy
- Substitutes see only "Ledigt pass", never who is sick or why. Colleagues see "Frånvarande".
- Only the person and the principal see "Sjuk".
- The demo has no login, so in practice whoever opens it sees everything.
- The schedule solver gets no names, no phone numbers and no absence reasons.

## Hours and pay
- **Sick time:** not counted as worked time. It is shown separately as sick hours and sick days.
- **Substitutes:** have no contract. Their hours appear separately in the export.
- **Extra time inside:** counted as worked time, and shown as hours over contract.

## Limits and simplifications (worth checking)
1. **Only whole-day sick reports.** Someone who goes home sick at 11:00, or is sick for part of a day, is not handled.
2. **Colleagues are not asked.** An extension of someone's day is written straight into the schedule. In reality they would need to agree, and short-notice changes may have rules (notice periods, extra pay).
3. **Overtime is just "over contract".** It does not tell mertid (part-time staff working more) from övertid (full-time), or apply any compensation or limits from the collective agreement (AB, kollektivavtal).
4. **Some rules are not checked for internal extensions.** Only rest and the weekly limit are checked. Not checked: the longest work without a break (default 5 h), the daily maximum, and breaks that must move when a day gets longer.
5. **Substitute shifts may have no break,** or one placed where the sick person had it. A 5–8 hour substitute shift is not given its own break.
6. **No deadline or reminders for offers.** In the demo, answers are simulated with a button. There is no "if nobody answers by 07:00" rule and no escalation (for example to a staffing agency or a neighbouring preschool).
7. **Matching is simple.** It looks at availability by weekday, special-needs training, open/close rights, existing bookings and rest. It does not consider:
   - fairness between substitutes;
   - minimum engagement or pay rules for hourly substitutes (timvikarier);
   - travel between preschools;
   - continuity (the same substitute on consecutive days);
   - LAS (employment protection) consequences of repeated bookings.
8. **One day at a time.** A sickness lasting several days creates one case per day, and long sick leave is not planned as a block.
9. **Same-day changes are not limited.** Nothing stops awarding after the shift has started, and there is no "too late to publish" warning.
10. **Ratios are the only staffing target.** "Adults missing" means below the children-per-adult target, or the rule for a minimum number of adults. It does not consider which kind of staff is missing (barnskötare or förskollärare).

## Questions for review
- Who usually arranges sick cover in a Swedish municipality: the principal, a central staffing unit (bemanningsenhet), or the staff themselves? Should the desk be shared by several preschools?
- Is it normal to cover only part of a day with a substitute? What is a realistic shortest substitute shift?
- Should a human always publish, or is automatic publishing acceptable, perhaps after a deadline?
- How should colleagues be asked to start earlier or stay later, and what does the collective agreement (AB) say about short-notice changes, mertid and övertid?
- What rules apply to booking hourly substitutes (minimum hours, notice, LAS days)?
- What should happen when nobody offers: a staffing agency, moving staff from another preschool, or asking parents to pick up early?
- Should a sickness of several days be handled as one case?
