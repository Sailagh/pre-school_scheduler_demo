"""Builds a week's staff schedule for the preschool demo with OR-Tools CP-SAT.

Input is the problem JSON made by `solverProblem()` in web/schedule-core-demo.js:
one entry per week with the staff (contract minutes, planning minutes, availability,
may open/close, special-needs training) and, per day, the adults needed in every
15-minute slot. Output is, per week, the shifts in the web app's format and the
opener/closer for each day.

The rules come from Settings in the web app (`rules` in each week; defaults below). Hard rules:
  - one continuous shift a day, 4-9 hours, inside the person's availability
  - the weekly limit (40 h) plus the flexible part (up to 2 h more) when the week before was not over;
    a week after one that went over is that much shorter (`maxSlots` per person)
  - one break (more if the breaks rule asks), inside the shift, and no more than 5 hours without one
  - an optional limit on hours a day, and rest between days
  - planning time comes in blocks of at least 30 minutes, at most one block a day
  - the opener works from opening time and the closer until closing time
Special days: on an early closing nobody works after it and the closer works until it;
a wish to finish by a time makes every slot worked after it cost a little.
Soft goals, in order of weight: enough adults every slot, a special-needs trained adult
in the unit while a child with special needs is there, contract hours, wishes to finish early, planning hours,
time with children in blocks of at least 30 minutes, enough adults per unit, not more adults
than needed, and not going over the weekly limit (people get tired, more so past one extra hour).
"""

import os
from concurrent.futures import ThreadPoolExecutor

from ortools.sat.python import cp_model

MIN_SHIFT, MAX_SHIFT = 16, 36  # slots: 4 h and 9 h
DEFAULT_RULES = {"maxRun": 20, "breakLen": 2, "weekMax": 160, "weekFlex": 8, "dayMax": None, "breaks": None,
                 "rest": 660, "sn": True, "openClose": True}

W_SHORT, W_SN, W_ROLE = 1000, 1000, 1000
W_HOURS, W_PLAN, W_OVER, W_LONE, W_FINISH = 60, 20, 4, 40, 25
W_GROUP = W_SHORT  # every unit needs its own adults, as strictly as the preschool as a whole
W_AWAY = 120  # a day helping in another unit than one's own: fine when needed, not for nothing
W_TIRED = 30  # per slot over the weekly limit, and again per slot more than an hour over it

# How long to search is measured in OR-Tools' "deterministic time": work done, not seconds, so a slow
# computer gets the same schedule as a fast one and just takes longer. A typical laptop does about this
# much work per second; `time_limit` is the seconds per week it would take there.
WORK_PER_SECOND = 0.6
PATIENCE = 15  # a stage stops after this many times its usual seconds even if the work is not done


