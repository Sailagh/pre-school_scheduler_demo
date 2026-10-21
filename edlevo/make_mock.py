"""Makes invented Edlevo children's schedules for the demo, in the exact shape the Tieto Education
Calendar API v2 returns them (GetPreschoolCalendarEvents, namespace http://open.tieto.com/edu/calendarevent/v2).

The API takes ONE child id per call, so there is one response file per child: edlevo/mock/svar-001.xml ...
Everything is made up: the GUIDs come from a fixed random seed, and no file holds a name or a personal number.

    python3 edlevo/make_mock.py            (writes edlevo/mock/, weeks 41-52 of 2026)

The schedules follow the pattern of a real Edlevo group schedule: about 18 children per department,
drop-off from 06:20 and pick-up by 17:30, some children with a regular day off ("Ledig"), some with
short 15-hour days (allmän förskola), the autumn break in week 44 and Christmas week with most children off.
The preschool is closed on Christmas Eve and Christmas Day, so those days have no events.
"""

import os
import random
import uuid
from datetime import date, datetime, timedelta
from xml.sax.saxutils import escape

NS = "http://open.tieto.com/edu/calendarevent/v2"
HERE = os.path.dirname(os.path.abspath(__file__))
FIRST, LAST = date(2026, 10, 5), date(2026, 12, 25)  # weeks 41-52
CLOSED = {date(2026, 12, 24), date(2026, 12, 25)}
UNIT = "Förskolan Solrosen"
# Department name (as the units are called in the demo), number of children, share with 15-hour days.
DEPARTMENTS = [("Avd 1", 16, 0.0), ("Avd 2", 18, 0.15), ("Avd 3", 20, 0.25)]

rng = random.Random(20261021)
guid = lambda: "{" + str(uuid.UUID(int=rng.getrandbits(128), version=4)) + "}"


def hm(minutes):
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def week_pattern(short):
    """A child's usual week: per weekday (start, stop) in minutes, or None for a day off."""
    if short:  # allmän förskola, 15 hours a week
        start = rng.choice([510, 540, 540])
        return [(start, start + 180)] * 5
    drop = rng.choice(range(380, 525, 5))          # 06:20-08:40
    pick = rng.choice(range(900, 1055, 5))         # 15:00-17:30
    if rng.random() < 0.15:                        # some start late, like 10:45-17:30 in the screenshot
        drop, pick = rng.choice([645, 525]), rng.choice([990, 1050])
    days = [(drop, pick) for _ in range(5)]
    if rng.random() < 0.2:                         # a regular day off
        days[rng.choice([0, 4])] = None
    if rng.random() < 0.3:                         # an early Friday
        days[4] = days[4] and (days[4][0], rng.choice([800, 870, 930]))
    if rng.random() < 0.25:                        # one day with other times
        d = rng.randrange(5)
        if days[d]:
            days[d] = (min(days[d][0] + 120, 645), max(days[d][1], 960))
    return days


def off_on(day):
    """Whether a child is booked off on `day` (holidays)."""
    if day in CLOSED:
        return True
    week = day.isocalendar()[1]
    if week == 44:                                 # autumn break
        return rng.random() < 0.35
    if week == 52:                                 # Christmas
        return rng.random() < 0.6
    return False


def response(child, dept, dept_id, unit_id, events):
    rows = []
    for start, stop in events:
        rows.append(
            "  <calendarevent>\n"
            f"    <start>{start:%Y-%m-%dT%H:%M:%S}</start>\n"
            f"    <stop>{stop:%Y-%m-%dT%H:%M:%S}</stop>\n"
            f"    <unitid>{unit_id}</unitid>\n"
            f"    <unitname>{escape(UNIT)}</unitname>\n"
            "    <preschoolcalendarevent>\n"
            f"      <childid>{child}</childid>\n"
            f"      <departmentid>{dept_id}</departmentid>\n"
            f"      <departmentname>{escape(dept)}</departmentname>\n"
            "    </preschoolcalendarevent>\n"
            "  </calendarevent>\n")
    return (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        f'<calendarevents xmlns="{NS}">\n'
        "  <properties>\n"
        "    <datetime>2026-10-21T14:10:42</datetime>\n"
        "    <datasource>Påhittad testdata för schemademon (inte från Edlevo)</datasource>\n"
        f"    <comments>GetPreschoolCalendarEvents Id={child} StartDate={FIRST} EndDate={LAST}</comments>\n"
        "    <schooltype>FS</schooltype>\n"
        "    <timeframe>\n"
        f"      <start>{FIRST}T00:00:00</start>\n"
        f"      <end>{LAST}T23:59:59</end>\n"
        "    </timeframe>\n"
        "  </properties>\n"
        + "".join(rows) + "</calendarevents>\n")


def main():
    out = os.path.join(HERE, "mock")
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith(".xml"):
            os.remove(os.path.join(out, f))
    unit_id, n = guid(), 0
    for dept, count, short_share in DEPARTMENTS:
        dept_id = guid()
        for i in range(count):
            child, pattern = guid(), week_pattern(i < round(count * short_share))
            events, day = [], FIRST
            while day <= LAST:
                times = pattern[day.weekday()] if day.weekday() < 5 else None
                if times and not off_on(day):
                    at = datetime(day.year, day.month, day.day)
                    events.append((at + timedelta(minutes=times[0]), at + timedelta(minutes=times[1])))
                day += timedelta(days=1)
            n += 1
            with open(os.path.join(out, f"svar-{n:03d}.xml"), "w", encoding="utf-8") as f:
                f.write(response(child, dept, dept_id, unit_id, events))
    print(f"{n} invented response files in {out}")


if __name__ == "__main__":
    main()
