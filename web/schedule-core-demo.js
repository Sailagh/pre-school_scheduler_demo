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
  { id: 'g1', name: 'Avd 1', ages: '1–3', open: 390, close: 1050, ratio: 5, max: 20, sn: 0 },
  { id: 'g2', name: 'Avd 2', ages: '3–4', open: 375, close: 1080, ratio: 7, max: 28, sn: 1 },
  { id: 'g3', name: 'Avd 3', ages: '4–5', open: 360, close: 1110, ratio: 10, max: 40, sn: 0 },
];
// Unit names can be changed in Settings (to match Edlevo's departments). Earlier versions of the demo called the
// units Blåbär, Lingon and Hjortron; a browser that saved those default names gets the new ones.
const OLD_NAMES = { g1: 'Blåbär', g2: 'Lingon', g3: 'Hjortron' };
// A unit's badge: its colours, and a letter from its name ("Avd 2" -> "2", "Jupiter" -> "J").
const BADGE = { g1: { ub: '#C9DDF5', uf: '#1E3F73' }, g2: { ub: '#FFD3D0', uf: '#8E2A27' }, g3: { ub: '#FFE3B8', uf: '#7A4A0C' } };
export const unitLetter = name => { const n = String(name || '').trim(), m = n.match(/(\d+)\s*$/); return m ? m[1] : (n[0] || '?').toUpperCase(); };
export const unitBadge = id => { const g = GROUPS.find(x => x.id === id); return { letter: g ? unitLetter(g.name) : '', ...(BADGE[id] || { ub: '#EEF3F6', uf: '#3C4B5A' }) }; };
export const UNITS = new Proxy({}, { get: (_, id) => unitBadge(id) });
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
export const effC = (p, w, closed = []) => { if (p.sub || (p.end && w > p.end)) return 0; const n = 5 - (p.off || []).length, full = contractH(p, w) * 60; let away = 0; for (let d = 0; d < 5; d++) if (!(p.off || []).includes(d) && (closed.includes(d) || (p.leave || []).some(l => l.w1 * 10 + l.d1 <= w * 10 + d && w * 10 + d <= l.w2 * 10 + l.d2))) away++; return Math.round(full * (n - away) / n); };
// Contract minutes in week `w` of state `s`: days the preschool is closed (e.g. a public holiday) count like leave.
export const closedDays = (s, w) => [0, 1, 2, 3, 4].filter(d => (s.special || []).some(x => x.kind === 'closed' && x.week === w && x.days.includes(d)));
const effCs = (s, p, w) => effC(p, w, closedDays(s, w));
export const RULE_TEXT = {
  en: { rest: 'At least {h} hours of rest between working days', week: 'No more than {h} hours in a week, or up to {flex} hours more if the next week is that much shorter', avg: 'On average no more than {h} hours a week over 4 weeks', cont: 'No more than {h} hours of work without a break', breakLen: 'A break is {a}–{b} minutes', count: 'Contract hours count time with children, breaks, planning and meetings', openClose: 'Someone opens and someone closes every day', avail: 'Nobody works when they are not available', absent: 'Nobody works while absent', sn: 'A trained adult is with children who have special needs', breaks: 'At least {n} breaks of {a} minutes on days longer than {over} hours', dayMax: 'No more than {h} hours of work in a day', minStaff: 'At least {n} adults at the preschool while children are there', ratio: 'Enough adults for the number of children' },
  sv: { rest: 'Minst {h} timmars vila mellan arbetsdagar', week: 'Högst {h} timmar per vecka, eller upp till {flex} timmar till om nästa vecka är lika mycket kortare', avg: 'I snitt högst {h} timmar per vecka över 4 veckor', cont: 'Högst {h} timmars arbete utan rast', breakLen: 'En rast är {a}–{b} minuter', count: 'Avtalade timmar räknar barntid, rast, planering och möten', openClose: 'Någon öppnar och någon stänger varje dag', avail: 'Ingen arbetar när de inte är tillgängliga', absent: 'Ingen arbetar när de är frånvarande', sn: 'En utbildad vuxen finns hos barn med särskilda behov', breaks: 'Minst {n} raster på {a} minuter dagar längre än {over} timmar', dayMax: 'Högst {h} timmars arbete per dag', minStaff: 'Minst {n} vuxna på förskolan när barn är där', ratio: 'Tillräckligt med vuxna för antalet barn' },
};
export const RULE_PARAMS = { rest: [['h', 'h', 8, 13, 1]], week: [['h', 'h', 20, 48, 1], ['flex', 'h', 0, 4, 1]], avg: [['h', 'h', 20, 48, 1]], cont: [['h', 'h', 2, 8, 0.5]], breakLen: [['a', 'min', 5, 60, 5], ['b', 'min', 5, 90, 5]], breaks: [['n', '', 1, 4, 1], ['a', 'min', 5, 60, 5], ['over', 'h', 3, 10, 0.5]], dayMax: [['h', 'h', 4, 12, 0.5]], minStaff: [['n', '', 1, 6, 1]] };
export const ADDABLE = { breaks: { n: 2, a: 15, over: 6 }, dayMax: { h: 9 }, minStaff: { n: 2 }, cont: { h: 5 }, rest: { h: 11 }, week: { h: 40, flex: 2 } };
export const ruleVer = (r, w) => { let v = null; for (const x of r.versions) if (x.from <= w && (!v || x.from >= v.from)) v = x; return v; };
export const ruleLabel = (type, p, lang) => tf((RULE_TEXT[lang] || RULE_TEXT.en)[type] || type, fmtP(p, lang));
const seedRules = () => [['rest', { h: 11 }], ['week', { h: 40, flex: 2 }], ['avg', { h: 40 }], ['cont', { h: 5 }], ['breakLen', { a: 15, b: 30 }], ['count', {}], ['openClose', {}], ['avail', {}], ['absent', {}], ['sn', {}]]
  .map(([type, p], i) => ({ id: 'r' + (i + 1), type, base: true, versions: [{ from: W0, on: true, p }] }));
const grp = id => GROUPS.find(g => g.id === id);

export const T = {
  en: {
    app: 'Preschool schedule', schedule: 'Schedule', staff: 'Staff', groups: 'Groups', hours: 'Hours', cover: 'Cover',
    week: 'Week', block: 'Block', weekOf: 'week {n} of {m}', undo: 'Undo', redo: 'Redo', copyWeek: 'Copy to next week',
    copied: 'Week {a} copied onto week {b}', warnings: 'Warnings', noWarnings: 'No warnings. Everything follows the rules.',
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
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    w_cont: '{name} works {h} without a break on {day}. The limit is {lim}.',
    w_break: '{name} has a {m}-minute break on {day}. A break should be {a}–{b} minutes.',
    w_rest: '{name} only gets {h} of rest after {day}. At least {lim} are needed.',
    w_week: '{name} is scheduled {h} this week. The limit is {lim}.', w_weekNext: '{name} works {h} this week, so week {n} can be at most {max}. It is {next}.', w_weekPrev: '{name} worked {h} in week {n}, so this week can be at most {max}. It is {cur}.',
    w_avg: '{name} averages {h} a week over the block. The limit is {lim}.',
    w_unav: '{name} is not available on {day} but has a shift.',
    w_noOpen: 'Nobody is set to open on {day}.', w_noClose: 'Nobody is set to close on {day}.',
    w_openNA: '{name} is set to open on {day} but is not allowed to open.',
    w_closeNA: '{name} is set to close on {day} but is not allowed to close.',
    w_cover: '{name} is {why} on {day}. {from}–{to} needs cover.',
    w_overlap: '{name} has two shifts at the same time on {day}.', w_closed: 'The preschool is closed on {day}, but {name} has a shift.', breakLen: 'Break length',
    w_under: 'Too few staff on {day} {from}–{to}: {have} working, {need} needed.', w_underUnit: 'Too few adults in {unit} on {day} {from}–{to}: {have} working, {need} needed.',
    r_busy: 'Already working then', r_unav: 'Not available on {day}', r_40: 'Would go over 40 hours this week',
    r_contract: 'Only {h} left in contract', r_absent: 'Also absent', c_staff: 'Staff · {h} left in contract', c_sub: 'Substitute · {phone}',
  },
  sv: {
    app: 'Förskolans schema', schedule: 'Schema', staff: 'Personal', groups: 'Grupper', hours: 'Timmar', cover: 'Ersättare',
    week: 'Vecka', block: 'Period', weekOf: 'vecka {n} av {m}', undo: 'Ångra', redo: 'Gör om', copyWeek: 'Kopiera veckan',
    copied: 'Vecka {a} kopierad till vecka {b}', warnings: 'Varningar', noWarnings: 'Inga varningar. Allt följer reglerna.',
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
    short: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'], months: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    w_cont: '{name} arbetar {h} utan rast på {day}. Gränsen är {lim}.',
    w_break: '{name} har {m} minuters rast på {day}. En rast ska vara {a}–{b} minuter.',
    w_rest: '{name} får bara {h} vila efter {day}. Minst {lim} krävs.',
    w_week: '{name} är schemalagd {h} denna vecka. Gränsen är {lim}.', w_weekNext: '{name} arbetar {h} denna vecka, så vecka {n} får vara högst {max}. Den är {next}.', w_weekPrev: '{name} arbetade {h} vecka {n}, så denna vecka får vara högst {max}. Den är {cur}.',
    w_avg: '{name} har i snitt {h} per vecka under perioden. Gränsen är {lim}.',
    w_unav: '{name} är inte tillgänglig på {day} men har ett pass.',
    w_noOpen: 'Ingen är satt att öppna på {day}.', w_noClose: 'Ingen är satt att stänga på {day}.',
    w_openNA: '{name} ska öppna på {day} men får inte öppna.',
    w_closeNA: '{name} ska stänga på {day} men får inte stänga.',
    w_cover: '{name} är {why} på {day}. {from}–{to} behöver ersättare.',
    w_overlap: '{name} har två pass samtidigt på {day}.', w_closed: 'Förskolan är stängd på {day}, men {name} har ett pass.', breakLen: 'Rastens längd',
    w_under: 'För lite personal på {day} {from}–{to}: {have} i tjänst, {need} behövs.', w_underUnit: 'För få vuxna i {unit} på {day} {from}–{to}: {have} i tjänst, {need} behövs.',
    r_busy: 'Arbetar redan då', r_unav: 'Inte tillgänglig på {day}', r_40: 'Skulle gå över 40 timmar denna vecka',
    r_contract: 'Bara {h} kvar i avtalet', r_absent: 'Också frånvarande', c_staff: 'Personal · {h} kvar i avtalet', c_sub: 'Vikarie · {phone}',
  },
};
Object.assign(T.en, { w_breaks: '{name} has {n} of {req} breaks on {day}. Days longer than {over} hours need {req}.', w_dayMax: '{name} works {h} on {day}. The limit is {lim}.', w_min: 'Only {have} adults at the preschool on {day} {from}–{to}. At least {n} are needed.', w_sn: '{unit} has a child with special needs on {day} {from}–{to}, but no trained adult is working there.', w_early: '{name} starts at {t} on {day} but cannot work before {lim}.', w_late: '{name} works until {t} on {day} but cannot work after {lim}.', w_ended: '{name}\'s contract ended in week {w}, but they still have shifts.', why_sick: 'off sick', why_vacation: 'on holiday', why_leave: 'on leave', why_parental: 'on parental leave', why_course: 'at a course', why_unavail: 'not available', r_ended: 'Contract has ended' });
Object.assign(T.sv, { w_breaks: '{name} har {n} av {req} raster på {day}. Dagar längre än {over} timmar kräver {req}.', w_dayMax: '{name} arbetar {h} på {day}. Gränsen är {lim}.', w_min: 'Bara {have} vuxna på förskolan på {day} {from}–{to}. Minst {n} krävs.', w_sn: '{unit} har ett barn med särskilda behov på {day} {from}–{to}, men ingen utbildad vuxen arbetar där.', w_early: '{name} börjar {t} på {day} men kan inte arbeta före {lim}.', w_late: '{name} arbetar till {t} på {day} men kan inte arbeta efter {lim}.', w_ended: '{name}s anställning slutade vecka {w}, men personen har fortfarande pass.', why_sick: 'sjuk', why_vacation: 'på semester', why_leave: 'ledig', why_parental: 'föräldraledig', why_course: 'på kurs', r_ended: 'Anställningen har slutat' });
const hrs = (min, lang) => { const v = Math.round(min / 6) / 10; return (lang === 'sv' ? String(v).replace('.', ',') : String(v)) + ' h'; };
const dateOf = (w, d) => new Date(2026, 9, 5 + (w - 41) * 7 + d); // Oct 5 2026 = Monday of week 41
const dayDate = (w, d, L) => { const x = dateOf(w, d); return x.getDate() + ' ' + L.months[x.getMonth()]; };
const weekDates = (w, L) => { const a = dateOf(w, 0), b = dateOf(w, 4); return (a.getMonth() === b.getMonth() ? a.getDate() + '–' + dayDate(w, 4, L) : dayDate(w, 0, L) + ' – ' + dayDate(w, 4, L)) + ' ' + b.getFullYear(); };

