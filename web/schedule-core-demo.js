// Shared mock engine for all schedule options: sample data, rules, hours, cover, drag, EN/SV text.
export const DS = 360, DE = 1110, SPAN = 750;
const BLOCK_START = 41, BLOCK_WEEKS = 4, PLAN_WEEK = 42;
export const W0 = 41, W1 = 52, TYPES = ['contact', 'break', 'planning', 'meeting'];
export const blockOf = w => W0 + Math.floor((w - W0) / BLOCK_WEEKS) * BLOCK_WEEKS;
export const fmtN = (v, lang) => lang === 'sv' ? String(v).replace('.', ',') : String(v);
const fmtP = (p, lang) => Object.fromEntries(Object.entries(p || {}).map(([k, v]) => [k, fmtN(v, lang)]));
export const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const pct = m => (m - DS) / SPAN * 100;
const clone = x => JSON.parse(JSON.stringify(x));
const tf = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

export const GROUPS = [
  { id: 'g1', name: 'Blåbär', ages: '1–3', open: 390, close: 1050, ratio: 5, max: 20, sn: 0 },
  { id: 'g2', name: 'Lingon', ages: '3–4', open: 375, close: 1080, ratio: 7, max: 28, sn: 1 },
  { id: 'g3', name: 'Hjortron', ages: '4–5', open: 360, close: 1110, ratio: 10, max: 40, sn: 0 },
];
export const STAFF = [
  { id: 'p1', name: 'Anna Lindqvist', pct: 100, hours: 40, group: 'g3', open: true, close: true, sn: true, off: [] },
  { id: 'p2', name: 'Erik Johansson', pct: 75, hours: 30, group: 'g2', open: false, close: true, sn: false, off: [] },
  { id: 'p3', name: 'Fatima Hassan', pct: 100, hours: 40, group: 'g1', open: true, close: true, sn: false, off: [] },
  { id: 'p4', name: 'Maja Berg', pct: 80, hours: 32, group: 'g2', open: false, close: false, sn: true, off: [4] },
  { id: 'p5', name: 'Johan Nilsson', pct: 100, hours: 40, group: 'g3', open: true, close: true, sn: false, off: [] },
  { id: 'p6', name: 'Tove Ek', pct: 50, hours: 20, group: 'g1', open: false, close: true, sn: false, off: [4] },
  { id: 'p7', name: 'Lena Holm', pct: 100, hours: 40, group: 'g1', open: true, close: true, sn: true, off: [] },
  { id: 'p8', name: 'Ahmed Karimi', pct: 90, hours: 36, group: 'g2', open: true, close: true, sn: false, off: [] },
  { id: 'p9', name: 'Elin Sandberg', pct: 100, hours: 40, group: 'g3', open: true, close: false, sn: false, off: [] },
  { id: 'p10', name: 'Mohammed Ali', pct: 75, hours: 30, group: 'g2', open: false, close: true, sn: false, off: [] },
  { id: 'p11', name: 'Ida Forsberg', pct: 100, hours: 40, group: 'g1', open: true, close: true, sn: true, off: [] },
  { id: 'p12', name: 'Peter Lindgren', pct: 60, hours: 24, group: 'g3', open: true, close: true, sn: false, off: [4] },
  { id: 'p13', name: 'Nora Svensson', pct: 100, hours: 40, group: 'g2', open: true, close: true, sn: false, off: [] },
  { id: 'p14', name: 'Hanna Wikström', pct: 80, hours: 32, group: 'g1', open: false, close: true, sn: false, off: [4] },
  { id: 'p15', name: 'Gustav Persson', pct: 100, hours: 40, group: 'g3', open: true, close: false, sn: true, off: [] },
  { id: 'p16', name: 'Leila Ahmadi', pct: 50, hours: 20, group: 'g2', open: false, close: false, sn: false, off: [] },
  { id: 'p17', name: 'Viktor Åberg', pct: 100, hours: 40, group: 'g1', open: true, close: true, sn: false, off: [] },
  { id: 'p18', name: 'Sofia Nyström', pct: 70, hours: 28, group: 'g3', open: false, close: true, sn: false, off: [] },
];
export const SUBS = [
  { id: 's1', name: 'Sara Ek', days: [0, 1, 2, 3, 4], phone: '070-412 88 19', sub: true, sn: true, open: true, close: true, prefer: [], booked: [] },
  { id: 's2', name: 'Karin Öberg', days: [0, 1, 2, 3, 4], phone: '070-123 45 67', sub: true, sn: true, open: true, close: true, prefer: ['g3'], booked: [] },
  { id: 's3', name: 'Oskar Lund', days: [1, 3, 4], phone: '073-987 65 43', sub: true, sn: true, open: false, close: true, prefer: ['g2'], booked: [{ week: 42, day: 1, from: 420, to: 960, where: 'Förskolan Vitsippan' }] },
  { id: 's4', name: 'Mira Dahl', days: [0, 1, 2, 3, 4], phone: '076-220 31 05', sub: true, sn: false, open: true, close: false, prefer: ['g1'], booked: [] },
  { id: 's5', name: 'Elias Strand', days: [0, 1, 2, 4], phone: '072-554 90 12', sub: true, sn: true, open: true, close: true, prefer: [], booked: [{ week: 42, day: 0, from: 1050, to: 1410, where: 'Kvällspass, annan arbetsplats' }] },
];
STAFF.forEach((p, i) => Object.assign(p, { earliest: null, latest: null, end: null, changes: [], leave: [], phone: ["070-318 42 11","073-552 18 90","076-104 77 23","070-889 21 46","072-431 09 58","073-260 64 12","070-715 33 80","076-942 15 37","070-206 58 74","073-118 90 25","072-677 41 03","070-534 26 69","076-391 82 14","073-820 47 56","070-462 13 98","072-159 70 31","076-283 55 40","073-704 36 82"][i] || '', phoneSrc: 'app' }));
STAFF[7].changes = [{ from: 47, pct: 75 }];
STAFF[8].leave = [{ id: 'l1', kind: 'vacation', w1: 43, d1: 0, w2: 43, d2: 4 }];
STAFF[5].earliest = 480; STAFF[11].end = 50; STAFF[12].sn = true;
const allP = () => [...STAFF, ...SUBS];
export const person = id => STAFF.find(p => p.id === id) || SUBS.find(p => p.id === id);
export const contractPct = (p, w) => { let v = p.pct || 0, f = -1; for (const x of p.changes || []) if (x.from <= w && x.from > f) { f = x.from; v = x.pct; } return v; };
export const contractH = (p, w) => p.sub ? 0 : Math.round(40 * contractPct(p, w)) / 100;
export const effC = (p, w) => { if (p.sub || (p.end && w > p.end)) return 0; const n = 5 - (p.off || []).length, full = contractH(p, w) * 60; let away = 0; for (let d = 0; d < 5; d++) if (!(p.off || []).includes(d) && (p.leave || []).some(l => l.w1 * 10 + l.d1 <= w * 10 + d && w * 10 + d <= l.w2 * 10 + l.d2)) away++; return Math.round(full * (n - away) / n); };
export const RULE_TEXT = {
  en: { rest: 'At least {h} hours of rest between working days', week: 'No more than {h} hours in a week', avg: 'On average no more than {h} hours a week over 4 weeks', cont: 'No more than {h} hours of work without a break', breakLen: 'A break is {a}–{b} minutes', count: 'Contract hours count time with children, breaks, planning and meetings', openClose: 'Someone opens and someone closes every day', avail: 'Nobody works when they are not available', absent: 'Nobody works while absent', sn: 'A trained adult is with children who have special needs', breaks: 'At least {n} breaks of {a} minutes on days longer than {over} hours', dayMax: 'No more than {h} hours of work in a day', minStaff: 'At least {n} adults at the preschool while children are there', ratio: 'Enough adults for the number of children' },
  sv: { rest: 'Minst {h} timmars vila mellan arbetsdagar', week: 'Högst {h} timmar per vecka', avg: 'I snitt högst {h} timmar per vecka över 4 veckor', cont: 'Högst {h} timmars arbete utan rast', breakLen: 'En rast är {a}–{b} minuter', count: 'Avtalade timmar räknar barntid, rast, planering och möten', openClose: 'Någon öppnar och någon stänger varje dag', avail: 'Ingen arbetar när de inte är tillgängliga', absent: 'Ingen arbetar när de är frånvarande', sn: 'En utbildad vuxen finns hos barn med särskilda behov', breaks: 'Minst {n} raster på {a} minuter dagar längre än {over} timmar', dayMax: 'Högst {h} timmars arbete per dag', minStaff: 'Minst {n} vuxna på förskolan när barn är där', ratio: 'Tillräckligt med vuxna för antalet barn' },
};
export const RULE_PARAMS = { rest: [['h', 'h', 8, 13, 1]], week: [['h', 'h', 20, 48, 1]], avg: [['h', 'h', 20, 48, 1]], cont: [['h', 'h', 2, 8, 0.5]], breakLen: [['a', 'min', 5, 60, 5], ['b', 'min', 5, 90, 5]], breaks: [['n', '', 1, 4, 1], ['a', 'min', 5, 60, 5], ['over', 'h', 3, 10, 0.5]], dayMax: [['h', 'h', 4, 12, 0.5]], minStaff: [['n', '', 1, 6, 1]] };
export const ADDABLE = { breaks: { n: 2, a: 15, over: 6 }, dayMax: { h: 9 }, minStaff: { n: 2 }, cont: { h: 5 }, rest: { h: 11 }, week: { h: 40 } };
export const ruleVer = (r, w) => { let v = null; for (const x of r.versions) if (x.from <= w && (!v || x.from >= v.from)) v = x; return v; };
export const ruleLabel = (type, p, lang) => tf((RULE_TEXT[lang] || RULE_TEXT.en)[type] || type, fmtP(p, lang));
const seedRules = () => [['rest', { h: 11 }], ['week', { h: 40 }], ['avg', { h: 40 }], ['cont', { h: 5 }], ['breakLen', { a: 15, b: 30 }], ['count', {}], ['openClose', {}], ['avail', {}], ['absent', {}], ['sn', {}]]
  .map(([type, p], i) => ({ id: 'r' + (i + 1), type, base: true, versions: [{ from: W0, on: true, p }] }));
