/* =====================================================================
   276-V100GEAR · v1.0 — THE 3D GEAR LOOK IN THE GAME (his look100 rounds 2–8 + his picks 2026-10-11)
   =====================================================================
   • The token modeller (222) now wears the approved look: code-built gear + SDF-SCULPTED helmets, cuirasses, belts and limb pieces
     (painted metal highlights, fine engraving dropped, Reinforced Chest ~55k / tassets = three hanging plates ~30k at the sculpt),
     sculpted belts hide the old harness belt, every figure's pieces MERGED into one skinned mesh with one outline (tools/art/rig92:
     sculpt.js · gear8.js · hold.js · game.js → assets/tok93.js by mkgame.js).
   • CONVERSION COST (his pick c): the printed pieces are sculpted ONCE at build time (tools/art/rig92/mkgear.js) and shipped as ONE
     pre-baked file, assets/gear100.js (a plain script: window.GEAR100), loaded on demand with three93.js + tok93.js — the modeller and
     the background converter never sculpt a printed piece on the device; only custom-coloured pieces and extras are built there.
   • WEAPONS from his cards in a closed fist: sword 15° out of the fist with a straight wrist (the elbow takes the angle); the scutum
     upright on the forearm (round 8, shield check: rig92 hold.js shieldCheck). The default 'stand' pose becomes the ARMED STAND for what
     the character holds (api.standFor) — in the converter (t93Make with pk 'stand'), the modeller's Stand preset and its Reset.
   • Card weapons by key: t93Weapon carries the weapon key (k) beside its family word.
   • Loincloth per class (his 3b): a character built on a printed class wears that class's cloth colour sampled from his minis (CLOTH100).
   • SIZE on the board: the figure path draws a 3D sheet at the minis' rule TW·MINI_BASE/(25.4·MINI_PXMM) (the base = 0.8 tile, whatever
     height a caller asks for); the figure itself stands +15% on its base (game.js scale 1.15).
   • T93_VER 2 (222): every stored token is remade ONCE (its hash changes once; the converter saves it once — idempotent).
   • v1.0 follow-up (his answers 2026-10-11): 1a the pieces stay the ~300 KB simplified bake; 2a the BODY pre-baked the same way
     (assets/body100.js beside gear100.js: body.js coreSteps — mesh, skin weights, face paint, crease ink, harness points — built once by
     mkgear.js and SIMPLIFIED with meshoptimizer to 60k triangles, paint/group edges locked, ~330 KB; look options stay runtime choices);
     3a the bow STRING (hold.js bowString: tip → draw hand → tip when drawn, rebuilt at every render; the bow turned so its limbs curve
     back toward the archer); 4a BEST FIT ON THE TILE (game.js fitTile: the base stays 0.8 tile, a figure reaching past its tile in any
     of the 8 facings is scaled down inside the render — sheet.tile reports it; spears and tridents stand upright in the armed stand).
   Globals: G100 (state: loading, ms, used), g100Load. Tests: tv100g (+ tv93k, tonl94). */
const G100={loading:null,ms:0,used:0,fail:''};
/* the loincloth per printed class (look100 round 7 3b: k-means of his minis' hip band, lifted to survive the toon ramp) */
const CLOTH100={soldier:'#7a1c14',royalty:'#2c3550',hero:'#5c6a2a',slave:'#9c7a46',veteranus:'#b1a391',amazonia:'#8a4a2a',venatore:'#5a3466',damnatio:'#4a3a2e'};
/* the pre-baked pieces, loaded once on demand (a plain script, like tok93.js: file://, the site and the standalone's data: URLs) */
/* v1.0 follow-up (his 2a): the BODY's slow core is pre-baked too — assets/body100.js (window.BODY100, ~330 KB, made by mkgear.js) loads
   beside gear100.js; a missing file only means the old on-device build (game.js falls back by itself) */
function g100Load(){if(window.GEAR100&&window.BODY100)return Promise.resolve(true);if(G100.loading)return G100.loading;const t0=performance.now();
  const one=(f,g)=>window[g]?Promise.resolve(true):t93Script(f).then(()=>!!window[g],e=>{G100.fail=String(e&&e.message||e);return false});
  G100.loading=Promise.all([one('gear100.js','GEAR100'),one('body100.js','BODY100')]).then(r=>{G100.ms=Math.round(performance.now()-t0);G100.loading=null;return r[0]});return G100.loading}
/* the armed stand: a request for the plain stand on an armed figure becomes the armed stand (the modeller's Stand preset, its Reset,
   the converter); api.presets' stand entry follows the gear so its picture and its button agree */
function g100Hook(api){if(!api||api._g100)return api;api._g100=1;if(typeof api.standFor!=='function')return api;
  const STAND=api.presets[0][2];let gk='',armed=STAND;const ap=api.apply;
  api.apply=function(a){a=a||{};if(a.gear){const k=JSON.stringify(a.gear);if(k!==gk){gk=k;try{armed=api.standFor(a.gear)}catch(e){console.error(e);armed=STAND}api.presets[0][2]=armed}}
    if(a.pose&&a.pose===STAND&&armed!==STAND)a=Object.assign({},a,{pose:armed});if(api.baked)G100.used++;return ap.call(this,a)};
  return api}
{const base=t93Load;t93Load=function(onStep){if(T93.api)return base.apply(this,arguments);const self=this,args=arguments;
  return g100Load().then(()=>base.apply(self,args)).then(api=>g100Hook(api))}}
/* the converter's / modeller's Save with the Stand preset: the armed stand for this character's own gear */
{const base=t93Make;t93Make=async function(c,pose,mode,pk){if(pk==='stand'){try{const api=await t93Load();if(api&&api.standFor)pose=api.standFor(t93Parts(c).gear)}catch(e){}}return base.call(this,c,pose,mode,pk)}}
/* the card weapon itself, beside its family word */
{const base=t93Weapon;t93Weapon=function(k){const r=base.apply(this,arguments);if(r&&k&&typeof k==='string')r.k=k;return r}}
/* the loincloth per printed class */
{const base=t93Parts;t93Parts=function(c){const r=base.apply(this,arguments);try{const m=/^cls:(\w+)$/.exec(String(c&&c.classRef||''));if(m&&CLOTH100[m[1]]&&r&&r.look)r.look.cloth=CLOTH100[m[1]]}catch(e){}return r}}
/* the minis' size rule on the board: base = MINI_BASE of a tile whatever height the caller passed (v0.99's ×0.88 stand-in, T99B.t93k
   in 272, is retired: the base is exactly 0.8 tile again and the figure itself stands +15% on it) */
if(typeof T99B!=='undefined')T99B.t93k=1;
{const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt){if(sp&&sp.t93&&typeof TW!=='undefined'&&TW>0)h=TW*1.3;return base.call(this,sp,x,y,h,opt)}}
