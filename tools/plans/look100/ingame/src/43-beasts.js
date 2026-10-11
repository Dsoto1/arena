/* =====================================================================
   43-BEASTS · THE BEAST DESIGNER'S ROUND TOKENS, THE STOCK BEASTS AND THE MYTH STARTERS (v0.46)
   =====================================================================
   • Every custom beast gets a ROUND TOKEN of its own, sculpted inside the same bronze ring as the printed
     NPC tokens (assets/rtok.webp). The ring is the template: pick its metal, the ground color, keep or drop
     the letter, start from a printed token if you like, then sculpt on top with the shared sculptor (kind
     'rt'). The token is used wherever a beast's round token is shown — the Menagerie, the NPC tracker,
     hover cards, the event designer's board, the studio lists — and on the board in cylinder style.
   • "Guards a zone" asks how big the zone is and where in it the beast starts; the event designer then
     shades that zone as soon as the beast is placed, and the event uses it.
   • Under "Your beasts" the stock beasts are listed (locked, copy only), and sixteen creatures of
     Greek and Roman myth wait as starters.
   ===================================================================== */
const RT_RINGS={bronze:[_T('Bronze'),'#3a2410','#c9964a','#7a5226','#f0cf7d'],gold:[_T('Gold'),'#3a2a08','#e6b93a','#8a6a14','#fff0b0'],silver:[_T('Silver'),'#24282c','#c9d0d6','#6a7680','#ffffff'],iron:[_T('Iron'),'#15171a','#6a6f76','#34383e','#b8bec6'],blood:[_T('Blood bronze'),'#2a0c08','#a3281f','#5a140e','#f0a080']};
let RT_UID=0;
function rtokBlank(n){return {ring:'bronze',bg:(n&&n.color)||'#5f8a3a',glyph:true,glyphC:'#fff3d8',base:'',layers:[],baked:[]}}
function rtokSpecOf(n){return n&&n.rtok?n.rtok:rtokBlank(n)}
/* the token, as SVG, in a 100×100 space: the printed ring (or a printed token as the base), then the sculpted shapes
   clipped to the inner disc, then the letter */
function rtokSVG(sp,n,opt={}){sp=sp||rtokBlank(n);const R=RT_RINGS[sp.ring]||RT_RINGS.bronze;const u='rt'+(++RT_UID);const g=String((sp.glyphT||(n&&n.glyph)||(n&&n.name)||'?')[0]||'?').toUpperCase();
  let base='';
  if(sp.base&&typeof RTOK_NAMES!=='undefined'&&RTOK_NAMES.includes(sp.base)){if(!opt.noBase){const i=RTOK_NAMES.indexOf(sp.base),c=i%RTOK_COLS,r=Math.floor(i/RTOK_COLS);
      base=`<svg x="0" y="0" width="100" height="100" viewBox="${c*128} ${r*128} 128 128"><image href="${assetURL('rtok.webp')}" width="${RTOK_COLS*128}" height="${RTOK_ROWS*128}"/></svg>`}}
  else{base=`<defs><radialGradient id="${u}r" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${R[4]}"/><stop offset=".45" stop-color="${R[2]}"/><stop offset="1" stop-color="${R[3]}"/></radialGradient><radialGradient id="${u}d" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${sp.bg}" stop-opacity="1"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>
    <circle cx="50" cy="50" r="49.5" fill="${R[1]}"/><circle cx="50" cy="50" r="47" fill="url(#${u}r)"/>
    ${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<circle cx="${(50+Math.cos(a)*42.5).toFixed(2)}" cy="${(50+Math.sin(a)*42.5).toFixed(2)}" r="1.7" fill="${R[4]}" stroke="${R[3]}" stroke-width=".6"/>`}).join('')}
    <circle cx="50" cy="50" r="38.6" fill="${R[1]}"/><circle cx="50" cy="50" r="37" fill="${sp.bg}"/><circle cx="50" cy="50" r="37" fill="url(#${u}d)" opacity=".55"/>`}
  const shapes=typeof scbLayersSVG==='function'?scbLayersSVG(sp,''):'';
  const glyph=sp.glyph?`<text x="50" y="52" text-anchor="middle" dominant-baseline="middle" font-family="Marcellus SC, Georgia, serif" font-weight="700" font-size="40" fill="${sp.glyphC||'#fff3d8'}" stroke="rgba(0,0,0,.45)" stroke-width="1.2" paint-order="stroke">${esc(g)}</text>`:'';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${opt.size?`width="${opt.size}" height="${opt.size}"`:''}>${base}<clipPath id="${u}c"><circle cx="50" cy="50" r="${sp.base?40:37}"/></clipPath><g clip-path="url(#${u}c)">${sp.base?'':glyph}${typeof rtokFaceSVG==='function'?rtokFaceSVG(sp,n):''}${shapes}</g>${sp.base?'':`<circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,240,200,.25)" stroke-width=".8"/>`}</svg>`}
