/* t12b — shard b of t12 (every event by CPU sims): runs t12.js with SHARDS.b; the three shards run in parallel in the suite */
process.argv[3]='shard:b';process.argv.length=4;
require('./t12.js');
