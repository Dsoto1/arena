/* =====================================================================
   27-FLAGS · THE HOUSE FLAG (v0.31)
   =====================================================================
   Every ludus flies a flag, built with the same banner press as the empire's city flags (flagURI).
   Yours is chosen at manager creation from a spread of twenty (seeded from the city banners), designed
   in the Creator Studio's Flag press, or changed later on the Lanista tab. Rival houses derive theirs
   from their city and temperament. The flag flies on your masthead, the league table, team screens,
   the city square's gate poles, Match Week bout cards — and in the STANDS, where the first fan seated
   behind one of a house's fighters holds it, lifting it high when they cheer.
   ===================================================================== */
/* FLAG_SHAPES — every device a banner can carry (the first twelve are the originals). */
const FLAG_SHAPES=['eagle','horse','mount','tri','olive','croc','tower','goat','sun','lion','wave','moon','wolf','owl','trident','laurel','boar','ship','thunder','column']; // v0.36: +8 devices
/* FLAG_SHAPES12 — the original twelve devices, used for derived banners so nobody's banner changes. */
const FLAG_SHAPES12=FLAG_SHAPES.slice(0,12); // derived banners (rival houses, families) keep the original twelve, so nobody's banner changes
/* FLAG_PALS — [field, device] colour pairs for derived and spread banners. */
const FLAG_PALS=[['#6e1414','#e2b64a'],['#1c3566','#e8e0cc'],['#2a0f0f','#e0643a'],['#8a5a0e','#fff0b8'],['#3d4a1e','#e8d9a0'],['#1d4a2a','#e0433a'],['#1d3f5c','#e8b26a'],['#1c3b6e','#e9c547'],['#24324a','#d7c29a'],['#11474a','#e9efe6'],['#3d1c4a','#e6c46a'],['#4a1a3d','#e8a34a'],['#101010','#c9ccd3'],['#5a1020','#f0cf7d']];
/* ludusInitials — a ludus name → the letters on its banner (prefixes like "Ludus " dropped, at most 8, 'LVDVS' when empty). */
const ludusInitials=name=>String(name||'LVDVS').replace(/^Ludus |^The |^House of |^Schola /i,'').split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,8)||'LVDVS';
/* mgrFlagOf — a house's banner: its chosen flag, else one derived from its id/name (palette) and city+name (device). */
function mgrFlagOf(mgr){if(!mgr)return null;if(mgr.flag)return mgr.flag;
  const pal=FLAG_PALS[Math.abs(hashStr(mgr.id||mgr.name||'x'))%FLAG_PALS.length];
  const shape=FLAG_SHAPES12[Math.abs(hashStr((mgr.city||'')+(mgr.name||'')))%FLAG_SHAPES12.length];
  return {bg:pal[0],fg:pal[1],txt:ludusInitials(mgr.ludus),shape}}