// ---------- seed ----------
function seed() {
  // No shifts or opener/closer roles: the schedule is left empty for the OR-Tools solver to fill.
  return { week: PLAN_WEEK, slot: 15, shifts: [], roles: {}, absences: [], nid: 0, rules: seedRules(), rid: 10, merge: { ...MERGE0 }, requests: [], notes: [], special: [], snKids: [{ id: 'k1', unit: 'g2', days: [0, 1, 2, 3], from: 480, to: 840 }, { id: 'k2', unit: 'g3', days: [1], from: 600, to: 765 }], free: [], prefs: { school: 'Förskolan Solrosen', notifySick: true, notifyWeek: false, notifyRules: true } };
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
  if (n.key === 'offerLost') return sv ? 'Passet ' + dayName(p.day, lang) + ' v.' + p.week + ' är tillsatt. Tack för ditt erbjudande!' : 'The shift on ' + dayName(p.day, lang) + ' w.' + p.week + ' has been filled. Thank you for your offer!';
  if (n.key === 'subConfirmed') return sv ? 'Bekräftat: du arbetar ' + dayName(p.day, lang) + ' v.' + p.week + ' ' + fmt(p.from) + '–' + fmt(p.to) + ' i ' + ((grp(p.group) || {}).name || '') + '.' : 'Confirmed: you work on ' + dayName(p.day, lang) + ' w.' + p.week + ' ' + fmt(p.from) + '–' + fmt(p.to) + ' in ' + ((grp(p.group) || {}).name || '') + '.';
  if (n.key === 'swapIn') return sv ? 'Du har fått ' + (person(p.from) || {}).name + 's pass på ' + dayName(p.day, lang) + ' v.' + p.week + '.' : 'You now have ' + (person(p.from) || {}).name + "'s shift on " + dayName(p.day, lang) + ' w.' + p.week + '.';
  return '';
};
export function submitRequest(st, r) {
  st.requests = st.requests || []; st.notes = st.notes || [];
  const q = { id: 'q' + Date.now(), at: Date.now(), status: r.type === 'sick' ? 'new' : r.type === 'cover' ? 'open' : 'pending', ...r };
  if (r.type === 'sick') reportSick(st, r.staff, r.week, r.day, r.clock ?? nowMin(), r.from ?? null, r.today);
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
// ---------- children from Edlevo: counts only ----------
// edlevo/aggregate.py turns Edlevo calendar events into the number of children per department per
// 15 minutes, inside the municipality. The planner only ever gets those counts, never a child id.
export const isoDate = (w, d) => new Date(Date.UTC(2026, 9, 12 + (w - 42) * 7 + d)).toISOString().slice(0, 10);
export function checkCounts(text) {
  // Returns { doc } or { error: 'raw' | 'format' }. Raw Edlevo data (with child ids) is refused.
  if (/<calendarevents|childid|<\?xml/i.test(text)) return { error: 'raw' };
  let doc; try { doc = JSON.parse(text); } catch (e) { return { error: 'format' }; }
  const ok = doc && doc.format === 'barnantal-v1' && doc.slotMinutes === 15 && doc.dayStart === '06:00' && doc.counts && typeof doc.counts === 'object'
    && Object.entries(doc.counts).every(([day, deps]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Object.values(deps).every(a => Array.isArray(a) && a.every(n => Number.isInteger(n) && n >= 0)));
  if (!ok) return { error: 'format' };
  const { format, about, made, period, departments, counts } = doc;
  return { doc: { format, about, made, period, departments: (departments || []).map(x => ({ departmentname: x.departmentname, children: x.children })), counts } };
}
// The counted children for a day, by unit id, or null when the planner's example curve is used for that day.
// A day inside the counted period with no bookings (e.g. closed) has no children.
function countsOn(s, w, d) {
  const C = s.childCounts; if (!C || (s.prefs || {}).childSource !== 'edlevo') return null;
  const day = isoDate(w, d), p = C.period || {}; if (!(p.start <= day && day <= p.end) && !C.counts[day]) return null;
  const byName = Object.fromEntries(Object.entries(C.counts[day] || {}).map(([k, v]) => [k.trim().toLowerCase(), v]));
  return Object.fromEntries(GROUPS.map(g => [g.id, byName[g.name.toLowerCase()] || []]));
}
export const childSource = (s, w, d) => countsOn(s, w, d) ? 'edlevo' : 'forecast';
// Children, adults needed and merge state at minute `mid` of `day`. Shared by the planner's staffing row and the solver.
function needAt(s, day, mid) {
  const sp = specialsOn(s, s.week, day), fewer = sp.find(x => x.kind === 'fewer'), shut = sp.find(x => x.kind === 'closeEarly') || (sp.some(x => x.kind === 'closed') && { time: 0 });
  const f = (day === 4 ? .7 : 1) * (fewer ? fewer.pct / 100 : 1), M = s.merge || MERGE0, merged = !!M.on && (mid < M.am || mid >= M.pm);
  // Counted children from Edlevo are the bookings themselves, so the example curve's Friday dip and
  // "fewer children" do not apply to them; closing early or closed still does.
  const real = countsOn(s, s.week, day), at = Math.floor((mid - DS) / 15);
  const groups = GROUPS.map(g => {
    const c = shut && mid > shut.time ? 0 : real ? (real[g.id][at] || 0) : (mid < g.open || mid > g.close) ? 0 : Math.round(g.max * curve(mid) * f);
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

// ---------- special days ----------
// Things that make a day different from usual, added by the principal before making a schedule:
//   finishBy   – staff hope to finish by `time` (a wish; the solver tries, the report says who could not)
//   closeEarly – the preschool closes at `time`, so no children after it
//   fewer      – only about `pct` % of the children come (e.g. autumn break)
//   closed     – the preschool is closed all day (e.g. a public holiday): no children, nobody works,
//                and contract hours for the week shrink as for a day of leave
export const SPECIAL_KINDS = ['finishBy', 'closeEarly', 'fewer', 'closed'];
export const specialsOn = (s, w, d) => (s.special || []).filter(x => x.week === w && x.days.includes(d));
export function specialLabel(x, lang) {
  const sv = lang === 'sv', note = x.note ? x.note + ': ' : '';
  if (x.kind === 'finishBy') return note + (sv ? 'personalen vill sluta senast ' : 'staff hope to finish by ') + fmt(x.time);
  if (x.kind === 'closeEarly') return note + (sv ? 'förskolan stänger ' : 'the preschool closes at ') + fmt(x.time);
  if (x.kind === 'closed') return note + (sv ? 'förskolan är stängd hela dagen' : 'the preschool is closed all day');
  return note + (sv ? 'ungefär ' + x.pct + ' % av barnen kommer' : 'about ' + x.pct + '% of the children come');
}
// Swedish public holidays (and Christmas Eve, when preschools close) that fall on weekdays in the demo period.
export const HOLIDAYS = [{ week: 52, day: 3, sv: 'Julafton', en: 'Christmas Eve' }, { week: 52, day: 4, sv: 'Juldagen', en: 'Christmas Day' }];
export const daysLabel = (days, lang) => days.length === 5 ? (lang === 'sv' ? 'hela veckan' : 'all week') : days.map(d => dayName(d, lang)).join(', ');

// ---------- OR-Tools solver ----------
// The solver (solver/ in the repo) gets one self-contained problem per week and returns shifts and opener/closer roles.
const SOLVER_SLOT = 15;
// Where the solver runs: the server the page came from (solver/server.py serves both), or ?solver=https://… in the page URL.
const SOLVER_URL = ((typeof location !== 'undefined' && (new URLSearchParams(location.search).get('solver') || (/^https?:$/.test(location.protocol) && location.origin))) || 'http://localhost:8000').replace(/\/$/, '');
export const checkWeek = (s, w, lang = 'en') => derive({ ...s, week: w }, T[lang] || T.en, lang).warns;
// With `keep`, people who already have shifts in a week keep them (the principal scheduled them by hand):
// they are left out of the problem, what they cover is taken off what is needed, and opener/closer
// already set stay. Everyone else is scheduled around them.
export function solverProblem(s, weeks, { keep = false } = {}) {
  const n = (DE - DS) / SOLVER_SLOT, mids = Array.from({ length: n }, (_, i) => DS + i * SOLVER_SLOT + SOLVER_SLOT / 2);
  return {
    dayStart: DS, slot: SOLVER_SLOT, slots: n, groups: GROUPS.map(g => g.id),
    weeks: weeks.map(w => {
      const R = solverRules(s, w), closed = closedDays(s, w);
      const kept = keep ? STAFF.filter(p => s.shifts.some(x => x.week === w && x.staff === p.id)).map(p => p.id) : [];
      const keptShifts = s.shifts.filter(x => x.week === w && kept.includes(x.staff) && x.type === 'contact' && !isAbsent(s, x.staff, w, x.day));
      const covered = (d, m, test = () => true) => new Set(keptShifts.filter(x => x.day === d && x.start <= m && x.end > m && test(x)).map(x => x.staff)).size;
      return {
      week: w, rules: R, kept,
      staff: STAFF.filter(p => !kept.includes(p.id)).map(p => {
        const { target, cap, owe } = weekTarget(s, p, w);
        return {
        id: p.id, group: p.group, open: !!p.open, close: !!p.close, sn: !!p.sn,
        target, planning: nonChildTarget(s, p, w), maxSlots: Math.floor(cap / SOLVER_SLOT), owe,
        days: [0, 1, 2, 3, 4].map(d => !closed.includes(d) && !(p.end && w > p.end) && !(p.off || []).includes(d) && !isAbsent(s, p.id, w, d)),
        earliest: p.earliest, latest: p.latest,
      }; }),
      days: [0, 1, 2, 3, 4].map(d => {
        const sw = { ...s, week: w }, at = mids.map(m => needAt(sw, d, m)), sp = specialsOn(s, w, d);
        const shut = sp.find(x => x.kind === 'closeEarly'), fin = sp.find(x => x.kind === 'finishBy'), role = (keep && s.roles[w + '-' + d]) || {};
        return {
          closed: closed.includes(d), hasOpen: !!role.open, hasClose: !!role.close,
          closeSlot: shut ? Math.max(0, Math.ceil((shut.time - DS) / SOLVER_SLOT) - 1) : n - 1,
          finishBy: fin ? Math.max(0, Math.round((fin.time - DS) / SOLVER_SLOT)) : null,
          need: at.map((x, i) => Math.max(0, (x.need ? Math.max(x.need, R.minStaff) : 0) - covered(d, mids[i]))), merged: at.map(x => x.merged),
          groupNeed: Object.fromEntries(GROUPS.map((g, gi) => [g.id, at.map((x, i) => x.merged ? 0 : Math.max(0, x.groups[gi].need - covered(d, mids[i], z => z.group === g.id)))])),
          sn: R.sn ? (s.snKids || []).filter(k => k.days.includes(d)).map(k => ({ group: k.unit, slots: mids.map((m, i) => m > k.from && m < k.to && !covered(d, m, z => z.group === k.unit && (person(z.staff) || {}).sn) ? i : -1).filter(i => i >= 0) })) : [],
        };
      }),
    }; }),
  };
}
// What a person should work in week `w`, in minutes, evening out the week before:
//   owe    – minutes worked over contract last week; this week's target is that much lower
//   cap    – the most this week may have: the weekly limit plus the flexible part, less what last week
//            went over the limit, and no more than an already scheduled next week leaves room for
export function weekTarget(s, p, w) {
  const R = solverRules(s, w), lim = R.weekMax * SOLVER_SLOT, prev = weekMins(s, p.id, w - 1), next = weekMins(s, p.id, w + 1);
  const owe = prev ? Math.max(0, prev - effCs(s, p, w - 1)) : 0;
  let cap = lim + R.weekFlex * SOLVER_SLOT;
  if (prev > lim) cap = Math.min(cap, 2 * lim - prev);
  if (next) cap = Math.min(cap, lim + Math.max(0, lim - next));
  cap = Math.max(0, cap);
  return { target: Math.max(0, Math.min(effCs(s, p, w) - owe, cap)), cap, owe };
}
// The rules from Settings that are on in week `w`, in solver units (slots of SOLVER_SLOT minutes).
function solverRules(s, w) {
  const on = t => (s.rules || []).filter(r => r.type === t).map(r => ruleVer(r, w)).filter(v => v && v.on).map(v => v.p);
  const one = t => on(t)[0], q = m => Math.round(m / SOLVER_SLOT), cont = one('cont'), brk = one('breakLen'), week = one('week'), rest = one('rest');
  const dayMax = on('dayMax').map(x => x.h), minStaff = on('minStaff').map(x => x.n), breaks = on('breaks').map(x => ({ n: x.n, over: q(x.over * 60) }));
  // The break is 30 minutes when the rule allows it, otherwise the allowed length closest to 30.
  const breakMin = brk ? Math.min(Math.max(30, brk.a), brk.b) : 30;
  return {
    maxRun: cont ? Math.floor(cont.h * 60 / SOLVER_SLOT) : 999, breakLen: Math.max(1, q(breakMin)),
    weekMax: q((week ? week.h : 48) * 60), weekFlex: week ? q((week.flex || 0) * 60) : 0,
    dayMax: dayMax.length ? Math.floor(Math.min(...dayMax) * 60 / SOLVER_SLOT) : null, minStaff: minStaff.length ? Math.max(...minStaff) : 0,
    breaks: breaks.length ? breaks.reduce((a, b) => (b.n > a.n ? b : a)) : null, rest: rest ? rest.h * 60 : 0,
    sn: !!one('sn'), openClose: !!one('openClose'),
  };
}
// Puts the solver's result into the solved weeks. People in `kept` (see solverProblem) keep their shifts,
// and opener/closer already set stay; everything else in those weeks is replaced.
export function applySolution(st, sol) {
  for (const wk of sol.weeks) {
    const kept = wk.kept || [];
    st.shifts = st.shifts.filter(x => x.week !== wk.week || kept.includes(x.staff)).concat(wk.shifts.map(x => ({ ...x, id: 'h' + (++st.nid), week: wk.week })));
    for (let d = 0; d < 5; d++) {
      const had = kept.length ? st.roles[wk.week + '-' + d] || {} : {}, got = wk.roles[d] || {};
      st.roles[wk.week + '-' + d] = { open: had.open || got.open || null, close: had.close || got.close || null };
    }
  }
}
export const seedState = () => seed();

// Plain-language summary of how the made schedule turned out, per week: what worked and what did not, and why.
// `saved`: the schedule came from the saved file, so special days were not taken into account.
export function scheduleReport(s, weeks, lang, saved = false) {
  const sv = lang === 'sv', L = T[lang] || T.en, h = m => hrs(m, lang), cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  return weeks.map(w => {
    const items = [], warns = checkWeek(s, w, lang);
    const staffing = warns.filter(x => x.kind === 'staffing'), other = warns.filter(x => x.kind !== 'staffing');
    items.push(staffing.length ? { ok: false, text: sv ? 'Ibland är det för få vuxna. Överväg en vikarie eller ändra passen för hand:' : 'Some times have too few adults. Consider a substitute or adjust the shifts by hand:', more: staffing.map(x => x.text) }
      : { ok: true, text: sv ? 'Tillräckligt många vuxna med barnen hela dagarna.' : 'Enough adults with the children all day, every day.' });
    if (other.length) items.push({ ok: false, text: sv ? 'Saker att kontrollera:' : 'Things to check:', more: other.map(x => x.text) });
    const more = [], less = [], lessPlan = [], flexed = [], evened = [], notEven = [], wr = (s.rules || []).find(r => r.type === 'week'), wv = wr && ruleVer(wr, w), lim = wv && wv.on ? wv.p.h * 60 : Infinity;
    for (const p of STAFF) {
      const q = personWeek(s, p.id, w);
      if (!q.C) continue;
      // Over the limit plus the flexible part is a broken rule, listed under Things to check.
      if (q.worked > lim) { if (q.worked <= lim + (wv.p.flex || 0) * 60) flexed.push(p.name.split(' ')[0] + ' ' + h(q.worked) + ' – ' + (sv ? 'vecka ' + (w + 1) + ' högst ' : 'week ' + (w + 1) + ' at most ') + h(Math.max(0, 2 * lim - q.worked))); continue; }
      // The target is the contract less what the week before went over it (see weekTarget).
      const { target, owe } = weekTarget(s, p, w), first = p.name.split(' ')[0];
      const extra = ' – ' + (sv ? h(owe) + ' extra vecka ' + (w - 1) : h(owe) + ' extra in week ' + (w - 1));
      if (owe > 15) { if (q.worked <= target + 15) evened.push(first + ' ' + h(q.worked) + extra); else { notEven.push(first + ' ' + h(q.worked) + (sv ? ' av ' : ' of ') + h(target) + extra); continue; } }
      const line = first + ' ' + h(q.worked) + (sv ? ' av ' : ' of ') + h(target);
      if (q.worked > target + 15) more.push(line); else if (q.worked < target - 15) less.push(line);
      if (q.non < q.N - 15) lessPlan.push(p.name.split(' ')[0] + ' ' + h(q.non) + (sv ? ' av ' : ' of ') + h(q.N));
    }
    if (!more.length && !less.length) items.push({ ok: true, text: sv ? 'Alla får sina avtalade timmar.' : 'Everyone gets their contract hours.' });
    if (notEven.length) items.push({ ok: false, text: sv ? 'Kunde inte få en kortare vecka efter extra timmar veckan innan, eftersom barnen behövde de vuxna. Jämna ut för hand eller ta in en vikarie:' : 'Could not get a shorter week after extra hours the week before, because the children needed the adults. Even it out by hand or bring in a substitute:', more: notEven });
    if (evened.length) items.push({ ok: true, text: sv ? 'Kortare vecka för att jämna ut extra timmar veckan innan:' : 'A shorter week to even out extra hours the week before:', more: evened });
    if (flexed.length) items.push({ ok: false, text: sv ? 'Arbetar lite över ' + h(lim) + ' den här veckan för att barnen ska ha tillräckligt med vuxna. Det jämnas ut nästa vecka:' : 'Work a little over ' + h(lim) + ' this week so the children have enough adults. It evens out next week:', more: flexed });
    if (more.length) items.push({ ok: false, text: sv ? 'Arbetar mer än sina avtalade timmar, eftersom barnen annars hade haft för få vuxna. Nästa vecka görs lika mycket kortare:' : 'Work more than their contract hours, because otherwise the children would have too few adults. The next week is made that much shorter:', more });
    if (less.length) items.push({ ok: false, text: sv ? 'Får färre timmar än sitt avtal den här veckan. Du kan lägga till tid för hand:' : 'Get fewer hours than their contract this week. You can add time by hand:', more: less });
    // People who help in another unit than their own, and on which days.
    const helped = STAFF.map(p => { const days = [0, 1, 2, 3, 4].filter(d => s.shifts.some(z => z.staff === p.id && z.week === w && z.day === d && z.type === 'contact' && z.group !== p.group)); return days.length ? p.name.split(' ')[0] + ' (' + ((GROUPS.find(g => g.id === p.group) || {}).name || '') + ' → ' + [...new Set(s.shifts.filter(z => z.staff === p.id && z.week === w && days.includes(z.day) && z.group !== p.group).map(z => (GROUPS.find(g => g.id === z.group) || {}).name))].join(', ') + ', ' + days.map(d => dayName(d, lang)).join(', ') + ')' : null; }).filter(Boolean);
    if (helped.length) items.push({ ok: true, text: sv ? 'Hjälper till på en annan avdelning än sin egen, så att alla avdelningar har tillräckligt med vuxna:' : 'Help in another unit than their own, so every unit has enough adults:', more: helped });
    if (lessPlan.length) items.push({ ok: false, text: sv ? 'Mindre planeringstid än vanligt, eftersom barnen behövde de vuxna:' : 'Less planning time than usual, because the children needed the adults:', more: lessPlan });
    for (const x of (s.special || []).filter(x => x.week === w)) {
      if (saved) { items.push({ ok: false, text: cap(daysLabel(x.days, lang)) + ': ' + specialLabel(x, lang) + (sv ? ' – inte med, eftersom lösaren inte var igång.' : ' – not included, because the solver was not running.') }); continue; }
      if (x.kind !== 'finishBy') { items.push({ ok: true, text: cap(daysLabel(x.days, lang)) + ': ' + specialLabel(x, lang) + (sv ? ' – med i schemat.' : ' – included.') }); continue; }
      for (const d of x.days) {
        const late = STAFF.filter(p => s.shifts.some(z => z.staff === p.id && z.week === w && z.day === d && z.end > x.time));
        const role = s.roles[w + '-' + d] || {}, why = p => p.id === role.close ? (sv ? ' (stänger)' : ' (closes)') : '';
        const working = STAFF.filter(p => s.shifts.some(z => z.staff === p.id && z.week === w && z.day === d)).length;
        items.push(late.length ? { ok: false, text: cap(dayName(d, lang)) + ': ' + specialLabel(x, lang) + '. ' + (sv ? (working - late.length) + ' av ' + working + ' slutar i tid. De här arbetar längre eftersom barn fortfarande är kvar:' : (working - late.length) + ' of ' + working + ' finish in time. These work later because children are still there:'), more: late.map(p => p.name + why(p)) }
          : { ok: true, text: cap(dayName(d, lang)) + ': ' + specialLabel(x, lang) + (sv ? ' – alla slutar i tid.' : ' – everyone finishes in time.') });
      }
    }
    return { week: w, items };
  });
}

// ---------- substitutes, free shifts & cover ----------
export const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const S2 = (lang, a, b) => lang === 'sv' ? a : b;
const rp = (s, type, w) => { const r = (s.rules || []).find(x => x.type === type), v = r && ruleVer(r, w); return v && v.on ? { code: r.id.toUpperCase(), ...v.p } : null; };
const dayShifts = (s, pid, w, d) => s.shifts.filter(x => x.staff === pid && x.week === w && x.day === d).sort((a, b) => a.start - b.start);
const bookedOn = (p, w, d) => (p.booked || []).filter(b => b.week === w && b.day === d);
const spanOf = (p, s, w, d) => { const l = [...dayShifts(s, p.id, w, d).map(x => [x.start, x.end]), ...bookedOn(p, w, d).map(x => [x.from, x.to])]; return l.length ? [Math.min(...l.map(x => x[0])), Math.max(...l.map(x => x[1]))] : null; };
// Is a shift's time away (sick, leave)? Minutes a person works in week `w`, leaving out the time they are away.
const awayAt = (s, pid, x) => s.absences.some(z => z.staff === pid && z.week === x.week && z.day === x.day && z.from < x.end && z.to > x.start) || (() => { const p = person(pid); return !!(p && onLeave(p, x.week, x.day)); })();
const weekMins = (s, pid, w) => s.shifts.filter(x => x.staff === pid && x.week === w && !awayAt(s, pid, x)).reduce((a, x) => a + x.end - x.start, 0);
const isAbsent = (s, pid, w, d) => s.absences.some(z => z.staff === pid && z.week === w && z.day === d) || (() => { const p = person(pid); return !!(p && onLeave(p, w, d)); })();
function restIssue(s, p, w, d, a, b, lang) {
  const R = rp(s, 'rest', w); if (!R) return null;
  const prev = d > 0 ? spanOf(p, s, w, d - 1) : null, next = d < 4 ? spanOf(p, s, w, d + 1) : null, cur = spanOf(p, s, w, d);
  const st = Math.min(a, cur ? cur[0] : a), en = Math.max(b, cur ? cur[1] : b), r = Math.min(prev ? 1440 - prev[1] + st : 1e9, next ? 1440 - en + next[0] : 1e9);
  return r < R.h * 60 ? R.code + ' · ' + S2(lang, 'bara ' + hrs(r, lang) + ' vila mellan passen', 'only ' + hrs(r, lang) + ' rest between shifts') : null;
}
export function freeNeeds(s, pid, w, d, from, to, group) {
  // Opening and closing are only the substitute's job if their part of the day starts or ends the shift.
  const r = s.roles[w + '-' + d] || {}, p = person(pid) || {}, sh = dayShifts(s, pid, w, d).filter(x => !x.was);
  const first = sh.length ? sh[0].start : from, last = sh.length ? Math.max(...sh.map(x => x.end)) : to;
  return { open: r.open === pid && from <= first, close: r.close === pid && to >= last, sn: !!p.sn && (s.snKids || []).some(k => k.unit === group && k.days.includes(d) && k.from < to && k.to > from) };
}
// Substitutes for a free shift. A substitute who is busy part of the time can still offer the rest: `free` is the
// time inside the window they could take (not working or booked then, enough rest), and they are asked if any part
// of it is at least the shortest substitute shift.
const subMinOf = (s, f) => Math.min((s.prefs || {}).subMin ?? SUB_MIN, f.to - f.from);
export function subCands(s, f, lang) {
  const min = subMinOf(s, f);
  return SUBS.map(p => {
    const w = f.week, d = f.day; let why = null, free = [];
    if ((f.declined || []).includes(p.id)) why = S2(lang, 'Tackade nej', 'Declined');
    else if (!p.days.includes(d)) why = S2(lang, 'Inte tillgänglig på ', 'Not available on ') + dayName(d, lang);
    else if (f.needs.sn && !p.sn) why = S2(lang, 'Inte utbildad för särskilt stöd', 'Not trained for special needs');
    else if (f.needs.open && !p.open) why = S2(lang, 'Får inte öppna', 'May not open');
    else if (f.needs.close && !p.close) why = S2(lang, 'Får inte stänga', 'May not close');
    else {
      const busy = [...bookedOn(p, w, d).map(b => [b.from, b.to, b.where]), ...dayShifts(s, p.id, w, d).filter(x => x.was !== f.staff).map(x => [x.start, x.end])].sort((a, b) => a[0] - b[0]);
      let at = f.from;
      for (const [a, b] of busy) { if (b <= at || a >= f.to) continue; if (a > at) free.push({ from: at, to: a }); at = Math.max(at, b); }
      if (at < f.to) free.push({ from: at, to: f.to });
      free = free.filter(x => x.to - x.from >= min && !restIssue(s, p, w, d, x.from, x.to, lang));
      if (!free.length) { const bk = busy.find(b => b[0] < f.to && b[1] > f.from); why = bk ? S2(lang, 'Arbetar redan då', 'Already working then') + (bk[2] ? ' · ' + bk[2] : '') : restIssue(s, p, w, d, f.from, f.to, lang) || S2(lang, 'Ingen tid som räcker', 'No time long enough'); }
    }
    return { id: p.id, name: p.name, ok: !why, why, free, part: !why && !(free.length === 1 && free[0].from === f.from && free[0].to === f.to), pref: (p.prefer || []).includes(f.group) };
  });
}
// Where a day is short of adults right now, as time ranges: per unit, and for the whole preschool while the units
// are merged in the morning and evening. Shifts of people who are away do not count. [{ group|null, from, to, n }]
export function shortfall(s, w, d) {
  const sw = { ...s, week: w, slot: 15 }, abs = s.absences.filter(z => z.week === w && z.day === d);
  const uncov = new Set(s.shifts.filter(x => x.week === w && x.day === d && (abs.some(z => z.staff === x.staff && z.from < x.end && z.to > x.start) || (() => { const p = person(x.staff); return p && !p.sub && onLeave(p, w, d); })())).map(x => x.id));
  const out = [], add = (group, t, n) => { const l = out.find(r => r.group === group && r.to === t); if (l) { l.to = t + 15; l.n = Math.max(l.n, n); } else out.push({ group, from: t, to: t + 15, n }); };
  for (const x of slotsFor(sw, d, uncov)) {
    if (x.merged) { if (x.have < x.need) add(null, x.t, x.need - x.have); }
    else for (const g of x.groups) if (g.have < g.need) add(g.id, x.t, g.need - g.have);
  }
  return out;
}
// The part of a free shift a substitute is needed for: from the first to the last gap in the sick person's unit
// (or while the units are merged) inside their shift, at least `subMin` minutes (Settings › Substitutes) and never
// outside the shift. With no gap at all, the whole shift.
export const SUB_MIN = 180;
export function subWindow(s, f) {
  const min = (s.prefs || {}).subMin ?? SUB_MIN, a0 = f.full ? f.full.from : f.from, b0 = f.full ? f.full.to : f.to;
  const gaps = shortfall(s, f.week, f.day).filter(r => (r.group === f.group || r.group === null) && r.from < b0 && r.to > a0);
  if (!gaps.length || b0 - a0 <= min) return { from: a0, to: b0 };
  let a = Math.max(a0, Math.min(...gaps.map(r => r.from))), b = Math.min(b0, Math.max(...gaps.map(r => r.to)));
  while (b - a < min) { if (a > a0) a -= 15; if (b - a < min && b < b0) b += 15; }
  return { from: a, to: b };
}
// ---------- sick cover: a call for proposals (contract net) ----------
// A sick report makes a free shift as a DRAFT. The principal (rektor) first tries to cover from inside: colleagues
// already working that day are ASKED to start earlier or stay later, and only a yes changes their day. Then the
// principal decides how much is needed from outside and PUBLISHES it to the staffing function (bemanning), which
// sends a call for proposals to the substitutes who can take some of it. Each substitute offers the whole time, a
// part of it, or declines, before a deadline. Bemanning AWARDS one or more offers (the app suggests a combination),
// or escalates if it is not covered in time. Every change is checked against the planner's own rules before it is
// saved. Statuses: draft -> open -> awarded, or covered (handled inside, no substitute). A real system could
// publish by itself, without the human step; here a person is in the loop on purpose. This follows the Contract
// Net Protocol (R. G. Smith, IEEE Transactions on Computers C-29(12), 1980).
export const OFFER_MINS = 15;
const copyDay = (st, pid, w, d) => st.shifts.filter(x => (x.staff === pid || x.was === pid) && x.week === w && x.day === d).map(x => ({ ...x }));
// Splits a person's shifts at minute `t`, so the part before can stay worked time when they go home sick.
function splitAt(st, pid, w, d, t) {
  st.shifts = st.shifts.flatMap(x => x.staff !== pid || x.week !== w || x.day !== d || x.start >= t || x.end <= t ? [x] : [{ ...x, end: t }, { ...x, id: 'h' + (++st.nid), start: t }]);
}
// A sick report: the whole day, or from minute `from` ("went home sick at 11:00"). Hours before stay worked.
export function reportSick(st, pid, w, d, t, from = null, today = true) {
  const sh = dayShifts(st, pid, w, d), first = sh.length ? sh[0].start : 0;
  const at = from != null && from > first ? Math.round(from / 15) * 15 : null;
  st.absences.push({ staff: pid, week: w, day: d, from: at ?? 0, to: 1440, reason: 'sick' });
  const f = makeFree(st, pid, w, d, t, at); if (f && today === false) f.today = false; return f;
}
export function makeFree(st, pid, w, d, t, from = null) {
  st.free = st.free || [];
  if (st.free.some(f => f.staff === pid && f.week === w && f.day === d)) return null;
  const orig = copyDay(st, pid, w, d);
  if (from != null) splitAt(st, pid, w, d, from);
  const sh = dayShifts(st, pid, w, d).filter(x => from == null || x.start >= from); if (!sh.length) return null;
  const a = sh[0].start, b = sh[sh.length - 1].end, c = sh.find(x => x.type === 'contact') || sh[0];
  const f = { id: 'f' + Date.now(), staff: pid, week: w, day: d, from: a, to: b, full: { from: a, to: b }, sickFrom: from, group: c.group, status: 'draft', orig,
    asked: [], offers: [], declined: [], won: [], internal: [], asks: [], escalated: [], clock: t, log: [{ t, k: 'sick', from }] };
  Object.assign(f, subWindow(st, f)); f.needs = freeNeeds(st, pid, w, d, f.from, f.to, c.group);
  st.free.push(f); return f;
}
const freeById = (st, id) => (st.free || []).find(x => x.id === id);
// The principal changes how much is needed from outside (inside the sick person's shift), before publishing.
export function setFreeWindow(st, id, from, to) {
  const f = freeById(st, id); if (!f || f.status !== 'draft') return;
  const full = f.full || { from: f.from, to: f.to }; f.full = full;
  f.from = Math.max(full.from, Math.min(from, full.to - 15)); f.to = Math.min(full.to, Math.max(to, f.from + 15));
  f.needs = freeNeeds(st, f.staff, f.week, f.day, f.from, f.to, f.group);
  const l = f.log[f.log.length - 1];
  if (l && l.k === 'window') Object.assign(l, { from: f.from, to: f.to }); else f.log.push({ t: f.clock, k: 'window', from: f.from, to: f.to });
}

// ---------- the planner's rules on a changed day ----------
// The planner's rule warnings for one person in week w: on day d and the day after (whose rest depends on d), and
// for the week. The same checks as the planner's list (personRules), for one person only.
export function personIssues(s, pid, w, d, lang = 'en') {
  const p = person(pid); if (!p) return [];
  const sw = { ...s, week: w }, L = T[lang] || T.en, R = rulesOf(sw), b0 = blockOf(w), out = [];
  const wk = s.shifts.filter(x => x.staff === pid && x.week === w), uncov = new Set(wk.filter(x => awayAt(s, pid, x)).map(x => x.id));
  const mins = wk.filter(x => !uncov.has(x.id)).reduce((a, x) => a + x.end - x.start, 0);
  const block = s.shifts.filter(x => x.staff === pid && !uncov.has(x.id) && x.week >= b0 && x.week < b0 + BLOCK_WEEKS).reduce((a, x) => a + x.end - x.start, 0);
  const W = (rule, key, v, day) => { const r = rule && (s.rules || []).find(x => x.id === rule); out.push({ text: tf(L[key], v), day, code: r ? r.id.toUpperCase() : '' }); };
  personRules(sw, p, wk, uncov, R, mins, block, L, lang, W);
  return out.filter(x => d == null || x.day == null || x.day === d || x.day === d + 1);
}
const newIssues = (before, after) => after.filter(x => !before.some(y => y.text === x.text));
const cloneDays = s => ({ ...s, shifts: s.shifts.map(x => ({ ...x })), roles: { ...s.roles } });
// Makes a person's day meet the break rules (longest work without a break, number of breaks) by moving a break or
// cutting a new one out of time with the children. The day keeps its start, end and minutes. Returns what it did,
// '' if nothing was needed, or null if it cannot be done.
export function placeBreaks(st, pid, w, d) {
  const R = rulesOf({ ...st, week: w }), lim = R.cont ? R.cont.h * 60 : null, len = R.brk ? Math.min(R.brk.b, Math.max(R.brk.a, 30)) : 30;
  const day = dayShifts(st, pid, w, d); if (!day.length) return '';
  const ok = segs => {
    let run = 0, prev = null;
    for (const x of segs) { if (x.type === 'break' || (prev != null && x.start - prev >= 15)) run = 0; if (x.type !== 'break') { run += x.end - x.start; if (lim && run > lim) return false; } prev = x.end; }
    const span = segs[segs.length - 1].end - segs[0].start;
    return R.breaksR.every(b => span <= b.over * 60 || segs.filter(x => x.type === 'break' && x.end - x.start >= b.a).length >= b.n);
  };
  if (ok(day)) return '';
  // A break of `m` minutes at `t`, cut out of time with the children (null if something else is there).
  const carve = (segs, t, m) => {
    if (segs.some(x => x.start < t + m && x.end > t && x.type !== 'contact')) return null;
    if (!segs.some(x => x.start <= t && x.end > t) || !segs.some(x => x.start < t + m && x.end >= t + m)) return null;
    const out = []; let done = false;
    for (const x of segs) {
      if (x.end <= t || x.start >= t + m) { out.push(x); continue; }
      if (x.start < t) out.push({ ...x, end: t });
      if (!done) { out.push({ ...x, id: null, type: 'break', start: t, end: t + m }); done = true; }
      if (x.end > t + m) out.push({ ...x, id: null, start: t + m });
    }
    return out.sort((a, b) => a.start - b.start);
  };
  const lo = day[0].start + 60, hi = day[day.length - 1].end - 60, grid = []; for (let t = lo; t + len <= hi; t += 15) grid.push(t);
  let best = null;
  // First: move an existing break, as little as possible.
  for (const bk of day.filter(x => x.type === 'break')) {
    const nb = day.find(x => x.type === 'contact' && (x.end === bk.start || x.start === bk.end)), base = day.map(x => x === bk ? { ...x, type: 'contact', group: nb ? nb.group : x.group } : x);
    for (const t of grid) { const c = carve(base, t, bk.end - bk.start); if (c && ok(c) && (!best || Math.abs(t - bk.start) < best.dist)) best = { segs: c, dist: Math.abs(t - bk.start), what: 'moved', t }; }
  }
  // Then: add breaks, one at a time, in the middle of the longest stretch of work.
  if (!best) {
    let segs = day, added = [];
    for (let k = 0; k < 3 && !ok(segs); k++) {
      const runs = []; let cur = null, prev = null;
      for (const x of segs) { if (x.type === 'break' || (prev != null && x.start - prev >= 15)) cur = null; if (x.type !== 'break') { if (!cur) runs.push(cur = { from: x.start, to: x.end }); else cur.to = x.end; } prev = x.end; }
      const r = runs.sort((a, b) => (b.to - b.from) - (a.to - a.from))[0], mid = Math.round(((r.from + r.to - len) / 2) / 15) * 15;
      const ts = grid.filter(t => t > r.from && t + len < r.to).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
      const t = ts.find(t => carve(segs, t, len)); if (t == null) break;
      segs = carve(segs, t, len); added.push(t);
    }
    if (ok(segs)) best = { segs, what: 'added', t: added[0] };
  }
  if (!best) return null;
  st.shifts = st.shifts.filter(x => !(x.staff === pid && x.week === w && x.day === d)).concat(best.segs.map(x => ({ ...x, id: x.id || 'h' + (++st.nid) })));
  return best.what + ':' + best.t;
}
const breakText = (r, lang) => r ? S2(lang, r.startsWith('moved') ? ', rasten flyttas till ' : ', med rast ', r.startsWith('moved') ? ', break moved to ' : ', with a break at ') + fmt(+r.split(':')[1]) : '';
// A change to a colleague's day: the extra time with the children in the sick person's unit (and the opening or
// closing), with the breaks put right. Returns the rule warnings it would add, or [] when it is fine.
function applyInternal(st, f, o, lang) {
  const before = personIssues(st, o.pid, f.week, f.day, lang);
  if (o.to > o.from) st.shifts.push({ id: 'h' + (++st.nid), staff: o.pid, week: f.week, day: f.day, start: o.from, end: o.to, type: 'contact', group: f.group });
  if (o.role) { const key = f.week + '-' + f.day; st.roles[key] = { ...(st.roles[key] || {}), [o.role]: o.pid }; }
  const brk = o.to > o.from ? placeBreaks(st, o.pid, f.week, f.day) : '';
  return { brk, issues: newIssues(before, personIssues(st, o.pid, f.week, f.day, lang)) };
}
// Covering from inside: colleagues already working that day who could start earlier or stay later to fill a gap in
// the sick person's unit (at most 3 hours more), within their earliest and latest times. Taking over the opening or
// closing is offered when the sick person had it and the colleague may do it. Each option is tried on a copy of the
// schedule and kept only if the planner's rules still hold, moving or adding a break when the day gets longer.
export function internalOptions(s, f, lang = 'sv') {
  const sv = lang === 'sv', w = f.week, d = f.day, key = w + '-' + d, roles = s.roles[key] || {}, full = f.full || f;
  const gaps = shortfall(s, w, d).filter(r => (r.group === f.group || r.group === null) && r.from < full.to && r.to > full.from);
  const asked = new Set((f.asks || []).filter(a => a.status !== 'withdrawn').map(a => a.pid));
  const out = [], valid = o => { const c = cloneDays(s), r = applyInternal(c, f, o, lang); return r.issues.length ? null : r; };
  const extra = (o, first, last) => {
    const over = Math.max(0, weekMins(s, o.pid, w) + o.ext - effCs(s, person(o.pid), w));
    return { over, text: (sv ? (o.kind === 'earlier' ? ' börjar ' + fmt(o.from) + ' i stället för ' + fmt(first) : ' stannar till ' + fmt(o.to) + ' i stället för ' + fmt(last)) : (o.kind === 'earlier' ? ' starts at ' + fmt(o.from) + ' instead of ' + fmt(first) : ' stays until ' + fmt(o.to) + ' instead of ' + fmt(last)))
      + (o.role ? (sv ? (o.role === 'open' ? ' och öppnar' : ' och stänger') : (o.role === 'open' ? ' and opens' : ' and closes')) : '') + ' (+' + hrs(o.ext, lang) + ')'
      + (over ? (sv ? ', ' + hrs(over, lang) + ' över avtalet denna vecka' : ', ' + hrs(over, lang) + ' over contract this week') : '') };
  };
  const day = p => { const sh = dayShifts(s, p.id, w, d).filter(x => !x.was); return sh.length ? [sh[0].start, Math.max(...sh.map(x => x.end))] : null; };
  const free = p => p.id !== f.staff && !asked.has(p.id) && !isAbsent(s, p.id, w, d) && !(p.off || []).includes(d) && !(p.end && w > p.end);
  for (const p of STAFF.filter(free)) {
    const span = day(p); if (!span) continue; const [first, last] = span;
    for (const g of gaps) {
      const opts = [];
      if (first > g.from && first <= g.to + 60) opts.push({ kind: 'earlier', from: Math.max(g.from, p.earliest ?? 0, full.from), to: first });
      if (last < g.to && last >= g.from - 60) opts.push({ kind: 'later', from: last, to: Math.min(g.to, p.latest ?? 1440, full.to) });
      for (const o0 of opts) {
        const ext = o0.to - o0.from; if (ext < 15 || ext > 180 || out.some(x => x.pid === p.id && x.kind === o0.kind)) continue;
        const role = o0.kind === 'earlier' && roles.open === f.staff && o0.from <= full.from && p.open ? 'open' : o0.kind === 'later' && roles.close === f.staff && o0.to >= full.to && p.close ? 'close' : null;
        const o = { pid: p.id, name: p.name, ...o0, ext, role, same: p.group === f.group }, r = valid(o); if (!r) continue;
        const x = extra(o, first, last); out.push({ ...o, over: x.over, brk: r.brk, text: x.text + breakText(r.brk, lang) });
      }
    }
  }
  // The sick person opened or closed: someone else must. First those already there then, at no extra time; else
  // someone who may open (close) and starts (ends) within two hours of it.
  for (const role of ['open', 'close']) {
    if (roles[role] !== f.staff || (f.internal || []).some(x => x.role === role) || (f.asks || []).some(a => a.role === role && (a.status === 'sent' || a.status === 'yes'))) continue;
    const at = role === 'open' ? full.from : full.to, cand = [];
    for (const p of STAFF.filter(x => free(x) && x[role])) {
      const span = day(p); if (!span) continue; const [first, last] = span;
      if (role === 'open' ? first <= at : last >= at) { cand.push({ pid: p.id, name: p.name, kind: 'role', from: at, to: at, ext: 0, role, over: 0, same: p.group === f.group, brk: '',
        text: sv ? (role === 'open' ? ' öppnar i stället (är redan där ' + fmt(first) + ')' : ' stänger i stället (är kvar till ' + fmt(last) + ')') : (role === 'open' ? ' opens instead (already there at ' + fmt(first) + ')' : ' closes instead (there until ' + fmt(last) + ')') }); continue; }
      const o0 = role === 'open' ? { kind: 'earlier', from: Math.max(at, p.earliest ?? 0), to: first } : { kind: 'later', from: last, to: Math.min(at, p.latest ?? 1440) }, ext = o0.to - o0.from;
      if (ext < 15 || ext > 120 || (role === 'open' ? o0.from > at : o0.to < at)) continue;
      const o = { pid: p.id, name: p.name, ...o0, ext, role, same: p.group === f.group }, r = valid(o); if (!r) continue;
      const x = extra(o, first, last); cand.push({ ...o, over: x.over, brk: r.brk, text: x.text + breakText(r.brk, lang) });
    }
    cand.sort((a, b) => a.ext - b.ext || (b.same ? 1 : 0) - (a.same ? 1 : 0)).slice(0, 2).forEach(c => { if (!out.some(x => x.pid === c.pid && x.kind === c.kind)) out.unshift(c); });
  }
  return out.sort((a, b) => (b.role ? 1 : 0) - (a.role ? 1 : 0) || (b.same ? 1 : 0) - (a.same ? 1 : 0) || a.over - b.over || a.ext - b.ext).slice(0, 6);
}
// Asking a colleague: the suggestion goes to their phone, and nothing in the schedule changes until they say yes.
export function askInternal(st, id, o) {
  const f = freeById(st, id); if (!f || f.status !== 'draft') return null;
  f.asks = f.asks || []; f.clock += 1;
  const a = { id: 'a' + (f.asks.length + 1) + o.pid, pid: o.pid, kind: o.kind, from: o.from, to: o.to, role: o.role, ext: o.ext, over: o.over, status: 'sent', t: f.clock };
  f.asks.push(a); f.log.push({ t: f.clock, k: 'asked', by: o.pid, from: o.from, to: o.to, role: o.role }); return a;
}
// The colleague's answer. A yes is checked against the rules again (the schedule may have changed since) and then
// written into the schedule; the time needed from outside is worked out again. Returns false if it could not be.
export function answerInternal(st, id, askId, yes, lang = 'en') {
  const f = freeById(st, id), a = f && (f.asks || []).find(x => x.id === askId); if (!a || a.status !== 'sent') return false;
  f.clock += 2;
  if (!yes) { a.status = 'no'; f.log.push({ t: f.clock, k: 'askNo', by: a.pid }); return true; }
  const keep = { shifts: st.shifts, roles: st.roles, nid: st.nid }, prev = (st.roles[f.week + '-' + f.day] || {})[a.role], orig = copyDay(st, a.pid, f.week, f.day);
  st.shifts = st.shifts.map(x => ({ ...x })); st.roles = { ...st.roles };
  const r = applyInternal(st, f, a, lang);
  if (r.issues.length) { Object.assign(st, keep); a.status = 'stale'; a.why = r.issues.map(x => x.text); f.log.push({ t: f.clock, k: 'askStale', by: a.pid }); return false; }
  a.status = 'yes';
  f.internal.push({ pid: a.pid, from: a.from, to: a.to, role: a.role, brk: r.brk, orig, prevRole: a.role ? prev ?? null : undefined });
  f.log.push({ t: f.clock, k: 'internal', by: a.pid, from: a.from, to: a.to, role: a.role });
  if (f.status === 'draft') { Object.assign(f, subWindow(st, f)); f.needs = freeNeeds(st, f.staff, f.week, f.day, f.from, f.to, f.group); }
  return true;
}
// For the demo: the colleague says yes on their phone.
export const coverInternally = (st, id, o) => { const a = askInternal(st, id, o); return !!a && answerInternal(st, id, a.id, true); };
// No substitute needed: the day is covered from inside.
export function closeFree(st, id) {
  const f = freeById(st, id); if (!f || f.status !== 'draft') return;
  f.status = 'covered'; f.log.push({ t: f.clock, k: 'covered' });
}
// Publishing sends the call for proposals to every substitute who can take some of the time, with a deadline
// (Settings › Substitutes). Questions to colleagues that are not answered yet are withdrawn.
export function publishFree(st, id) {
  const f = freeById(st, id); if (!f || f.status !== 'draft') return;
  for (const a of f.asks || []) if (a.status === 'sent') a.status = 'withdrawn';
  f.status = 'open'; f.clock += 1;
  f.asked = subCands(st, f, 'en').filter(c => c.ok).map(c => c.id);
  f.pubClock = f.clock; f.pubAt = Date.now(); f.deadline = f.clock + ((st.prefs || {}).offerMins ?? OFFER_MINS);
  f.log.push({ t: f.clock, k: f.asked.length ? 'published' : 'nobody', ids: f.asked.slice() });
}
// The desk's clock for a free shift: its own time (when things happened in the demo) plus the real minutes since it
// was published.
export const freeNow = (f, now = Date.now()) => f.pubAt ? Math.max(f.clock, f.pubClock + Math.floor((now - f.pubAt) / 60000)) : f.clock;
// For the demo: jump to the deadline.
export function skipToDeadline(st, id) { const f = freeById(st, id); if (f && f.pubAt) f.pubAt -= Math.max(0, f.deadline - freeNow(f)) * 60000 + 1000; }
// Is it late? Publishing or awarding after the shift has started, or less than 30 minutes before. Only for a sick
// report made the same day. { started, mins } or null.
export function lateness(f, now = freeNow(f)) {
  if (f.today === false) return null;
  const m = f.from - now; return m <= 0 ? { started: true, mins: -m } : m < 30 ? { started: false, mins: m } : null;
}
// Escalating when the deadline has passed and it is not covered: to the municipality's substitute portal, a
// preschool nearby, or something else. In the demo this is a marked step, not a real integration.
export const ESCALATE = ['portal', 'nearby', 'other'];
export function escalateFree(st, id, to) {
  const f = freeById(st, id); if (!f || f.status !== 'open' || !ESCALATE.includes(to)) return;
  f.escalated = [...(f.escalated || []), { to, t: freeNow(f) }]; f.log.push({ t: freeNow(f), k: 'escalated', to });
}
// A substitute's answer: the whole window or a part of it (at least the shortest substitute shift), or no.
export function offerFree(st, id, subId, from, to) {
  const f = freeById(st, id); if (!f || f.status !== 'open' || !f.asked.includes(subId)) return false;
  from = Math.max(f.from, from); to = Math.min(f.to, to);
  if (to - from < subMinOf(st, f)) return false;
  f.offers = f.offers.filter(o => o.sub !== subId); f.declined = f.declined.filter(x => x !== subId); f.clock += 2;
  f.offers.push({ id: 'o' + (f.offers.length + 1) + subId, sub: subId, from, to, status: 'sent', t: f.clock });
  f.log.push({ t: f.clock, k: 'offer', by: subId, from, to }); return true;
}
export function declineFree(st, id, subId) {
  const f = freeById(st, id); if (!f || f.status !== 'open') return;
  f.offers = f.offers.filter(o => o.sub !== subId);
  if (!f.declined.includes(subId)) { f.declined.push(subId); f.clock += 1; f.log.push({ t: f.clock, k: 'declined', by: subId }); }
}
// The app's suggestion: an offer covering everything if there is one (the preferred substitute first); otherwise
// offers added one at a time by how much uncovered time each adds. Bemanning decides.
export function suggestOffers(f) {
  const pref = o => { const p = person(o.sub); return p && (p.prefer || []).includes(f.group) ? 1 : 0; };
  const all = f.offers.filter(o => o.status === 'sent'), whole = all.filter(o => o.from <= f.from && o.to >= f.to).sort((a, b) => pref(b) - pref(a) || a.t - b.t);
  if (whole.length) return [whole[0].id];
  const pick = [], covered = [];
  const gain = o => { let m = 0; for (let t = o.from; t < o.to; t += 15) if (!covered.some(c => c.from <= t && c.to > t)) m += 15; return m; };
  for (;;) {
    const best = all.filter(o => !pick.includes(o.id)).map(o => ({ o, g: gain(o) })).filter(x => x.g > 0).sort((a, b) => b.g - a.g || pref(b.o) - pref(a.o) || a.o.t - b.o.t)[0];
    if (!best) break; pick.push(best.o.id); covered.push(best.o);
  }
  return pick;
}
export const uncoveredBy = (f, ids) => { const ch = f.offers.filter(o => ids.includes(o.id)); let m = 0; for (let t = f.from; t < f.to; t += 15) if (!ch.some(o => o.from <= t && o.to > t)) m += 15; return m; };
// Each chosen substitute takes the sick person's day inside their offer (time with the children), in the order of
// the offers, with a break of their own where the piece is long. Returns the rule warnings per substitute.
function applyAward(st, f, chosen, lang) {
  const before = Object.fromEntries(chosen.map(o => [o.sub, personIssues(st, o.sub, f.week, f.day, lang)]));
  for (const o of chosen) {
    st.shifts = st.shifts.flatMap(x => {
      if (x.staff !== f.staff || x.week !== f.week || x.day !== f.day || x.end <= o.from || x.start >= o.to) return [x];
      const out = [];
      if (x.start < o.from) out.push({ ...x, end: o.from });
      if (x.end > o.to) out.push({ ...x, id: 'h' + (++st.nid), start: o.to });
      const mid = { ...x, id: x.start < o.from ? 'h' + (++st.nid) : x.id, start: Math.max(x.start, o.from), end: Math.min(x.end, o.to), was: x.staff, staff: o.sub };
      if (mid.type !== 'contact' && mid.type !== 'break') { mid.wasType = mid.type; mid.type = 'contact'; }
      return [...out, mid];
    });
  }
  const out = [];
  for (const o of chosen) {
    if (placeBreaks(st, o.sub, f.week, f.day) === null) out.push({ sub: o.sub, text: S2(lang, 'Rasten går inte att lägga så att reglerna följs', 'The break cannot be placed so the rules hold') });
    for (const x of newIssues(before[o.sub], personIssues(st, o.sub, f.week, f.day, lang))) out.push({ sub: o.sub, ...x });
  }
  return out;
}
// What awarding these offers would break, tried on a copy: [] when it is fine.
export function awardIssues(s, id, ids, lang = 'en') {
  const f = freeById(s, id); if (!f) return [];
  const c = cloneDays(s); return applyAward(c, f, f.offers.filter(o => ids.includes(o.id)).sort((a, b) => a.from - b.from), lang);
}
// Awarding: refused if it would break a rule. Everyone who offered is told.
export function awardFree(st, id, ids) {
  const f = freeById(st, id); if (!f || f.status !== 'open' || !ids.length) return false;
  if (awardIssues(st, id, ids).length) return false;
  applyAward(st, f, f.offers.filter(o => ids.includes(o.id)).sort((a, b) => a.from - b.from), 'en');
  const chosen = f.offers.filter(o => ids.includes(o.id)).sort((a, b) => a.from - b.from);
  f.clock = freeNow(f) + 3; st.notes = st.notes || [];
  for (const o of f.offers) {
    o.status = ids.includes(o.id) ? 'won' : 'lost';
    st.notes.push({ id: 'n' + Date.now() + o.id, to: o.sub, key: o.status === 'won' ? 'subConfirmed' : 'offerLost', p: { week: f.week, day: f.day, from: o.from, to: o.to, group: f.group }, at: Date.now(), read: false });
  }
  f.won = chosen.map(o => ({ sub: o.sub, from: o.from, to: o.to })); f.status = 'awarded';
  f.log.push({ t: f.clock, k: 'awarded', won: f.won.slice() }); return true;
}
// For the demo only: the substitutes who were asked answer as people often do. The first can take about 5 hours
// from the start, the second the rest of the day, the others say no.
export function simulateOffers(st, id) {
  const f = freeById(st, id); if (!f || f.status !== 'open') return;
  const min = subMinOf(st, f), c = subCands(st, { ...f, declined: [] }, 'en').filter(x => f.asked.includes(x.id) && !f.offers.some(o => o.sub === x.id) && !f.declined.includes(x.id)).sort((a, b) => (b.pref ? 1 : 0) - (a.pref ? 1 : 0));
  c.forEach((x, i) => {
    const fr = x.free[0], len = fr.to - fr.from;
    if (i === 0) offerFree(st, f.id, x.id, fr.from, len > 300 + 15 ? fr.from + Math.max(min, 300) : fr.to);
    else if (i === 1) { const last = x.free[x.free.length - 1]; offerFree(st, f.id, x.id, Math.max(last.from, last.to - Math.max(min, f.to - f.from - 300 + 60)), last.to); }
    else declineFree(st, f.id, x.id);
  });
}
// Taking the sick report back gives the person their day again, as it was, and undoes the colleagues' changes.
export function removeFree(st, pid, w, d) {
  const f = (st.free || []).find(x => x.staff === pid && x.week === w && x.day === d); if (!f) return;
  const at = x => x.week === w && x.day === d;
  for (const o of (f.internal || []).slice().reverse()) {
    if (o.orig) st.shifts = st.shifts.filter(x => !(x.staff === o.pid && at(x))).concat(o.orig.map(x => ({ ...x })));
    else st.shifts = st.shifts.filter(x => !(x.staff === o.pid && at(x) && x.start === o.from && x.end === o.to && x.type === 'contact'));
    if (o.role && o.prevRole !== undefined) { const key = w + '-' + d, r = { ...(st.roles[key] || {}) }; if (r[o.role] === o.pid) { if (o.prevRole) r[o.role] = o.prevRole; else delete r[o.role]; } st.roles[key] = r; }
  }
  if (f.orig) st.shifts = st.shifts.filter(x => !((x.staff === pid || x.was === pid) && at(x))).concat(f.orig.map(x => ({ ...x })));
  else st.shifts.forEach(x => { if (x.was === pid && at(x)) { x.staff = pid; delete x.was; if (x.wasType) { x.type = x.wasType; delete x.wasType; } } });
  st.free = st.free.filter(x => x !== f);
}
export function nonChildTarget(s, p, w) {
  const full = contractH(p, w) * 60; if (!full) return 0;
  const h = p.nonChild != null ? p.nonChild : Math.round(((s.prefs || {}).nonChild ?? 5) * contractPct(p, w) / 100 * 2) / 2;
  return Math.round(h * 60 * effCs(s, p, w) / full);
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
      if (z && z.reason === 'sick') { const m = own.filter(x => x.start < z.to && x.end > z.from).reduce((a, x) => a + x.end - x.start, 0); if (m) { day.sick = m; r.sick += m; r.sickDays++; } }
      own.filter(x => x.staff === pid && !(z && x.start < z.to && x.end > z.from)).forEach(x => { r[x.type] += x.end - x.start; if (x.type === 'contact' || x.type === 'break') day.child += x.end - x.start; else day.non += x.end - x.start; });
      day.st = day.child + day.non ? 'work' : (p.off || []).includes(d) ? 'off' : 'none';
    }
    r.days.push(day);
  }
  r.child = r.contact + r.break; r.non = r.planning + r.meeting; r.worked = r.child + r.non;
  r.C = p.sub ? 0 : effCs(s, p, w); r.N = p.sub ? 0 : nonChildTarget(s, p, w); r.A = r.C - r.N;
  return r;
}
export function coverCands(s, r, lang) {
  const w = r.week, d = r.day, a = r.from, b = r.to, dur = b - a, D = derive({ ...s, week: w }, T[lang] || T.en, lang);
  const RW = rp(s, 'week', w), RA = rp(s, 'avg', w), RC = rp(s, 'cont', w);
  return STAFF.filter(p => p.id !== r.staff).map(p => {
    let why = null; const mine = dayShifts(s, p.id, w, d);
    if ((r.declined || []).includes(p.id)) why = S2(lang, 'Tackade nej', 'Declined');
    else if (((s.phonePrefs || {})[p.id] || {}).offers === false) why = S2(lang, 'Vill inte få förfrågningar', 'Does not want requests');
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
// The rules in force in week s.week.
function rulesOf(s) {
  const active = (s.rules || []).map(r => ({ r, v: ruleVer(r, s.week) })).filter(x => x.v && x.v.on);
  const one = t => { const x = active.find(y => y.r.type === t); return x ? { id: x.r.id, ...x.v.p } : null; };
  const many = t => active.filter(y => y.r.type === t).map(x => ({ id: x.r.id, ...x.v.p }));
  return { rest: one('rest'), week: one('week'), avg: one('avg'), cont: one('cont'), brk: one('breakLen'), oc: one('openClose'), av: one('avail'), ab: one('absent'), sn: one('sn'),
    breaksR: many('breaks'), dayR: many('dayMax'), minR: many('minStaff') };
}
// The working-time rules for one person in week s.week: rest, availability, breaks, hours a day and a week. The
// planner runs it for everyone; the substitute desk runs it on a changed day before the change is saved.
function personRules(s, p, wk, uncov, R, minsWeek, minsBlock, L, lang, W) {
  const { breaksR, dayR } = R;
  let lastEnd = null; const name = nmOf(p);
  const mineAll = wk.filter(x => x.staff === p.id && !uncov.has(x.id));
  if (R.av && !p.sub && p.end && s.week > p.end && mineAll.length) W(R.av.id, 'w_ended', { name, w: p.end }, null, null, 'rule', p.id);
  for (let d = 0; d < 5; d++) {
    const segs = mineAll.filter(x => x.day === d).sort((a, b) => a.start - b.start);
    if (!segs.length) { lastEnd = null; continue; }
    const day = L.dayW[d], first = segs[0], last = segs[segs.length - 1];
    if (R.rest && lastEnd != null && (1440 - lastEnd + first.start) < R.rest.h * 60) W(R.rest.id, 'w_rest', { name, h: hrs(1440 - lastEnd + first.start, lang), lim: hrs(R.rest.h * 60, lang), day: L.dayW[d - 1] }, d, first.id);
    lastEnd = last.end;
    if (R.av) {
      if ((p.off || []).includes(d) || (p.sub && !(p.days || []).includes(d))) W(R.av.id, 'w_unav', { name, day }, d, first.id);
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
  if (R.week) {
    // Up to `flex` hours over the limit is fine if the week next to it is that much shorter.
    const lim = R.week.h * 60, flex = (R.week.flex || 0) * 60, cur = minsWeek, prev = weekMins(s, p.id, s.week - 1), next = weekMins(s, p.id, s.week + 1);
    if (cur > lim + flex) W(R.week.id, 'w_week', { name, h: hrs(cur, lang), lim: hrs(lim + flex, lang) }, null, null, 'rule', p.id);
    else if (cur > lim && next > 2 * lim - cur) W(R.week.id, 'w_weekNext', { name, h: hrs(cur, lang), n: s.week + 1, max: hrs(2 * lim - cur, lang), next: hrs(next, lang) }, null, null, 'rule', p.id);
    if (prev > lim && cur > 2 * lim - prev) W(R.week.id, 'w_weekPrev', { name, h: hrs(prev, lang), n: s.week - 1, max: hrs(Math.max(0, 2 * lim - prev), lang), cur: hrs(cur, lang) }, null, null, 'rule', p.id);
  }
  if (R.avg && minsBlock / BLOCK_WEEKS > R.avg.h * 60) W(R.avg.id, 'w_avg', { name, h: hrs(minsBlock / BLOCK_WEEKS, lang), lim: hrs(R.avg.h * 60, lang) }, null, null, 'rule', p.id);
}
function derive(s, L, lang) {
  const wk = s.shifts.filter(x => x.week === s.week), b0 = blockOf(s.week), RT = RULE_TEXT[lang] || RULE_TEXT.en;
  const abs = s.absences.filter(z => z.week === s.week).map(z => ({ ...z, reason: z.reason || 'sick' }));
  for (const p of STAFF) for (let d = 0; d < 5; d++) { const l = onLeave(p, s.week, d); if (l && !abs.some(z => z.staff === p.id && z.day === d)) abs.push({ staff: p.id, week: s.week, day: d, from: 0, to: 1440, reason: l.kind }); }
  const absent = (pid, day, a, b) => abs.some(z => z.staff === pid && z.day === day && z.from < b && z.to > a);
  const uncov = new Set(wk.filter(x => absent(x.staff, x.day, x.start, x.end)).map(x => x.id));
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
  const R = rulesOf(s), { minR } = R;
  for (const p of allP()) personRules(s, p, wk, uncov, R, minsW[p.id], minsB[p.id], L, lang, W);
  const slotsByDay = [0, 1, 2, 3, 4].map(d => slotsFor(s, d, uncov));
  const closed = closedDays(s, s.week);
  for (const x of wk.filter(x => closed.includes(x.day))) W(null, 'w_closed', { name: nmOf(person(x.staff) || { name: '?' }), day: L.dayW[x.day] }, x.day, x.id);
  if (R.oc) for (let d = 0; d < 5; d++) { if (closed.includes(d)) continue; const r = s.roles[s.week + '-' + d] || {}, day = L.dayW[d]; if (!r.open) W(R.oc.id, 'w_noOpen', { day }, d, null, 'role'); if (!r.close) W(R.oc.id, 'w_noClose', { day }, d, null, 'role'); }
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
    // Each unit needs its own adults, except while the units are merged into one room.
    GROUPS.forEach((g, gi) => runs(sl, x => !x.merged && x.groups[gi].have < x.groups[gi].need, (i, j) => W('ratio', 'w_underUnit', { unit: g.name, day, from: fr(i), to: to(j), have: Math.min(...sl.slice(i, j + 1).map(x => x.groups[gi].have)), need: Math.max(...sl.slice(i, j + 1).map(x => x.groups[gi].need)) }, d, null, 'staffing')));
    for (const m of minR) runs(sl, x => x.children > 0 && x.have < m.n, (i, j) => W(m.id, 'w_min', { day, from: fr(i), to: to(j), have: Math.min(...sl.slice(i, j + 1).map(x => x.have)), n: m.n }, d, null, 'staffing'));
    if (R.sn && !closed.includes(d)) for (const kid of (s.snKids || []).filter(q => q.days.includes(d))) {
      const cs = wk.filter(x => x.day === d && x.type === 'contact' && x.group === kid.unit && !uncov.has(x.id) && (person(x.staff) || {}).sn);
      runs(sl, x => { const mid = x.t + s.slot / 2; return mid > kid.from && mid < kid.to && !cs.some(q => q.start <= mid && q.end > mid); }, (i, j) => W(R.sn.id, 'w_sn', { unit: (grp(kid.unit) || {}).name, day, from: fr(i), to: to(j) }, d, null, 'staffing'));
    }
  });
  // An empty week has nothing to check yet: warnings would only say what is missing.
  if (!wk.length) { warns.length = 0; bad.clear(); }
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
    (j.groups || []).forEach(x => { const g = GROUPS.find(y => y.id === x.id); if (g) Object.assign(g, x, x.name === OLD_NAMES[x.id] ? { name: g.name } : {}); }); (j.subs || []).forEach(x => { const p = SUBS.find(y => y.id === x.id); if (p) Object.assign(p, x); }); if (!j.s.free) j.s.free = [];
    j.s.free.forEach(f => { f.asks = f.asks || []; f.escalated = f.escalated || []; if (f.asked) return; const by = f.by; f.asked = f.offered || []; f.offers = []; f.declined = f.declined || []; f.internal = []; f.full = f.full || { from: f.from, to: f.to };
      f.won = by ? [{ sub: by, from: f.from, to: f.to }] : []; f.status = by ? 'awarded' : 'open'; }); if (!j.s.requests) j.s.requests = []; if (!j.s.special) j.s.special = [];
    (j.s.rules || []).filter(r => r.type === 'week').forEach(r => r.versions.forEach(v => { if (v.p.flex == null) v.p.flex = 2; })); if (!j.s.notes) j.s.notes = []; return j.s; } catch (e) { return null; } };
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
  const toast = msg => { clearTimeout(toastT); up({ toast: msg }); toastT = setTimeout(() => up({ toast: null }), 2600); };

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
    // A break, planning or meeting that is part of a working day can be dropped anywhere in that day. Only the
    // time with children closes up around it: other breaks and planning stay where they are, and the day keeps
    // its start, end and minutes of each kind. Dropped onto another such block, it settles right next to it.
    if (ctx.mode !== 'new' && sh.type !== 'contact' && (prev || next)) mode = 'reflow';
    const chain = [o]; for (let a = prev && P; a; a = sib.find(x => x.end === a.start)) chain.unshift({ ...a });
    for (let b = next && N; b; b = sib.find(x => x.start === b.end)) chain.push({ ...b });
    const chainIds = new Set(chain.map(x => x.id)), spares = mode === 'reflow' ? [1, 2, 3].map(() => 'h' + (++s.nid)) : [];
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const reflow = at => {
      const len = o.end - o.start, d0 = chain[0].start, d1 = chain[chain.length - 1].end, edge = o.type === 'break' ? slot : 0;
      const fixed = chain.filter(x => x.id !== o.id && x.type !== 'contact'), lo = d0 + edge, hi = d1 - len - edge;
      const free = t => t >= lo && t <= hi && !fixed.some(f => t < f.end && t + len > f.start);
      let ins = cl(at, lo, hi);
      if (!free(ins)) {
        // the nearest free spot: just before or just after the blocks in the way
        const cands = fixed.flatMap(f => [f.start - len, f.end]).concat([lo, hi]).filter(free);
        if (!cands.length) return;
        ins = cands.reduce((a, b) => Math.abs(b - at) < Math.abs(a - at) ? b : a);
      }
      const blocks = [...fixed, { ...o, start: ins, end: ins + len }].sort((a, b) => a.start - b.start), contacts = chain.filter(x => x.type === 'contact');
      const ids = [...contacts.map(x => x.id), ...spares], out = [];
      const fill = (a, b) => { if (b <= a) return; const src = contacts.find(x => x.start < b && x.end > a) || contacts[0] || o; out.push({ ...src, type: 'contact', id: ids.shift(), start: a, end: b }); };
      let t = d0;
      for (const x of blocks) { fill(t, x.start); out.push(x); t = x.end; }
      fill(t, d1);
      const st = store.get(); st.shifts = st.shifts.filter(x => !chainIds.has(x.id) && !spares.includes(x.id)).concat(out);
    };
    const move = ev => {
      if (!moved && Math.abs(pos(ev) - p0) < 4) return; moved = true;
      const dm = snap(toMin(pos(ev)) - toMin(p0));
      store.live(() => {
        if (mode === 'reflow') reflow(o.start + dm);
        else if (mode === 'move') { const len = o.end - o.start; sh.start = Math.max(DS, Math.min(DE - len, o.start + dm)); sh.end = sh.start + len; }
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
      const m = D.minsW[p.id], c = effCs(s, p, s.week), diff = m - c;
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
        i: d, name: L.days[d], short: L.short[d], date: dayDate(s.week, d, L), active: d === day,
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
        toggleSick: () => store.set(st => { if (sick) { st.absences = st.absences.filter(z => !(z.week === s.week && z.staff === pp.id && z.day === day)); removeFree(st, pp.id, s.week, day); } else reportSick(st, pp.id, s.week, day, nowMin(), null, isoDate(s.week, day) === new Date().toLocaleDateString('sv-SE')); }),
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
    const totB = STAFF.reduce((a, p) => a + D.minsB[p.id], 0), conB = STAFF.reduce((a, p) => a + [0, 1, 2, 3].reduce((x, i) => x + effCs(s, p, b0 + i), 0), 0);
    const totW = STAFF.reduce((a, p) => a + D.minsW[p.id], 0), conW = STAFF.reduce((a, p) => a + effCs(s, p, s.week), 0);
    const fp = person(ui.focus) || STAFF[0];
    return {
      ready: true, L, lang, s, merge: s.merge || MERGE0, roster, ghost: gh, hasGhost: !!gh, weekNo: s.week, slot: s.slot, is15: s.slot === 15, is30: s.slot === 30,
      weekLabel: L.week + ' ' + s.week, dateRange: weekDates(s.week, L),
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
      focusWeek: [0, 1, 2, 3, 4].map(d => ({ ...rowFor(fp, d), dayName: L.days[d], short: L.short[d], date: dayDate(s.week, d, L), active: d === day, select: () => up({ day: d }) })),
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
      set15: () => store.live(st => { st.slot = 15; }), set30: () => store.live(st => { st.slot = 30; }),
      toggleSlot: () => store.live(st => { st.slot = st.slot === 15 ? 30 : 15; }),
      clearSel: () => up({ sel: null, person: null }),
      expand: () => up({ expanded: !ui.expanded }), expanded: ui.expanded,
    };
  }
  // Makes the schedule for `weeks` with the solver, one week at a time and in order, so each week sees the
  // hours of the week before (the flexible week). If the solver can't be reached at all, the weeks come from
  // the saved schedule instead. Everything is one change (one Undo).
  // Returns { saved, missing: weeks that could not be made, errors: what the solver said, unreachable }.
  const generate = async (weeks, onProgress, { keep = false } = {}) => {
    const done = [], missing = [], errors = []; let saved = false, unreachable = false;
    store.begin();
    for (let i = 0; i < weeks.length; i++) {
      onProgress && onProgress(i, weeks.length, weeks[i]);
      let sol = null, reached = false;
      try {
        const problem = solverProblem(store.get(), [weeks[i]], { keep });
        const r = await fetch(SOLVER_URL + '/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(problem) });
        // A server without a solver (e.g. a plain web host) answers 404/405/501: same as no solver.
        reached = ![404, 405, 501].includes(r.status);
        if (r.ok) { sol = await r.json(); sol.weeks.forEach(x => { x.kept = problem.weeks[0].kept; }); } else if (reached) errors.push((await r.json().catch(() => ({}))).error || 'HTTP ' + r.status);
      } catch (e) {}
      if (!reached && !done.length && !errors.length) { saved = unreachable = true; break; }
      if (!reached) unreachable = true;
      if (!sol) { missing.push(weeks[i]); continue; }
      store.live(st => applySolution(st, sol)); done.push(weeks[i]);
    }
    if (saved) try {
      // The saved schedule covers everyone, so it can't fill in around shifts that are kept.
      const all = await (await fetch(new URL('solved-schedule.json', import.meta.url))).json(), have = all.weeks.filter(x => weeks.includes(x.week) && !(keep && store.get().shifts.some(z => z.week === x.week)));
      store.live(st => applySolution(st, { weeks: have })); done.push(...have.map(x => x.week));
      missing.push(...weeks.filter(w => !done.includes(w)));
    } catch (e) {}
    if (!done.length) { store.cancel(); return { done, missing: weeks, errors, unreachable, saved: false }; }
    up({ sel: null }); store.commit();
    return { done, saved, missing, errors, unreachable };
  };
  return { store, ui, view, up, touch, resetDemo, generate };
}

// ---------- Medvind base schedule: schedule lines in an N-week rotation ----------
// A rotation is what Medvind calls a grundschema: N weeks that repeat, one row (schemarad) per line, one time
// range per weekday. rotation = { weeks: N, start: k (Medvind's "Startvecka", 1..N), lines: [{ label, unit,
// extra, staff?, cells: [week][day 0-6] -> { from, to, raw?, flag?, note? } | null }], flags: [...] }.
// medvind/medvind.py reads and writes the Excel export; everything here works on this plain shape.
export const ROT0 = { n: 6, start: W0 };
// Our schedule as schedule lines: one line per person, numbered by unit like Medvind ("1, Avd 1"), for the
// N calendar weeks from `start`. A day becomes one range from the first start to the last end, as in Medvind,
// so breaks and planning inside it are not shown.
export function rotationFromShifts(s, start = (s.rotation || ROT0).start, n = (s.rotation || ROT0).n) {
  let no = 0;
  const lines = GROUPS.flatMap(g => STAFF.filter(p => p.group === g.id).map(p => ({
    label: ++no + ', ' + g.name, unit: g.name, extra: false, staff: p.id, name: p.name,
    cells: [...Array(n).keys()].map(k => [...Array(7).keys()].map(d => { const l = d < 5 ? dayShifts(s, p.id, start + k, d) : []; return l.length ? { from: l[0].start, to: Math.max(...l.map(x => x.end)) } : null; })),
  })));
  return { weeks: n, start: 1, first: start, lines, flags: [] };
}
// Repeats weeks start..start+n-1 over the following weeks up to the last week of the demo (shifts and openers/closers).
export function repeatRotation(st, start, n) {
  const to = [];
  for (let w = start + n; w <= W1; w++) {
    const from = start + (w - start) % n; to.push(w);
    st.shifts = st.shifts.filter(x => x.week !== w).concat(st.shifts.filter(x => x.week === from).map(x => ({ ...x, id: 'h' + (++st.nid), week: w })));
    for (let d = 0; d < 5; d++) st.roles[w + '-' + d] = { ...(st.roles[from + '-' + d] || {}) };
  }
  return to;
}
// Checks a rotation against the rules in Settings, the way they apply to a base schedule:
//   avg    – hours worked per week averaged over the whole cycle, at most the limit (R3, 40 h)
//   rest   – at least the rule's hours (R1, 11 h) between two working days, also from the last week back to the first
//   breaks – no more than the rule's hours (R4, 5 h) without a break. A Medvind export has one range per day and
//            no breaks, so this is checked as "how many breaks the day needs", not whether they are there.
// Worked time is the range less the breaks the day needs, each as long as the break rule's longest break (30 min),
// since breaks are unpaid; the result says so.
export function checkRotation(rot, s, lang = 'sv') {
  const sv = lang === 'sv', w0 = s.week || W0, R = { avg: rp(s, 'avg', w0), rest: rp(s, 'rest', w0), cont: rp(s, 'cont', w0), brk: rp(s, 'breakLen', w0) };
  const runMax = (R.cont ? R.cont.h : 5) * 60, brk = R.brk ? R.brk.b : 30, N = rot.weeks;
  const needBreaks = span => span > runMax ? Math.ceil((span - runMax) / (runMax + brk)) : 0;
  const DN = sv ? ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const where = (n, d) => (sv ? 'vecka ' : 'week ') + (n + 1) + ' ' + DN[d], H = m => hrs(m, lang), rng = x => fmt(x.from) + '–' + fmt(x.to);
  const lines = rot.lines.map(line => {
    const issues = [], days = [];
    line.cells.forEach((wk, n) => wk.forEach((x, d) => { if (x) days.push({ n, d, x, at: (n * 7 + d) * 1440 }); }));
    const span = line.cells.map(wk => wk.reduce((a, x) => a + (x ? x.to - x.from : 0), 0));
    const work = line.cells.map(wk => wk.reduce((a, x) => a + (x ? x.to - x.from - needBreaks(x.to - x.from) * brk : 0), 0));
    const avgSpan = span.reduce((a, b) => a + b, 0) / N, avgWork = work.reduce((a, b) => a + b, 0) / N;
    if (R.avg && avgWork > R.avg.h * 60) issues.push({ rule: 'avg', code: R.avg.code, text: sv ? 'I snitt ' + H(avgWork) + ' arbetad tid per vecka över ' + N + ' veckor (' + H(avgSpan) + ' med raster). Gränsen är ' + H(R.avg.h * 60) + '.' : 'On average ' + H(avgWork) + ' worked per week over ' + N + ' weeks (' + H(avgSpan) + ' with breaks). The limit is ' + H(R.avg.h * 60) + '.' });
    if (R.rest) days.forEach((a, i) => {
      if (days.length < 2) return; const b = days[(i + 1) % days.length], gap = (b.at + b.x.from + (i + 1 === days.length ? N * 7 * 1440 : 0)) - (a.at + a.x.to);
      if (gap < R.rest.h * 60) issues.push({ rule: 'rest', code: R.rest.code, week: a.n + 1, day: a.d, text: (sv ? 'Bara ' : 'Only ') + H(gap) + (sv ? ' vila mellan ' : ' rest between ') + where(a.n, a.d) + ' (' + rng(a.x) + ')' + (sv ? ' och ' : ' and ') + where(b.n, b.d) + ' (' + rng(b.x) + ').' });
    });
    if (R.cont) days.forEach(({ n, d, x }) => { const k = needBreaks(x.to - x.from); if (k) issues.push({ rule: 'breaks', code: R.cont.code, week: n + 1, day: d, need: k, text: where(n, d)[0].toUpperCase() + where(n, d).slice(1) + ' ' + rng(x) + ' (' + H(x.to - x.from) + (sv ? ') behöver ' : ') needs ') + (k === 1 ? (sv ? 'en rast' : 'a break') : k + (sv ? ' raster' : ' breaks')) + (sv ? ' så att ingen period blir längre än ' : ' so that no stretch is longer than ') + H(runMax) + '.' }); });
    return { label: line.label, unit: line.unit, extra: !!line.extra, staff: line.staff, name: line.name, span, work, avgSpan, avgWork, daysPerWeek: line.cells.map(wk => wk.filter(Boolean).length), issues };
  });
  return { lines, breakMin: brk, runMax, rules: R };
}
// Reading and writing Medvind's Excel file goes through the local server (solver/server.py, medvind/medvind.py).
const medvindCall = async (path, body, json) => {
  let r; try { r = await fetch(SOLVER_URL + path, { method: 'POST', headers: { 'Content-Type': json ? 'application/json' : 'application/octet-stream' }, body }); }
  catch (e) { throw new Error('unreachable'); }
  if (!r.ok) { let m = ''; try { m = (await r.json()).error; } catch (e) {} throw new Error(m || 'HTTP ' + r.status); }
  return r;
};
export const medvindRead = async file => (await medvindCall('/medvind/read', await file.arrayBuffer())).json();
export const medvindWrite = async rot => (await medvindCall('/medvind/write', JSON.stringify(rot), true)).blob();
