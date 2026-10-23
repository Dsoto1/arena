/* G6 the Medicus at the gate: every house's Medicus level (256 advLvM, 1 to start) takes 10 points off the editor's lethality for its condemned
   fighters (rules.death 80 -> 70 at level 1, 60 at 2, ...) */
{const base=leagueFate;leagueFate=function(glad,row,mgr){const w=W_();const lv=mgr&&typeof advLvM==='function'?advLvM(mgr,'medicus'):0;if(!(w&&w.rules&&lv>0))return base.apply(this,arguments);const d0=w.rules.death;w.rules.death=Math.max(0,(d0??80)-10*lv);try{return base.apply(this,arguments)}finally{w.rules.death=d0}}}
