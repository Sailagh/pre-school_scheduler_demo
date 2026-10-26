// Writes a rule-check report (Markdown, English) for a Medvind base schedule, using the planner's own rule checker.
//   .venv/bin/python medvind/medvind.py read private/grundschema.xlsx > private/rotation.json
//   node medvind/report.mjs private/rotation.json "medvind_2026-10-21_141042.xlsx" > private/rule-check-report.md
// Rules and their values are the prototype's defaults (Settings › Rules): average hours (R3), daily rest (R1),
// hours without a break (R4) and break length.
import { readFileSync } from 'node:fs';
import * as m from '../web/schedule-core-demo.js';

const [file, name = file] = process.argv.slice(2);
const rot = JSON.parse(readFileSync(file, 'utf8')), s = m.seedState(), chk = m.checkRotation(rot, s, 'en');
const H = min => { const v = Math.round(min / 6) / 10; return (Number.isInteger(v) ? v : v.toFixed(1)) + ' h'; };
const HM = min => Math.floor(min / 60) + ' h ' + String(Math.round(min % 60)).padStart(2, '0') + ' min';
const t = x => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
const DAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const R = chk.rules, N = rot.weeks, out = [];
const shifts = rot.lines.flatMap(l => l.cells.flatMap((w, n) => w.map((x, d) => x && { line: l.label, n, d, x }).filter(Boolean)));
const unit = rot.lines.filter(l => !l.extra), flags = rot.flags || [], kinds = k => flags.filter(f => f.kind === k);

// Smallest rest per line (including from the last week back to the first) and where.
const rest = rot.lines.map(l => {
  const days = []; l.cells.forEach((w, n) => w.forEach((x, d) => { if (x) days.push({ n, d, x, at: (n * 7 + d) * 1440 }); }));
  let min = Infinity, at = null;
  days.forEach((a, i) => { const b = days[(i + 1) % days.length], gap = b.at + b.x.from + (i + 1 === days.length ? N * 7 * 1440 : 0) - (a.at + a.x.to); if (gap < min) { min = gap; at = [a, b]; } });
  return { label: l.label, min, at };
});
const tightest = Math.min(...rest.map(r => r.min)), atLimit = rest.filter(r => r.min === tightest);
const byRule = k => chk.lines.flatMap(l => l.issues.filter(x => x.rule === k).map(x => ({ ...x, line: l.label })));
const avgBad = byRule('avg'), restBad = byRule('rest'), brk = byRule('breaks'), two = brk.filter(x => x.need > 1);
const longDays = shifts.filter(x => x.x.to - x.x.from > 2 * chk.runMax + chk.breakMin);
const shapes = new Set(shifts.map(x => (x.x.raw || '').replace(/\s/g, '').replace(/\d/g, '9')).filter(Boolean));
const days = l => { const v = [...new Set(l.daysPerWeek)].sort((a, b) => a - b); return v.length > 1 ? v[0] + '–' + v[v.length - 1] : String(v[0]); };
const full = chk.lines.filter(l => Math.abs(l.avgWork - 2400) < 1), weeksOver = chk.lines.flatMap(l => l.work.map((w, n) => ({ l, w, n })).filter(x => x.w > ((R.avg || { h: 40 }).h + 2) * 60));
const mondays = unit.map(l => l.cells.map(w => w[0] && w[0].to)), allTo19 = mondays.every(ws => ws.every(x => x === 19 * 60));