/* HFLAG_CACHE — cache of banner data URIs and images. */
const HFLAG_CACHE={};
/* flagSculpt — the sculpted layers of a banner as SVG (scaled to the banner), '' when it has none. */
function flagSculpt(flag){return (flag.layers&&flag.layers.length)||(flag.baked&&flag.baked.length)?`<g transform='scale(6)'>${scbLayersSVG(flag)}</g>`:''}
/* houseFlagURI — a banner as a data URI via flagURI (cached unless it is the one on the press bench). */
function houseFlagURI(flag){if(!flag)return null;const ex=typeof scbLayersSVG==='function'?flagSculpt(flag):'';if(ex&&flag===ST.fd)return flagURI(flag.bg,flag.fg,flag.txt,flag.shape,ex);const k=[flag.bg,flag.fg,flag.txt,flag.shape].join('|')+(ex?'|'+hashStr(ex):'');return HFLAG_CACHE[k]||(HFLAG_CACHE[k]=flagURI(flag.bg,flag.fg,flag.txt,flag.shape,ex))}
/* flagChip — a house's banner as a small <img> chip, height px tall. */
function flagChip(mgr,height=20,title){const f=mgrFlagOf(mgr);if(!f)return '';return `<img class="flagchip" src="${houseFlagURI(f)}" style="height:${height}px" alt="" title="${esc(title||(_T('The banner of ')+(mgr.ludus||'')))}">`}
/* flagImg — a banner as a loaded Image for the canvas (null until it has loaded). */
function flagImg(flag){const k='im:'+[flag.bg,flag.fg,flag.txt,flag.shape].join('|')+((flag.layers||[]).length||(flag.baked||[]).length?'|'+hashStr(JSON.stringify([flag.layers,flag.baked])):'');let im=HFLAG_CACHE[k];if(!im){im=new Image();im.src=houseFlagURI(flag);HFLAG_CACHE[k]=im}return im.complete&&im.naturalWidth?im:null}
// twenty seeded designs for the creation picker (deterministic per shuffle seed)
/* flagSpread — the creation picker's banners: six city banners on the first spread, then twenty seeded designs. */
function flagSpread(seed,ludus){const R0=mulberry32(hashStr('flags'+seed+(ludus||'')));const R=()=>R0.next();const out=[];const txt=ludusInitials(ludus);
  // the empire's own city banners, ready to fly over a house (first spread only)
  if(seed<=1)for(const [k,F] of Object.entries(FLAGS).slice(0,6)){const [bg,fg,t2,shape]=F.v[0];out.push({bg,fg,txt:t2,shape})}
  for(let i=0;i<20;i++){const pal=FLAG_PALS[Math.floor(R()*FLAG_PALS.length)];const sw=R()<0.35;
    out.push({bg:sw?pal[1]:pal[0],fg:sw?pal[0]:pal[1],txt,shape:FLAG_SHAPES[Math.floor(R()*FLAG_SHAPES.length)]})}
  return out}
/* flagPickerHTML — the banner picker at house creation: your rack designs, then the spread. */
function flagPickerHTML(cur,seed,ludus){const spread=flagSpread(seed,ludus);const customs=((typeof CUSTOM!=='undefined'&&CUSTOM.flags)||[]).filter(f=>f.rack!==false&&f.fmt!=='portrait'&&(typeof rosterGate!=='function'||rosterGate('flags',f,true))); // v0.44: only banners on the rack
  /* cell — one banner button in the picker (marked when it is the current pick). */
  const cell=(f,src)=>`<button type="button" class="flagcell ${cur&&cur.bg===f.bg&&cur.fg===f.fg&&cur.shape===f.shape&&cur.txt===f.txt?'on':''}" data-nmflag='${esc(JSON.stringify(f))}' title="${src||''}"><img src="${houseFlagURI(f)}" alt=""></button>`;
  return `<div class="sect">${_T`🚩 The house banner`} <span class="rc-sub">${_T`flies over your masthead, the league table, the stands and the square ·`} <button class="btn tksm" type="button" data-mg="nmflagshuffle">${_T`🎲 new spread`}</button></span></div>
   <div class="flaggrid">${customs.map(f=>cell({bg:f.bg,fg:f.fg,txt:f.txt,shape:f.shape},'✦ '+(f.name||_T('your design')))).join('')}${spread.map(f=>cell(f)).join('')}</div>`}

/* ---------------- THE BANNER HIERARCHY (v0.33) ----------------
   ONE banner for the empire (the S·P·Q·R eagle), ONE per city (spectators and their
   cities rep them — the guard wears the colors, the arena poles fly the cloth), one per
   LUDUS (the house banner above), and every gladiator is born under a FAMILY banner,
   derived from the family name so kin share it. */
/* EMPIRE_FLAG — the empire's one banner (S·P·Q·R eagle). */
const EMPIRE_FLAG={bg:'#6e1414',fg:'#e2b64a',txt:'S·P·Q·R',shape:'eagle'};
/* famFlagOf — the family banner for a name (or a fighter): derived from the family name so kin share it. */
function famFlagOf(who){const nm2=typeof who==='string'?who:(who&&who.name||'');const fam=String(nm2).trim().split(/\s+/).pop()||'GENS';
  const key=fam.toLowerCase();
  const pal=FLAG_PALS[Math.abs(hashStr('fam'+key))%FLAG_PALS.length];
  const shape=FLAG_SHAPES12[Math.abs(hashStr('famsh'+key))%FLAG_SHAPES12.length];
  return {bg:pal[0],fg:pal[1],txt:fam.slice(0,8).toUpperCase(),shape,fam}}
