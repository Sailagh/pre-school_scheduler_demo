"""Builds a week's staff schedule for the preschool demo with OR-Tools CP-SAT.

Input is the problem JSON made by `solverProblem()` in web/schedule-core-demo.js:
one entry per week with the staff (contract minutes, planning minutes, availability,
may open/close, special-needs training) and, per day, the adults needed in every
15-minute slot. Output is, per week, the shifts in the web app's format and the
opener/closer for each day.

Hard rules (as checked by the planner):
  - one continuous shift a day, 4-9 hours, inside the person's availability, and at most 40 hours a week
  - one 30-minute break, inside the shift, and nobody works more than 5 hours without one
  - planning time comes in blocks of at least 30 minutes, at most one block a day
  - the opener works from opening time and the closer until closing time
Soft goals, in order of weight: enough adults every slot, a special-needs trained adult
in the unit while a child with special needs is there, contract hours, planning hours,
time with children in blocks of at least 30 minutes, enough adults per unit, and not more
adults than needed.
"""

import os
from concurrent.futures import ThreadPoolExecutor

from ortools.sat.python import cp_model

MIN_SHIFT, MAX_SHIFT = 16, 36  # slots: 4 h and 9 h
BREAK_LEN = 2  # slots: 30 min
MAX_RUN = 20  # slots of work without a break: 5 h

W_SHORT, W_SN, W_ROLE = 1000, 1000, 1000
W_HOURS, W_PLAN, W_GROUP, W_OVER, W_LONE = 60, 20, 30, 4, 40
WEEK_MAX = 160  # slots: the 40-hour week


