/* F10 leaner rival backers: a rival house's weekly stipend is 12 + 0.3 x fame instead of 22 + 0.6 x fame (23 aiLanistaWeek, v0.29);
   applied as a deduction of the difference after the week (fame read before it); 427's floor top-up still runs. */
{const base=aiLanistaWeek;aiLanistaWeek=function(){const w=W_();const f0=new Map();try{for(const m of w.mgrs)if(!m.isPlayer&&!m.dead)f0.set(m,m.fame||0)}catch(e){}
  const r=base.apply(this,arguments);try{for(const [m,f] of f0){if(m.dead||m.sica)continue;m.coin-=Math.round(22+f*0.6)-Math.round(12+f*0.3)}}catch(e){}return r}}