/* famFlagChip — a family banner as a small <img> chip, height px tall. */
function famFlagChip(who,height=15){const f=famFlagOf(who);if(!f)return '';return `<img class="flagchip" src="${houseFlagURI(f)}" style="height:${height}px" alt="" title="${_T`The banner of the ${esc(f.fam)} family — every fighter is born under one; kin share it`}">`}

/* ---------------- the Flag press (Creator Studio) ---------------- */
/* blankFlag — a fresh banner on the press. */
function blankFlag(){return {id:'f'+Date.now().toString(36),name:'',bg:'#6e1414',fg:'#e2b64a',txt:'LVDVS',shape:'none',layers:[],baked:[],v:1}}
/* loadFlags — loads the custom banners from the Store, sorted by name. */
async function loadFlags(){try{CUSTOM.flags=(await Store.list('customFlags')).sort((a,b)=>String(a.name).localeCompare(String(b.name)))}catch(e){CUSTOM.flags=CUSTOM.flags||[]}}
/* flagStudioHTML — the Banner press page in the Creator Studio: the bench, the devices, your banners and the empire's presets. */
function flagStudioHTML(){const d=ST.fd||(ST.fd=blankFlag());const L=CUSTOM.flags||[];
  /* preset — one preset banner button that copies onto the bench. */
  const preset=(f,label,tip)=>`<span style="text-align:center"><button type="button" class="flagcell" data-fdp='${esc(JSON.stringify({bg:f.bg,fg:f.fg,txt:f.txt,shape:f.shape}))}' title="${esc(tip||_T('Copy onto the bench'))}"><img src="${houseFlagURI(f)}" alt=""></button><br><span class="rc-sub" style="font-size:10px">${esc(label)}</span></span>`;
  return `<p>${_T`The <b>Banner press</b> — the same press that prints every banner in the empire. The order of cloth: <b>one banner for the empire</b>, <b>one for each city</b> (its spectators and its guard rep it), <b>one per ludus</b> (yours flies on the masthead, the league table, the square and the stands), and every gladiator is born under a <b>family banner</b> shared with their kin. Design a house banner here and it hangs in the banner rack whenever a lanista is created.`}</p>
   <div class="trstudio"><div class="trprev scart scflag" data-scbprev="f" title="${_T`Drag a shape to move it`}"><img id="fdPrev" draggable="false" src="${houseFlagURI(d)}" style="width:100%;max-width:320px;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.5)"><div class="rc-sub" style="text-align:center;margin-top:4px">${esc(d.name||_T('Unnamed banner'))}</div></div>
    <div class="formgrid"><label>${_T`Name`}<input type="text" data-fdf="name" value="${esc(d.name)}" maxlength="24" placeholder="${_T`e.g. The Boar of Capua`}"></label>
     <label>Motto / letters<input type="text" data-fdf="txt" value="${esc(d.txt)}" maxlength="10"></label>
     <label>${_T`Field`}<input type="color" data-fdf="bg" value="${esc(d.bg)}"></label><label>${_T`Device &amp; letters`}<input type="color" data-fdf="fg" value="${esc(d.fg)}"></label>
     <label style="grid-column:1/-1">${_T`Start from a device`} <span class="rc-sub">${_T`— the heraldic term for the emblem on the cloth · or keep the cloth blank and sculpt your own`}</span>${`<div class="flaggrid" style="margin-top:4px">${['none',...FLAG_SHAPES].map(sh=>`<button type="button" class="flagcell ${d.shape===sh?'on':''}" data-fds="${sh}"><img src="${houseFlagURI({...d,shape:sh})}" alt="${sh}"></button>`).join('')}</div>`}</label>${scbBenchHTML('f')}</div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-fda="save">${_T`💾 Save banner`}</button><button class="btn" type="button" data-fda="new">${_T`↺ Fresh cloth`}</button></div>
   <h4>${_T`Your banners · ${L.length}`}</h4>${L.length?`<div class="flaggrid">${L.map(f=>`<span style="text-align:center"><img src="${houseFlagURI(f)}" style="height:44px;border-radius:3px"><br><span class="rc-sub" style="font-size:10.5px">${esc(f.name||'')}</span><br>${crActs('f',f)}</span>`).join('')}</div>`:`<p class="rc-sub">${_T`The press is idle.`}</p>`}
   <h4>${_T`🏛 The empire's banners`} <span class="rc-sub" style="font-weight:400">${_T`— presets: click one to copy it onto the bench and make it your own`}</span></h4>
   <div class="flaggrid">${preset(EMPIRE_FLAG,_T('THE EMPIRE'),_T('The one banner over them all — S·P·Q·R'))}${Object.entries(FLAGS).map(([k,F])=>{const [bg,fg,txt,shape]=F.v[0];return preset({bg,fg,txt,shape},F.n,_T`The banner of ${F.n} — its spectators rep it in the stands and the square`)}).join('')}</div>`}
/* flagStudioClick — handles the Banner press buttons: new / edit / delete / save. */
async function flagStudioClick(btn,redraw){const a=btn.dataset.fda,id=btn.dataset.id;
  if(a==='new'){ST.fd=blankFlag();redraw();return}
  if(a==='edit'){const f=(CUSTOM.flags||[]).find(x=>x.id===id);if(f)ST.fd=JSON.parse(JSON.stringify(f));redraw();return}
  if(a==='del'){CUSTOM.flags=(CUSTOM.flags||[]).filter(x=>x.id!==id);await Store.del('customFlags',id).catch(()=>{});redraw();return}
  if(a==='save'){const d=ST.fd;if(!String(d.name).trim())d.name=_T('Banner ')+d.txt;if(!nameGuard('flags',d,'[data-fdf="name"]'))return;d.v=(d.v||0)+1;
    CUSTOM.flags=[...(CUSTOM.flags||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))];await Store.put('customFlags',d.id,d).catch(()=>{});
    if(typeof mToast==='function')mToast(_T`🚩 <b>${esc(d.name)}</b> comes off the press.`);redraw();return}}
/* flagStudioInput — handles the press form fields and refreshes the preview. */
function flagStudioInput(input){const d=ST.fd;if(!d)return false;if(input.dataset.fdf==null)return false;
  d[input.dataset.fdf]=input.value;const pv=document.getElementById('fdPrev');if(pv)pv.src=houseFlagURI(d);return true}

/* ---------------- the stands: the superfan with the banner ---------------- */
/* drawFanFlags — in the stands, the first seated fan of each house fighter holds the house banner (lifted and waving while cheering). TWEAK: the lift 0.34 TW and mood 45. */
function drawFanFlags(){ // called from the crowd painter, after the spectators
  if(!S||!S.spect||typeof ctx==='undefined')return;const holders={};
  for(const sp of S.spect){if(sp.gone||sp.fav==null||sp._x==null)continue;const p=S.players[sp.fav];if(!p||!p.mgrGid)continue;
    if(holders[sp.fav]!=null)continue;holders[sp.fav]=sp; // the FIRST fan seated for each house fighter carries the banner
    const w2=(typeof MGR!=='undefined'&&MGR.world);const g=w2&&w2.glads?w2.glads.find(x=>x.id===p.mgrGid):null;
    const m=g&&g.contract&&typeof mgrById==='function'?mgrById(g.contract.mgr):null;const f=m?mgrFlagOf(m):null;if(!f)continue;
    const cheering=(S.emotes||[]).some(e=>e.sid===sp.id)||sp.mood>=45;const lift=cheering?TW*0.34:0;const wob=cheering?Math.sin(performance.now()/120)*0.1:0;
    const im=flagImg(f);const x=sp._x+TW*0.14,y=sp._y-TW*0.5-lift;
    ctx.save();ctx.translate(x,y);ctx.rotate(wob);
    ctx.strokeStyle='#5a4a34';ctx.lineWidth=Math.max(1.2,TW*0.03);ctx.beginPath();ctx.moveTo(0,TW*0.34);ctx.lineTo(0,-TW*0.26);ctx.stroke();
    if(im)ctx.drawImage(im,0,-TW*0.26,TW*0.4,TW*0.24);else{ctx.fillStyle=f.bg;ctx.fillRect(0,-TW*0.26,TW*0.4,TW*0.24);ctx.strokeStyle=f.fg;ctx.strokeRect(0,-TW*0.26,TW*0.4,TW*0.24)}
    ctx.restore()}}
