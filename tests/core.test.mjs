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

test('the report is in Swedish, starts lines with a capital, and is honest about the saved schedule', () => {
  const s = solvedState();
  s.special = [{ id: 'a', week: 42, days: [1], kind: 'finishBy', time: 1020, note: '' }, { id: 'b', week: 42, days: [4], kind: 'closeEarly', time: 780, note: '' }];
  const live = m.scheduleReport(s, [42], 'sv')[0].items.map(i => i.text), saved = m.scheduleReport(s, [42], 'sv', true)[0].items.map(i => i.text);
  assert.ok(live.some(t => t.startsWith('Fredag: förskolan stänger 13:00 – med i schemat')), live.join('\n'));
  assert.ok(live.some(t => t.startsWith('Tisdag: personalen vill sluta senast 17:00')), live.join('\n'));
  assert.ok(saved.some(t => t === 'Fredag: förskolan stänger 13:00 – inte med, eftersom lösaren inte var igång.'), saved.join('\n'));
  assert.ok(!saved.some(t => /med i schemat|slutar i tid/.test(t)), 'nothing claims special days were included');
  for (const t of [...live, ...saved]) assert.doesNotMatch(t, /\b(the|week|staff|hours|children|included)\b/i, 'English in: ' + t);
});

test('the flexible week: 41 then 39 is fine, 41 then 40 and 43 are warned about, in both languages', () => {
  const s = solvedState(), add = (staff, week, day, start, end) => s.shifts.push({ id: 'x' + s.shifts.length, staff, week, day, start, end, type: 'contact', group: 'g3' });
  const codes = (w, lang = 'en') => m.checkWeek(s, w, lang).filter(x => x.code === 'R2').map(x => x.text);
  add('p1', 42, 4, 1050, 1110);                                  // Anna: 41 h in week 42, 40 h in week 43
  assert.match(codes(42).join(), /Anna L\. works 41 h this week, so week 43 can be at most 39 h/);
  assert.match(codes(43, 'sv').join(), /Anna L\. arbetade 41 h vecka 42, så denna vecka får vara högst 39 h/);
  const fri = s.shifts.filter(x => x.staff === 'p1' && x.week === 43 && x.day === 4).sort((a, b) => b.end - a.end)[0];
  fri.end -= 60;                                                 // week 43 down to 39 h
  assert.deepEqual(codes(42), []); assert.deepEqual(codes(43), []);
  add('p5', 42, 4, 1000, 1180);                                  // Johan: 43 h, over 40 + 2
  assert.match(codes(42).join(), /Johan N\. is scheduled 43 h this week\. The limit is 42 h/);
});

test('extra hours over contract are evened out the next week, also for part-timers', () => {
  const s = solvedState(), erik = m.person('p2');                       // Erik: 30 h contract
  const fri = s.shifts.filter(x => x.staff === 'p2' && x.week === 42).sort((a, b) => b.day - a.day || b.end - a.end)[0];
  fri.end += 120;                                                     // 2 h extra in week 42
  const t = m.weekTarget(s, erik, 43);
  assert.equal(t.owe, 120);
  assert.equal(t.target, m.effC(erik, 43) - 120, 'week 43 aims for 28 h');
  assert.equal(m.solverProblem(s, [43]).weeks[0].staff.find(x => x.id === 'p2').target, t.target);
  const r42 = m.scheduleReport(s, [42], 'en')[0].items.map(i => i.text + ' ' + (i.more || []).join(' ')).join('\n');
  assert.match(r42, /The next week is made that much shorter: Erik 32 h of 30 h/);
  s.shifts.filter(x => x.staff === 'p2' && x.week === 43).sort((a, b) => b.day - a.day || b.end - a.end)[0].end -= 120;
  const r43 = m.scheduleReport(s, [43], 'sv')[0].items.map(i => i.text + ' ' + (i.more || []).join(' ')).join('\n');
  assert.match(r43, /Kortare vecka för att jämna ut extra timmar veckan innan: Erik 28 h – 2 h extra vecka 42/);
  assert.doesNotMatch(r43, /färre timmar än sitt avtal[^\n]*Erik/);
});

test('an empty week shows no warnings', () => {
  const s = m.seedState();
  assert.deepEqual(m.checkWeek(s, 42), []);
});

test('a closed day: no children, nobody available, fewer contract hours, warned if someone works', () => {
  const s = m.seedState();
  s.special = [{ id: 'c', week: 52, days: [3, 4], kind: 'closed', note: 'Jul' }];
  const p = m.solverProblem(s, [52]).weeks[0], anna = p.staff.find(x => x.id === 'p1');
  assert.ok(p.days[3].need.every(x => x === 0) && p.days[4].need.every(x => x === 0));
  assert.ok(p.days[3].closed && p.days[4].closed);
  assert.deepEqual(anna.days, [true, true, true, false, false]);
  assert.equal(anna.target, m.effC(m.person('p1'), 52) * 3 / 5, 'three days of five');
  assert.equal(m.personWeek(s, 'p1', 52).C, anna.target);
  s.shifts.push({ id: 'z', staff: 'p1', week: 52, day: 4, start: 480, end: 900, type: 'contact', group: 'g3' });
  const w = m.checkWeek(s, 52, 'sv').map(x => x.text);
  assert.ok(w.includes('Förskolan är stängd på fredag, men Anna L. har ett pass.'), w.join('\n'));
  assert.ok(!w.some(t => /Ingen är satt att (öppna|stänga) på (torsdag|fredag)/.test(t)), 'no opener/closer needed on closed days');
});

