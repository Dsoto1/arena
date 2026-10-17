/* 387-v105task — v1.05 B68 + B69.
   · B68: the weekly checklist's empty-hand tasks (225 weekChecklist/arm94Todo) and the Match Week "Gear up" line name only fighters who
     FIGHT this week: a First-team fighter (350 team104 'A') or one entered in a bout this week. A reserve never gets "fights with bare hands".
     arm94Todo is wrapped (empty = filtered); the hurt-gear count is untouched.
   · B69: the building-project chip (.bp104c, 351) also shows on the banner of the page of the building it belongs to (Infirmary <- Valetudinarium,
     Training Yard <- Yard, Armory, Barracks <- Roster, Stables <- Match Week); Your ludus keeps its chip. One chip per banner, no duplicates.
   Kill switch: localStorage flavius_v105taskoff=1. Test tv105x. */
function task105On(){try{return localStorage.getItem('flavius_v105taskoff')!=='1'}catch(e){return true}}
function fights105(g,pm){try{const w=W_();const n=w&&w.night;if(n&&!n.bye&&n.bouts&&n.bouts.some(b=>(b.ents||[]).includes(g.id)))return true;return team104(g,pm)==='A'}catch(e){return true}}
{const base=arm94Todo;arm94Todo=function(pm){const T=base.apply(this,arguments);try{if(!task105On()||!T||!T.empty)return T;return {...T,empty:T.empty.filter(g=>fights105(g,pm))}}catch(e){console.error(e)}return T}}
const BP105_TAB={valet:'infirm',yard:'practice',stands:'practice',armory:'armory',barracks:'roster',stables:'night'};
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!task105On()||typeof h!=='string'||MGR.view||h.indexOf('class="roomhd')<0)return h;const pm=me();if(!pm||!pm.bp104)return h;
  const b=bp104Of(pm);if(!b||BP105_TAB[b.k]!==MGR.tab)return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;const hd=R.querySelector('#mgrPane .roomhd')||R.querySelector('.roomhd');
  if(!hd||R.querySelector('.bp104c'))return h;
  hd.insertAdjacentHTML('beforeend',`<span class="bp104c" title="${esc(_T('One building project at a time'))}">${bp104Line(pm,W_())}</span>`);
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}