const grp = id => GROUPS.find(g => g.id === id);

export const T = {
  en: {
    app: 'Preschool schedule', schedule: 'Schedule', staff: 'Staff', groups: 'Groups', hours: 'Hours', cover: 'Cover',
    week: 'Week', block: 'Block', weekOf: 'week {n} of {m}', undo: 'Undo', redo: 'Redo', copyWeek: 'Copy to next week',
    copied: 'Week {a} copied onto week {b}', solve: 'Make schedule', solving: 'Making schedule…',
    solved: 'OR-Tools made the schedule for week {w}.', solvedSaved: 'The solver is not running, so week {w} was loaded from a schedule OR-Tools made earlier for the demo data.', solveFailed: 'Could not make a schedule. Start the solver: see README.', warnings: 'Warnings', noWarnings: 'No warnings. Everything follows the rules.',
    children: 'Children', need: 'Needed', have: 'Working', haveNeed: 'Staff working / needed', coverage: 'Staffing',
    contact: 'With children', break: 'Break', planning: 'Planning', meeting: 'Meeting',
    opens: 'Opens', closes: 'Closes', nobody: 'nobody', opener: 'Opener', closer: 'Closer',
    markSick: 'Mark sick today', sickToday: 'Sick today', unSick: 'No longer sick',
    needsCover: 'Needs cover', whoCanCover: 'Who can take it', assign: 'Assign', sub: 'Substitute',
    drawHint: 'Drag across a row to draw a shift. Drag a shift to move it, or its edges to change the time. Click a shift to change it.',
    del: 'Delete shift', type: 'What kind of time?', group: 'Group', close: 'Close',
    canOpen: 'May open', canClose: 'May close', cannotOpen: 'May not open', cannotClose: 'May not close',
    setOpener: 'Opens this day', setCloser: 'Closes this day', thisWeek: 'This week', thisBlock: 'This block',
    ofContract: 'of {h}', over: 'Over', under: 'Under', ok: 'On target', totalPreschool: 'Whole preschool',
    slot: 'Columns', min: 'min', tooFew: 'Too few', tooMany: 'More than needed', enough: 'Enough',
    noCover: 'Nobody is off sick this week. Click a name and choose “Mark sick today” to try it.',
    pickShift: 'Click a shift to change it.', pickPerson: 'Click a name to see the person.', today: 'Today',
    sn: 'Special needs trained', planningWeek: 'Planning this week', available: 'Available', notAvailable: 'Not available',
    whole: 'Whole week', focus: 'Plan one person', merged: 'Groups merged', yrs: 'yrs', ratio: '{n} children per adult',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], dayW: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], month: 'Oct',
    w_cont: '{name} works {h} without a break on {day}. The limit is {lim}.',
    w_break: '{name} has a {m}-minute break on {day}. A break should be {a}–{b} minutes.',
    w_rest: '{name} only gets {h} of rest after {day}. At least {lim} are needed.',
    w_week: '{name} is scheduled {h} this week. The limit is {lim}.',
    w_avg: '{name} averages {h} a week over the block. The limit is {lim}.',
    w_unav: '{name} is not available on {day} but has a shift.',
    w_noOpen: 'Nobody is set to open on {day}.', w_noClose: 'Nobody is set to close on {day}.',
    w_openNA: '{name} is set to open on {day} but is not allowed to open.',
    w_closeNA: '{name} is set to close on {day} but is not allowed to close.',
    w_cover: '{name} is {why} on {day}. {from}–{to} needs cover.',
    w_overlap: '{name} has two shifts at the same time on {day}.', breakLen: 'Break length',
    w_under: 'Too few staff on {day} {from}–{to}: {have} working, {need} needed.',
    r_busy: 'Already working then', r_unav: 'Not available on {day}', r_40: 'Would go over 40 hours this week',
    r_contract: 'Only {h} left in contract', r_absent: 'Also absent', c_staff: 'Staff · {h} left in contract', c_sub: 'Substitute · {phone}',
  },
  sv: {
    app: 'Förskolans schema', schedule: 'Schema', staff: 'Personal', groups: 'Grupper', hours: 'Timmar', cover: 'Ersättare',
    week: 'Vecka', block: 'Period', weekOf: 'vecka {n} av {m}', undo: 'Ångra', redo: 'Gör om', copyWeek: 'Kopiera till nästa vecka',
    copied: 'Vecka {a} kopierad till vecka {b}', solve: 'Skapa schema', solving: 'Skapar schema…',
    solved: 'OR-Tools har gjort schemat för vecka {w}.', solvedSaved: 'Lösaren är inte igång, så vecka {w} hämtades från ett schema som OR-Tools gjort tidigare för demodata.', solveFailed: 'Kunde inte skapa ett schema. Starta lösaren: se README.', warnings: 'Varningar', noWarnings: 'Inga varningar. Allt följer reglerna.',
    children: 'Barn', need: 'Behövs', have: 'I tjänst', haveNeed: 'Personal i tjänst / behov', coverage: 'Bemanning',
    contact: 'Barntid', break: 'Rast', planning: 'Planering', meeting: 'Möte',
    opens: 'Öppnar', closes: 'Stänger', nobody: 'ingen', opener: 'Öppnare', closer: 'Stängare',
    markSick: 'Sjukanmäl idag', sickToday: 'Sjuk idag', unSick: 'Inte längre sjuk',
    needsCover: 'Behöver ersättare', whoCanCover: 'Vem kan ta passet', assign: 'Tilldela', sub: 'Vikarie',
    drawHint: 'Dra över en rad för att rita ett pass. Dra ett pass för att flytta det, eller dess kanter för att ändra tiden. Klicka på ett pass för att ändra det.',
    del: 'Ta bort pass', type: 'Vilken sorts tid?', group: 'Grupp', close: 'Stäng',
    canOpen: 'Får öppna', canClose: 'Får stänga', cannotOpen: 'Får inte öppna', cannotClose: 'Får inte stänga',
    setOpener: 'Öppnar denna dag', setCloser: 'Stänger denna dag', thisWeek: 'Denna vecka', thisBlock: 'Denna period',
    ofContract: 'av {h}', over: 'Över', under: 'Under', ok: 'Enligt avtal', totalPreschool: 'Hela förskolan',
    slot: 'Kolumner', min: 'min', tooFew: 'För få', tooMany: 'Fler än behövs', enough: 'Tillräckligt',
    noCover: 'Ingen är sjuk denna vecka. Klicka på ett namn och välj ”Sjukanmäl idag” för att prova.',
    pickShift: 'Klicka på ett pass för att ändra det.', pickPerson: 'Klicka på ett namn för att se personen.', today: 'Idag',
    sn: 'Utbildad för särskilt stöd', planningWeek: 'Planeras denna vecka', available: 'Tillgänglig', notAvailable: 'Inte tillgänglig',
    whole: 'Hela veckan', focus: 'Planera en person', merged: 'Grupperna sammanslagna', yrs: 'år', ratio: '{n} barn per vuxen',
    days: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'], dayW: ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'],
    short: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'], month: 'okt',
    w_cont: '{name} arbetar {h} utan rast på {day}. Gränsen är {lim}.',
    w_break: '{name} har {m} minuters rast på {day}. En rast ska vara {a}–{b} minuter.',
    w_rest: '{name} får bara {h} vila efter {day}. Minst {lim} krävs.',
    w_week: '{name} är schemalagd {h} denna vecka. Gränsen är {lim}.',
    w_avg: '{name} har i snitt {h} per vecka under perioden. Gränsen är {lim}.',
    w_unav: '{name} är inte tillgänglig på {day} men har ett pass.',
    w_noOpen: 'Ingen är satt att öppna på {day}.', w_noClose: 'Ingen är satt att stänga på {day}.',
    w_openNA: '{name} ska öppna på {day} men får inte öppna.',
    w_closeNA: '{name} ska stänga på {day} men får inte stänga.',
    w_cover: '{name} är {why} på {day}. {from}–{to} behöver ersättare.',
    w_overlap: '{name} har två pass samtidigt på {day}.', breakLen: 'Rastens längd',
    w_under: 'För lite personal på {day} {from}–{to}: {have} i tjänst, {need} behövs.',
    r_busy: 'Arbetar redan då', r_unav: 'Inte tillgänglig på {day}', r_40: 'Skulle gå över 40 timmar denna vecka',
    r_contract: 'Bara {h} kvar i avtalet', r_absent: 'Också frånvarande', c_staff: 'Personal · {h} kvar i avtalet', c_sub: 'Vikarie · {phone}',
  },
};
Object.assign(T.en, { w_breaks: '{name} has {n} of {req} breaks on {day}. Days longer than {over} hours need {req}.', w_dayMax: '{name} works {h} on {day}. The limit is {lim}.', w_min: 'Only {have} adults at the preschool on {day} {from}–{to}. At least {n} are needed.', w_sn: '{unit} has a child with special needs on {day} {from}–{to}, but no trained adult is working there.', w_early: '{name} starts at {t} on {day} but cannot work before {lim}.', w_late: '{name} works until {t} on {day} but cannot work after {lim}.', w_ended: '{name}\'s contract ended in week {w}, but they still have shifts.', why_sick: 'off sick', why_vacation: 'on holiday', why_leave: 'on leave', why_parental: 'on parental leave', why_course: 'at a course', why_unavail: 'not available', r_ended: 'Contract has ended' });
Object.assign(T.sv, { w_breaks: '{name} har {n} av {req} raster på {day}. Dagar längre än {over} timmar kräver {req}.', w_dayMax: '{name} arbetar {h} på {day}. Gränsen är {lim}.', w_min: 'Bara {have} vuxna på förskolan på {day} {from}–{to}. Minst {n} krävs.', w_sn: '{unit} har ett barn med särskilda behov på {day} {from}–{to}, men ingen utbildad vuxen arbetar där.', w_early: '{name} börjar {t} på {day} men kan inte arbeta före {lim}.', w_late: '{name} arbetar till {t} på {day} men kan inte arbeta efter {lim}.', w_ended: '{name}s anställning slutade vecka {w}, men personen har fortfarande pass.', why_sick: 'sjuk', why_vacation: 'på semester', why_leave: 'ledig', why_parental: 'föräldraledig', why_course: 'på kurs', r_ended: 'Anställningen har slutat' });
const hrs = (min, lang) => { const v = Math.round(min / 6) / 10; return (lang === 'sv' ? String(v).replace('.', ',') : String(v)) + ' h'; };
const monday = w => 5 + (w - 41) * 7; // Oct 5 2026 = Monday of week 41

