"""Tests for medvind/medvind.py: reading the hand-typed times, flagging what cannot be read, and writing the layout back.

Run:  .venv/bin/python -m unittest tests/test_medvind.py      (needs openpyxl, installed by start.py)
"""

import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "medvind"))
from medvind import parse_range, read, write  # noqa: E402


class ParseTest(unittest.TestCase):
    def test_every_format_seen_in_a_real_export(self):
        cases = {"06.00-13.00": (360, 780), "8-16.30": (480, 990), "7.30-12.00": (450, 720), "9-19": (540, 1140),
                 "0630-1030": (390, 630), "06-10": (360, 600), "6.30-13": (390, 780), "07.30-16": (450, 960),
                 "6-14.30": (360, 870), " 7 - 13 ": (420, 780), "06:30–14:00": (390, 840), "6,30-13,00": (390, 780)}
        for raw, (a, b) in cases.items():
            x = parse_range(raw)
            self.assertEqual((x["from"], x["to"]), (a, b), raw)
            self.assertNotIn("flag", x, raw)

    def test_a_typo_is_read_but_flagged(self):
        x = parse_range("6.3014.0")
        self.assertEqual((x["from"], x["to"], x["flag"]), (390, 840, "guessed"))
        self.assertIn("06:30–14:00", x["note"])

    def test_what_cannot_be_read_is_flagged_not_guessed(self):
        for raw in ("7.30-", "ledig", "19-07", "25-26", "6.75-12"):
            x = parse_range(raw)
            self.assertEqual(x["flag"], "unread", raw)
            self.assertNotIn("from", x, raw)
        self.assertIsNone(parse_range(""))
        self.assertIsNone(parse_range(None))


class FileTest(unittest.TestCase):
    def test_the_invented_example(self):
        rot = read(os.path.join(ROOT, "medvind", "exempel-grundschema.xlsx"))
        self.assertEqual((rot["weeks"], rot["start"], len(rot["lines"])), (6, 4, 10))
        self.assertEqual({(f["cell"], f["kind"]) for f in rot["flags"]}, {("G4", "guessed"), ("I7", "unread")})
        self.assertEqual(rot["lines"][0]["unit"], "Avd 1")
        self.assertTrue(rot["lines"][-1]["extra"])
        self.assertIsNone(rot["lines"][4]["cells"][0][3], "the unreadable cell is left out")

    def test_write_then_read_gives_the_same_schedule(self):
        rot = read(os.path.join(ROOT, "medvind", "exempel-grundschema.xlsx"))
        path = os.path.join(tempfile.mkdtemp(), "ut.xlsx")
        write(rot, path)
        back = read(path)
        times = lambda r: [[[(x["from"], x["to"]) if x else None for x in w] for w in l["cells"]] for l in r["lines"]]
        self.assertEqual(times(back), times(rot))
        self.assertEqual((back["weeks"], back["start"]), (6, 4))
        self.assertEqual([l["label"] for l in back["lines"]], [l["label"] for l in rot["lines"]])
        self.assertEqual(back["flags"], [], "what we write can always be read")


if __name__ == "__main__":
    unittest.main()
