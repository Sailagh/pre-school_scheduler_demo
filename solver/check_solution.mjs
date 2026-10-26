// Runs the planner's own rule checks on a solved schedule for the demo's starting data.
//   node solver/check_solution.mjs web/solved-schedule.json
import { readFileSync } from 'node:fs';
import { seedState, applySolution, checkWeek } from '../web/schedule-core-demo.js';

const sol = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const s = seedState();
applySolution(s, sol);
let total = 0;
for (const { week } of sol.weeks) {
  const warns = checkWeek(s, week);
  total += warns.length;
  console.log(`week ${week}: ${warns.length} warning(s)`);
  for (const w of warns) console.log(`  ${w.code || '-'} ${w.text}`);
}
process.exitCode = total ? 1 : 0;