// ---------- seed ----------
function seed() {
  // No shifts or opener/closer roles: the schedule is left empty for the OR-Tools solver to fill.
  return { week: PLAN_WEEK, slot: 15, shifts: [], roles: {}, absences: [], nid: 0, rules: seedRules(), rid: 10, merge: { ...MERGE0 }, requests: [], notes: [], snKids: [{ id: 'k1', unit: 'g2', days: [0, 1, 2, 3], from: 480, to: 840 }, { id: 'k2', unit: 'g3', days: [1], from: 600, to: 765 }], free: [], prefs: { school: 'Förskolan Solrosen', notifySick: true, notifyWeek: false, notifyRules: true } };
}

// ---------- store with undo ----------
export function createStore(init) {
  let s = init, past = [], fut = [], snap = null; const subs = new Set();
  const emit = () => subs.forEach(f => f());
  return {
    get: () => s, sub: f => (subs.add(f), () => subs.delete(f)),
    set(fn) { past.push(clone(s)); if (past.length > 80) past.shift(); fut = []; fn(s); emit(); },
    begin() { snap = clone(s); }, live(fn) { fn(s); emit(); },
    commit() { if (snap) { past.push(snap); fut = []; } snap = null; emit(); },
    cancel() { if (snap) s = snap; snap = null; emit(); },
    undo() { if (!past.length) return; fut.push(clone(s)); s = past.pop(); emit(); },
    redo() { if (!fut.length) return; past.push(clone(s)); s = fut.pop(); emit(); },
    replace(next) { s = next; past = []; fut = []; snap = null; emit(); },
    canUndo: () => past.length > 0, canRedo: () => fut.length > 0,
  };
}

// ---------- children forecast & coverage ----------
function curve(t) {
  const pts = [[360, .08], [420, .35], [510, 1], [840, 1], [900, .55], [960, .35], [1020, .15], [1110, 0]];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (t - a) / (b - a); }
  return 0;
}
// ---------- staff requests & notifications ----------
const DN = { en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], sv: ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'] };
export const dayName = (d, lang) => (DN[lang] || DN.en)[d];
export const reqLabel = (r, lang) => {
  const sv = lang === 'sv', d = dayName(r.day, lang), w = (sv ? ' v.' : ' w.') + r.week, who = r.with && person(r.with) ? person(r.with).name : '';
  const part = r.from != null && !(r.from <= DS && r.to >= DE) ? ' ' + fmt(r.from) + '–' + fmt(r.to) : '';
  if (r.type === 'sick') return (sv ? 'Sjuk ' : 'Sick on ') + d + w;
  if (r.type === 'cover') return (sv ? 'Täck del av pass ' : 'Cover part of shift on ') + d + w + ' ' + fmt(r.from) + '–' + fmt(r.to);
  if (r.type === 'swap') return (sv ? 'Byta ' + d + w + ' med ' : 'Swap ' + d + w + ' with ') + who;
  return (sv ? 'Kan inte arbeta ' : "Can't work ") + d + w + part;
};
export const noteLabel = (n, lang) => {
  const sv = lang === 'sv', p = n.p || {};
  if (n.key === 'published') return sv ? 'Vecka ' + p.w + ' är publicerad.' : 'Week ' + p.w + ' is published.';
  if (n.key === 'changed') return sv ? 'Ditt pass på ' + dayName(p.day, lang) + ' v.' + p.week + ' är ändrat till ' + p.t + '.' : 'Your shift on ' + dayName(p.day, lang) + ' w.' + p.week + ' was changed to ' + p.t + '.';
  const what = n.req ? reqLabel(n.req, lang) : '';
  if (n.key === 'approved') return (sv ? 'Godkänd: ' : 'Approved: ') + what;
  if (n.key === 'declined') return (sv ? 'Inte godkänd: ' : 'Declined: ') + what;
  if (n.key === 'coverIn') return sv ? 'Godkänt: du tar ' + fmt(p.from) + '–' + fmt(p.to) + ' ' + dayName(p.day, lang) + ' v.' + p.week + ' i ' + ((grp(p.group) || {}).name || '') + '.' : 'Approved: you take ' + fmt(p.from) + '–' + fmt(p.to) + ' on ' + dayName(p.day, lang) + ' w.' + p.week + ' in ' + ((grp(p.group) || {}).name || '') + '.';
  if (n.key === 'subConfirmed') return sv ? 'Bekräftat: du arbetar ' + dayName(p.day, lang) + ' v.' + p.week + ' ' + fmt(p.from) + '–' + fmt(p.to) + ' i ' + ((grp(p.group) || {}).name || '') + '.' : 'Confirmed: you work on ' + dayName(p.day, lang) + ' w.' + p.week + ' ' + fmt(p.from) + '–' + fmt(p.to) + ' in ' + ((grp(p.group) || {}).name || '') + '.';
  if (n.key === 'swapIn') return sv ? 'Du har fått ' + (person(p.from) || {}).name + 's pass på ' + dayName(p.day, lang) + ' v.' + p.week + '.' : 'You now have ' + (person(p.from) || {}).name + "'s shift on " + dayName(p.day, lang) + ' w.' + p.week + '.';
  return '';
};
export function submitRequest(st, r) {
  st.requests = st.requests || []; st.notes = st.notes || [];
  const q = { id: 'q' + Date.now(), at: Date.now(), status: r.type === 'sick' ? 'new' : r.type === 'cover' ? 'open' : 'pending', ...r };
  if (r.type === 'sick') { st.absences.push({ staff: r.staff, week: r.week, day: r.day, from: 0, to: 1440, reason: 'sick' }); makeFree(st, r.staff, r.week, r.day, r.clock ?? nowMin()); }
  if (r.type === 'cover') { q.offered = coverCands(st, q, 'en').filter(x => x.ok).map(x => x.id); q.declined = []; q.by = null; if (!q.offered.length) q.status = 'nobody'; }
  st.requests.push(q); return q;
}
export function decideRequest(st, id, ok) {
  const r = (st.requests || []).find(x => x.id === id); if (!r) return; st.notes = st.notes || [];
  if (r.type === 'sick') { r.status = 'seen'; return; }
  r.status = ok ? 'approved' : 'declined';
  if (ok && r.type === 'swap') for (const x of st.shifts) if (x.week === r.week && x.day === r.day) { if (x.staff === r.staff) x.staff = r.with; else if (x.staff === r.with) x.staff = r.staff; }
  if (ok && r.type === 'cover' && r.by) {
    const a = r.from, b = r.to, add = [];
    st.shifts = st.shifts.flatMap(x => {
      if (x.staff !== r.staff || x.week !== r.week || x.day !== r.day || x.end <= a || x.start >= b) return [x];
      const out = []; if (x.start < a) out.push({ ...x, end: a }); if (x.end > b) out.push({ ...x, id: 'h' + (++st.nid), start: b });
      if (x.type !== 'break') { const s0 = Math.max(x.start, a), e0 = Math.min(x.end, b), l = add[add.length - 1];
        if (l && l.end === s0 && l.group === x.group) l.end = e0; else add.push({ id: 'h' + (++st.nid), staff: r.by, week: r.week, day: r.day, start: s0, end: e0, type: 'contact', group: x.group, cover: r.staff }); }
      return out;
    });
    st.shifts.push(...add);
    st.notes.push({ id: 'n' + Date.now() + 'c', to: r.by, key: 'coverIn', p: { from: a, to: b, day: r.day, week: r.week, group: (add[0] || {}).group }, at: Date.now(), read: false });
  }
  if (ok && r.type === 'unavail') st.absences.push({ staff: r.staff, week: r.week, day: r.day, from: r.from ?? 0, to: r.to ?? 1440, reason: 'leave' });
  st.notes.push({ id: 'n' + Date.now(), to: r.staff, key: ok ? 'approved' : 'declined', req: { ...r }, at: Date.now(), read: false });
  if (ok && r.type === 'swap') st.notes.push({ id: 'n' + Date.now() + 'b', to: r.with, key: 'swapIn', p: { from: r.staff, day: r.day, week: r.week }, at: Date.now(), read: false });
}
export const MERGE0 = { on: true, am: 450, pm: 960, ratio: 8, room: 'g3' };
// Children, adults needed and merge state at minute `mid` of `day`. Shared by the planner's staffing row and the solver.
function needAt(s, day, mid) {
  const f = day === 4 ? .7 : 1, M = s.merge || MERGE0, merged = !!M.on && (mid < M.am || mid >= M.pm);
  const groups = GROUPS.map(g => {
    const c = (mid < g.open || mid > g.close) ? 0 : Math.round(g.max * curve(mid) * f);
    const sn = 0;
    return { id: g.id, children: c, need: c ? Math.ceil(c / g.ratio) + sn : 0, frac: c / g.ratio, sn };
  });
  const children = groups.reduce((a, g) => a + g.children, 0);
  const need = merged ? (children ? Math.max(1, Math.ceil(children / M.ratio)) : 0) : Math.ceil(groups.reduce((a, g) => a + g.frac, 0) - 1e-9) + groups.reduce((a, g) => a + g.sn, 0);
  return { children, need, merged, groups };
}
function slotsFor(s, day, uncovSet) {
  const out = [];
  const contacts = s.shifts.filter(x => x.week === s.week && x.day === day && x.type === 'contact' && !uncovSet.has(x.id));
  for (let t = DS; t < DE; t += s.slot) {
    const mid = t + s.slot / 2, { children, need, merged, groups } = needAt(s, day, mid);
    groups.forEach(g => { g.have = new Set(contacts.filter(x => x.group === g.id && x.start <= mid && x.end > mid).map(x => x.staff)).size; });
    const have = new Set(contacts.filter(x => x.start <= mid && x.end > mid).map(x => x.staff)).size;
    out.push({ t, children, need, have, merged, groups, status: have < need ? 'under' : (have >= need + 2 && need > 0 || (need === 0 && have > 1)) ? 'over' : 'ok' });
  }
  return out;
}