test('keeping hand-made shifts: those people are left out and what they cover is taken off the need', () => {
  const s = m.seedState(), full = solvedState(), mine = ['p1', 'p2', 'p3', 'p4'];
  s.shifts = full.shifts.filter(x => x.week === 42 && mine.includes(x.staff));
  s.roles['42-0'] = { open: 'p1' };
  const base = m.solverProblem(m.seedState(), [42]).weeks[0], p = m.solverProblem(s, [42], { keep: true }).weeks[0];
  assert.deepEqual(p.kept, mine);
  assert.equal(p.staff.length, 14);
  const sum = d => d.need.reduce((a, b) => a + b, 0);
  assert.ok(sum(p.days[1]) < sum(base.days[1]), 'less is needed once the kept shifts are counted');
  assert.ok(p.days[0].hasOpen && !p.days[0].hasClose);
  assert.equal(m.solverProblem(s, [42]).weeks[0].staff.length, 18, 'without keep everyone is scheduled');
  m.applySolution(s, { weeks: [{ week: 42, kept: mine, shifts: [{ staff: 'p5', day: 0, start: 420, end: 900, type: 'contact', group: 'g3' }], roles: [{ open: 'p9', close: 'p5' }, {}, {}, {}, {}] }] });
  assert.equal(s.shifts.filter(x => mine.includes(x.staff)).length, full.shifts.filter(x => x.week === 42 && mine.includes(x.staff)).length, 'kept shifts stay');
  assert.deepEqual(s.roles['42-0'], { open: 'p1', close: 'p5' }, 'an opener already set stays');
});

test('every unit needs its own adults: a gap in one unit is warned about even if the total is fine', () => {
  const s = solvedState();
  // Move all of Lingon's Tuesday time with children to Hjortron: the total stays the same, Lingon is left empty.
  s.shifts.filter(x => x.week === 42 && x.day === 1 && x.group === 'g2' && x.type === 'contact').forEach(x => { x.group = 'g3'; });
  const w = m.checkWeek(s, 42, 'sv').map(x => x.text);
  assert.ok(w.some(t => /^För få vuxna i Lingon på tisdag/.test(t)), w.join('\n'));
  assert.ok(!w.some(t => /^För lite personal på tisdag/.test(t)), 'the preschool as a whole is still covered');
});

test('someone who switched off cover requests on their phone is not asked', () => {
  const s = solvedState(), r = { staff: 'p1', week: 42, day: 1, from: 780, to: 840 };
  const free = m.coverCands(s, r, 'en').find(c => c.ok);
  assert.ok(free, 'someone can be asked');
  s.phonePrefs = { [free.id]: { offers: false } };
  const now = m.coverCands(s, r, 'en').find(c => c.id === free.id);
  assert.equal(now.why, 'Does not want requests'); assert.equal(now.ok, false);
});

test('children from Edlevo: only counts are accepted, and they replace the example curve', () => {
  const text = readFileSync(new URL('../web/edlevo-counts.json', import.meta.url), 'utf8');
  const raw = readFileSync(new URL('../edlevo/mock/svar-001.xml', import.meta.url), 'utf8');
  assert.equal(m.checkCounts(raw).error, 'raw', 'raw Edlevo data with child ids is refused');
  assert.equal(m.checkCounts('{"format":"x"}').error, 'format');
  const { doc } = m.checkCounts(text), s = m.seedState(), curve = m.solverProblem(s, [43]).weeks[0];
  s.childCounts = doc; s.prefs.childSource = 'edlevo';
  const ed = m.solverProblem(s, [43]).weeks[0], at = (h, mm) => (h * 60 + mm - 360) / 15;
  // Monday 19 Oct 10:00: adults needed per unit from the counted children and each unit's children per adult.
  const mon = doc.counts['2026-10-19'], want = Math.ceil(mon['Blåbär'][at(10, 0)] / 5 + mon['Lingon'][at(10, 0)] / 7 + mon['Hjortron'][at(10, 0)] / 10 - 1e-9);
  assert.equal(ed.days[0].need[at(10, 0)], want);
  assert.notDeepEqual(ed.days[0].need, curve.days[0].need);
  assert.equal(m.childSource(s, 43, 0), 'edlevo');
  // Christmas Eve is inside the counted period with no bookings: no children.
  assert.ok(m.solverProblem(s, [52]).weeks[0].days[3].need.every(x => x === 0));
  s.prefs.childSource = 'forecast';
  assert.deepEqual(m.solverProblem(s, [43]).weeks[0].days[0].need, curve.days[0].need, 'switching back uses the curve');
});
