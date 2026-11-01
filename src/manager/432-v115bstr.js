/* 432-v115bstr — v1.15b "Stronger small houses" (his 1a 2a 3a, tools/plans/v115b/NOTES.md; study tools/plans/strength115/REPORT.md F13 =
   sim patches F1under + F3patron). Manager only. Kill switch localStorage flavius_v115bstroff=1 restores v1.15a's behaviour exactly.
   F1 A TIRONES' UNDERCARD: 17 TIERS.under.hi 62 → 54 (the 1★ line). REPLACES the early-league 62. Every reader takes T.hi live, so this one
      value moves them all: 17 makeNight (rival entries T.lo−4…T.hi+2 → ≤ 56), 17 fillNight (free-agent fillers ≤ 57; new fillers stay 40),
      the player's entry checks (296 any100Why / 319 r101WhyNot / 17 nightHTML: T.hi+6 → ≤ 60), the replacements of 141/183/229/319
      (T.hi+3), 229's depth-chart slot label ("≤ " + T.hi → "≤ 54"), 145's road-deal tier pick and 22's poster billing (T.hi+6).
      The Feature (56–77) is unchanged, so a rival's 55–62 fighter goes up a tier.
   F3 PATRON PARITY: the player's in-season patron pays the rivals' formula (23 aiLanistaWeek) 22 + 0.6 × fame a week. REPLACES 427's P1
      10 + 0.3 × fame (v1.12). 427 still pays it (same week, same ledger 'patron' row and "💼 Your patron: +N coin" line, both read
      E112.pat through e112Amt), so only the two numbers change. 427's own kill switch flavius_v112econoff still stops the stipend.
   Set at load, before any world is built. No save shape change: a save keeps only bouts' tier keys (never lo/hi) and no stipend amount;
   entries already on a loaded world's card stay, the next card is drawn with the new band. Never the dice (no rand()). Test tv115b.
   FIX (beta report on v1.15b; the bug is older than v1.15b): 229 st95Fill put each starter into his slot's bout WITHOUT the rating check, so a
      73-rated starter sat in the Undercard (manual entry takes T.lo-6...T.hi+6 = up to 60). Now a starter outside his bout's band (the 319
      r101WhyNot test; special 'spc100' bouts excepted) is not auto-entered; st95Ensure's slot choice and the rivals are untouched. A card
      already drawn and not yet started is cleaned once: an out-of-band AUTO-entered fighter comes off an unfought bout (st95Out puts a
      filler back); manual entries stay. Own switch flavius_v115bfilloff=1 restores the old fill; it works with flavius_v115bstroff on or off. */
const V115B={off:(()=>{try{return localStorage.getItem('flavius_v115bstroff')==='1'}catch(e){return false}})(),underHi:54,pat:{base:22,fame:0.6}};
window.V115B=V115B;
if(!V115B.off){
  try{if(typeof TIERS!=='undefined'&&TIERS.under)TIERS.under.hi=V115B.underHi}catch(e){console.error(e)}
  try{if(typeof E112!=='undefined'&&E112.pat){E112.pat.base=V115B.pat.base;E112.pat.fame=V115B.pat.fame}}catch(e){console.error(e)}
}

/* 432 fix - the starters' auto-fill respects the bout's rating band (own switch, independent of V115B.off) */
const V115BF={off:(()=>{try{return localStorage.getItem('flavius_v115bfilloff')==='1'}catch(e){return false}})()};
window.V115BF=V115BF;
function v115bOut(g,b){const T=b&&TIERS[b.tier];if(!T||b.tier==='spc100')return false;const o=effOvr(g);return o<T.lo-6||o>T.hi+6}
{const base=st95Fill;st95Fill=function(w,pm){const hold=[];
  try{if(!V115BF.off&&w&&pm&&w.night&&w.night.bouts)for(const g of st95Pool(w,pm))if(g.slot95&&v115bOut(g,w.night.bouts[g.slot95-1])){hold.push([g,g.slot95,g.tm104]);g.slot95=0;delete g.tm104 /* 350's reserve cover would else put him in as a 'reserve' */}}catch(e){console.error(e)}
  try{return base.apply(this,arguments)}finally{for(const [g,s,t] of hold){g.slot95=s;if(t!==undefined)g.tm104=t}}}}
/* a card already drawn (a saved world): an auto-entered fighter outside his bout's band comes off it, only while no bout is done */
function v115bClean(){try{if(V115BF.off)return 0;const w=W_(),pm=me(),n=w&&w.night;if(!w||!pm||w.dead||w.tutorial||!n||n.bye||!n.bouts||!(n.auto95||[]).length)return 0;
  if(n.bouts.some(b=>b.done)||(typeof S!=='undefined'&&S&&!S.over&&(S.mgrCtx||S.exhibCtx||S.pen76)))return 0;let k=0;
  for(const b of n.bouts)for(const id of b.ents.slice()){if(!n.auto95.includes(id))continue;const g=gById(id);if(g&&g.contract&&g.contract.mgr===pm.id&&v115bOut(g,b)){st95Out(b,id);n.auto95=n.auto95.filter(x=>x!==id);k++}}
  if(k)saveWorld();return k}catch(e){console.error(e);return 0}}
{const base=mgrHTML;mgrHTML=function(){v115bClean();return base.apply(this,arguments)}}
