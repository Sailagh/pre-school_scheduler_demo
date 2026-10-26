"""Tests for edlevo/aggregate.py: counts are right, and no child id ever reaches the output.

Run:  python3 -m unittest tests/test_edlevo.py      (standard library only)
"""

import json
import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "edlevo"))
from aggregate import aggregate  # noqa: E402

A, B = "{11111111-aaaa-4aaa-8aaa-111111111111}", "200101011234"  # a GUID and a personal-number style id


def event(child, start, stop, dept="Lingon"):
    return (f"<calendarevent><start>{start}</start><stop>{stop}</stop><unitid>{{u}}</unitid><unitname>Förskolan</unitname>"
            f"<preschoolcalendarevent><childid>{child}</childid><departmentid>{{d}}</departmentid>"
            f"<departmentname>{dept}</departmentname></preschoolcalendarevent></calendarevent>")


def response(*events):
    return ('<?xml version="1.0" encoding="utf-8"?><calendarevents xmlns="http://open.tieto.com/edu/calendarevent/v2">'
            "<properties><datetime>2026-10-21T10:00:00</datetime><datasource>test</datasource>"
            "<timeframe><start>2026-10-19T00:00:00</start><end>2026-10-23T23:59:59</end></timeframe></properties>"
            + "".join(events) + "</calendarevents>")


class AggregateTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        files = {
            "a.xml": response(event(A, "2026-10-19T06:20:00", "2026-10-19T16:30:00"),
                              # the same child booked twice in the same quarter counts once
                              event(A, "2026-10-19T16:00:00", "2026-10-19T17:10:00")),
            "b.xml": response(event(B, "2026-10-19T09:00:00", "2026-10-19T12:00:00", "Blåbär"),
                              event(B, "2026-10-20T09:00:00", "2026-10-20T12:00:00", "Blåbär")),
        }
        for name, text in files.items():
            with open(os.path.join(self.dir, name), "w", encoding="utf-8") as f:
                f.write(text)
        self.doc = aggregate([self.dir])

    def test_counts_per_department_and_quarter(self):
        mon = self.doc["counts"]["2026-10-19"]
        slot = lambda h, m: (h * 60 + m - 360) // 15
        self.assertEqual(mon["Lingon"][slot(6, 0)], 0)
        self.assertEqual(mon["Lingon"][slot(6, 15)], 1, "06:20 is inside the 06:15 quarter")
        self.assertEqual(mon["Lingon"][slot(16, 15)], 1, "two bookings at once still one child")
        self.assertEqual(mon["Lingon"][slot(17, 0)], 1)
        self.assertEqual(mon["Lingon"][slot(17, 15)], 0)
        self.assertEqual(mon["Blåbär"][slot(9, 0)], 1)
        self.assertEqual(mon["Blåbär"][slot(12, 0)], 0, "a stop at 12:00 is not in the 12:00 quarter")
        self.assertEqual(len(mon["Lingon"]), 50, "06:00-18:30 in quarters")

    def test_no_child_id_in_the_output(self):
        text = json.dumps(self.doc, ensure_ascii=False)
        self.assertNotIn(A, text)
        self.assertNotIn(B, text)
        self.assertNotIn("childid", text)

    def test_period_and_departments(self):
        self.assertEqual(self.doc["period"], {"start": "2026-10-19", "end": "2026-10-23"}, "the period asked for")
        self.assertEqual({d["departmentname"]: d["children"] for d in self.doc["departments"]}, {"Blåbär": 1, "Lingon": 1})
        self.assertEqual(self.doc["responses"], 2)
        self.assertEqual(self.doc["format"], "barnantal-v1")

    def test_times_with_a_time_zone_are_counted_in_swedish_time(self):
        d = tempfile.mkdtemp()
        with open(os.path.join(d, "z.xml"), "w", encoding="utf-8") as f:
            f.write(response(event(A, "2026-10-19T04:20:00Z", "2026-10-19T14:00:00Z"),            # UTC: 06:20-16:00 in Sweden
                             event(B, "2026-10-19T06:20:00.000+02:00", "2026-10-19T16:00:00+02:00")))
        mon = aggregate([d])["counts"]["2026-10-19"]["Lingon"]
        slot = lambda h, m: (h * 60 + m - 360) // 15
        self.assertEqual((mon[slot(6, 0)], mon[slot(6, 15)], mon[slot(15, 45)], mon[slot(16, 0)]), (0, 2, 2, 0))

    def test_the_demo_counts_file_is_made_from_the_mock_and_has_no_ids(self):
        mock = os.path.join(ROOT, "edlevo", "mock")
        doc = aggregate([mock])
        with open(os.path.join(ROOT, "web", "edlevo-counts.json"), encoding="utf-8") as f:
            saved = json.load(f)
        self.assertEqual(doc["counts"], saved["counts"], "web/edlevo-counts.json is up to date with edlevo/mock")
        text = json.dumps(saved)
        for name in os.listdir(mock):
            with open(os.path.join(mock, name), encoding="utf-8") as f:
                child = f.read().split("<childid>")[1].split("</childid>")[0]
            self.assertNotIn(child, text)


if __name__ == "__main__":
    unittest.main()
