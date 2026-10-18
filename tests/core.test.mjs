// Tests for the shared logic in web/schedule-core-demo.js.   Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as m from '../web/schedule-core-demo.js';

const saved = JSON.parse(readFileSync(new URL('../web/solved-schedule.json', import.meta.url), 'utf8'));
const solvedState = () => { const s = m.seedState(); m.applySolution(s, saved); return s; };
const rule = (s, type) => s.rules.find(r => r.type === type);

test('the demo starts with an empty schedule but keeps the staff and children', () => {
  const s = m.seedState();
  assert.equal(s.shifts.length, 0);
  assert.deepEqual(s.roles, {});
  assert.deepEqual(s.special, []);
  assert.equal(m.STAFF.length, 18);
  assert.equal(s.snKids.length, 2);
});

test('the solver problem has the contract hours, leave and end of contract', () => {
  const s = m.seedState(), p = m.solverProblem(s, [43, 51]);
  const elin43 = p.weeks[0].staff.find(x => x.id === 'p9');
  assert.deepEqual(elin43.days, [false, false, false, false, false], 'Elin is on holiday all of week 43');
  assert.equal(elin43.target, 0);
  const anna = p.weeks[0].staff.find(x => x.id === 'p1');
  assert.equal(anna.target, m.effC(m.person('p1'), 43));
  const peter51 = p.weeks[1].staff.find(x => x.id === 'p12');
  assert.equal(peter51.target, 0, "Peter's contract ends in week 50");
  assert.equal(p.weeks[0].days[0].need.length, p.slots);
});

test('special days change the need: early closing and fewer children', () => {
  const s = m.seedState();
  s.special = [{ id: 'a', week: 42, days: [4], kind: 'closeEarly', time: 780, note: '' }, { id: 'b', week: 42, days: [0], kind: 'fewer', pct: 50, note: '' }];
  const p = m.solverProblem(s, [42]), base = m.solverProblem(m.seedState(), [42]);
  const fri = p.weeks[0].days[4], at13 = (780 - p.dayStart) / p.slot;
  assert.ok(fri.need.slice(at13).every(x => x === 0), 'no adults needed after an early closing');
  assert.equal(fri.closeSlot, at13 - 1);
  const mon = p.weeks[0].days[0].need, monBase = base.weeks[0].days[0].need;
  assert.ok(Math.max(...mon) < Math.max(...monBase), 'fewer children need fewer adults');
  assert.deepEqual(p.weeks[0].days[1].need, base.weeks[0].days[1].need, 'other days are unchanged');
});

test('applying a solution replaces only the solved week', () => {
  const s = solvedState(), other = s.shifts.filter(x => x.week !== 42).length;
  m.applySolution(s, { weeks: [{ week: 42, shifts: [{ staff: 'p1', day: 0, start: 420, end: 900, type: 'contact', group: 'g3' }], roles: [{ open: 'p1' }, {}, {}, {}, {}] }] });
  assert.equal(s.shifts.filter(x => x.week === 42).length, 1);
  assert.equal(s.shifts.filter(x => x.week !== 42).length, other);
  assert.equal(s.roles['42-0'].open, 'p1');
  assert.equal(new Set(s.shifts.map(x => x.id)).size, s.shifts.length, 'shift ids stay unique');
});

test('the saved schedule passes every planner rule and gives everyone their contract hours', () => {
  const s = solvedState();
  for (let w = m.W0; w <= m.W1; w++) {
    assert.deepEqual(m.checkWeek(s, w).map(x => x.text), [], 'week ' + w);
    for (const p of m.STAFF) {
      const q = m.personWeek(s, p.id, w);
      assert.ok(Math.abs(q.worked - q.C) <= 15, `${p.name} week ${w}: ${q.worked} of ${q.C} min`);
    }
  }
});

test('the report for the saved schedule says everything worked', () => {
  const [r] = m.scheduleReport(solvedState(), [42], 'en');
  const bad = r.items.filter(i => !i.ok && !/planning/.test(i.text));
  assert.deepEqual(bad, []);
});

test('the solver problem carries the rules from Settings', () => {
  const s = m.seedState();
  rule(s, 'cont').versions[0].p.h = 4;
  rule(s, 'week').versions[0].p.h = 38;
  const r = m.solverProblem(s, [42]).weeks[0].rules;
  assert.equal(r.maxRun, 16, '4 hours without a break');
  assert.equal(r.weekMax, 38 * 4);
});
