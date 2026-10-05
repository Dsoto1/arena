/* 165-v89seats — v0.89 (his ask 2026-10-05): Play Now deals the seats' classes at random — at page load, and again each time a fresh
   New event opens — so players who keep the default settings don't always get the slave in seat 1 (the bottom corner). Rules:
   • the eight printed classes, no two seats alike (more seats than classes → repeats are allowed);
   • only while the seats still hold the classes WE dealt: a seat the player changed (or a preset, a custom character) is left alone,
     and once any seat was changed by hand nothing is re-dealt this session;
   • UI randomness (Math.random), never the event's seeded dice. */
const SEATS89={dealt:null,off:false};
function seats89Deal(){try{
  if(SEATS89.off||!CFG||!Array.isArray(CFG.seats))return;
  const now=CFG.seats.map(s=>s&&s.cls);
  if(SEATS89.dealt&&now.some((c,i)=>c!==SEATS89.dealt[i])){SEATS89.off=true;return}
  if(CFG.seats.some(s=>s&&(s.char||s.ccl||s.custom||(s.cls&&!BASE_CLS.includes(s.cls)))))return;
  const pool=BASE_CLS.slice();let bag=[];
  SEATS89.dealt=CFG.seats.map(s=>{if(!bag.length)bag=pool.slice().sort(()=>Math.random()-.5);const c=bag.pop();if(s)s.cls=c;return c});
}catch(e){console.error(e)}}
seats89Deal();
{const base=openSetup;openSetup=async function(fresh){if(fresh)seats89Deal();return base.apply(this,arguments)}}