// ---------- OR-Tools solver ----------
// The solver (solver/ in the repo) gets one self-contained problem per week and returns shifts and opener/closer roles.
const SOLVER_SLOT = 15;
// Where the solver server runs; override with ?solver=https://… in the page URL.
const SOLVER_URL = ((typeof location !== 'undefined' && new URLSearchParams(location.search).get('solver')) || 'http://localhost:8000').replace(/\/$/, '');
export const checkWeek = (s, w, lang = 'en') => derive({ ...s, week: w }, T[lang] || T.en, lang).warns;
export function solverProblem(s, weeks) {
  const n = (DE - DS) / SOLVER_SLOT, mids = Array.from({ length: n }, (_, i) => DS + i * SOLVER_SLOT + SOLVER_SLOT / 2);
  return {
    dayStart: DS, slot: SOLVER_SLOT, slots: n, groups: GROUPS.map(g => g.id),
    weeks: weeks.map(w => ({
      week: w,
      staff: STAFF.map(p => ({
        id: p.id, group: p.group, open: !!p.open, close: !!p.close, sn: !!p.sn,
        target: effC(p, w), planning: nonChildTarget(s, p, w),
        days: [0, 1, 2, 3, 4].map(d => !(p.end && w > p.end) && !(p.off || []).includes(d) && !isAbsent(s, p.id, w, d)),
        earliest: p.earliest, latest: p.latest,
      })),
      days: [0, 1, 2, 3, 4].map(d => {
        const at = mids.map(m => needAt(s, d, m));
        return {
          need: at.map(x => x.need), merged: at.map(x => x.merged),
          groupNeed: Object.fromEntries(GROUPS.map((g, i) => [g.id, at.map(x => x.merged ? 0 : x.groups[i].need)])),
          sn: (s.snKids || []).filter(k => k.days.includes(d)).map(k => ({ group: k.unit, slots: mids.map((m, i) => m > k.from && m < k.to ? i : -1).filter(i => i >= 0) })),
        };
      }),
    })),
  };
}
// Replaces the shifts and roles of the solved weeks with the solver's result.
export function applySolution(st, sol) {
  for (const wk of sol.weeks) {
    st.shifts = st.shifts.filter(x => x.week !== wk.week).concat(wk.shifts.map(x => ({ ...x, id: 'h' + (++st.nid), week: wk.week })));
    for (let d = 0; d < 5; d++) st.roles[wk.week + '-' + d] = { ...(wk.roles[d] || {}) };
  }
}
export const seedState = () => seed();

// ---------- substitutes, free shifts & cover ----------
export const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const S2 = (lang, a, b) => lang === 'sv' ? a : b;
const rp = (s, type, w) => { const r = (s.rules || []).find(x => x.type === type), v = r && ruleVer(r, w); return v && v.on ? { code: r.id.toUpperCase(), ...v.p } : null; };
const dayShifts = (s, pid, w, d) => s.shifts.filter(x => x.staff === pid && x.week === w && x.day === d).sort((a, b) => a.start - b.start);
const bookedOn = (p, w, d) => (p.booked || []).filter(b => b.week === w && b.day === d);
const spanOf = (p, s, w, d) => { const l = [...dayShifts(s, p.id, w, d).map(x => [x.start, x.end]), ...bookedOn(p, w, d).map(x => [x.from, x.to])]; return l.length ? [Math.min(...l.map(x => x[0])), Math.max(...l.map(x => x[1]))] : null; };
const isAbsent = (s, pid, w, d) => s.absences.some(z => z.staff === pid && z.week === w && z.day === d) || (() => { const p = person(pid); return !!(p && onLeave(p, w, d)); })();
function restIssue(s, p, w, d, a, b, lang) {
  const R = rp(s, 'rest', w); if (!R) return null;
  const prev = d > 0 ? spanOf(p, s, w, d - 1) : null, next = d < 4 ? spanOf(p, s, w, d + 1) : null, cur = spanOf(p, s, w, d);
  const st = Math.min(a, cur ? cur[0] : a), en = Math.max(b, cur ? cur[1] : b), r = Math.min(prev ? 1440 - prev[1] + st : 1e9, next ? 1440 - en + next[0] : 1e9);
  return r < R.h * 60 ? R.code + ' · ' + S2(lang, 'bara ' + hrs(r, lang) + ' vila mellan passen', 'only ' + hrs(r, lang) + ' rest between shifts') : null;
}
export function freeNeeds(s, pid, w, d, from, to, group) {
  const r = s.roles[w + '-' + d] || {}, p = person(pid) || {};
  return { open: r.open === pid, close: r.close === pid, sn: !!p.sn && (s.snKids || []).some(k => k.unit === group && k.days.includes(d) && k.from < to && k.to > from) };
}
export function subCands(s, f, lang) {
  return SUBS.map(p => {
    const w = f.week, d = f.day; let why = null;
    if ((f.declined || []).includes(p.id)) why = S2(lang, 'Tackade nej', 'Declined');
    else if (!p.days.includes(d)) why = S2(lang, 'Inte tillgänglig på ', 'Not available on ') + dayName(d, lang);
    else if (f.needs.sn && !p.sn) why = S2(lang, 'Inte utbildad för särskilt stöd', 'Not trained for special needs');
    else if (f.needs.open && !p.open) why = S2(lang, 'Får inte öppna', 'May not open');
    else if (f.needs.close && !p.close) why = S2(lang, 'Får inte stänga', 'May not close');
    else {
      const bk = bookedOn(p, w, d).find(b => b.from < f.to && b.to > f.from), sh = f.by !== p.id && dayShifts(s, p.id, w, d).find(x => x.start < f.to && x.end > f.from);
      if (bk || sh) why = S2(lang, 'Arbetar redan då', 'Already working then') + (bk && bk.where ? ' · ' + bk.where : '');
      else if (f.by !== p.id) why = restIssue(s, p, w, d, f.from, f.to, lang);
    }
    return { id: p.id, name: p.name, ok: !why, why, pref: (p.prefer || []).includes(f.group) };
  });
}
function route(st, f, first) {
  const ok = subCands(st, f, 'en').filter(c => c.ok), pref = ok.filter(c => c.pref);
  if (first) f.clock += 1;
  if (first && pref.length) { f.stage = 'preferred'; f.offered = pref.map(c => c.id); f.log.push({ t: f.clock, k: 'offerPref', ids: f.offered.slice() }); }
  else if (ok.length) { f.stage = 'all'; f.offered = ok.map(c => c.id); f.log.push({ t: f.clock, k: 'offerAll', ids: f.offered.slice() }); }
  else { f.stage = 'all'; f.offered = []; f.status = 'nobody'; f.log.push({ t: f.clock, k: 'nobody' }); }
}
export function makeFree(st, pid, w, d, t) {
  st.free = st.free || [];
  if (st.free.some(f => f.staff === pid && f.week === w && f.day === d)) return null;
  const sh = dayShifts(st, pid, w, d); if (!sh.length) return null;
  const from = sh[0].start, to = sh[sh.length - 1].end, c = sh.find(x => x.type === 'contact') || sh[0];
  const f = { id: 'f' + Date.now(), staff: pid, week: w, day: d, from, to, group: c.group, needs: freeNeeds(st, pid, w, d, from, to, c.group), status: 'offered', stage: 'preferred', offered: [], declined: [], by: null, clock: t, log: [{ t, k: 'sick' }] };
  route(st, f, true); st.free.push(f); return f;
}
const freeById = (st, id) => (st.free || []).find(x => x.id === id);
export function skipFree(st, id) {
  const f = freeById(st, id); if (!f || f.status !== 'offered') return;
  f.clock += 15;
  if (f.stage === 'preferred') { f.log.push({ t: f.clock, k: 'noAnswer', ids: f.offered.slice() }); route(st, f, false); }
  else f.log.push({ t: f.clock, k: 'wait' });
}
export function acceptFree(st, id, subId) {
  const f = freeById(st, id); if (!f || f.status !== 'offered' || !f.offered.includes(subId)) return false;
  f.status = 'accepted'; f.by = subId; f.clock += 6; f.log.push({ t: f.clock, k: 'accepted', by: subId });
  st.shifts.forEach(x => { if (x.staff === f.staff && x.week === f.week && x.day === f.day) { x.was = x.staff; x.staff = subId; } });
  return true;
}
export function declineFree(st, id, subId) {
  const f = freeById(st, id); if (!f || f.status !== 'offered') return;
  f.declined = [...(f.declined || []), subId]; f.log.push({ t: f.clock, k: 'declined', by: subId });
  if (f.offered.every(x => f.declined.includes(x))) route(st, f, false);
}
export function confirmFree(st, id) {
  const f = freeById(st, id); if (!f || f.status !== 'accepted') return;
  f.status = 'confirmed'; f.clock += 2; f.log.push({ t: f.clock, k: 'confirmed', by: f.by });
  st.notes = st.notes || []; st.notes.push({ id: 'n' + Date.now() + 'f', to: f.by, key: 'subConfirmed', p: { week: f.week, day: f.day, from: f.from, to: f.to, group: f.group }, at: Date.now(), read: false });
}
export function removeFree(st, pid, w, d) {
  const f = (st.free || []).find(x => x.staff === pid && x.week === w && x.day === d); if (!f) return;
  st.shifts.forEach(x => { if (x.was === pid && x.week === w && x.day === d) { x.staff = pid; delete x.was; } });
  st.free = st.free.filter(x => x !== f);
}
export function nonChildTarget(s, p, w) {
  const full = contractH(p, w) * 60; if (!full) return 0;
  const h = p.nonChild != null ? p.nonChild : Math.round(((s.prefs || {}).nonChild ?? 5) * contractPct(p, w) / 100 * 2) / 2;
  return Math.round(h * 60 * effC(p, w) / full);
}
export function personWeek(s, pid, w) {
  const p = person(pid) || {}, r = { contact: 0, break: 0, planning: 0, meeting: 0, sick: 0, sickDays: 0, vac: 0, leave: 0, days: [] };
  for (let d = 0; d < 5; d++) {
    const own = s.shifts.filter(x => x.week === w && x.day === d && (x.staff === pid || x.was === pid));
    const z = s.absences.find(a => a.staff === pid && a.week === w && a.day === d), l = onLeave(p, w, d), full = z && z.from <= 0 && z.to >= 1440;
    const reason = full ? (z.reason || 'sick') : l ? l.kind : null, mins = own.reduce((a, x) => a + x.end - x.start, 0);
    const day = { d, st: 'none', child: 0, non: 0, sick: 0 };
    if (reason === 'sick') { day.st = 'sick'; day.sick = mins; r.sick += mins; r.sickDays++; }
    else if (reason === 'vacation') { day.st = 'vacation'; r.vac++; }
    else if (reason) { day.st = 'leave'; r.leave++; }
    else {
      own.filter(x => x.staff === pid && !(z && x.start < z.to && x.end > z.from)).forEach(x => { r[x.type] += x.end - x.start; if (x.type === 'contact' || x.type === 'break') day.child += x.end - x.start; else day.non += x.end - x.start; });
      day.st = day.child + day.non ? 'work' : (p.off || []).includes(d) ? 'off' : 'none';
    }
    r.days.push(day);
  }
  r.child = r.contact + r.break; r.non = r.planning + r.meeting; r.worked = r.child + r.non;
  r.C = p.sub ? 0 : effC(p, w); r.N = p.sub ? 0 : nonChildTarget(s, p, w); r.A = r.C - r.N;
  return r;
}
export function coverCands(s, r, lang) {
  const w = r.week, d = r.day, a = r.from, b = r.to, dur = b - a, D = derive({ ...s, week: w }, T[lang] || T.en, lang);
  const RW = rp(s, 'week', w), RA = rp(s, 'avg', w), RC = rp(s, 'cont', w);
  return STAFF.filter(p => p.id !== r.staff).map(p => {
    let why = null; const mine = dayShifts(s, p.id, w, d);
    if ((r.declined || []).includes(p.id)) why = S2(lang, 'Tackade nej', 'Declined');
    else if (isAbsent(s, p.id, w, d)) why = S2(lang, 'Frånvarande', 'Away');
    else if ((p.end && w > p.end) || (p.off || []).includes(d) || (p.earliest != null && a < p.earliest) || (p.latest != null && b > p.latest)) why = S2(lang, 'Inte tillgänglig då', 'Not available then');
    else if (mine.some(x => x.start < b && x.end > a)) why = S2(lang, 'Arbetar redan då', 'Already working then');
    else if ((why = restIssue(s, p, w, d, a, b, lang))) { /* rest */ }
    else if (RW && D.minsW[p.id] + dur > RW.h * 60) why = RW.code + ' · ' + S2(lang, 'över ' + RW.h + ' h denna vecka', 'over ' + RW.h + ' h this week');
    else if (RA && (D.minsB[p.id] + dur) / BLOCK_WEEKS > RA.h * 60) why = RA.code + ' · ' + S2(lang, 'över ' + RA.h + ' h i snitt', 'over ' + RA.h + ' h on average');
    else if (RC) {
      let run = 0, prev = null, mx = 0;
      for (const x of [...mine, { start: a, end: b, type: 'contact' }].sort((x, y) => x.start - y.start)) { if (x.type === 'break' || (prev != null && x.start - prev >= 15)) run = 0; if (x.type !== 'break') { run += x.end - x.start; mx = Math.max(mx, run); } prev = x.end; }
      if (mx > RC.h * 60) why = RC.code + ' · ' + S2(lang, hrs(mx, lang) + ' utan rast', hrs(mx, lang) + ' without a break');
    }
    return { id: p.id, name: p.name, ok: !why, why };
  });
}
export function coverRespond(st, id, pid, yes) {
  const r = (st.requests || []).find(x => x.id === id); if (!r || r.status !== 'open' || !(r.offered || []).includes(pid)) return false;
  if (yes) { r.status = 'matched'; r.by = pid; r.matchedAt = Date.now(); }
  else { r.declined = [...(r.declined || []), pid]; if (r.offered.every(x => r.declined.includes(x))) r.status = 'nobody'; }
  return true;
}

