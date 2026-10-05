/* t12a — shard a of t12 (every event by CPU sims): runs t12.js with SHARDS.a; the three shards run in parallel in the suite */
process.argv[3]='shard:a';process.argv.length=4;
require('./t12.js');
