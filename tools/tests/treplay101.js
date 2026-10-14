/* v1.01 REPLAY HARNESS (tools/replay, Phase 0 of tools/plans/layers100/PLAN.md): every golden recording in tools/replay/golden/ replays on
   this build to the SAME game — end hash, the dice stream (RNG.s), every log line, each seat's result — and the 2-seat online (mock
   lockstep) stream meets the same hash at every input. A deliberate rule change re-records: node tools/replay/record.js --update. */
const path=require('path');const {run}=require('../replay/check.js');
run(path.resolve(process.argv[2]||'flavius-arena.html')).then(bad=>{console.log('ERRS '+JSON.stringify(bad?[bad+' recording(s) no longer replay to the same game (see FAIL lines)']:[]));process.exitCode=bad?1:0}).catch(e=>{console.log('ERRS '+JSON.stringify([String(e)]));process.exitCode=1});