out.push(`# Rule check of a real Medvind base schedule`, '');
out.push(`**Source:** ${name}, exported from Medvind. ${N}-week rotation, start week ${rot.start}, ${rot.lines.length} schedule lines (${unit.length} tied to units, ${rot.lines.length - unit.length} extra lines), weekdays only, one time range per day. The file contains no names.`, '');
out.push(`**Method:** the file was read by the prototype's Medvind import (\`medvind/medvind.py\`) and checked with its rule checker (\`checkRotation\` in \`web/schedule-core-demo.js\`), with the rule values from Settings: average working time at most ${R.avg ? R.avg.h : '–'} h per week over the whole rotation (${R.avg ? R.avg.code : '–'}), at least ${R.rest ? R.rest.h : '–'} h daily rest, also from the last week of the rotation back to the first (${R.rest ? R.rest.code : '–'}), and at most ${R.cont ? R.cont.h : '–'} h without a break (${R.cont ? R.cont.code : '–'}). A day in the export runs from start to end with breaks included; worked time is that less the unpaid breaks, ${chk.breakMin} min for each stretch over ${H(chk.runMax)} (one break on an ordinary day, two on days over ${H(2 * chk.runMax + chk.breakMin)}).`, '');

out.push(`## Summary`, '');
out.push(`| Rule | Result | Where |`, `|---|---|---|`);
out.push(`| Average working time over the ${N}-week rotation, at most ${R.avg.h} h/week | ${avgBad.length ? `**Fails** on ${avgBad.length} of ${rot.lines.length} lines` : `**Passes** on all ${rot.lines.length} lines`} | ${avgBad.length ? avgBad.map(x => x.line).join(', ') : `${full.length} lines at exactly ${R.avg.h} h 00 min worked (${H(full[0] ? full[0].avgSpan : 0)} with breaks)`} |`);
out.push(`| Daily rest at least ${R.rest.h} h | ${restBad.length ? `**Fails** ${restBad.length} times` : `**Passes** on all ${rot.lines.length} lines`} | ${restBad.length ? [...new Set(restBad.map(x => x.line))].join(', ') : `Tightest: exactly ${HM(tightest)} on ${atLimit.map(r => r.label).join(' and ')} (${DAY[atLimit[0].at[0].d]} ${t(atLimit[0].at[0].x.to)} to ${DAY[atLimit[0].at[1].d]} ${t(atLimit[0].at[1].x.from)}): no margin`} |`);
out.push(`| At most ${R.cont.h} h without a break | **Cannot be checked** from the export | ${brk.length} of ${shifts.length} shifts are over ${R.cont.h} h and need a break; ${two.length} need two (${longDays.every(x => x.d === 0) ? 'all of them Mondays' : 'long days'} of ${H(Math.min(...longDays.map(x => x.x.to - x.x.from)))}–${H(Math.max(...longDays.map(x => x.x.to - x.x.from)))}). The export has one range per day and no breaks. |`);
out.push('');

