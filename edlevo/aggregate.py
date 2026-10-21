"""Counts children per department per 15 minutes from Edlevo calendar events, and keeps nothing else.

This is the step that would run INSIDE the municipality's own systems: it reads the responses of the
Tieto Education Calendar API v2 (GetPreschoolCalendarEvents, one response per child), and writes a file
with only the number of children in each department in each quarter of an hour. Child ids (GUID or
personal number) are used only to avoid counting a child twice in the same quarter, and are thrown away;
they never reach the output, and the schedule planner never sees them.

    python3 edlevo/aggregate.py edlevo/mock -o web/edlevo-counts.json
    python3 edlevo/aggregate.py svar1.xml svar2.xml ... -o barnantal.json

A child counts in a quarter if any part of their booked time falls in it, so the count is the most
children who can be there during that quarter. Only the standard library is used, so it runs on any
Python 3.9+. (In production, parse untrusted XML with defusedxml.)
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime

NS = {"c": "http://open.tieto.com/edu/calendarevent/v2"}
FORMAT = "barnantal-v1"
DAY_START, DAY_END, SLOT = 6 * 60, 18 * 60 + 30, 15  # the planner's day: 06:00-18:30
SLOTS = (DAY_END - DAY_START) // SLOT


def _when(text):
    """An xs:dateTime as Swedish wall-clock time. The API's examples have no time zone; a time with one
    (e.g. UTC, "...Z") is converted to Europe/Stockholm, so 04:20Z in October counts as 06:20."""
    text = text.strip()
    t = datetime.fromisoformat(text[:-1] + "+00:00" if text.endswith("Z") else text)  # "Z" for Python < 3.11
    if t.tzinfo is None:
        return t
    try:
        from zoneinfo import ZoneInfo
        return t.astimezone(ZoneInfo("Europe/Stockholm")).replace(tzinfo=None)
    except Exception as e:  # Windows without the tzdata package has no time zone database
        raise ValueError(f"The time {text} has a time zone, and Swedish time cannot be worked out here ({e}). Install tzdata.")


def _files(paths):
    for p in paths:
        if os.path.isdir(p):
            yield from sorted(os.path.join(p, f) for f in os.listdir(p) if f.lower().endswith(".xml"))
        else:
            yield p


def aggregate(paths):
    """Returns the counts document. Child ids live only in local variables while one file is read."""
    present = defaultdict(lambda: defaultdict(lambda: [set() for _ in range(SLOTS)]))  # date -> dept -> slot -> ids
    departments, units, enrolled = {}, {}, defaultdict(set)
    files = events = clipped = 0
    asked = {}
    first = last = None
    for path in _files(paths):
        root = ET.parse(path).getroot()
        if root.tag != "{%s}calendarevents" % NS["c"]:
            raise ValueError(f"{path}: not a Calendar API v2 response (root is {root.tag})")
        files += 1
        # The period asked for (a day in it without bookings has no children, e.g. when closed).
        tf = root.find("c:properties/c:timeframe", NS)
        if tf is not None:
            for k in ("start", "end"):
                x = _when(tf.findtext("c:" + k, "", NS)).date().isoformat()
                asked[k] = min(asked.get(k, x), x) if k == "start" else max(asked.get(k, x), x)
        for ev in root.findall("c:calendarevent", NS):
            pre = ev.find("c:preschoolcalendarevent", NS)
            if pre is None:
                continue  # a school event, not preschool
            child = pre.findtext("c:childid", "", NS).strip()
            dept = (pre.findtext("c:departmentname", "", NS) or "").strip() or "(utan avdelning)"
            departments.setdefault(dept, (pre.findtext("c:departmentid", "", NS) or "").strip())
            enrolled[dept].add(child)
            units.setdefault(ev.findtext("c:unitid", "", NS).strip(), ev.findtext("c:unitname", "", NS).strip())
            start, stop = _when(ev.findtext("c:start", "", NS)), _when(ev.findtext("c:stop", "", NS))
            if stop <= start:
                continue
            events += 1
            day = start.date().isoformat()
            first, last = min(first or day, day), max(last or day, day)
            a = start.hour * 60 + start.minute
            b = (stop.hour * 60 + stop.minute) if stop.date() == start.date() else 24 * 60
            if a < DAY_START or b > DAY_END:
                clipped += 1
            for i in range(SLOTS):
                s0 = DAY_START + i * SLOT
                if a < s0 + SLOT and b > s0:
                    present[day][dept][i].add(child)
    counts = {day: {dept: [len(ids) for ids in slots] for dept, slots in sorted(depts.items())}
              for day, depts in sorted(present.items())}
    children = {dept: len(ids) for dept, ids in enrolled.items()}
    del present, enrolled  # the ids are gone from here on
    return {
        "format": FORMAT,
        "about": "Antal barn per avdelning och kvart, sammanräknat från Edlevo (Calendar API v2). Inga barn-id.",
        "made": datetime.now().replace(microsecond=0).isoformat(),
        "slotMinutes": SLOT, "dayStart": "06:00", "dayEnd": "18:30",
        "period": {"start": asked.get("start", first), "end": asked.get("end", last)},
        "responses": files, "events": events, "outsideDay": clipped,
        "units": [{"unitid": k, "unitname": v} for k, v in units.items()],
        "departments": [{"departmentid": v, "departmentname": k, "children": children[k]} for k, v in sorted(departments.items())],
        "counts": counts,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("paths", nargs="+", help="response files (.xml) or folders of them")
    ap.add_argument("-o", "--out", help="where to write the counts (default: print)")
    args = ap.parse_args()
    doc = aggregate(args.paths)
    text = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)
    print(f"{doc['responses']} responses, {doc['events']} events, {len(doc['counts'])} days, "
          f"departments: {', '.join(d['departmentname'] for d in doc['departments'])}. No child ids in the output.",
          file=sys.stderr)


if __name__ == "__main__":
    main()
