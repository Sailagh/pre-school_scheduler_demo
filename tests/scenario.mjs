// Test scenarios for the solver, built with the web app's own code.
//   node tests/scenario.mjs problem <scenario> <week> [solved.json ...]   prints the solver problem for one week,
//                                                                         after applying earlier solutions
//   node tests/scenario.mjs check <scenario> <solved.json ...>            prints the planner's warnings and hours as JSON
import { readFileSync } from 'node:fs';
import * as m from '../web/schedule-core-demo.js';

const rule = (s, type) => s.rules.find(r => r.type === type);
const SCENARIOS = {
  base: () => {},
  special: s => {
    s.special = [
      { id: 'a', week: 42, days: [1], kind: 'finishBy', time: 1020, note: 'Concert' },
      { id: 'b', week: 42, days: [4], kind: 'closeEarly', time: 780, note: '' },
      { id: 'c', week: 42, days: [2], kind: 'fewer', pct: 50, note: '' },
    ];
  },
  rules: s => {
    rule(s, 'cont').versions[0].p.h = 4;
    s.rules.push({ id: 'r11', type: 'dayMax', base: false, versions: [{ from: m.W0, on: true, p: { h: 8 } }] });
    s.rules.push({ id: 'r12', type: 'minStaff', base: false, versions: [{ from: m.W0, on: true, p: { n: 2 } }] });
  },
  // Four people scheduled by hand in week 42 (from the saved schedule); the rest is filled in around them.
  partial: s => {
    const saved = JSON.parse(readFileSync(new URL('../web/solved-schedule.json', import.meta.url), 'utf8')).weeks.find(x => x.week === 42);
    s.shifts = saved.shifts.filter(x => ['p1', 'p2', 'p3', 'p4'].includes(x.staff)).map((x, i) => ({ ...x, id: 'k' + i, week: 42 }));
    s.roles['42-0'] = { open: 'p3' };
  },
  holiday: s => { s.special = [{ id: 'h', week: 52, days: [3, 4], kind: 'closed', note: 'Jul' }]; },
  // Three Blåbär staff away in week 42: the others have to cover, using the flexible week.
  short: s => {
    for (const id of ['p3', 'p11', 'p14']) s.absences.push(...[0, 1, 2, 3, 4].map(day => ({ staff: id, week: 42, day, from: 0, to: 1440, reason: 'leave' })));
  },
};

const [cmd, name, ...rest] = process.argv.slice(2);
const s = m.seedState();
SCENARIOS[name](s);
const files = cmd === 'problem' ? rest.slice(1) : rest;
for (const f of files) m.applySolution(s, JSON.parse(readFileSync(f, 'utf8')));
if (cmd === 'problem') process.stdout.write(JSON.stringify(m.solverProblem(s, [+rest[0]], { keep: name === 'partial' })));
else {
  const weeks = [...new Set(s.shifts.map(x => x.week))].sort();
  process.stdout.write(JSON.stringify(weeks.map(w => ({
    week: w,
    warnings: m.checkWeek(s, w).map(x => ({ code: x.code, kind: x.kind, text: x.text })),
    hours: Object.fromEntries(m.STAFF.map(p => [p.id, m.personWeek(s, p.id, w).worked])),
    contract: Object.fromEntries(m.STAFF.map(p => [p.id, m.personWeek(s, p.id, w).C])),
    report: m.scheduleReport(s, [w], 'en')[0].items,
    shifts: s.shifts.filter(x => x.week === w).map(({ staff, day, start, end, type }) => ({ staff, day, start, end, type })),
    roles: [0, 1, 2, 3, 4].map(d => s.roles[w + '-' + d] || {}),
  }))));
}
