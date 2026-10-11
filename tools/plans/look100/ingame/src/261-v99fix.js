/* 261-v99fix — v0.99 fixes (Virgilante's notes).
   1) Event Designer with 8 players: a seat whose start tile was never placed no longer falls back onto a printed start tile another
      seat already uses (two gladiators on one tile); Test play seats every placed start (was capped at 4) — see 224 e94Test.
   2) 15-custom random-arena helper skips unplaced (null) start slots. */
{const base=customSeatStarts;customSeatStarts=function(config,evDef){const r=base.apply(this,arguments);
  try{const used=new Set(config.seats.filter(s=>s.start).map(s=>s.start[0]+','+s.start[1]));
    config.seats.forEach((s,i)=>{if(s.start)return;const d=STARTS[i];if(d&&!used.has(d[0]+','+d[1]))return;
      const f=STARTS.find(t=>!used.has(t[0]+','+t[1]));if(f){s.start=[...f];used.add(f[0]+','+f[1])}})}catch(e){console.error(e)}
  return r}}
