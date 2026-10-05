/* t12c — shard c of t12 (every event by CPU sims): runs t12.js with SHARDS.c; the three shards run in parallel in the suite */
process.argv[3]='shard:c';process.argv.length=4;
require('./t12.js');