def _build(problem, wk, days, targets, caps=None, away=True):
    """Model for `days` of a week; `targets[pid]` is (work slots, planning slots) over those days, and
    `caps[pid]` the most slots over those days (default: the person's weekly cap). With `away`, people
    may help in another unit than their own."""
    n, slot, day_start = problem["slots"], problem["slot"], problem["dayStart"]
    R = {**DEFAULT_RULES, **wk.get("rules", {})}
    blen, max_run = R["breakLen"], R["maxRun"]
    n_breaks = max(1, R["breaks"]["n"]) if R["breaks"] else 1
    m = cp_model.CpModel()
    cost = []
    contact, brk, plan, work = {}, {}, {}, {}
    # Each working person-day is in one unit (`m.units`), home or another; `m.unit_contact` is time with
    # children per unit, which is what each unit's need and special-needs cover count.
    m.units, m.unit_contact = {}, {}
    m.gaps = []  # adults missing (total, per unit, special needs): what "the day has a gap" means
    units = problem["groups"]
    opener, closer = {}, {}

    for p in wk["staff"]:
        pid = p["id"]
        for d in days:
            if not p["days"][d]:
                continue
            first = 0 if p["earliest"] is None else max(0, -(-(p["earliest"] - day_start) // slot))
            last = n if p["latest"] is None else min(n, (p["latest"] - day_start) // slot)
            last = min(last, wk["days"][d].get("closeSlot", n - 1) + 1)  # nobody works after an early closing
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
            # Breaks: exactly `blen` slots each, strictly inside the shift.
            bs = [m.new_bool_var("") for _ in range(n)]
            for t in range(n):
                m.add(b[t] == sum(bs[max(0, t - blen + 1):t + 1]))
                if t + blen > n:
                    m.add(bs[t] == 0)
                if t == 0 or t == n - 1:
                    m.add(b[t] == 0)
                else:
                    m.add_implication(b[t], wv[t - 1])
                    m.add_implication(b[t], wv[t + 1])
                    # Two breaks back to back would read as one long break.
                    m.add_implication(bs[t], b[t - 1].Not())
            m.add(sum(bs) <= n_breaks)
            if R["breaks"]:
                # Days longer than `over` need `n` breaks.
                long_day = m.new_bool_var("")
                m.add(sum(wv) <= R["breaks"]["over"] + MAX_SHIFT * long_day)
                m.add(sum(bs) >= R["breaks"]["n"] * long_day)
            # No more than `max_run` slots of work without a break.
            for t in range(n - max_run):
                m.add(sum(c[t:t + max_run + 1]) + sum(pl[t:t + max_run + 1]) <= max_run)
            if R["dayMax"] is not None:
                m.add(sum(c) + sum(pl) <= R["dayMax"])
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
            a = {g: m.new_bool_var("") for g in (units if away or p["group"] not in units else [p["group"]])}
            m.add(sum(a.values()) == on)
            cg = {g: [m.new_bool_var("") for _ in range(n)] for g in a}
            for t in range(n):
                m.add(sum(cg[g][t] for g in a) == c[t])
                for g in a:
                    m.add_implication(cg[g][t], a[g])
            if p["group"] in a:
                cost.append(W_AWAY * (on - a[p["group"]]))
            m.units[pid, d], m.unit_contact[pid, d] = a, cg
            if p["open"] and R["openClose"]:
                opener[pid, d] = m.new_bool_var("")
                m.add_implication(opener[pid, d], wv[0])
            if p["close"] and R["openClose"]:
                closer[pid, d] = m.new_bool_var("")
                m.add_implication(closer[pid, d], wv[wk["days"][d].get("closeSlot", n - 1)])
            # A wish to finish early (e.g. a concert in the evening): every slot worked after it costs.
            fin = wk["days"][d].get("finishBy")
            if fin is not None:
                cost += [W_FINISH * wv[t] for t in range(fin, n)]

        mine = [d for d in days if (pid, d) in work]
        total = sum(sum(work[pid, d]) for d in mine)
        planned = sum(sum(plan[pid, d]) for d in mine)
        # The flexible week: `maxSlots` already allows the extra hours, but going over tires people.
        m.add(total <= (caps[pid] if caps else p.get("maxSlots", R["weekMax"])))
        if len(mine) > 1:
            for extra in (0, 4):
                tired = m.new_int_var(0, 5 * n, "")
                m.add(tired >= total - R["weekMax"] - extra)
                cost.append(W_TIRED * tired)
        # Rest between days, when the rule asks for more than a day's opening hours leave anyway.
        for d1, d2 in zip(mine, mine[1:]):
            if d2 == d1 + 1:
                for t in range(n):
                    for u in range(n):
                        if 1440 - (t + 1 - u) * slot < R["rest"]:
                            m.add(work[pid, d1][t] + work[pid, d2][u] <= 1)
        for value, target, weight in ((total, targets[pid][0], W_HOURS), (planned, targets[pid][1], W_PLAN)):
            dev = m.new_int_var(0, 5 * n, "")
            m.add(dev >= value - target)
            m.add(dev >= target - value)
            cost.append(weight * dev)

    staff = {p["id"]: p for p in wk["staff"]}
    for d in days:
        day = wk["days"][d]
        # No opener/closer on a closed day, or when the principal already set one.
        roles = [] if not R["openClose"] or day.get("closed") else \
            [r for r, have in ((opener, day.get("hasOpen")), (closer, day.get("hasClose"))) if not have]
        for role in roles:
            vars_ = [v for (pid, dd), v in role.items() if dd == d]
            missing = m.new_bool_var("")
            m.add(sum(vars_) + missing == 1)
            cost.append(W_ROLE * missing)
        for t in range(n):
            here = [contact[pid, d][t] for pid in staff if (pid, d) in contact]
            need = day["need"][t]
            short = m.new_int_var(0, max(need, 0), "")
            m.gaps.append(short)
            m.add(sum(here) + short >= need)
            over = m.new_int_var(0, len(here), "")
            m.add(over >= sum(here) - need - 1)
            cost += [W_SHORT * short, W_OVER * over]
            for g, gneed in day["groupNeed"].items():
                if gneed[t]:
                    gshort = m.new_int_var(0, gneed[t], "")
                    m.gaps.append(gshort)
                    m.add(sum(m.unit_contact[pid, d][g][t] for pid in staff if g in m.unit_contact.get((pid, d), {})) + gshort >= gneed[t])
                    cost.append(W_GROUP * gshort)
        for kid in day["sn"]:
            trained = [pid for pid in staff if staff[pid]["sn"] and kid["group"] in m.unit_contact.get((pid, d), {})]
            for t in kid["slots"]:
                miss = m.new_bool_var("")
                m.gaps.append(miss)
                m.add(sum(m.unit_contact[pid, d][kid["group"]][t] for pid in trained) + miss >= 1)
                cost.append(W_SN * miss)

    m.minimize(sum(cost))
    return m, contact, brk, plan, work, opener, closer


def _split(total, caps, unit):
    """Splits `total` slots over days in whole `unit`s, as evenly as possible without going over
    each day's cap (a short day, e.g. an early closing, gets less and the others more)."""
    out, left = [0] * len(caps), round(total / unit)
    open_ = [i for i in range(len(caps)) if caps[i] >= unit]
    while left > 0 and open_:
        for i in list(open_):
            if left == 0:
                break
            out[i] += unit
            left -= 1
            if out[i] + unit > caps[i]:
                open_.remove(i)
    return out


SEED = None  # set for repeatable experiments (bench/); CP-SAT's own default otherwise


def _solve(model, seconds, workers, hint=None):
    """Searches for as much work as `seconds` on a typical computer (longer on a slow one, within reason)."""
    solver = cp_model.CpSolver()
    solver.parameters.max_deterministic_time = seconds * WORK_PER_SECOND
    solver.parameters.max_time_in_seconds = seconds * PATIENCE
    solver.parameters.num_workers = workers
    if SEED is not None:
        solver.parameters.random_seed = SEED
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
        caps = [min(MAX_SHIFT, wk["days"][d].get("closeSlot", n - 1) + 1) for d in on]
        hours = _split(p["target"] / slot, caps, 1)
        planning = _split(p["planning"] / slot, [max(0, h - MIN_SHIFT) for h in hours], 2)
        # Each day also gets its share of the weekly cap, so the days together never break it and
        # the whole-week stage can start from them.
        cap_share = _split(p.get("maxSlots", 999), caps, 1)
        share[p["id"]] = {d: (hours[i], planning[i], cap_share[i]) for i, d in enumerate(on)}
    # A day usually reaches its best answer in 2-3 s and then stops; the week gets the rest of the time.
    hint = {}
    for d in range(5):
        day = {pid: s.get(d, (0, 0, 0)) for pid, s in share.items()}
        # Days stay in their home units first (small and fast). A day that leaves some unit short is
        # solved again with people allowed to help in other units.
        args = (problem, wk, [d], {pid: x[:2] for pid, x in day.items()}, {pid: x[2] for pid, x in day.items()})
        best = None
        for away in (False, True):
            m, *vars_ = _build(*args, away=away)
            # With helpers, start from the home-units answer: it is still valid, just with nobody helping.
            start = [(v, best[1][k]) for k, v in _all_vars(vars_, m).items() if k in best[1]] if best else None
            solver, status = _solve(m, time_limit * (0.2 if not away else 0.3), workers, start)
            if status == cp_model.UNKNOWN:  # nothing found yet: keep going until the day has a schedule
                solver, status = _solve(m, time_limit, workers)
            ok = status in (cp_model.OPTIMAL, cp_model.FEASIBLE)
            if ok and (best is None or solver.objective_value < best[0]):
                best = (solver.objective_value, {k: solver.value(v) for k, v in _all_vars(vars_, m).items()})
            if not ok or not any(solver.value(g) for g in m.gaps):
                break  # no gap in any unit (or nothing found): no need to try with helpers
        if best:
            hint.update(best[1])
    targets = {p["id"]: (round(p["target"] / slot), round(p["planning"] / slot)) for p in wk["staff"]}
    m, contact, brk, plan, work, opener, closer = _build(problem, wk, range(5), targets)
    full = _all_vars((contact, brk, plan, work, opener, closer), m)
    hints = [(v, hint[k]) for k, v in full.items() if k in hint]
    days = None
    if all(k in hint for k in full if k[0] not in ("unit_contact", "unit")):
        # The days together are a whole week's schedule: that is the one to beat.
        fixed = m.clone()
        for v, val in hints:
            fixed.add(v == val)
        days = _solve(fixed, time_limit, workers)
        if days[1] not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            days = None
    # The whole week, starting from the days, can move hours between days. Kept only if it is better.
    solver, status = _solve(m, time_limit * (0.5 if days else 3), workers, hints)
    if days and (status not in (cp_model.OPTIMAL, cp_model.FEASIBLE) or solver.objective_value > days[0].objective_value):
        solver, status = days
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise RuntimeError(f"No schedule found for week {wk['week']} ({solver.status_name(status)})")

    staff = {p["id"]: p for p in wk["staff"]}
    day_start = problem["dayStart"]
    shifts = []
    for (pid, d), wv in work.items():
        unit = next((g for g, v in m.units[pid, d].items() if solver.value(v)), staff[pid]["group"])
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
                           "type": kinds[t], "group": unit})
            t = u + 1
    roles = []
    for d in range(5):
        pick = lambda role: next((pid for (pid, dd), v in role.items() if dd == d and solver.value(v)), None)
        roles.append({"open": pick(opener), "close": pick(closer)})
    return {"week": wk["week"], "shifts": shifts, "roles": roles,
            "status": solver.status_name(status), "objective": solver.objective_value}


def _all_vars(groups, model):
    """The decision variables of a model, keyed by kind, person, day and slot."""
    out = {}
    for (pid, d), a in model.units.items():
        out.update({("unit", g, pid, d): v for g, v in a.items()})
        out.update({("unit_contact", g, pid, d, t): v for g, slots in model.unit_contact[pid, d].items() for t, v in enumerate(slots)})
    for kind, vars_ in zip(("contact", "break", "planning", "work"), groups[:4]):
        for (pid, d), slots in vars_.items():
            out.update({(kind, pid, d, t): v for t, v in enumerate(slots)})
    for kind, vars_ in zip(("open", "close"), groups[4:]):
        out.update({(kind, pid, d): v for (pid, d), v in vars_.items()})
    return out


def solve(problem, time_limit=20.0, parallel=4):
    """Solves every week in the problem; weeks are independent, so they run side by side."""
    # CP-SAT searches in several ways at once; fewer than 4 makes it much slower to find a schedule.
    workers = max(4, (os.cpu_count() or 4) // max(1, min(parallel, len(problem["weeks"]))))
    with ThreadPoolExecutor(max_workers=parallel) as pool:
        weeks = list(pool.map(lambda wk: solve_week(problem, wk, time_limit, workers), problem["weeks"]))
    return {"weeks": weeks}