function rtokSvgHTML(sp,n,size=28,title=''){return `<span class="rtok rtoksvg" role="img" aria-label="${esc(title||(n&&n.name)||'token')}"${title?` title="${esc(title)}"`:''} style="width:${size}px;height:${size}px">${rtokSVG(sp,n)}</span>`}
/* a custom beast (the studio record) behind a board or list beast */
function cnRecord(x){if(!x)return null;const T=NPCT[x.t];if(!T||!T.custom)return null;return (CUSTOM.npcs||[]).find(c=>c.id===T.cid)||null}
function cnTokHTML(c,size=28){return rtokSvgHTML(rtokSpecOf(c),c,size,c&&c.name)}
/* the round token wherever the tracker, menagerie and hover cards ask for one */
{const _npcTok=npcTokHTML;npcTokHTML=function(n,size=28){const c=cnRecord(n);if(c)return cnTokHTML({...c,name:n.name||c.name},size);return _npcTok(n,size)}}

/* ---------- canvas: cylinder-style pieces wear the token on their top ---------- */
const RT_CANVAS={};let RT_SPRITE=null;
function rtokSprite(){if(RT_SPRITE)return RT_SPRITE.complete&&RT_SPRITE.naturalWidth?RT_SPRITE:null;RT_SPRITE=new Image();RT_SPRITE.onload=()=>{for(const k in RT_CANVAS)delete RT_CANVAS[k];try{draw()}catch(e){}};RT_SPRITE.src=assetURL('rtok.webp');return null}
function rtokCanvas(c){if(HEADLESS||!c)return null;const sp=rtokSpecOf(c);const key=c.id+'|'+JSON.stringify(sp);const hit=RT_CANVAS[key];if(hit)return hit.ready?hit.cv:null;
  const cv=document.createElement('canvas');cv.width=cv.height=128;const rec={cv,ready:false};RT_CANVAS[key]=rec;
  const im=new Image();im.onload=()=>{const x=cv.getContext('2d');if(sp.base){const spr=rtokSprite();const i=RTOK_NAMES.indexOf(sp.base);if(spr&&i>=0)x.drawImage(spr,(i%RTOK_COLS)*128,Math.floor(i/RTOK_COLS)*128,128,128,0,0,128,128);else if(!spr){delete RT_CANVAS[key];return}}
    x.drawImage(im,0,0,128,128);rec.ready=true;try{draw()}catch(e){}};
  im.src='data:image/svg+xml,'+encodeURIComponent(rtokSVG(sp,c,{noBase:true}));return null}
{const _dn=drawNPC;drawNPC=function(n){_dn(n);try{const T=NPCT[n.t];if(!T||!T.custom||wantFigure(true))return;const c=cnRecord(n);const cv=rtokCanvas(c);if(!cv)return;
  const m=center(n.r,n.c);const big=T.hp>=12;const rx=TW*(big?0.27:0.22),h=TW*(big?0.34:0.24);ctx.save();ctx.beginPath();ctx.ellipse(m.x,m.y-h,rx,rx*0.5,0,0,Math.PI*2);ctx.clip();ctx.drawImage(cv,m.x-rx,m.y-h-rx*0.5,rx*2,rx);ctx.restore()}catch(e){}}}