out.push(`## Reading the file`, '');
out.push(`- ${shifts.length} working days read out of ${rot.lines.length * N * 5} weekday cells (the rest are empty, i.e. days off on part-time and extra lines${kinds('unread').length ? ', or could not be read' : ''}).`);
out.push(`- Times were typed in ${shapes.size} different ways (${[...shapes].slice(0, 6).map(x => '\`' + x + '\`').join(', ')} …, where 9 is any digit). ${kinds('unread').length ? kinds('unread').length + ' cell(s) could not be read and are left out' : 'All cells could be read'}${kinds('guessed').length ? ', ' + kinds('guessed').length + ' only by guessing' : ''} (below).`);
const guessed = kinds('guessed'), gl = {};
guessed.forEach(f => { (gl[f.line + '|' + f.raw + '|' + f.day] = gl[f.line + '|' + f.raw + '|' + f.day] || []).push(f); });
for (const fs of Object.values(gl)) {
  const f = fs[0], line = rot.lines.find(l => l.label === f.line), weeks = fs.map(x => x.week);
  const others = [...new Set(line.cells.map((w, n) => !weeks.includes(n + 1) && w[f.day] ? t(w[f.day].from) + '–' + t(w[f.day].to) : null).filter(Boolean))];
  out.push(`- **Guessed:** ${fs.length === 1 ? 'cell' : 'cells'} ${fs.map(x => x.cell).join(', ')} (${f.line}, ${DAY[f.day]} in week ${weeks.join(', ')}): \`${f.raw}\` has no dash and was read as ${f.note.match(/\d\d:\d\d–\d\d:\d\d/)[0]}.${others.length ? ` The same line's other ${DAY[f.day]}s are ${others.join(', ')}, so it may be meant differently; check in Medvind.` : ''}`);
}
for (const f of kinds('unread')) out.push(`- **Not read:** cell ${f.cell} (${f.line}): \`${f.raw}\`.`);
for (const f of kinds('noUnit')) out.push(`- **No unit:** schedule line "${f.line}" has no unit number.`);
if (!kinds('unread').length) out.push(`- No cell had to be left out.`);
out.push('');

out.push(`## Per schedule line`, '');
out.push(`| Line | Days/week | Week, scheduled (with breaks) | Week, worked | Average scheduled | Average worked | Smallest rest | Shifts needing a break (two) |`, `|---|---|---|---|---|---|---|---|`);
chk.lines.forEach((l, i) => out.push(`| ${l.label} | ${days(l)} | ${H(Math.min(...l.span))}–${H(Math.max(...l.span))} | ${H(Math.min(...l.work))}–${H(Math.max(...l.work))} | ${H(l.avgSpan)} | ${H(l.avgWork)} | ${HM(rest[i].min)} | ${l.issues.filter(x => x.rule === 'breaks').length} (${l.issues.filter(x => x.rule === 'breaks' && x.need > 1).length}) |`));
out.push('');

out.push(`## Other observations`, '');
out.push(`- **Full-time lines average ${H(full[0] ? full[0].avgSpan : 0)} a week including breaks** (${full.length} lines), which is exactly ${R.avg.h} h worked once 30-minute unpaid breaks are taken out per ${H(chk.runMax)} stretch. So the schedule is built to ${R.avg.h} h on average; single weeks vary from ${H(Math.min(...full.flatMap(l => l.span)))} to ${H(Math.max(...full.flatMap(l => l.span)))} scheduled (${H(Math.min(...full.flatMap(l => l.work)))}–${H(Math.max(...full.flatMap(l => l.work)))} worked) and even out over the ${N} weeks.`);
const odd = chk.lines.filter(l => !l.extra && Math.abs(l.avgWork - 2400) >= 1);
if (odd.length) out.push(`- Lines not at ${R.avg.h} h: ${odd.map(l => `${l.label} (${H(l.avgWork)} worked, ${days(l)} days a week)`).join('; ')}. Probably part-time or a different contract; the export does not say.`);
if (weeksOver.length) out.push(`- ${weeksOver.length} single weeks are over ${R.avg.h + 2} h worked (up to ${H(Math.max(...weeksOver.map(x => x.w)))}). That is allowed when the average holds, but the prototype's flexible-week rule for planning week by week (R2: at most ${R.avg.h} h + 2 h, and the next week that much shorter) would flag them.`);
out.push(`- ${allTo19 ? `**Every unit line works until 19:00 on Mondays**, in every week` : `Most unit lines work until 19:00 on Mondays`} (probably a weekly meeting); the extra lines do not. That gives Monday shifts of up to ${H(Math.max(...shifts.filter(x => x.d === 0).map(x => x.x.to - x.x.from)))}, and it is what makes the daily rest Monday → Tuesday the tightest.`);
out.push(`- Weekly rest is not a problem: every line has Saturday and Sunday off.`);
out.push('');
out.push(`## Limitations`, '');
out.push(`- The export has no breaks, so the break rule can only be described, not checked, and worked time depends on the break assumption above.`);
out.push(`- The export has no contract hours per line, so "full-time" is inferred from the hours.`);
out.push(`- It is the base schedule only: deviations, absences, holidays and swaps made in the daily schedule are not in it.`);
out.push(`- The rule values are the prototype's defaults (${R.avg.h} h average, ${R.rest.h} h rest, ${R.cont.h} h without a break, ${chk.breakMin}-minute breaks). The collective agreement or local agreements may differ, for example on the averaging period or the rest exceptions.`);
process.stdout.write(out.join('\n') + '\n');