// ---------- rules ----------
const nmOf = p => { const a = p.name.split(' '); return a[0] + (a[1] ? ' ' + a[1][0] + '.' : ''); };
const wd = (w, d) => w * 10 + d;
export const onLeave = (p, w, d) => (p.leave || []).find(l => wd(l.w1, l.d1) <= wd(w, d) && wd(w, d) <= wd(l.w2, l.d2));
function derive(s, L, lang) {
  const wk = s.shifts.filter(x => x.week === s.week), b0 = blockOf(s.week), RT = RULE_TEXT[lang] || RULE_TEXT.en;
  const abs = s.absences.filter(z => z.week === s.week).map(z => ({ ...z, reason: z.reason || 'sick' }));
  for (const p of STAFF) for (let d = 0; d < 5; d++) { const l = onLeave(p, s.week, d); if (l && !abs.some(z => z.staff === p.id && z.day === d)) abs.push({ staff: p.id, week: s.week, day: d, from: 0, to: 1440, reason: l.kind }); }
  const absent = (pid, day, a, b) => abs.some(z => z.staff === pid && z.day === day && z.from < b && z.to > a);
  const uncov = new Set(wk.filter(x => absent(x.staff, x.day, x.start, x.end)).map(x => x.id));
  const active = (s.rules || []).map(r => ({ r, v: ruleVer(r, s.week) })).filter(x => x.v && x.v.on);
  const one = t => { const x = active.find(y => y.r.type === t); return x ? { id: x.r.id, ...x.v.p } : null; };
  const many = t => active.filter(y => y.r.type === t).map(x => ({ id: x.r.id, ...x.v.p }));
  const warns = [], bad = new Set(); let k = 0;
  const W = (rule, key, v, day, shiftId, kind = 'rule', staff = null) => {
    const r = rule && (s.rules || []).find(x => x.id === rule), rv = r && ruleVer(r, s.week);
    warns.push({ id: 'w' + (++k), text: tf(L[key], v), day, shiftId, kind, rule, ruleName: r ? tf(RT[r.type], fmtP(rv.p, lang)) : rule === 'ratio' ? RT.ratio : '', code: r ? r.id.toUpperCase() : rule === 'ratio' ? 'R0' : '', staff: staff || (shiftId ? (wk.find(x => x.id === shiftId) || {}).staff : null) });
    if (shiftId) bad.add(shiftId);
  };
  const minsW = {}, minsB = {}, byType = {};
  for (const p of allP()) {
    const mine = wk.filter(x => x.staff === p.id && !uncov.has(x.id));
    minsW[p.id] = mine.reduce((a, x) => a + x.end - x.start, 0);
    byType[p.id] = Object.fromEntries(TYPES.map(t => [t, mine.filter(x => x.type === t).reduce((a, x) => a + x.end - x.start, 0)]));
    minsB[p.id] = s.shifts.filter(x => x.staff === p.id && !uncov.has(x.id) && x.week >= b0 && x.week < b0 + BLOCK_WEEKS).reduce((a, x) => a + x.end - x.start, 0);
  }
  const R = { rest: one('rest'), week: one('week'), avg: one('avg'), cont: one('cont'), brk: one('breakLen'), oc: one('openClose'), av: one('avail'), ab: one('absent'), sn: one('sn') };
  const breaksR = many('breaks'), dayR = many('dayMax'), minR = many('minStaff');
  for (const p of STAFF) {
    let lastEnd = null; const name = nmOf(p);
    const mineAll = wk.filter(x => x.staff === p.id && !uncov.has(x.id));
    if (R.av && p.end && s.week > p.end && mineAll.length) W(R.av.id, 'w_ended', { name, w: p.end }, null, null, 'rule', p.id);
    for (let d = 0; d < 5; d++) {
      const segs = mineAll.filter(x => x.day === d).sort((a, b) => a.start - b.start);
      if (!segs.length) { lastEnd = null; continue; }
      const day = L.dayW[d], first = segs[0], last = segs[segs.length - 1];
      if (R.rest && lastEnd != null && (1440 - lastEnd + first.start) < R.rest.h * 60) W(R.rest.id, 'w_rest', { name, h: hrs(1440 - lastEnd + first.start, lang), lim: hrs(R.rest.h * 60, lang), day: L.dayW[d - 1] }, d, first.id);
      lastEnd = last.end;
      if (R.av) {
        if (p.off.includes(d)) W(R.av.id, 'w_unav', { name, day }, d, first.id);
        if (p.earliest != null && first.start < p.earliest) W(R.av.id, 'w_early', { name, day, t: fmt(first.start), lim: fmt(p.earliest) }, d, first.id);
        if (p.latest != null && last.end > p.latest) W(R.av.id, 'w_late', { name, day, t: fmt(last.end), lim: fmt(p.latest) }, d, last.id);
      }
      let run = 0, prevEnd = null, flagged = false, work = 0;
      for (const x of segs) {
        if (prevEnd != null && x.start < prevEnd) W(null, 'w_overlap', { name, day }, d, x.id);
        if (x.type === 'break' || (prevEnd != null && x.start - prevEnd >= 15)) run = 0;
        if (x.type === 'break') { const m = x.end - x.start; if (R.brk && (m < R.brk.a || m > R.brk.b)) W(R.brk.id, 'w_break', { name, m, day, a: R.brk.a, b: R.brk.b }, d, x.id); }
        else { work += x.end - x.start; run += x.end - x.start; if (R.cont && run > R.cont.h * 60 && !flagged) { flagged = true; W(R.cont.id, 'w_cont', { name, h: hrs(run, lang), lim: hrs(R.cont.h * 60, lang), day }, d, x.id); } }
        prevEnd = x.end;
      }
      const span = last.end - first.start;
      for (const b of breaksR) { const ok = segs.filter(x => x.type === 'break' && x.end - x.start >= b.a).length; if (span > b.over * 60 && ok < b.n) W(b.id, 'w_breaks', { name, day, n: ok, req: b.n, over: fmtN(b.over, lang) }, d, first.id); }
      for (const m of dayR) if (work > m.h * 60) W(m.id, 'w_dayMax', { name, day, h: hrs(work, lang), lim: hrs(m.h * 60, lang) }, d, first.id);
    }
    if (R.week && minsW[p.id] > R.week.h * 60) W(R.week.id, 'w_week', { name, h: hrs(minsW[p.id], lang), lim: hrs(R.week.h * 60, lang) }, null, null, 'rule', p.id);
    if (R.avg && minsB[p.id] / BLOCK_WEEKS > R.avg.h * 60) W(R.avg.id, 'w_avg', { name, h: hrs(minsB[p.id] / BLOCK_WEEKS, lang), lim: hrs(R.avg.h * 60, lang) }, null, null, 'rule', p.id);
  }
  const slotsByDay = [0, 1, 2, 3, 4].map(d => slotsFor(s, d, uncov));
  if (R.oc) for (let d = 0; d < 5; d++) { const r = s.roles[s.week + '-' + d] || {}, day = L.dayW[d]; if (!r.open) W(R.oc.id, 'w_noOpen', { day }, d, null, 'role'); if (!r.close) W(R.oc.id, 'w_noClose', { day }, d, null, 'role'); }
  const units = [];
  for (const z of abs) {
    const ids = wk.filter(x => x.staff === z.staff && x.day === z.day && uncov.has(x.id)); if (!ids.length) continue;
    const from = Math.min(...ids.map(x => x.start)), to = Math.max(...ids.map(x => x.end));
    units.push({ key: z.staff + '-' + z.day, staff: z.staff, day: z.day, from, to, ids: ids.map(x => x.id), reason: z.reason });
    if (R.ab) W(R.ab.id, 'w_cover', { name: nmOf(person(z.staff)), why: L['why_' + z.reason] || z.reason, day: L.dayW[z.day], from: fmt(from), to: fmt(to) }, z.day, ids[0].id, 'cover');
  }
  const runs = (sl, test, cb) => { let i = 0; while (i < sl.length) { if (!test(sl[i])) { i++; continue; } let j = i; while (j + 1 < sl.length && test(sl[j + 1])) j++; if (sl[j].t + s.slot - sl[i].t >= 30) cb(i, j); i = j + 1; } };
  slotsByDay.forEach((sl, d) => {
    const day = L.dayW[d], fr = i => fmt(sl[i].t), to = j => fmt(sl[j].t + s.slot);
    runs(sl, x => x.status === 'under', (i, j) => W('ratio', 'w_under', { day, from: fr(i), to: to(j), have: Math.min(...sl.slice(i, j + 1).map(x => x.have)), need: Math.max(...sl.slice(i, j + 1).map(x => x.need)) }, d, null, 'staffing'));
    for (const m of minR) runs(sl, x => x.children > 0 && x.have < m.n, (i, j) => W(m.id, 'w_min', { day, from: fr(i), to: to(j), have: Math.min(...sl.slice(i, j + 1).map(x => x.have)), n: m.n }, d, null, 'staffing'));
    if (R.sn) for (const kid of (s.snKids || []).filter(q => q.days.includes(d))) {
      const cs = wk.filter(x => x.day === d && x.type === 'contact' && x.group === kid.unit && !uncov.has(x.id) && (person(x.staff) || {}).sn);
      runs(sl, x => { const mid = x.t + s.slot / 2; return mid > kid.from && mid < kid.to && !cs.some(q => q.start <= mid && q.end > mid); }, (i, j) => W(R.sn.id, 'w_sn', { unit: (grp(kid.unit) || {}).name, day, from: fr(i), to: to(j) }, d, null, 'staffing'));
    }
  });
  return { wk, uncov, warns, bad, minsW, minsB, byType, slotsByDay, units, absent, nm: nmOf };
}

