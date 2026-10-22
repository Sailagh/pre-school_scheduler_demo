"""Turns bench/results/*.csv into bench/results/report.html: how long it takes to make a satisfactory schedule.

    python bench/report.py            (standard library only)

A run is satisfactory when the planner shows nothing under "Att kontrollera" and everyone is within 15 minutes of
their contract hours (the bar the solver tests use). For each computer, scenario and number of cores the report gives
the smallest budget at which every seed was satisfactory, and how many seconds that took.
"""

import csv
import glob
import html
import math
import os
import statistics

HERE = os.path.dirname(os.path.abspath(__file__))
NAMES = {"base": "Ordinary week", "special": "Special days", "lingon": "Two staff away", "edlevo": "Children from Edlevo"}
SERIES = ["--series-1", "--series-2", "--series-3"]  # all cores, 2 cores, 1 core (fixed order)


def load():
    rows = []
    for path in sorted(glob.glob(os.path.join(HERE, "results", "*.csv"))):
        with open(path, newline="") as f:
            rows += list(csv.DictReader(f))
    for r in rows:
        r["budget"], r["wall_s"], r["objective"] = float(r["budget"]), float(r["wall_s"]), max(1.0, float(r["objective"]))
        r["sat"] = r.get("satisfactory") == "1"
        r["scored"] = r.get("satisfactory") not in (None, "")
    return rows


def esc(x):
    return html.escape(str(x))


def fmt_s(s):
    return f"{s:.0f} s" if s < 90 else f"{s / 60:.1f} min"


def short(v):
    """1000 -> 1k, 1000000 -> 1M: axis labels that fit."""
    return f"{v // 1_000_000:g}M" if v >= 1_000_000 else f"{v // 1000:g}k" if v >= 1000 else f"{v:g}"


def scatter(rows, title, W=440, H=260):
    """Time (x) against the solver's cost (y, log): one dot per run, filled if satisfactory."""
    L, R, T, B = 56, 12, 28, 40
    xs, ys = [r["wall_s"] for r in rows], [r["objective"] for r in rows]
    x1 = max(xs) * 1.08
    y0, y1 = 10 ** math.floor(math.log10(min(ys))), 10 ** math.ceil(math.log10(max(ys)))
    X = lambda v: L + (W - L - R) * v / x1
    Y = lambda v: T + (H - T - B) * (1 - (math.log10(v) - math.log10(y0)) / max(1e-9, math.log10(y1) - math.log10(y0)))
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{esc(title)}">', f'<text x="{L}" y="16" class="t">{esc(title)}</text>']
    for k in range(int(math.log10(y0)), int(math.log10(y1)) + 1):
        y = Y(10 ** k)
        out.append(f'<line x1="{L}" x2="{W - R}" y1="{y:.1f}" y2="{y:.1f}" class="grid"/><text x="{L - 6}" y="{y + 4:.1f}" class="ax" text-anchor="end">{short(10 ** k)}</text>')
    step = next(s for s in (10, 20, 30, 60, 120, 300, 600) if x1 / s <= 6)
    for v in range(0, int(x1) + 1, step):
        out.append(f'<text x="{X(v):.1f}" y="{H - B + 16}" class="ax" text-anchor="middle">{v}</text>')
    out.append(f'<line x1="{L}" x2="{W - R}" y1="{H - B}" y2="{H - B}" class="axis"/>')
    out.append(f'<text x="{(L + W - R) / 2}" y="{H - 6}" class="ax" text-anchor="middle">seconds to make the week</text>')
    out.append(f'<text x="14" y="{(T + H - B) / 2}" class="ax" text-anchor="middle" transform="rotate(-90 14 {(T + H - B) / 2})">solver cost (log)</text>')
    for r in sorted(rows, key=lambda r: r["sat"]):
        tip = f'budget {r["budget"]:g}, seed {r["seed"]}: {fmt_s(r["wall_s"])}, cost {r["objective"]:,.0f}, {r.get("warnings", "?")} warnings, {r.get("hours_off_people", "?")} people off their hours' + (" (satisfactory)" if r["sat"] else "")
        fill = "var(--series-1)" if r["sat"] else "var(--surface-1)"
        out.append(f'<circle cx="{X(r["wall_s"]):.1f}" cy="{Y(r["objective"]):.1f}" r="5" fill="{fill}" stroke="var(--series-1)" stroke-width="2"><title>{esc(tip)}</title></circle>')
    out.append("</svg>")
    return "".join(out)