def _build(problem, wk, days, targets):
    """Model for `days` of a week; `targets[pid]` is (work slots, planning slots) over those days."""
    n, slot, day_start = problem["slots"], problem["slot"], problem["dayStart"]
    m = cp_model.CpModel()
    cost = []
    contact, brk, plan, work = {}, {}, {}, {}
    opener, closer = {}, {}

    for p in wk["staff"]:
        pid = p["id"]
        for d in days:
            if not p["days"][d]:
                continue
            first = 0 if p["earliest"] is None else max(0, -(-(p["earliest"] - day_start) // slot))
            last = n if p["latest"] is None else min(n, (p["latest"] - day_start) // slot)
            c = [m.new_bool_var("") for _ in range(n)]
            b = [m.new_bool_var("") for _ in range(n)]
            pl = [m.new_bool_var("") for _ in range(n)]
            wv = [m.new_bool_var("") for _ in range(n)]
            on = m.new_bool_var("")
            for t in range(n):
                m.add(c[t] + b[t] + pl[t] == wv[t])
                if t < first or t >= last:
                    m.add(wv[t] == 0)
            m.add(sum(wv) >= MIN_SHIFT).only_enforce_if(on)
            m.add(sum(wv) <= MAX_SHIFT * on)
            # One continuous block of work.
            starts = [m.new_bool_var("") for _ in range(n)]
            for t in range(n):
                m.add(starts[t] >= wv[t] - (wv[t - 1] if t else 0))
            m.add(sum(starts) <= 1)
            # Breaks: exactly BREAK_LEN slots each, strictly inside the shift.
            bs = [m.new_bool_var("") for _ in range(n)]
            for t in range(n):
                m.add(b[t] == sum(bs[max(0, t - BREAK_LEN + 1):t + 1]))
                if t + BREAK_LEN > n:
                    m.add(bs[t] == 0)
                if t == 0 or t == n - 1:
                    m.add(b[t] == 0)
                else:
                    m.add_implication(b[t], wv[t - 1])
                    m.add_implication(b[t], wv[t + 1])
                    # Two breaks back to back would read as one long break.
                    m.add_implication(bs[t], b[t - 1].Not())
            m.add(sum(bs) <= 1)
            # No more than MAX_RUN slots of work without a break.
            for t in range(n - MAX_RUN):
                m.add(sum(c[t:t + MAX_RUN + 1]) + sum(pl[t:t + MAX_RUN + 1]) <= MAX_RUN)
            # Planning: one block a day, at least 30 minutes.
            ps = [m.new_bool_var("") for _ in range(n)]
            for t in range(n):
                m.add(ps[t] >= pl[t] - (pl[t - 1] if t else 0))
                if t + 1 < n:
                    m.add_implication(ps[t], pl[t + 1])
                else:
                    m.add(ps[t] == 0)
            m.add(sum(ps) <= 1)
            # Prefer time with children in blocks of at least 30 minutes.
            for t in range(n):
                lone = m.new_bool_var("")
                m.add(lone >= c[t] - (c[t - 1] if t else 0) - (c[t + 1] if t + 1 < n else 0))
                cost.append(W_LONE * lone)
            contact[pid, d], brk[pid, d], plan[pid, d], work[pid, d] = c, b, pl, wv
            if p["open"]:
                opener[pid, d] = m.new_bool_var("")
                m.add_implication(opener[pid, d], wv[0])
            if p["close"]:
                closer[pid, d] = m.new_bool_var("")
                m.add_implication(closer[pid, d], wv[n - 1])

        mine = [d for d in days if (pid, d) in work]
        total = sum(sum(work[pid, d]) for d in mine)
        planned = sum(sum(plan[pid, d]) for d in mine)
        m.add(total <= WEEK_MAX)
        for value, target, weight in ((total, targets[pid][0], W_HOURS), (planned, targets[pid][1], W_PLAN)):
            dev = m.new_int_var(0, 5 * n, "")
            m.add(dev >= value - target)
            m.add(dev >= target - value)
            cost.append(weight * dev)

    staff = {p["id"]: p for p in wk["staff"]}
    for d in days:
        day = wk["days"][d]
        for role in (opener, closer):
            vars_ = [v for (pid, dd), v in role.items() if dd == d]
            missing = m.new_bool_var("")
            m.add(sum(vars_) + missing == 1)
            cost.append(W_ROLE * missing)
        for t in range(n):
            here = [contact[pid, d][t] for pid in staff if (pid, d) in contact]
            need = day["need"][t]
            short = m.new_int_var(0, max(need, 0), "")
            m.add(sum(here) + short >= need)
            over = m.new_int_var(0, len(here), "")
            m.add(over >= sum(here) - need - 1)
            cost += [W_SHORT * short, W_OVER * over]
            for g, gneed in day["groupNeed"].items():
                if gneed[t]:
                    gshort = m.new_int_var(0, gneed[t], "")
                    m.add(sum(contact[pid, d][t] for pid in staff if (pid, d) in contact and staff[pid]["group"] == g) + gshort >= gneed[t])
                    cost.append(W_GROUP * gshort)
        for kid in day["sn"]:
            trained = [pid for pid in staff if (pid, d) in contact and staff[pid]["sn"] and staff[pid]["group"] == kid["group"]]
            for t in kid["slots"]:
                miss = m.new_bool_var("")
                m.add(sum(contact[pid, d][t] for pid in trained) + miss >= 1)
                cost.append(W_SN * miss)

    m.minimize(sum(cost))
    return m, contact, brk, plan, work, opener, closer


def _split(total, parts, unit):
    """Splits `total` slots over `parts` days in whole `unit`s, as evenly as possible."""
    if not parts:
        return []
    k = round(total / unit)
    return [(k // parts + (i < k % parts)) * unit for i in range(parts)]


def _solve(model, time_limit, workers, hint=None):
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = time_limit
    solver.parameters.num_workers = workers
    if hint:
        model.clear_hints()
        for var, value in hint:
            model.add_hint(var, value)
    status = solver.solve(model)
    return solver, status


def solve_week(problem, wk, time_limit=20.0, workers=4):
    """Two stages: each day on its own with an even share of the week's hours (small and fast),
    then the whole week starting from that answer, so hours can move between days."""
    n, slot = problem["slots"], problem["slot"]
    share = {}
    for p in wk["staff"]:
        on = [d for d in range(5) if p["days"][d]]
        hours, planning = _split(p["target"] / slot, len(on), 1), _split(p["planning"] / slot, len(on), 2)
        share[p["id"]] = {d: (hours[i], planning[i]) for i, d in enumerate(on)}
    day_limit = time_limit * 0.4 / 5
    hint = {}
    for d in range(5):
        targets = {pid: s.get(d, (0, 0)) for pid, s in share.items()}
        m, *vars_ = _build(problem, wk, [d], targets)
        solver, status = _solve(m, day_limit, workers)
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            hint.update({k: solver.value(v) for k, v in _all_vars(vars_).items()})
    targets = {p["id"]: (round(p["target"] / slot), round(p["planning"] / slot)) for p in wk["staff"]}
    m, contact, brk, plan, work, opener, closer = _build(problem, wk, range(5), targets)
    full = _all_vars((contact, brk, plan, work, opener, closer))
    solver, status = _solve(m, time_limit * 0.6, workers, [(v, hint[k]) for k, v in full.items() if k in hint])
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise RuntimeError(f"No schedule found for week {wk['week']} ({solver.status_name(status)})")

    staff = {p["id"]: p for p in wk["staff"]}
    day_start = problem["dayStart"]
    shifts = []
    for (pid, d), wv in work.items():
        kinds = []
        for t in range(n):
            if solver.value(contact[pid, d][t]):
                kinds.append("contact")
            elif solver.value(brk[pid, d][t]):
                kinds.append("break")
            elif solver.value(plan[pid, d][t]):
                kinds.append("planning")
            else:
                kinds.append(None)
        t = 0
        while t < n:
            if kinds[t] is None:
                t += 1
                continue
            u = t
            while u + 1 < n and kinds[u + 1] == kinds[t]:
                u += 1
            shifts.append({"staff": pid, "day": d, "start": day_start + t * slot, "end": day_start + (u + 1) * slot,
                           "type": kinds[t], "group": staff[pid]["group"]})
            t = u + 1
    roles = []
    for d in range(5):
        pick = lambda role: next((pid for (pid, dd), v in role.items() if dd == d and solver.value(v)), None)
        roles.append({"open": pick(opener), "close": pick(closer)})
    return {"week": wk["week"], "shifts": shifts, "roles": roles,
            "status": solver.status_name(status), "objective": solver.objective_value}


def _all_vars(groups):
    """The decision variables of a model, keyed by kind, person, day and slot."""
    out = {}
    for kind, vars_ in zip(("contact", "break", "planning", "work"), groups[:4]):
        for (pid, d), slots in vars_.items():
            out.update({(kind, pid, d, t): v for t, v in enumerate(slots)})
    for kind, vars_ in zip(("open", "close"), groups[4:]):
        out.update({(kind, pid, d): v for (pid, d), v in vars_.items()})
    return out


def solve(problem, time_limit=20.0, parallel=4):
    """Solves every week in the problem; weeks are independent, so they run side by side."""
    workers = max(1, (os.cpu_count() or 4) // max(1, min(parallel, len(problem["weeks"]))))
    with ThreadPoolExecutor(max_workers=parallel) as pool:
        weeks = list(pool.map(lambda wk: solve_week(problem, wk, time_limit, workers), problem["weeks"]))
    return {"weeks": weeks}