function candidates(s, D, u, L, lang) {
  const dur = u.to - u.from, out = [];
  for (const p of STAFF) {
    if (p.id === u.staff) continue;
    let reason = null; const left = contractH(p, s.week) * 60 - D.minsW[p.id];
    if (D.absent(p.id, u.day, 0, 1440)) reason = L.r_absent;
    else if (p.end && s.week > p.end) reason = L.r_ended;
    else if (p.off.includes(u.day)) reason = tf(L.r_unav, { day: L.dayW[u.day] });
    else if (D.wk.some(x => x.staff === p.id && x.day === u.day && x.start < u.to && x.end > u.from)) reason = L.r_busy;
    else if (D.minsW[p.id] + dur > 2400) reason = L.r_40;
    else if (left < dur) reason = tf(L.r_contract, { h: hrs(Math.max(0, left), lang) });
    out.push({ id: p.id, name: p.name, sub: false, ok: !reason, reason, left, info: tf(L.c_staff, { h: hrs(Math.max(0, left), lang) }) });
  }
  for (const p of SUBS) {
    let reason = null;
    if (!p.days.includes(u.day)) reason = tf(L.r_unav, { day: L.dayW[u.day] });
    else if (D.wk.some(x => x.staff === p.id && x.day === u.day && x.start < u.to && x.end > u.from)) reason = L.r_busy;
    out.push({ id: p.id, name: p.name, sub: true, ok: !reason, reason, left: -1, info: tf(L.c_sub, { phone: p.phone }) });
  }
  return out.sort((a, b) => (b.ok - a.ok) || (a.sub - b.sub) || (b.left - a.left));
}