def cores_chart(rows, title, W=440, H=260, key="cores"):
    """Median seconds (y) at each budget (x), one line per number of cores (or per computer, with key="computer")."""
    L, R, T, B = 56, 70 if key == "cores" else 120, 28, 40
    groups = {}
    for r in rows:
        groups.setdefault(r[key], {}).setdefault(r["budget"], []).append(r["wall_s"])
    order = sorted(groups) if key != "cores" else sorted(groups, key=lambda c: 0 if c == "all" else -int(c))
    budgets = sorted({r["budget"] for r in rows})
    y1 = max(statistics.median(v) for g in groups.values() for v in g.values()) * 1.1
    X = lambda b: L + (W - L - R) * budgets.index(b) / max(1, len(budgets) - 1)
    Y = lambda v: T + (H - T - B) * (1 - v / y1)
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{esc(title)}">', f'<text x="{L}" y="16" class="t">{esc(title)}</text>']
    step = next(s for s in (30, 60, 120, 300, 600, 1200) if y1 / s <= 5)
    for v in range(0, int(y1) + 1, step):
        out.append(f'<line x1="{L}" x2="{W - R}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" class="grid"/><text x="{L - 6}" y="{Y(v) + 4:.1f}" class="ax" text-anchor="end">{v}</text>')
    for b in budgets:
        out.append(f'<text x="{X(b):.1f}" y="{H - B + 16}" class="ax" text-anchor="middle">{b:g}</text>')
    out.append(f'<line x1="{L}" x2="{W - R}" y1="{H - B}" y2="{H - B}" class="axis"/>')
    out.append(f'<text x="{(L + W - R) / 2}" y="{H - 6}" class="ax" text-anchor="middle">work budget</text>')
    out.append(f'<text x="14" y="{(T + H - B) / 2}" class="ax" text-anchor="middle" transform="rotate(-90 14 {(T + H - B) / 2})">seconds (median)</text>')
    for i, c in enumerate(order):
        pts = [(X(b), Y(statistics.median(groups[c][b]))) for b in budgets if b in groups[c]]
        col = f"var({SERIES[min(i, 2)]})"
        out.append(f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="none" stroke="{col}" stroke-width="2"/>')
        for (x, y), b in zip(pts, [b for b in budgets if b in groups[c]]):
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="{col}" stroke="var(--surface-1)" stroke-width="2"><title>{esc(c)}{" cores" if key == "cores" else ""}, budget {b:g}: {fmt_s(statistics.median(groups[c][b]))}</title></circle>')
        label = c if key != "cores" else "all cores" if c == "all" else f"{c} core" + ("s" if c != "1" else "")
        out.append(f'<text x="{pts[-1][0] + 8:.1f}" y="{pts[-1][1] + 4:.1f}" class="lab">{esc(label)}</text>')
    out.append("</svg>")
    return "".join(out)


def main():
    rows = load()
    if not rows:
        raise SystemExit("No results yet: run bench/bench.py first.")
    scored = [r for r in rows if r["scored"]]
    parts = []
    for comp in sorted({r["computer"] for r in rows}):
        rc = [r for r in rows if r["computer"] == comp]
        cpu, n = rc[0]["cpu"], rc[0]["logical_cpus"]
        parts.append(f'<h2>{esc(comp)}</h2><p class="sub">{esc(cpu)}, {esc(n)} logical CPUs, OR-Tools {esc(rc[0]["ortools"])}, Python {esc(rc[0]["python"])}. {len(rc)} runs.</p>')
        # Summary table: the smallest budget from which every seed at that budget and every larger one was satisfactory
        # (a lucky seed at a small budget does not count when a larger budget still fails).
        trs = []
        for sc in NAMES:
            for c in sorted({r["cores"] for r in rc if r["scenario"] == sc}, key=lambda c: 0 if c == "all" else -int(c)):
                g = [r for r in rc if r["scenario"] == sc and r["cores"] == c and r["scored"]]
                if not g:
                    continue
                by = {}
                for r in g:
                    by.setdefault(r["budget"], []).append(r)
                bs = sorted(by)
                ok = [b for i, b in enumerate(bs) if all(r["sat"] for x in bs[i:] for r in by[x])]
                first = ok[0] if ok else None
                some = [b for b in sorted(by) if any(r["sat"] for r in by[b])]
                cell = (f'{first:g} · {fmt_s(statistics.median(r["wall_s"] for r in by[first]))} (up to {fmt_s(max(r["wall_s"] for r in by[first]))})' if first is not None
                        else "never" + (f" for every seed (sometimes from budget {some[0]:g})" if some else ""))
                best = min(by[max(by)], key=lambda r: r["objective"])
                trs.append(f'<tr><td>{esc(NAMES[sc])}</td><td>{esc("all" if c == "all" else c)}</td><td>{len({r["seed"] for r in g})}</td><td>{cell}</td>'
                           f'<td>{fmt_s(statistics.median(r["wall_s"] for r in by[max(by)]))}</td><td>{best.get("warnings", "")}</td><td>{best.get("hours_off_people", "")}</td><td>{best.get("planning_short_h", "")}</td></tr>')
        parts.append('<table><thead><tr><th>Scenario</th><th>Cores</th><th>Seeds</th><th>Budget from which every seed is satisfactory · seconds (median, worst)</th>'
                     '<th>Largest budget · seconds</th><th>Warnings at largest</th><th>People off their hours at largest</th><th>Planning hours missing at largest</th></tr></thead><tbody>' + "".join(trs) + "</tbody></table>")
        figs = [scatter([r for r in rc if r["scenario"] == sc and r["cores"] == "all" and r["scored"]], NAMES[sc]) for sc in NAMES
                if any(r["scenario"] == sc and r["cores"] == "all" and r["scored"] for r in rc)]
        parts.append('<h3>Time against quality, all cores</h3><p class="sub">One dot per run. Filled: satisfactory (nothing to check, everyone within 15 min of their hours). Hollow: not. Lower cost is better: it adds up gaps, hours off contract, missing planning time and other soft goals.</p><div class="grid2">' + "".join(f"<figure>{f}</figure>" for f in figs) + "</div>")
        multi = [sc for sc in NAMES if len({r["cores"] for r in rc if r["scenario"] == sc}) > 1]
        if multi:
            parts.append('<h3>Fewer cores: a slower computer</h3><p class="sub">The same work budget on fewer cores, as on a weaker computer (Linux taskset). Median seconds per week.</p><div class="grid2">'
                         + "".join(f"<figure>{cores_chart([r for r in rc if r['scenario'] == sc], NAMES[sc])}</figure>" for sc in multi) + "</div>")
    comps = sorted({r["computer"] for r in rows})
    if len(comps) > 1:
        both = [sc for sc in NAMES if all(any(r["computer"] == c and r["scenario"] == sc and r["cores"] == "all" for r in rows) for c in comps)]
        cpu = {c: next(r for r in rows if r["computer"] == c) for c in comps}
        parts.insert(0, '<h2>The computers side by side</h2><p class="sub">Median seconds per week at each work budget, all cores. '
                     + "; ".join(f'{esc(c)}: {esc(cpu[c]["cpu"])}, {esc(cpu[c]["logical_cpus"])} logical CPUs' for c in comps)
                     + '. The solver runs one search per logical CPU, so the same budget is spread over as many searches as the computer has logical CPUs: it is not the same work, and more searches are not always faster.</p><div class="grid2">'
                     + "".join(f"<figure>{cores_chart([r for r in rows if r['scenario'] == sc and r['cores'] == 'all'], NAMES[sc], key='computer')}</figure>" for sc in both) + "</div>")
    css = """
:root{color-scheme:light;--surface-0:#f4f4f2;--surface-1:#fcfcfb;--text-primary:#0b0b0b;--text-secondary:#52514e;--grid:#e3e2de;--axis:#b9b8b2;--series-1:#2a78d6;--series-2:#eb6834;--series-3:#1baf7a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--surface-0:#121211;--surface-1:#1a1a19;--text-primary:#f0efec;--text-secondary:#c3c2b7;--grid:#2c2c2a;--axis:#4a4a46;--series-1:#3987e5;--series-2:#d95926;--series-3:#199e70}}
:root[data-theme="dark"]{color-scheme:dark;--surface-0:#121211;--surface-1:#1a1a19;--text-primary:#f0efec;--text-secondary:#c3c2b7;--grid:#2c2c2a;--axis:#4a4a46;--series-1:#3987e5;--series-2:#d95926;--series-3:#199e70}
body{margin:0;background:var(--surface-0);color:var(--text-primary);font:15px/1.5 system-ui,sans-serif}
main{max-width:1000px;margin:0 auto;padding:24px 16px 48px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;margin:32px 0 2px}h3{font-size:16px;margin:24px 0 2px}
.sub{color:var(--text-secondary);margin:0 0 10px;font-size:14px}
table{border-collapse:collapse;width:100%;background:var(--surface-1);font-size:13px;display:block;overflow-x:auto}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--grid);vertical-align:top}th{color:var(--text-secondary);font-weight:600}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
figure{margin:0;background:var(--surface-1);border-radius:8px;padding:8px}svg{width:100%;height:auto;display:block}
.t{font-size:13px;font-weight:600;fill:var(--text-primary)}.ax{font-size:11px;fill:var(--text-secondary)}.lab{font-size:11px;fill:var(--text-primary)}
.grid{stroke:var(--grid);stroke-width:1}.axis{stroke:var(--axis);stroke-width:1}
"""
    page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Schedule solver timing</title><style>{css}</style></head><body><main>'
            '<h1>How long does a good schedule take?</h1><p class="sub">The solver made one week with different work budgets. Each result was checked with the planner\'s own rules. '
            '"Satisfactory": nothing under Att kontrollera and everyone within 15 minutes of their contract hours.</p>'
            + "".join(parts) + f'<p class="sub" style="margin-top:24px">{len(rows)} runs, {len(scored)} scored. Made by bench/report.py from bench/results/*.csv.</p></main></body></html>')
    out = os.path.join(HERE, "results", "report.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    print(out)


if __name__ == "__main__":
    main()
