// Prints the solver problem for the demo's starting data, weeks 41-52, as JSON.
// Used to build web/solved-schedule.json (see README).
import { seedState, solverProblem, W0, W1 } from '../web/schedule-core-demo.js';

const weeks = [];
for (let w = W0; w <= W1; w++) weeks.push(w);
process.stdout.write(JSON.stringify(solverProblem(seedState(), weeks)));
