/* F6 tirones learn fast: a fighter rated under 55 in ANY house gets a second weekly +1 rating roll (17 endWeek: chance discipline/130, up to
   his potential), only when the week really ends (427 e112Ready) */
{const base=endWeek;endWeek=async function(){try{const w=W_();if(w&&!w.dead&&e112Ready(w))for(const m of w.mgrs){if(m.dead)continue;for(const g of rosterOf(m))if(effOvr(g)<55&&g.ovr<g.pot&&Math.random()<((m.p&&m.p.discipline)||50)/130)g.ovr++}}catch(e){}return base.apply(this,arguments)}}