/* ---------- the zone a guarding beast keeps ---------- */
const RT_AT=[['c',_T('In the middle')],['n',_T('Top edge')],['s',_T('Bottom edge')],['w',_T('Left edge')],['e',_T('Right edge')],['nw',_T('Top-left corner')],['ne',_T('Top-right corner')],['sw',_T('Bottom-left corner')],['se',_T('Bottom-right corner')]];
function guardZone(r,c,rad,at){rad=Math.max(1,Math.min(3,+rad||1));at=at||'c';const d=2*rad;
  const rows=at.includes('n')?[r,r+d]:at.includes('s')?[r-d,r]:[r-rad,r+rad];const cols=at.includes('w')?[c,c+d]:at.includes('e')?[c-d,c]:[c-rad,c+rad];
  return [Math.max(0,rows[0]),Math.min(N-1,rows[1]),Math.max(0,cols[0]),Math.min(N-1,cols[1])]}
{const _za=zoneAround;zoneAround=function(t,r,c,name){if(String(t).startsWith('cn_')){const cn=(CUSTOM.npcs||[]).find(x=>'cn_'+x.id===t);if(cn&&cn.zone)return guardZone(r,c,cn.zone.rad,cn.zone.at)}return _za(t,r,c,name)}}
/* the event designer shades every guarded zone as soon as its beast is placed */
{const _eb=edBoardHTML;edBoardHTML=function(){const L=ST.draft&&ST.draft.layout;const Z=[];
  if(L)for(const n of L.npcs||[]){const T=NPCT[n.t];if(!T)continue;const beh=n.beh||(T.scan?'hunt':T.huntCF?'cf':'zone');if(beh!=='zone')continue;try{Z.push({z:zoneAround(n.t,n.r,n.c,n.name),col:T.col,nm:n.name})}catch(e){}}
  ST._edZones=Z;try{return _eb()}finally{ST._edZones=null}}}
{const _ec=edCell;edCell=function(r,c){let h=_ec(r,c);const Z=(ST._edZones||[]).filter(q=>r>=q.z[0]&&r<=q.z[1]&&c>=q.z[2]&&c<=q.z[3]);
  if(Z.length){const q=Z[0];const edge=[r===q.z[0]?'t':'',r===q.z[1]?'b':'',c===q.z[2]?'l':'',c===q.z[3]?'r':''].join('');
    h=h.replace('class="edcell',_T`class="edcell zn ${edge.split('').map(x=>'zn'+x).join(' ')}`).replace('style="',`style="--zc:${q.col};`).replace(/title="([^"]*)"/,(m,t)=>_T`title="${t} · ${esc(Z.map(x=>x.nm).join(', '))}’s zone"`)}
  const L=ST.draft&&ST.draft.layout;const n=L&&L.npcs.find(x=>x.r===r&&x.c===c);const cn=n&&cnRecord(n);
  if(cn)h=h.replace(/<span class="ic"><span style="display:inline-grid[^>]*>[^<]*<\/span><\/span>/,`<span class="ic">${cnTokHTML(cn,22)}</span>`);
  return h}}

/* ---------- the designer ---------- */
if(typeof SCB_KIND!=='undefined')SCB_KIND.rt={round:[50,50,37],obj:()=>ST.tab==='npcs'&&ST.draft?(ST.draft.rtok||(ST.draft.rtok=rtokBlank(ST.draft))):null,vb:[100,100],add:{x:50,y:50},
  el:()=>document.querySelector('#rtPrev svg'),refresh:()=>rtPrevRefresh()};
function rtPrevRefresh(){const pv=document.getElementById('rtPrev');if(pv&&ST.draft)pv.innerHTML=rtokSVG(ST.draft.rtok||rtokBlank(ST.draft),ST.draft)}
function rtZoneMini(z){const rad=+z.rad||1,at=z.at||'c';const s=2*rad+1;const [r0,,c0]=guardZone(10,10,rad,at);const cells=[];for(let r=0;r<s;r++)for(let c=0;c<s;c++){const me=r0+r===10&&c0+c===10;cells.push(`<i class="${me?'me':''}"></i>`)}
  return `<span class="zmini" style="grid-template-columns:repeat(${s},1fr)" title="${_T`The zone, with the beast's starting tile`}">${cells.join('')}</span>`}
{const _ne=npcEditorHTML;npcEditorHTML=function(){const n=ST.draft;n.rtok=n.rtok||rtokBlank(n);const sp=n.rtok;let h=_ne();
  h=h.replace(/<div id="stNpcPrev"[^>]*>[^<]*<\/div>/,`<div id="rtPrev" class="rtprev" data-scbprev="rt" title="${_T`The beast's round token — drag a selected shape here`}">${rtokSVG(sp,n)}</div><div class="rc-sub" style="font:600 10px var(--mono);letter-spacing:.1em">${_T`ROUND TOKEN`}</div>`);
  h=h.replace(new RegExp('<label>'+RXL('Token letter')+'[\\s\\S]*?<\\/label><label>'+RXL('Color')+'<input[^>]*><\\/label>'),`<label>${_T`Token letter${fTxt('glyph',n.glyph,'maxlength="1"')}`}</label><label>${_T`Color`}<input type="color" class="tin" data-f="color" value="${esc(n.color)}" style="height:34px;padding:2px"></label>`);
  const zone=n.beh==='zone'||!n.beh?(()=>{n.zone=n.zone||{rad:2,at:'c'};return `<div class="card2 zonecard">${_T`<b>🛡 The zone it guards</b>`} <span class="rc-sub">${_T`it stays inside, attacking anyone who steps in — placed in the Event Designer, the zone shows on the board`}</span>
      <div class="formgrid" style="margin-top:6px;align-items:center"><label>${_T`How big${fSel('zone.rad',[['1',_T('3 × 3 — one tile around it')],['2',_T('5 × 5 — two tiles around it')],['3',_T('7 × 7 — three tiles around it')]],String(n.zone.rad))}`}</label><label>${_T`Where it starts in the zone${fSel('zone.at',RT_AT,n.zone.at)}`}</label>${rtZoneMini(n.zone)}</div></div>`})():'';
  const tokCard=`<div class="card2 rtcard">${_T`<b>🪙 The round token</b>`} <span class="rc-sub">${_T`the NPC token in the printed game's bronze ring — used in the Menagerie, the NPC tracker, hover cards, the event designer and on the board in cylinder style`}</span>
      <div class="formgrid tkgrid" style="margin-top:6px"><label>${_T`Ring${fSel('rtok.ring',Object.entries(RT_RINGS).map(([k,v])=>[k,v[0]]),sp.ring)}`}</label><label>${_T`Ground`}<input type="color" data-f="rtok.bg" value="${esc(sp.bg||'#5f8a3a')}" style="width:44px;height:30px;border:0;background:none;padding:0"></label>
      <label>${_T`Start from a printed token${fSel('rtok.base',[['',_T('— the plain ring —')],...['leo','leaena','ursa','brutum','valencia','moechus','glykon','arenosus','tholo','commodus','zora','boar','croc'].map(k=>[k,k[0].toUpperCase()+k.slice(1)])],sp.base||'')}`}</label>
      <label>${_T`Letter color`}<input type="color" data-f="rtok.glyphC" value="${esc(sp.glyphC||'#fff3d8')}" style="width:44px;height:30px;border:0;background:none;padding:0"></label></div>
      <div class="chkgrid" style="margin-top:4px">${fChk('rtok.glyph',sp.glyph,_T('Show the token letter'))}</div>${scbBenchHTML('rt')}</div>`;
  h=h.replace('<div class="chkgrid" style="margin-top:8px">',zone+'<div class="chkgrid" style="margin-top:8px">');
  h=h.replace('<p class="hint">'+TX('Beasts attack with 2 hit dice against gladiators; each hit deals their attack value. Place them on the board in the Event Designer.'),m0=>tokCard+m0);
  return h}}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&/^rtok\./.test(t.dataset.f||'')&&ST.draft){if(t.type==='color')setPath(ST.draft,t.dataset.f,t.value);rtPrevRefresh()}});

function studioRedraw(){const box=$('#mBody'),r=$('#studio');if(!r||!box)return;const sc=box.scrollTop;r.innerHTML=studioHTML();box.scrollTop=sc}
/* ---------- stock beasts (locked) and the myth starters ---------- */
const L9=(t,x,y,w,h,c,r=0,o=1)=>({t,x,y,w,h,c,r,o});
const MYTH_BEASTS=[
  {name:'Nemean Lion',kind:'Nemean Lion',kindKey:'lion',glyph:'N',color:'#b8782e',hp:18,ap:5,rng:1,mv:3,coin:14,cf:9,beh:'hunt',tameable:false,states:true,lore:_T('Its golden hide turned every blade — Heracles had to strangle it.'),
    tok:{kind:'beast',body:'quad',c1:'#d8a040',c2:'#8a5a20',size:1.12,tail:'tuft',mane:true,bulk:1,eyes:'#f0cf7d'},rt:{ring:'gold',bg:'#5a3410',glyph:false,layers:[L9('star',50,50,64,64,'#e6b93a'),L9('circle',50,52,30,30,'#b8782e'),L9('diamond',50,58,8,6,'#2a1608')]}},
  {name:'Lernaean Hydra',kind:'Hydra',glyph:'H',color:'#3f6a2a',hp:20,ap:4,rng:2,mv:1,coin:15,cf:10,beh:'zone',zone:{rad:1,at:'c'},tameable:false,states:true,lore:_T('Cut one head and two grow back; it guards its swamp to the last.'),
    tok:{kind:'beast',body:'serpent',c1:'#3f6a2a',c2:'#b8c07a',size:1.1,spikes:true,eyes:'#e0d040'},rt:{ring:'bronze',bg:'#1f3a24',glyph:false,layers:[L9('line',38,54,40,7,'#5f8a3a',-60),L9('line',50,50,40,7,'#5f8a3a',-90),L9('line',62,54,40,7,'#5f8a3a',-120),L9('circle',30,36,13,13,'#7fb04a'),L9('circle',50,30,13,13,'#7fb04a'),L9('circle',70,36,13,13,'#7fb04a')]}},
  {name:'Cerberus',kind:'Hound of Hades',glyph:'C',color:'#2a2226',hp:18,ap:5,rng:1,mv:3,coin:14,cf:9,beh:'zone',zone:{rad:1,at:'s'},tameable:true,states:true,lore:_T('Three heads at the gate of the dead — Orpheus lulled it with the lyre.'),
    tok:{kind:'beast',body:'quad',c1:'#26222a',c2:'#5a4a52',size:1.1,tail:'spiked',bulk:1,extra:'collar',eyes:'#e04a2a'},rt:{ring:'iron',bg:'#3a1010',glyph:false,layers:[L9('circle',32,52,20,20,'#2a2428'),L9('circle',68,52,20,20,'#2a2428'),L9('circle',50,44,22,22,'#342e32'),L9('circle',46,42,3,3,'#ff5a3a'),L9('circle',54,42,3,3,'#ff5a3a'),L9('circle',29,50,3,3,'#ff5a3a'),L9('circle',71,50,3,3,'#ff5a3a')]}},
  {name:'The Minotaur',kind:'Minotaur',glyph:'M',color:'#6a3a22',hp:20,ap:6,rng:1,mv:2,coin:15,cf:10,beh:'hunt',tameable:false,states:true,lore:_T('Half bull, half man, and all hunger — the labyrinth was built to hold it.'),
    tok:{kind:'beast',body:'biped',c1:'#6a3a22',c2:'#3a2014',size:1.15,horns:true,bulk:1,extra:'chains',eyes:'#e04a2a'},rt:{ring:'blood',bg:'#4a2a18',glyph:false,layers:[L9('crescent',50,38,50,30,'#e8dcc0',90),L9('circle',50,56,28,28,'#6a3a22'),L9('ring',50,68,10,6,'#c9a458')]}},
  {name:'The Chimera',kind:'Chimera',glyph:'X',color:'#8a3a1a',hp:16,ap:5,rng:2,mv:3,coin:13,cf:9,beh:'cf',tameable:false,states:true,lore:_T('Lion, goat and serpent, breathing fire — it plays to the crowd.'),
    tok:{kind:'beast',body:'quad',c1:'#c98a3a',c2:'#5f8a3a',size:1.08,tail:'spiked',mane:true,horns:true,eyes:'#ff8a2a'},rt:{ring:'bronze',bg:'#5a1a10',glyph:false,layers:[L9('star',42,52,40,40,'#d8a050'),L9('tri',64,38,12,18,'#9a9a9a',20),L9('spike',66,68,26,14,'#5f8a3a',30),L9('circle',28,66,11,11,'#f07a2a')]}},
  {name:'Harpy of the Strophades',kind:'Harpy',glyph:'A',color:'#4a3a6a',hp:7,ap:2,rng:1,mv:5,coin:7,cf:7,beh:'cf',fly:true,tameable:false,states:false,lore:_T('The snatchers: wings of a vulture and a face that laughs.'),
    tok:{kind:'beast',body:'bird',c1:'#4a3a6a',c2:'#d8b090',size:0.85,eyes:'#e0d040'},rt:{ring:'silver',bg:'#2a2440',glyph:false,layers:[L9('tri',32,50,28,40,'#6a5a8a',-30),L9('tri',68,50,28,40,'#6a5a8a',30),L9('ellipse',50,62,12,22,'#4a3a6a'),L9('circle',50,42,16,16,'#d8b090')]}},
  {name:'Stymphalian Bird',kind:'Stymphalian Bird',glyph:'S',color:'#9a6a2a',hp:6,ap:3,rng:2,mv:4,coin:7,cf:6,beh:'hunt',fly:true,tameable:false,states:false,lore:_T('Bronze beaks, bronze feathers it throws like darts.'),
    tok:{kind:'beast',body:'bird',c1:'#9a6a2a',c2:'#e6b93a',size:0.8,spikes:true,eyes:'#f0cf7d'},rt:{ring:'bronze',bg:'#1a2a2a',glyph:false,layers:[L9('diamond',50,52,20,44,'#c9964a'),L9('tri',32,46,28,20,'#b8925a',-70),L9('tri',68,46,28,20,'#b8925a',70),L9('spike',50,28,10,8,'#e6b93a',-90)]}},
  {name:'Erymanthian Boar',kind:'Erymanthian Boar',kindKey:'boar',glyph:'E',color:'#4a3424',hp:16,ap:4,rng:1,mv:3,coin:12,cf:7,beh:'hunt',tameable:false,states:true,lore:_T('Heracles drove it into deep snow and carried it home alive.'),
    tok:{kind:'beast',body:'quad',c1:'#4a3424',c2:'#8a6a4a',size:1.1,tail:'none',bulk:1,spikes:true,extra:'fangs',eyes:'#e04a2a'},rt:{ring:'bronze',bg:'#2e2418',glyph:false,layers:[L9('ellipse',50,54,50,34,'#4a3424'),L9('crescent',40,64,10,16,'#f0e8d0',-60),L9('crescent',60,64,10,16,'#f0e8d0',240),L9('circle',42,48,5,5,'#e04a2a'),L9('circle',58,48,5,5,'#e04a2a')]}},
  {name:'Cretan Bull',kind:'Cretan Bull',kindKey:'aurochs',glyph:'B',color:'#d8ccb0',hp:17,ap:4,rng:1,mv:3,coin:12,cf:8,beh:'hunt',tameable:true,states:true,lore:_T('Poseidon’s white bull from the sea, father of the Minotaur.'),
    tok:{kind:'beast',body:'quad',c1:'#e8e0cc',c2:'#8a7a60',size:1.12,tail:'long',horns:true,bulk:1,eyes:'#3a2a1a'},rt:{ring:'silver',bg:'#1a2a4a',glyph:false,layers:[L9('crescent',50,36,50,28,'#f0e8d0',90),L9('circle',50,56,28,28,'#e8dcc0'),L9('ellipse',50,66,14,9,'#d8a0a0')]}},
  {name:'Griffin of Apollo',kind:'Griffin',glyph:'G',color:'#b8923a',hp:12,ap:4,rng:1,mv:4,coin:11,cf:8,beh:'cf',fly:true,tameable:true,states:true,lore:_T('Eagle and lion — it guards the gold of the north.'),
    tok:{kind:'beast',body:'quad',c1:'#c9a050',c2:'#e8dcc0',size:1.02,tail:'tuft',wings:true,eyes:'#f0cf7d'},rt:{ring:'gold',bg:'#3a2a10',glyph:false,layers:[L9('tri',34,48,34,40,'#d6ab4c',-25),L9('tri',66,48,34,40,'#d6ab4c',25),L9('circle',50,40,18,18,'#e8dcc0'),L9('spike',50,50,10,10,'#e6b93a',90)]}},
  {name:'Polyphemus',kind:'Cyclops',glyph:'P',color:'#c98e62',hp:22,ap:6,rng:1,mv:2,coin:16,cf:10,beh:'zone',zone:{rad:2,at:'c'},tameable:false,states:true,lore:_T('The one-eyed shepherd of Sicily — Nobody blinded him.'),
    tok:{kind:'beast',body:'biped',c1:'#c98e62',c2:'#6a4a2a',size:1.2,eyeT:'cyclops',bulk:1,eyes:'#f0cf7d'},rt:{ring:'bronze',bg:'#3a3020',glyph:false,layers:[L9('circle',50,50,40,40,'#c98e62'),L9('ellipse',50,46,20,16,'#f4ecd8'),L9('circle',50,46,8,8,'#2a1a10')]}},
  {name:'Pegasus',kind:'Winged Horse',glyph:'W',color:'#e8e4dc',hp:9,ap:2,rng:1,mv:6,coin:9,cf:9,beh:'cf',fly:true,tameable:true,states:false,lore:_T('Sprung from Medusa’s neck; only Bellerophon ever rode him.'),
    tok:{kind:'beast',body:'quad',c1:'#f0ece4',c2:'#c9d0d6',size:1.0,tail:'long',wings:true,eyes:'#3a5a8a'},rt:{ring:'silver',bg:'#1d2a55',glyph:false,layers:[L9('tri',34,44,30,44,'#f4f0e8',-35),L9('tri',66,44,30,44,'#f4f0e8',35),L9('ellipse',50,60,30,18,'#e8e4dc'),L9('star',72,28,10,10,'#f0cf7d')]}},
  {name:'Ceryneian Hind',kind:'Golden Hind',kindKey:'stag',glyph:'D',color:'#b07a3a',hp:8,ap:2,rng:1,mv:6,coin:10,cf:8,beh:'zone',zone:{rad:3,at:'c'},tameable:true,states:false,lore:_T('Artemis’s deer with golden antlers — faster than an arrow.'),
    tok:{kind:'beast',body:'quad',c1:'#c08a44',c2:'#e6b93a',size:0.92,tail:'none',horns:true,eyes:'#3a2a1a'},rt:{ring:'gold',bg:'#2a3a1c',glyph:false,layers:[L9('line',40,32,22,5,'#e6b93a',-50),L9('line',60,32,22,5,'#e6b93a',50),L9('ellipse',50,52,20,28,'#b07a3a'),L9('circle',50,72,8,8,'#e6b93a')]}},
  {name:'Arachne',kind:'Great Spider',glyph:'R',color:'#3a2a3a',hp:10,ap:3,rng:2,mv:3,coin:9,cf:7,beh:'hunt',tameable:false,states:true,lore:_T('She out-wove Athena and was made to weave forever.'),
    tok:{kind:'beast',body:'spider',c1:'#3a2a3a',c2:'#c8c0d8',size:0.95,eyes:'#e04a2a'},rt:{ring:'iron',bg:'#1a1024',glyph:false,layers:[L9('line',50,50,62,3,'#c8c0d8',20),L9('line',50,50,62,3,'#c8c0d8',-20),L9('line',50,50,62,3,'#c8c0d8',55),L9('line',50,50,62,3,'#c8c0d8',-55),L9('circle',50,54,22,22,'#2a1a2a'),L9('circle',50,40,13,13,'#3a2a3a'),L9('circle',50,56,6,6,'#a3281f')]}},
  {name:'Python of Delphi',kind:'Python',kindKey:'viper',glyph:'Y',color:'#5f8a3a',hp:15,ap:4,rng:1,mv:2,coin:12,cf:8,beh:'zone',zone:{rad:1,at:'c'},tameable:true,states:true,lore:_T('The earth-dragon of the oracle, slain by Apollo’s arrows.'),
    tok:{kind:'beast',body:'serpent',c1:'#5f8a3a',c2:'#d8c88a',size:1.05,pattern:'scales',eyes:'#e0d040'},rt:{ring:'bronze',bg:'#2a2010',glyph:false,layers:[L9('ring',50,50,50,50,'#5f8a3a'),L9('ring',50,50,32,32,'#7fb04a'),L9('circle',50,50,11,11,'#e6b93a')]}},
  {name:'Talos',kind:'Bronze Giant',glyph:'T',color:'#b87333',hp:24,ap:5,rng:1,mv:1,coin:16,cf:10,beh:'zone',zone:{rad:2,at:'c'},tameable:false,states:false,lore:_T('The bronze giant who walked Crete’s shores three times a day.'),
    tok:{kind:'beast',body:'biped',c1:'#b87333',c2:'#e6b93a',size:1.25,pattern:'plates',bulk:1,eyes:'#ffb04a'},rt:{ring:'gold',bg:'#3a2410',glyph:false,layers:[L9('rect',50,56,30,38,'#b87333'),L9('circle',50,32,16,16,'#c9964a'),L9('line',50,54,26,4,'#6a3a1a'),L9('circle',46,31,3,3,'#ffb04a'),L9('circle',54,31,3,3,'#ffb04a')]}}];
function mythDraft(i){const M=MYTH_BEASTS[i];if(!M)return null;const n=blankNpc();const {tok,rt,lore,...st}=JSON.parse(JSON.stringify(M));
  Object.assign(n,st,{kindKey:M.kindKey||null,kind:M.kind,token:tok,tokenRef:'',rtok:{...rtokBlank(M),...rt,baked:[]},lore});if(nameClash('npcs',n.name))n.name=nameSuggest('npcs',n.name);return n}
const STOCK_BEASTS=()=>Object.keys(NPCT).filter(k=>!NPCT[k].custom&&!k.startsWith('cn_'));
const STOCK_KIND={snake:'viper',wolf:'wolf',bear:'bear',lion:'lion',boar:'boar',croc:'crocodile',crocodile:'crocodile',eagle:'eagle'};
function stockDraft(k){const n=blankNpc();applyNpcBase(n,k);const T=NPCT[k];n.name=T.n+' (copy)';if(nameClash('npcs',n.name))n.name=nameSuggest('npcs',n.name);n.kind=T.n;n.kindKey=STOCK_KIND[k]||null;n.tokenRef=['snake','wolf','bear','lion','zora'].includes(k)?'d:'+k:'';
  n.rtok={...rtokBlank(n),base:typeof npcTokName==='function'?(npcTokName({t:k,name:T.n,id:0})||''):'',glyph:false};if(n.beh==='zone')n.zone={rad:k==='bear'?1:2,at:'c'};return n}
function beastGalleryHTML(){const stock=STOCK_BEASTS();
  const stat=T=>_T`${T.hp} HP · attack ${T.ap} · range ${T.rng||1} · move ${T.mv}${T.fly?' · flies':''}${T.tameable?' · tameable':''}`;
  return `<h4>${_T`The system beasts · ${stock.length}`} <span class="rc-sub">${_T`the stock of the classic game — locked, so the defaults are always there; copy one to make it yours`}</span></h4>
   <div class="list2 one sysbeasts">${stock.map(k=>{const T=NPCT[k];return `<div class="lrow" style="--pc:${T.col}">${typeof npcTokHTML==='function'?npcTokHTML({t:k,name:T.n,id:0},40):''}<div class="t">${_T`<b>${esc(T.n)}</b><small>${stat(T)}</small><small>slain: ${coinAmt87(T.coin)}, ${cfAmt87(T.cf)} · ${T.scan?_T('hunts the closest gladiator'):T.huntCF?_T('hunts the highest CF'):_T('guards a zone')}</small>`}</div><div class="a">${sysActs(`data-st="npcsys" data-v="${k}"`)}</div></div>`}).join('')}</div>
   <h4>${_T`Myth starters · ${MYTH_BEASTS.length}`} <span class="rc-sub">${_T`creatures of Greek and Roman myth, ready to tweak — press one to start a beast from it`}</span></h4>
   <div class="mythgrid">${MYTH_BEASTS.map((M,i)=>`<button type="button" class="mythcard" data-st="npcmyth" data-v="${i}" title="${esc(M.lore)}"><span class="mythtok">${rtokSVG({...rtokBlank(M),...M.rt},M)}</span><span class="mythfig">${typeof figureHTML==='function'?figureHTML(M.tok,70):''}</span>${_T`<b>${esc(M.name)}</b><small>${M.hp} HP · atk ${M.ap} · move ${M.mv}${M.fly?' · flies':''}</small><small class="rc-sub">${esc(M.lore)}</small>`}</button>`).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-st="npcmyth"],[data-st="npcsys"]');if(!b||typeof ST==='undefined')return;
  const d=b.dataset.st==='npcmyth'?mythDraft(+b.dataset.v):stockDraft(b.dataset.v);if(!d)return;e.stopPropagation();ST.tab='npcs';ST.draft=d;ST.view='edit';
  if(typeof SCB!=='undefined'){SCB.hist.rt=[];SCB.redo.rt=[]}
  try{studioRedraw()}catch(err){}
  if(typeof mToast==='function')mToast(_T`${b.dataset.st==='npcmyth'?_T('🏛 Myth starter'):_T('⧉ Copied')}: <b>${esc(d.name)}</b> is on the bench — save it to keep it.`);
  const top=document.querySelector('#rtPrev');if(top)top.scrollIntoView({block:'center',behavior:'smooth'})},true);
