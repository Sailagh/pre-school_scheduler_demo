// Prints the solver problem for one week of the demo's starting data, as JSON, after applying the
// solutions of earlier weeks (so the flexible week can even out).
//   node solver/export_problem.mjs <week> [solved.json ...]
import { readFileSync } from 'node:fs';
import { seedState, solverProblem, applySolution } from '../web/schedule-core-demo.js';

const [week, ...files] = process.argv.slice(2);
const s = seedState();
for (const f of files) applySolution(s, JSON.parse(readFileSync(f, 'utf8')));
process.stdout.write(JSON.stringify(solverProblem(s, [+week])));
