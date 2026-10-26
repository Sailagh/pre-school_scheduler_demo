"""Solver tests: each scenario is built and checked with the web app's own code (tests/scenario.mjs).

Run:  .venv/bin/python -m unittest discover tests      (needs node and ortools; takes a few minutes)
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "solver"))
from schedule_solver import solve  # noqa: E402

LIMIT = float(os.environ.get("TEST_TIME_LIMIT", "20"))
NAMES = {"p1": "Anna", "p2": "Erik", "p3": "Fatima", "p4": "Maja", "p5": "Johan", "p6": "Tove", "p7": "Lena", "p8": "Ahmed",
         "p9": "Elin", "p10": "Mohammed", "p11": "Ida", "p12": "Peter", "p13": "Nora", "p14": "Hanna", "p15": "Gustav",
         "p16": "Leila", "p17": "Viktor", "p18": "Sofia"}


def node(*args):
    return json.loads(subprocess.run(["node", os.path.join(ROOT, "tests", "scenario.mjs"), *args],
                                     check=True, capture_output=True, text=True).stdout)


def solve_weeks(scenario, weeks, tmp):
    """Solves the weeks in order, each after the ones before it, like the planner does."""
    files = []
    for w in weeks:
        problem = node("problem", scenario, str(w), *files)
        sol = solve(problem, time_limit=LIMIT, parallel=1)
        sol["weeks"][0]["kept"] = problem["weeks"][0]["kept"]  # as the planner does
        path = os.path.join(tmp, f"{scenario}-{w}.json")
        with open(path, "w") as f:
            json.dump(sol, f)
        files.append(path)
    return node("check", scenario, *files)


class SolverTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def assertNoWarnings(self, week):
        self.assertEqual([w["text"] for w in week["warnings"]], [], f"week {week['week']}")

    def test_ordinary_week_follows_every_rule(self):
        (wk,) = solve_weeks("base", [42], self.tmp)
        self.assertNoWarnings(wk)
        for pid, mins in wk["hours"].items():
            self.assertLessEqual(abs(mins - wk["contract"][pid]), 15, pid)

    def test_special_days(self):
        (wk,) = solve_weeks("special", [42], self.tmp)
        self.assertNoWarnings(wk)
        texts = " ".join(i["text"] for i in wk["report"])
        self.assertIn("closes at 13:00", texts)
        late = [i for i in wk["report"] if "finish by 17:00" in i["text"]]
        self.assertEqual(len(late), 1)
        # Children stay until 18:30, so a few must work late, but not most of the staff.
        self.assertLessEqual(len(late[0].get("more", [])), 4)

    def test_rules_from_settings_are_followed(self):
        (wk,) = solve_weeks("rules", [42], self.tmp)
        self.assertNoWarnings(wk)

    def test_fills_in_around_shifts_made_by_hand(self):
        (wk,) = solve_weeks("partial", [42], self.tmp)
        self.assertNoWarnings(wk)
        saved = next(x for x in json.load(open(os.path.join(ROOT, "web", "solved-schedule.json")))["weeks"] if x["week"] == 42)
        mine = lambda shifts: sorted((x["staff"], x["day"], x["start"], x["end"], x["type"]) for x in shifts if x["staff"] in ("p1", "p2", "p3", "p4"))
        self.assertEqual(mine(wk["shifts"]), mine(saved["shifts"]), "the hand-made shifts are untouched")
        self.assertEqual(wk["roles"][0]["open"], "p3", "the opener set by hand stays")

    def test_closed_days(self):
        (wk,) = solve_weeks("holiday", [52], self.tmp)
        self.assertNoWarnings(wk)
        self.assertFalse([x for x in wk["shifts"] if x["day"] in (3, 4)], "nobody works on closed days")
        for pid, mins in wk["hours"].items():
            self.assertLessEqual(abs(mins - wk["contract"][pid]), 15, pid)

    def test_every_unit_is_covered_with_help_from_other_units(self):
        (wk,) = solve_weeks("lingon", [42], self.tmp)
        self.assertEqual([w["text"] for w in wk["warnings"] if w["kind"] == "staffing"], [])
        helped = [i for i in wk["report"] if i["text"].startswith("Help in another unit")]
        self.assertTrue(helped and any("→ Avd 2" in x for x in helped[0]["more"]), wk["report"])

    def test_children_counted_from_edlevo(self):
        (wk,) = solve_weeks("edlevo", [43], self.tmp)
        self.assertNoWarnings(wk)
        for pid, mins in wk["hours"].items():
            self.assertLessEqual(abs(mins - wk["contract"][pid]), 15, pid)

    def test_flexible_week_evens_out(self):
        w42, w43 = solve_weeks("short", [42, 43], self.tmp)
        over = {pid: m for pid, m in w42["hours"].items() if m > 40 * 60}
        self.assertTrue(all(m <= 42 * 60 for m in over.values()), over)
        for pid, mins in over.items():
            self.assertLessEqual(w43["hours"][pid], 80 * 60 - mins, f"{pid} must work less in week 43")
        self.assertEqual([w["text"] for w in w42["warnings"] + w43["warnings"] if w["code"] == "R2"], [])
        self.assertEqual([w["text"] for w in w43["warnings"]], [])
        # Anyone over their contract in week 42, part-timers included, gets that much less in week 43,
        # unless the children need them; then the report must say so.
        explained = " ".join(" ".join(i.get("more", [])) for i in w43["report"] if "Could not get a shorter week" in i["text"])
        for pid, mins in w42["hours"].items():
            extra = mins - w42["contract"][pid]
            if extra > 15 and w43["hours"][pid] > max(0, w43["contract"][pid] - extra) + 15:
                self.assertIn(NAMES[pid], explained, f"{pid} worked {extra} min extra and was neither evened out nor explained")


if __name__ == "__main__":
    unittest.main()
