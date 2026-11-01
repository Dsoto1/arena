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
   entries already on a loaded world's card stay, the next card is drawn with the new band. Never the dice (no rand()). Test tv115b. */
const V115B={off:(()=>{try{return localStorage.getItem('flavius_v115bstroff')==='1'}catch(e){return false}})(),underHi:54,pat:{base:22,fame:0.6}};
window.V115B=V115B;
if(!V115B.off){
  try{if(typeof TIERS!=='undefined'&&TIERS.under)TIERS.under.hi=V115B.underHi}catch(e){console.error(e)}
  try{if(typeof E112!=='undefined'&&E112.pat){E112.pat.base=V115B.pat.base;E112.pat.fame=V115B.pat.fame}}catch(e){console.error(e)}
}