// ---------- controller ----------
export function controller(comp) {
  const KEY = 'schema-demo-v5' + ((typeof location !== 'undefined' && (location.search.match(/[?&]k=(guide\w*)/) || [])[1]) ? '-' + location.search.match(/[?&]k=(guide\w*)/)[1] : '');
  const load = () => { try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!j || !j.s) return null;
    j.staff.forEach(x => { const p = STAFF.find(y => y.id === x.id); if (p) Object.assign(p, x); else STAFF.push(x); });
    for (let i = STAFF.length - 1; i >= 0; i--) if (!j.staff.some(x => x.id === STAFF[i].id)) STAFF.splice(i, 1);
    (j.groups || []).forEach(x => { const g = GROUPS.find(y => y.id === x.id); if (g) Object.assign(g, x); }); (j.subs || []).forEach(x => { const p = SUBS.find(y => y.id === x.id); if (p) Object.assign(p, x); }); if (!j.s.free) j.s.free = []; if (!j.s.requests) j.s.requests = []; if (!j.s.notes) j.s.notes = []; return j.s; } catch (e) { return null; } };
  const store = createStore(load() || seed());
  const me = Math.random().toString(36).slice(2); let syncing = false;
  let saveT; const save = () => { if (syncing) return; clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify({ s: store.get(), staff: STAFF, groups: GROUPS, subs: SUBS })); window.dispatchEvent(new CustomEvent('schema-sync', { detail: me })); } catch (e) {} }, 300); };
  store.sub(save);
  const reload = () => { const j = load(); if (!j) return; syncing = true; try { store.replace(j); } finally { syncing = false; } };
  window.addEventListener('storage', e => { if (e.key === KEY) reload(); });
  window.addEventListener('schema-sync', e => { if (e.detail !== me) reload(); });
  const touch = fn => store.set(st => { fn && fn(st); });
  const resetDemo = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
  const ui = { day: 1, sel: null, person: null, flash: null, toast: null, focus: 'p1', expanded: true };
  store.sub(() => comp.forceUpdate());
  const up = p => { Object.assign(ui, p); comp.forceUpdate(); };
  let toastT;
  const toast = (msg, ms = 2600) => { clearTimeout(toastT); up({ toast: msg }); toastT = setTimeout(() => up({ toast: null }), ms); };

  function drag(e, ctx) {
    if (e.button != null && e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    const axis = ctx.axis || 'x', track = e.currentTarget.closest('[data-track]'); if (!track) return;
    const r = track.getBoundingClientRect(), size = axis === 'x' ? r.width : r.height, origin = axis === 'x' ? r.left : r.top;
    const s = store.get(), slot = s.slot, pos = ev => axis === 'x' ? ev.clientX : ev.clientY;
    const toMin = p => DS + (p - origin) / size * SPAN, snap = m => Math.round(m / slot) * slot, clamp = m => Math.max(DS, Math.min(DE, m));
    const p0 = pos(e); let moved = false, id = ctx.id;
    store.begin();
    if (ctx.mode === 'new') {
      const a = clamp(Math.floor(toMin(p0) / slot) * slot), day = ctx.day ?? ui.day;
      id = 'h' + (++s.nid); s.shifts.push({ id, staff: ctx.staff, week: s.week, day, start: a, end: Math.min(DE, a + slot), type: 'contact', group: person(ctx.staff).group || 'g1' });
    }
    const sh = store.get().shifts.find(x => x.id === id), o = { ...sh };
    // neighbours that touch this shift: edges between them move together, breaks keep their length
    const sib = ctx.mode === 'new' ? [] : store.get().shifts.filter(x => x.staff === sh.staff && x.week === sh.week && x.day === sh.day && x.id !== sh.id);
    const prev = sib.find(x => x.end === o.start), next = sib.find(x => x.start === o.end);
    const prev2 = prev && sib.find(x => x.end === prev.start), next2 = next && sib.find(x => x.start === next.end);
    const P = prev && { ...prev }, N = next && { ...next }, P2 = prev2 && { ...prev2 }, N2 = next2 && { ...next2 };
    let mode = ctx.mode;
    if (sh.type === 'break' && ((mode === 'start' && prev) || (mode === 'end' && next) || (mode === 'move' && (prev || next)))) mode = 'slide';
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const move = ev => {
      if (!moved && Math.abs(pos(ev) - p0) < 4) return; moved = true;
      const dm = snap(toMin(pos(ev)) - toMin(p0));
      store.live(() => {
        if (mode === 'slide') {
          const len = o.end - o.start, st = cl(o.start + dm, prev ? P.start + slot : DS, next ? N.end - slot - len : DE - len);
          sh.start = st; sh.end = st + len; if (prev) prev.end = st; if (next) next.start = st + len;
        } else if (mode === 'move') { const len = o.end - o.start; sh.start = Math.max(DS, Math.min(DE - len, o.start + dm)); sh.end = sh.start + len; }
        else if (mode === 'end') {
          if (next && next.type === 'break') {
            const len = N.end - N.start, e = cl(o.end + dm, o.start + slot, next2 ? N2.end - slot - len : DE - len);
            sh.end = e; next.start = e; next.end = e + len; if (next2) next2.start = e + len;
          } else if (next) { const e = cl(o.end + dm, o.start + slot, N.end - slot); sh.end = e; next.start = e; }
          else sh.end = Math.min(DE, Math.max(o.start + slot, o.end + dm));
        } else if (mode === 'start') {
          if (prev && prev.type === 'break') {
            const len = P.end - P.start, st = cl(o.start + dm, prev2 ? P2.start + slot + len : DS + len, o.end - slot);
            sh.start = st; prev.end = st; prev.start = st - len; if (prev2) prev2.end = st - len;
          } else if (prev) { const st = cl(o.start + dm, P.start + slot, o.end - slot); sh.start = st; prev.end = st; }
          else sh.start = Math.max(DS, Math.min(o.end - slot, o.start + dm));
        }
        else { const b = clamp(snap(toMin(pos(ev)))); sh.start = Math.min(o.start, b); sh.end = Math.max(o.start + slot, b); }
      });
    };
    const end = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end);
      if (!moved) { store.cancel(); if (ctx.mode !== 'new') up({ sel: id, person: null }); else up({ sel: null }); }
      else { store.commit(); up({ sel: id, person: null }); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
  }

  function dragPerson(e, staffId) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    const root = e.currentTarget.closest('[data-root]'); if (!root) return;
    const x0 = e.clientX, y0 = e.clientY; let moved = false;
    const locate = ev => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY), tr = el && el.closest('[data-track]');
      if (!tr || !root.contains(tr)) return null;
      const r = tr.getBoundingClientRect(), slot = store.get().slot;
      const m = Math.round((DS + (ev.clientX - r.left) / r.width * SPAN - 30) / slot) * slot;
      return Math.max(DS, Math.min(DE - 60, m));
    };
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return; moved = true;
      const rr = root.getBoundingClientRect(), sc = rr.width / root.offsetWidth || 1;
      up({ ghost: { staff: staffId, name: person(staffId).name, x: (ev.clientX - rr.left) / sc, y: (ev.clientY - rr.top) / sc, at: locate(ev) } });
    };
    const end = ev => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end);
      const m = moved ? locate(ev) : null; ui.ghost = null;
      if (!moved) { up({ person: staffId, sel: null }); return; }
      if (m == null) { comp.forceUpdate(); return; }
      store.set(st => { const id = 'h' + (++st.nid); st.shifts.push({ id, staff: staffId, week: st.week, day: ui.day, start: m, end: m + 60, type: 'contact', group: person(staffId).group || 'g1' }); ui.sel = id; ui.person = null; });
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
  }

  function view(lang = 'en', opt = {}) {
    const L = T[lang] || T.en, s = store.get(), pal = opt.pal || {}, axis = opt.axis || 'x';
    const D = derive(s, L, lang), day = ui.day, b0 = blockOf(s.week);
    const col = t => pal[t] || { bg: '#ccc', fg: '#111' };
    const svm = x => {
      const un = D.uncov.has(x.id), w = pct(x.end) - pct(x.start);
      return {
        id: x.id, type: x.type, typeName: L[x.type], left: pct(x.start), width: w, top: pct(x.start), height: w,
        time: fmt(x.start) + '–' + fmt(x.end), label: w > 7 ? fmt(x.start) + '–' + fmt(x.end) : '', short: w > 3.5 ? L[x.type].slice(0, 1) : '',
        bg: un ? (pal.uncovered || 'repeating-linear-gradient(45deg,#fff 0 4px,#f2c4c4 4px 8px)') : col(x.type).bg,
        fg: un ? (pal.uncoveredFg || '#9b1c1c') : col(x.type).fg, uncovered: un, warn: D.bad.has(x.id), selected: ui.sel === x.id,
        ring: ui.sel === x.id ? (pal.selRing || '0 0 0 2px #111') : D.bad.has(x.id) ? (pal.warnRing || '0 0 0 2px #d33') : un ? '0 0 0 1.5px ' + (pal.uncoveredFg || '#c33') : 'none',
        tip: L[x.type] + ' ' + fmt(x.start) + '–' + fmt(x.end), groupName: grp(x.group)?.name || '', warnDot: D.bad.has(x.id),
        down: e => drag(e, { mode: 'move', id: x.id, axis }), dStart: e => drag(e, { mode: 'start', id: x.id, axis }), dEnd: e => drag(e, { mode: 'end', id: x.id, axis }),
      };
    };
    const role = d => s.roles[s.week + '-' + d] || {};
    const hoursOf = p => {
      const m = D.minsW[p.id], c = effC(p, s.week), diff = m - c;
      const flag = p.sub ? 'ok' : diff > 15 ? 'over' : diff < -15 ? 'under' : 'ok';
      return {
        total: hrs(m, lang), contract: p.sub ? '' : hrs(c, lang), text: p.sub ? hrs(m, lang) : hrs(m, lang) + ' / ' + hrs(c, lang).replace(' h', '') + ' h',
        flag, isOver: flag === 'over', isUnder: flag === 'under', isOk: flag === 'ok', flagText: L[flag] + (flag !== 'ok' ? ' ' + (diff > 0 ? '+' : '−') + hrs(Math.abs(diff), lang) : ''),
        fill: c ? Math.min(100, m / c * 100) : 0, overFill: c && m > c ? Math.min(30, (m - c) / c * 100) : 0,
        block: hrs(D.minsB[p.id], lang) + (p.sub ? '' : ' / ' + hrs(c * BLOCK_WEEKS, lang)),
        types: ['contact', 'break', 'planning', 'meeting'].map(t => ({ key: t, name: L[t], h: hrs(D.byType[p.id][t], lang), w: c ? D.byType[p.id][t] / Math.max(c, m) * 100 : 0, bg: col(t).bg })),
      };
    };
    const people = [...STAFF, ...SUBS.filter(p => D.wk.some(x => x.staff === p.id))];
    const rowFor = (p, d) => {
      const r = role(d), g = grp(p.group);
      return {
        id: p.id, name: p.name, first: p.name.split(' ')[0], initials: p.name.split(' ').map(w => w[0]).join(''), isSub: !!p.sub,
        meta: p.sub ? L.sub : contractPct(p, s.week) + '% · ' + fmtN(contractH(p, s.week), lang) + ' h', groupName: g ? g.name : L.sub, groupId: p.group || 'sub',
        isOpener: r.open === p.id, isCloser: r.close === p.id, sick: D.absent(p.id, d, 0, 1440), off: p.off ? p.off.includes(d) : !p.days.includes(d),
        selected: ui.person === p.id, focused: ui.focus === p.id, h: hoursOf(p),
        shifts: D.wk.filter(x => x.staff === p.id && x.day === d).sort((a, b) => a.start - b.start).map(svm),
        ghosts: (() => { const out = []; D.wk.filter(x => x.day === d && (x.was === p.id || x.cover === p.id)).sort((a, b) => a.start - b.start).forEach(x => { const l = out[out.length - 1]; if (l && l.staff === x.staff && x.start <= l.end) l.end = Math.max(l.end, x.end); else out.push({ staff: x.staff, start: x.start, end: x.end }); });
          return out.map(g => { const who = (person(g.staff) || {}).name || ''; return { left: pct(g.start), width: pct(g.end) - pct(g.start), time: fmt(g.start) + '–' + fmt(g.end), who: '→ ' + who, tip: fmt(g.start) + '–' + fmt(g.end) + ' → ' + who }; }); })(),
        preview: ui.ghost && ui.ghost.staff === p.id && ui.ghost.at != null && d === ui.day ? { left: pct(ui.ghost.at), width: pct(ui.ghost.at + 60) - pct(ui.ghost.at), label: fmt(ui.ghost.at) + '–' + fmt(ui.ghost.at + 60) } : null,
        dragName: e => dragPerson(e, p.id),
        down: e => drag(e, { mode: 'new', staff: p.id, day: d, axis }), pick: () => up({ person: p.id, sel: null }), focus: () => up({ focus: p.id, sel: null }),
      };
    };
    const rows = people.map(p => rowFor(p, day));
    const roster = [...STAFF, ...SUBS].map(p => rowFor(p, day));
    const gh = ui.ghost ? { ...ui.ghost, label: ui.ghost.at != null ? fmt(ui.ghost.at) + '–' + fmt(ui.ghost.at + 60) : '' } : null;
    const covVM = (sl) => sl.map(c => ({
      ...c, left: pct(c.t), width: pct(c.t + s.slot) - pct(c.t), label: c.need ? c.have + '/' + c.need : '', kids: c.children || '',
      bg: pal[c.status] || '#eee', fg: pal[c.status + 'Fg'] || '#222', isUnder: c.status === 'under', isOver: c.status === 'over',
      groups: c.groups.map(g => ({ ...g, label: g.need ? g.have + '/' + g.need : '', st: g.have < g.need ? 'under' : g.have >= g.need + 2 && g.need ? 'over' : 'ok', bg: pal[g.have < g.need ? 'under' : (g.have >= g.need + 2 && g.need) ? 'over' : 'ok'] || '#eee' })),
    }));
    const ticks = []; for (let h = 6; h <= 18; h++) ticks.push({ label: String(h).padStart(2, '0'), full: String(h).padStart(2, '0') + ':00', left: pct(h * 60), top: pct(h * 60) });
    const lines = []; for (let t = DS; t <= DE; t += s.slot) lines.push({ left: pct(t), top: pct(t), hour: t % 60 === 0, strong: t % 60 === 0 ? 1 : 0 });
    const days = [0, 1, 2, 3, 4].map(d => {
      const ws = D.warns.filter(w => w.day === d);
      return {
        i: d, name: L.days[d], short: L.short[d], date: (monday(s.week) + d) + ' ' + L.month, active: d === day,
        warnCount: ws.length, hasWarn: ws.length > 0, ok: ws.length === 0, select: () => up({ day: d, sel: null }),
        opener: role(d).open ? person(role(d).open).name.split(' ')[0] : '—', closer: role(d).close ? person(role(d).close).name.split(' ')[0] : '—',
        cov: covVM(D.slotsByDay[d]),
        rows: opt.allDays ? people.map(p => rowFor(p, d)) : [],
      };
    });
    const selShift = s.shifts.find(x => x.id === ui.sel);
    const sel = selShift ? (() => {
      const v = svm(selShift), p = person(selShift.staff);
      return {
        ...v, staffName: p.name, dayName: L.days[selShift.day],
        types: ['contact', 'break', 'planning', 'meeting'].map(t => ({ key: t, name: L[t], bg: col(t).bg, fg: col(t).fg, active: selShift.type === t, ring: selShift.type === t ? (pal.selRing || '0 0 0 2px #111') : 'none', pick: () => store.set(st => { st.shifts.find(x => x.id === ui.sel).type = t; }) })),
        groups: GROUPS.map(g => ({ id: g.id, name: g.name, active: selShift.group === g.id, pick: () => store.set(st => { st.shifts.find(x => x.id === ui.sel).group = g.id; }) })),
        isBreak: selShift.type === 'break',
        breakLens: [15, 30].map(m => ({ m, label: m + ' ' + L.min, active: selShift.end - selShift.start === m, pick: () => store.set(st => {
          const x = st.shifts.find(y => y.id === ui.sel), nx = st.shifts.find(y => y.id !== x.id && y.staff === x.staff && y.week === x.week && y.day === x.day && y.start === x.end);
          const ne = x.start + m; if (nx) { if (nx.end - ne < 15) return; nx.start = ne; } x.end = Math.min(DE, ne);
        }) })),
        del: () => { const id = ui.sel; up({ sel: null }); store.set(st => { st.shifts = st.shifts.filter(x => x.id !== id); }); },
        close: () => up({ sel: null }),
      };
    })() : null;
    const pp = ui.person && person(ui.person);
    const personVM = pp ? (() => {
      const key = s.week + '-' + day, r = role(day), sick = D.absent(pp.id, day, 0, 1440);
      return {
        ...rowFor(pp, day), canOpen: !!pp.open, canClose: !!pp.close, openTxt: pp.open ? L.canOpen : L.cannotOpen, closeTxt: pp.close ? L.canClose : L.cannotClose,
        snTxt: pp.sn ? L.sn : '', hasSn: !!pp.sn, dayName: L.days[day],
        avail: [0, 1, 2, 3, 4].map(d => ({ short: L.short[d], ok: pp.off ? !pp.off.includes(d) : pp.days.includes(d) })),
        setOpen: () => store.set(st => { st.roles[key] = { ...r, open: r.open === pp.id ? null : pp.id }; }),
        setClose: () => store.set(st => { st.roles[key] = { ...r, close: r.close === pp.id ? null : pp.id }; }),
        toggleSick: () => store.set(st => { if (sick) { st.absences = st.absences.filter(z => !(z.week === s.week && z.staff === pp.id && z.day === day)); removeFree(st, pp.id, s.week, day); } else { st.absences.push({ staff: pp.id, week: s.week, day, from: 0, to: 1440, reason: 'sick' }); makeFree(st, pp.id, s.week, day, nowMin()); } }),
        sickLabel: sick ? L.unSick : L.markSick, isSick: sick, isStaff: !pp.sub,
        close: () => up({ person: null }),
      };
    })() : null;
    const cover = D.units.map(u => ({
      key: u.key, name: person(u.staff).name, dayName: L.days[u.day], time: fmt(u.from) + '–' + fmt(u.to), onDay: u.day === day,
      title: person(u.staff).name + ' · ' + L.days[u.day] + ' ' + fmt(u.from) + '–' + fmt(u.to),
      cands: candidates(s, D, u, L, lang).map(c => ({ ...c, notOk: !c.ok, assign: () => { store.set(st => { st.shifts.forEach(x => { if (u.ids.includes(x.id)) x.staff = c.id; }); }); toast(c.name + ' → ' + L.days[u.day] + ' ' + fmt(u.from) + '–' + fmt(u.to)); } })),
    }));
    const warnings = D.warns.map(w => ({
      ...w, dayShort: w.day != null ? L.short[w.day] : L.week.slice(0, 1) + '.' + s.week, isRule: w.kind === 'rule', isCover: w.kind === 'cover', isStaffing: w.kind === 'staffing', isRole: w.kind === 'role',
      onDay: w.day === day, go: () => up({ day: w.day ?? day, sel: w.shiftId || null, person: null }),
      color: pal['w_' + w.kind] || '#c33',
    }));
    const totB = STAFF.reduce((a, p) => a + D.minsB[p.id], 0), conB = STAFF.reduce((a, p) => a + [0, 1, 2, 3].reduce((x, i) => x + effC(p, b0 + i), 0), 0);
    const totW = STAFF.reduce((a, p) => a + D.minsW[p.id], 0), conW = STAFF.reduce((a, p) => a + effC(p, s.week), 0);
    const fp = person(ui.focus) || STAFF[0];
    return {
      ready: true, L, lang, s, merge: s.merge || MERGE0, roster, ghost: gh, hasGhost: !!gh, weekNo: s.week, slot: s.slot, is15: s.slot === 15, is30: s.slot === 30,
      weekLabel: L.week + ' ' + s.week, dateRange: monday(s.week) + '–' + (monday(s.week) + 4) + ' ' + L.month + ' 2026',
      blockLabel: L.block + ' v.' + b0 + '–' + (b0 + BLOCK_WEEKS - 1) + ' · ' + tf(L.weekOf, { n: s.week - b0 + 1, m: BLOCK_WEEKS }),
      blockWeeks: Array.from({ length: BLOCK_WEEKS }, (_, i) => ({ n: b0 + i, active: b0 + i === s.week, go: () => store.live(st => { st.week = b0 + i; }) })),
      day, dayName: L.days[day], dayShortName: L.short[day], days, rows, ticks, lines, cov: covVM(D.slotsByDay[day]),
      groups: GROUPS.map(g => ({ ...g, ratioTxt: tf(L.ratio, { n: g.ratio }), agesTxt: g.ages + ' ' + L.yrs, rows: rows.filter(r => r.groupId === g.id) })),
      subRows: rows.filter(r => r.isSub), hasSubRows: rows.some(r => r.isSub),
      warnings, warnCount: warnings.length, noWarnings: warnings.length === 0, hasWarnings: warnings.length > 0,
      sel, hasSel: !!sel, noSel: !sel, person: personVM, hasPerson: !!personVM, cover, hasCover: cover.length > 0, noCover: cover.length === 0,
      hours: STAFF.map(p => ({ id: p.id, name: p.name, first: p.name.split(' ')[0], ...hoursOf(p) })),
      totalWeek: hrs(totW, lang) + ' / ' + hrs(conW, lang), totalBlock: hrs(totB, lang) + ' / ' + hrs(conB, lang),
      legend: ['contact', 'break', 'planning', 'meeting'].map(t => ({ key: t, name: L[t], bg: col(t).bg, fg: col(t).fg })),
      opener: role(day).open ? person(role(day).open).name : L.nobody, closer: role(day).close ? person(role(day).close).name : L.nobody,
      noOpener: !role(day).open, noCloser: !role(day).close,
      focusRow: { ...rowFor(fp, day), ...hoursOf(fp), name: fp.name, meta: contractPct(fp, s.week) + '% · ' + fmtN(contractH(fp, s.week), lang) + ' h' },
      focusWeek: [0, 1, 2, 3, 4].map(d => ({ ...rowFor(fp, d), dayName: L.days[d], short: L.short[d], date: (monday(s.week) + d) + ' ' + L.month, active: d === day, select: () => up({ day: d }) })),
      toast: ui.toast, hasToast: !!ui.toast,
      canUndo: store.canUndo(), canRedo: store.canRedo(),
      undo: () => { up({ sel: null }); store.undo(); }, redo: () => { up({ sel: null }); store.redo(); },
      prevWeek: () => s.week > W0 && (up({ sel: null }), store.live(st => { st.week--; })),
      nextWeek: () => s.week < W1 && (up({ sel: null }), store.live(st => { st.week++; })),
      atFirst: s.week === W0, atLast: s.week === W1,
      copyWeek: () => {
        if (s.week >= W1) return; const a = s.week, b = a + 1;
        store.set(st => { st.shifts = st.shifts.filter(x => x.week !== b).concat(st.shifts.filter(x => x.week === a).map(x => ({ ...x, id: 'h' + (++st.nid), week: b }))); for (let d = 0; d < 5; d++) st.roles[b + '-' + d] = { ...(st.roles[a + '-' + d] || {}) }; });
        toast(tf(L.copied, { a, b }));
      },
      solving: !!ui.solving, solveTxt: ui.solving ? L.solving : L.solve,
      solveWeek: async () => {
        if (ui.solving) return; const w = s.week; up({ solving: true });
        let sol = null, saved = false;
        try { const r = await fetch(SOLVER_URL + '/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(solverProblem(store.get(), [w])) }); if (r.ok) sol = await r.json(); } catch (e) {}
        if (!sol) try { const all = await (await fetch(new URL('solved-schedule.json', import.meta.url))).json(); sol = { weeks: all.weeks.filter(x => x.week === w) }; saved = true; } catch (e) {}
        up({ solving: false });
        if (!sol || !sol.weeks.length) return toast(L.solveFailed, 6000);
        up({ sel: null }); store.set(st => applySolution(st, sol));
        toast(tf(saved ? L.solvedSaved : L.solved, { w }), saved ? 7000 : 3500);
      },
      set15: () => store.live(st => { st.slot = 15; }), set30: () => store.live(st => { st.slot = 30; }),
      toggleSlot: () => store.live(st => { st.slot = st.slot === 15 ? 30 : 15; }),
      clearSel: () => up({ sel: null, person: null }),
      expand: () => up({ expanded: !ui.expanded }), expanded: ui.expanded,
    };
  }
  return { store, ui, view, up, touch, resetDemo };
}
