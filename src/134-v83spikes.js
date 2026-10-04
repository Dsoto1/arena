/* =====================================================================
   134-V83SPIKES · v0.83 — the Floor Spikes medallion (Virgilante: "spears that come out from beneath the tile through small
   slots… about 6 spikes angling out and up with 1 straight up in the middle")
   =====================================================================
   • assets/rtok.webp cell 'spike' = the new medallion (tools/art/spikes83/make.py: his Spiders frame, plaque and scroll; his
     Water stands; an iron plate with seven slots and seven spears; "2 DMG" and "SPIKES" set from his own lettering).
   • It shows wherever spikes are named: the log (spikes rising, a spike wound), the tile line under the arena, and the Event
     Designer's Spike tool. The board keeps drawing the raised iron spikes (130-v82vis).
   ===================================================================== */
const SPIKE_TOK83=(sz=18)=>typeof rtokHTML==='function'?rtokHTML('spike',sz,'Floor spikes'):'';
/* the log: lines about the floor spikes carry the token */
{const base=log;log=function(h,cls){try{if(typeof h==='string'&&/floor spike/i.test(h)&&h.indexOf('class="rtok"')<0)h=SPIKE_TOK83(18)+' '+h}catch(e){}return base.call(this,h,cls)}}
/* the tile line under the arena */
{const base=describeTile;describeTile=function(t){let h=base.apply(this,arguments);try{if(typeof h==='string'&&h.indexOf('Floor spike (')>=0)h=h.replace('Floor spike (',SPIKE_TOK83(18)+' Floor spike (')}catch(e){}return h}}
/* the Event Designer's Spike tool wears the token */
{const tag=()=>{for(const b of document.querySelectorAll('[data-st="tool"][data-v="spike"]:not([data-tok83])')){b.dataset.tok83='1';b.insertAdjacentHTML('afterbegin',SPIKE_TOK83(18)+' ')}};
 new MutationObserver(()=>{if(document.querySelector('[data-st="tool"][data-v="spike"]:not([data-tok83])'))tag()}).observe(document.documentElement,{childList:true,subtree:true})}
