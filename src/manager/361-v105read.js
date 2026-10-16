/* 361-v105read — v1.05 workstream B, "Your read" (v104 NOTES N3; his answers s1a s2a s3a r1a r2a):
   • yourRead105(g) — the ONE API for what you know of a fighter's strength: null (no read) or
       {est, lo, hi, rough:bool, src:'sand'|'dossier'|'watched'}
     est = the rating the betting table / odds use for your side (estOvr(g).v is wrapped to return it), lo..hi = the band you would quote,
     rough = true unless the Recruiter is high (level 4+, s3a: exact). src = where it came from: 'sand' (walked the sand at the arena gate),
     'dossier' (your recruiting scouting, your own fighters), 'watched' (saw him fight live). Deterministic per (world, week, fighter): the
     rough offset is hashStr(world id|week|fighter id) — no seeded-RNG call, nothing random in the UI. Builder A's Match Week (360) calls it.
   • s1a: the betting table's "Your scouts" column is now "Your read" (17-manager; tooltip names the three sources); filled from yourRead105.
   • s2a: wsand90Walk (185) also reads EVERY fighter on this week's card (its own effects stay). Fighters you already scouted keep that read (dossier).
   • r1a: a gate read = ONE ROUGH LOOK in Recruiting for each free agent on the card: this week's number goes into g.sc98.l104 (351's looks, which
     count toward the "two earlier looks" before a trial bout once the week is over); g.scout is never raised, so it never goes past rough.
   • r2a: mgrAfterWatch (17) — everyone in a bout you watched live to the end gets the same rough look (src 'watched'), free agents' look included.
   Storage: w.read105[fighterId] = {wk, src}. A read ages out after READ105.keep weeks (3 more weeks): ratings drift with training and injuries, and
   the noise is re-drawn each week, so an old read would only mislead; entries older than that are pruned on every write. Old worlds simply have
   no w.read105 (created on first write), so no SAVE_MIGRATIONS entry is needed. Kill switch: localStorage flavius_v105boff=1 (then yourRead105
   answers only the old rule: your own fighters and recruiting-scouted ones, and nothing is recorded). */
const READ105={keep:3,high:4,on:(()=>{try{return localStorage.getItem('flavius_v105boff')!=='1'}catch(e){return true}})()};
function read105Live(){try{const w=typeof W_==='function'?W_():null;return READ105.on&&w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
function read105Band(w){let lv=1;try{lv=typeof adv98Lv==='function'?adv98Lv(w,'recruiter'):1}catch(e){}return lv>=READ105.high?0:lv>=3?2:3}
function read105Entry(w,g){const R=w&&w.read105;const e=R&&g?R[g.id]:null;return e&&w.week-e.wk<=READ105.keep?e:null}
function yourRead105(g){
  if(!g)return null;let w=null,m=null;try{w=W_();m=me()}catch(e){}if(!w)return null;
  const mine=!!(g.contract&&m&&g.contract.mgr===m.id);const ov=effOvr(g);
  if(!g.contract&&typeof rec98Ovr==='function'){try{const o=rec98Ovr(g);if(o.p>=1){const bd=read105Band(w);return {est:o.v,lo:o.v-bd,hi:o.v+bd,rough:bd>0,src:'dossier'}}}catch(e){}} /* a free agent you have stat looks at: 249's own estimate */
  if(mine||(g.scout||0)>=2)return {est:ov,lo:ov,hi:ov,rough:false,src:'dossier'}; /* your own fighters and fully scouted ones: exact */
  const e=read105Live()?read105Entry(w,g):null;
  if(!e&&(g.scout||0)<1)return null;
  const src=e?e.src:'dossier';const band=read105Band(w);
  if(!band)return {est:ov,lo:ov,hi:ov,rough:false,src};
  const off=(hashStr(String(w.id)+'|'+w.week+'|'+g.id)%(2*band+1))-band;const est=ov+off;
  return {est,lo:est-band,hi:est+band,rough:true,src}}
/* what a source is called in the table */
function read105Name(src){return src==='sand'?_T('walked the sand'):src==='watched'?_T('watched him fight'):_T('your recruiting dossier')}
function read105Title(g){const q=yourRead105(g);if(!q)return '';return (q.rough?_T('A rough read')+' '+q.lo+'–'+q.hi:_T('Read')+' '+q.est)+' · '+read105Name(q.src)}
/* one rough look: the read itself + the Recruiting look for a free agent (never past rough) */
function read105Look(w,g,src){if(!w||!g||!g.alive)return false;const R=w.read105=w.read105||{};const old=R[g.id];
  if(!old||old.wk<w.week||src!=='sand')R[g.id]={wk:w.week,src}; /* a sand read does not overwrite a fresher watched one */
  if(!g.contract&&typeof rec98K==='function'){const K=rec98K(g);if(K){K.l104=K.l104||[];if(K.l104[K.l104.length-1]!==w.week){K.l104.push(w.week);if(K.l104.length>40)K.l104=K.l104.slice(-40)}}}
  return true}
function read105Prune(w){const R=w&&w.read105;if(!R)return;for(const id of Object.keys(R))if(w.week-R[id].wk>READ105.keep)delete R[id]}
function read105Card(w,src){if(!w||!w.night||!w.night.bouts)return 0;let n=0;for(const b of w.night.bouts)for(const id of b.ents||[]){const g=gById(id);if(g&&read105Look(w,g,src))n++}read105Prune(w);return n}
/* the table's estimate for a fighter you only have a read of (feeds boutProbs 'mine', the Recruiting cards) */
{const base=estOvr;estOvr=function(glad){const r=base.apply(this,arguments);try{if(!READ105.on||!glad||(glad.contract&&glad.contract.mgr===me().id))return r;
  const q=yourRead105(glad);if(!q)return r;if(!glad.contract&&typeof rec98Ovr==='function'&&rec98Ovr(glad).p>=1)return r;return {v:q.est,txt:q.rough?`${q.lo}–${q.hi}`:String(q.est)}}catch(e){return r}}}
/* s2a + r1a: walking the sand reads the whole card */
if(typeof wsand90Walk==='function'){const base=wsand90Walk;wsand90Walk=function(){const r=base.apply(this,arguments);
  try{const w=read105Live();if(r&&w){const n=read105Card(w,'sand');if(n){if(typeof tnews==='function')tnews(_T`🗺 Your doctores read ${n} fighters on the card — the Your read column fills in.`);saveWorld()}}}catch(e){console.error(e)}return r}}
/* r2a: a bout watched live to the end */
{const base=mgrAfterWatch;mgrAfterWatch=async function(res,ctx){const r=await base.apply(this,arguments);
  try{const w=read105Live();if(w&&res&&res.rows&&ctx&&w.week===ctx.week){for(const x of res.rows){const g=gById(x.mgrId);if(g)read105Look(w,g,'watched')}read105Prune(w);saveWorld(true)}}catch(e){console.error(e)}return r}}
