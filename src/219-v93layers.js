/* 219-v93layers — v0.93 THE LAYER MANAGER (his yes 2026-10-07). Behaviour-neutral: same pixels, same order, same caches.
   draw() (07-ui) now hands its board work over as ONE ordered list of layers (drawLayers93([[name, paint], …])); this module
   replaces drawLayers93 with the manager. The order is the old paint order (painting order = what lies on top):
     10 rim        the board's raised rim
     20 stands     drawStands: 192 UNDER (cached) · the benches · 192 DECO (cached: walls, banners) · the crowd   [off: no stands]
     30 tiles      the sand tiles, ship decks, zone tints, out-of-zone shade
     40 walls      night91Sand: 192 TOP (cached: near walls, towers, podium) · 192 LIGHT (cached, source-atop) · SKY (cached,
                   destination-over: behind everything) · the 189 NIGHT grade + torches · the live flames
     50 floor      event marks (exits, capture, chariot lines, naumachia doors/water), zone ropes, tile names, start marks, tunnels, spikes
     60 decals     rubble + 194 WEAR (cached: sand wear, blood trickles, stains, settled rubble) · piles/corpses · blood · crew ·
                   floor tokens · the chest
     70 highlights move/attack highlights + the hover outline
     80 pieces     pillars, beasts, gladiators sorted back to front (see-through)
     90 overlays   aggro tethers, attack rings, the suggestion tile, tosses
    100 crowdtop   fan flags + shout bubbles over the board                                                     [off: no stands]
    110 flavius    Flavius's box
    120 fx         board effects + speech bubbles
    130 duel       the final duel's vignette + UI
   The spec's names map as: sky → walls/sky · under → stands/under · sand/tiles → tiles · decals → decals (+ wear) · pieces → pieces ·
   fx → fx · top walls → walls/top + stands/deco · night → walls (its uncached part) · marks → floor + highlights + overlays.
   Each layer: {name, order, cached, key(), off(), sub[]}. Top-level layers depend on the live state, so they paint every frame
   (key() null); the CACHED sub-layers keep their own cache (192's AR91.L with 208's padded reference frame, 194's WEAR91_C) —
   the manager only watches them: hit/miss per frame, paint and blit time, last key. off() = the layer's Off path: the stands
   setting for stands/crowdtop (their paint is a no-op then) or the DEBUG switch (LAYERS93.debugOff(name) — tests/dev only, no
   player UI; a cached sub-layer is then not blitted, 'wear' skips the whole 194 pass incl. its rubble).
   STATS: LAYERS93.stats[name] = {last, avg, max, n, ring[] (last LAYERS93.N frames, ms)}; cache[name] = {hits, misses, paintMs,
   blitMs, key}; LAYERS93.report() → rows for tests (tv92p prints them, tv93l checks them). orderErr counts a frame whose list
   ran out of order (must stay 0). Kill switch: localStorage flavius_layers93off=1 → the plain loop (07-ui's own drawLayers93). */
const LAYERS93={on:true,N:60,frames:0,orderErr:0,unknown:0,stats:{},cache:{},dbg:new Set(),lastFrameMs:0,
  defs:[['rim',10],['stands',20,['under','deco']],['tiles',30],['walls',40,['top','light','sky']],['floor',50],['decals',60,['wear']],['highlights',70],
    ['pieces',80],['overlays',90],['crowdtop',100],['flavius',110],['fx',120],['duel',130]],byName:{}};
try{LAYERS93.on=localStorage.getItem('flavius_layers93off')!=='1'}catch(e){}
{const noStands=new Set(['stands','crowdtop']);
  for(const [name,order,sub] of LAYERS93.defs){LAYERS93.byName[name]={name,order,cached:false,sub:sub||[],key:()=>null,
    off:()=>LAYERS93.dbg.has(name)||(noStands.has(name)&&!STANDS)}}
  for(const d of Object.values(LAYERS93.byName))for(const s of d.sub)LAYERS93.byName[s]={name:s,order:d.order,parent:d.name,cached:true,sub:[],
    key:()=>s==='wear'?(typeof WEAR91_C!=='undefined'?WEAR91_C.key:null):(typeof AR91!=='undefined'&&AR91.L[s]?AR91.L[s].key:null),
    off:()=>LAYERS93.dbg.has(s)}}
function layers93Rec(name,ms){const S9=LAYERS93.stats[name]||(LAYERS93.stats[name]={last:0,avg:0,max:0,n:0,ring:[]});S9.last=ms;S9.n++;S9.max=Math.max(S9.max,ms);
  S9.ring.push(ms);if(S9.ring.length>LAYERS93.N)S9.ring.shift();S9.avg=S9.ring.reduce((a,b)=>a+b,0)/S9.ring.length}
function layers93C(name){return LAYERS93.cache[name]||(LAYERS93.cache[name]={hits:0,misses:0,paintMs:0,blitMs:0,key:null})}
/* the manager: same order, same calls; a layer is skipped only when its off() says so */
{const base=drawLayers93;drawLayers93=function(layers){if(!LAYERS93.on)return base.apply(this,arguments);const F=LAYERS93;F.frames++;let prev=-1;const t00=performance.now();
  for(const l of layers){const name=l[0],d=F.byName[name];
    if(d){if(d.order<prev)F.orderErr++;prev=d.order;if(d.off()){layers93Rec(name,0);continue}}else F.unknown++;
    const t0=performance.now();l[1]();layers93Rec(name,performance.now()-t0)}
  F.lastFrameMs=performance.now()-t00}}
/* the cached sub-layers: 192/208's paint-or-reuse (ar91Layer) and blit (ar91Blit), 194's wear pass */
if(typeof ar91Layer==='function'){const base=ar91Layer;ar91Layer=function(name,key){if(!LAYERS93.on)return base.apply(this,arguments);const C=layers93C(name);
  const L0=typeof AR91!=='undefined'?AR91.L[name]:null;const hit=!!(L0&&L0.key===key);const t0=performance.now();const r=base.apply(this,arguments);
  if(hit)C.hits++;else{C.misses++;C.paintMs=performance.now()-t0}C.key=key;return r}}
if(typeof ar91Blit==='function'){const base=ar91Blit;ar91Blit=function(L){if(!LAYERS93.on||typeof AR91==='undefined')return base.apply(this,arguments);
  let name=null;for(const k in AR91.L)if(AR91.L[k]===L){name=k;break}
  if(name&&LAYERS93.dbg.has(name))return;const t0=performance.now();const r=base.apply(this,arguments);if(name)layers93C(name).blitMs=performance.now()-t0;return r}}
if(typeof wear91Layer==='function'){const base=wear91Layer;wear91Layer=function(){if(!LAYERS93.on)return base.apply(this,arguments);if(LAYERS93.dbg.has('wear'))return;
  const b0=WEAR91.bakes;const t0=performance.now();const r=base.apply(this,arguments);const C=layers93C('wear');if(WEAR91.bakes>b0){C.misses++;C.paintMs=WEAR91.lastBakeMs}else C.hits++;
  C.blitMs=performance.now()-t0;C.key=WEAR91_C.key;return r}}
/* dev/tests only: switch a layer (or a cached sub-layer) off, then redraw */
LAYERS93.debugOff=function(name,off=true){if(off)LAYERS93.dbg.add(name);else LAYERS93.dbg.delete(name);try{if(!HEADLESS)draw()}catch(e){}};
LAYERS93.reset=function(){LAYERS93.stats={};LAYERS93.cache={};LAYERS93.frames=0;LAYERS93.orderErr=0;LAYERS93.unknown=0};
LAYERS93.report=function(){const rows=[];for(const [name] of LAYERS93.defs){const d=LAYERS93.byName[name],s=LAYERS93.stats[name]||{};
    rows.push({name,order:d.order,avg:+(s.avg||0).toFixed(3),max:+(s.max||0).toFixed(3),n:s.n||0,off:d.off()});
    for(const sub of d.sub){const c=LAYERS93.cache[sub];if(c)rows.push({name:d.name+'/'+sub,order:d.order,cached:true,hits:c.hits,misses:c.misses,paintMs:+c.paintMs.toFixed(3),blitMs:+c.blitMs.toFixed(3)})}}
  return {on:LAYERS93.on,frames:LAYERS93.frames,orderErr:LAYERS93.orderErr,unknown:LAYERS93.unknown,lastFrameMs:+LAYERS93.lastFrameMs.toFixed(3),rows}};
