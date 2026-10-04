/* =====================================================================
   57-CLASSES · THE CLASS CREATOR (v0.52)
   =====================================================================
   A class is the LOADOUT: weapons, armor, ability, weakness, starting coin, keys, starting CF and up to three
   starting items (arena cards or offering tokens). It prints as a class card like the ones in the rulebook.
   A character is the PERSON: name, face, city, personality, story — and the class they fight as (one of the
   nine printed classes, or one of yours). Characters made before v0.52 were given a class of their own that
   holds exactly the gear they had.
   Stored in Store 'customClasses'. Characters point at a class with classRef: 'cls:<printed key>' or 'ccl:<id>'.
   ===================================================================== */
const CLS_BUDGET=26;
if(typeof SAVE_COLS!=='undefined'&&!SAVE_COLS.includes('customClasses'))SAVE_COLS.push('customClasses'); /* whole-game backups carry the classes */ /* the character budget (22) plus room for starting Crowd Favor */
const CLS_TYPES=[_T('Retiarius'),_T('Murmillo'),_T('Thraex'),_T('Hoplomachus'),_T('Secutor'),_T('Dimachaerus'),_T('Provocator'),_T('Essedarius'),_T('Sagittarius'),_T('Laquearius'),_T('Andabata'),_T('Crupellarius'),_T('Scissor'),_T('Eques'),_T('Paegniarius'),_T('Arbelas'),_T('Veles'),_T('Bestiarius'),_T('Cestiarius'),_T('Rudiarius'),_T('Gallus'),_T('Samnis')];
const CLS_ITEM_OPTS=ITEM_OPTS.concat([['c:wealth3',_T('Wealth of Saturn · 3 coin (card)')],['c:elixir4',_T('Health Elixir 4 HP (card)')]].filter(([k])=>CARDS[k.slice(2)]));
if(typeof CUSTOM!=='undefined'&&!CUSTOM.classes)CUSTOM.classes=[];
function blankClass(){const t=pickOne(CLS_TYPES.filter(n=>!(CUSTOM.classes||[]).some(c=>c.name===n)).concat([_T('Gladiator')]));
  return {_cls:1,id:null,name:t,hero:genName({}),city:pickOne(HOME_CITIES()),color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),
    abil:'none',abilVal:1,weak:'none',abilText:'',R:'gladius',L:null,
    arm:{head:'galea',chest:null,belt:false,rarm:{upper:null,lower:null,wraps:true,cestus:false},larm:{upper:null,lower:null,wraps:true,cestus:false},legU:null,legUp:true,legL:null,legLp:false},
    coin:3,keys:1,cf:0,items:['','',''],lore:'',sandbox:false,status:'active'}}
function classCost(k){return charCost({...k,items:(k.items||[]).filter(Boolean)})+(+k.cf||0)}
/* the loadout a classRef stands for */
function classLoadout(ref){if(!ref)return null;
  if(ref.startsWith('cls:')){const k=ref.slice(4);if(!CLASSES[k]||CLASSES[k].custom)return null;const t=charFromClass({},k);
    return {R:t.R,L:t.L,arm:t.arm,coin:t.coin,keys:t.keys,cf:0,items:(CLASSES[k].items||[]).slice(),abil:t.abil,abilVal:1,weak:t.weak,abilText:'',sandbox:false}}
  if(ref.startsWith('ccl:')){const c=(CUSTOM.classes||[]).find(x=>x.id===ref.slice(4));if(!c)return null;
    return JSON.parse(JSON.stringify({R:c.R||null,L:c.L||null,arm:c.arm,coin:c.coin||0,keys:c.keys||0,cf:+c.cf||0,items:(c.items||[]).filter(Boolean),abil:c.abil||'none',abilVal:c.abilVal||1,weak:c.weak||'none',abilText:c.abilText||'',sandbox:!!c.sandbox}))}
  return null}
function classNameOf(ref){if(!ref)return '';if(ref.startsWith('cls:')){const C=CLASSES[ref.slice(4)];return C?C.name:''}const c=(CUSTOM.classes||[]).find(x=>'ccl:'+x.id===ref);return c?c.name:''}
function applyClassToChar(c){if(!c||!c.classRef)return c;const L=classLoadout(c.classRef);if(!L){c.classRef='cls:soldier';return applyClassToChar(c)}Object.assign(c,L);return c}
function classOpts(){return [...BASE_CLS.map(k=>['cls:'+k,`🛡 ${CLASSES[k].name} · printed`]),...(CUSTOM.classes||[]).filter(c=>c.status!=='retired').map(c=>['ccl:'+c.id,`✦ ${c.name}${c.sandbox?' · sandbox':''}`])]}

/* ---------- the card ---------- */
function clsWrap(s,n){const out=[];let line='';for(const w of String(s).split(/\s+/)){if(!w)continue;if((line+' '+w).trim().length>n){if(line)out.push(line);line=w}else line=(line+' '+w).trim()}if(line)out.push(line);return out}
function classCardSVG(k){k=k||{};const x=esc;const A=charArmor({arm:k.arm||{}});const grp={};
  for(const [key,loc] of A){const a=ARM[key];if(!a)continue;const g=grp[key]||(grp[key]={a,locs:[]});g.locs.push(loc)}
  const armL=Object.values(grp).map(g=>{const pair=g.locs.length>1;const where=pair?LOCS_SHORT[g.locs[0]]:LOCN[g.locs[0]];const kind=g.a.pt==='upper'?_T('Upper '):g.a.pt==='lower'&&g.a.slot!=='chest'?_T('Lower '):'';return `[${g.a.ap} AP] ${kind}${where}${pair?_T(' *For each'):''}`});
  const abil=(k.abilText?k.abilText+': ':'')+(k.abil&&k.abil!=='none'?abilDesc(k.abil,k.abilVal||1):_T('No class ability'))+(k.weak&&k.weak!=='none'&&WEAKNESSES[k.weak]?'. Weakness: '+WEAKNESSES[k.weak][0]:'');
  const wpn=[k.R,k.L].filter(Boolean).map(w=>W[w]?_T`1x LVL ${W[w].lv} “${W[w].n}”`:'').filter(Boolean);
  const std=[`[${k.coin||0}x Coin]`];if(k.keys)std.push(_T`${k.keys}x Arena Key`);if(+k.cf)std.push(`[${k.cf} CF]`);
  const uniq=(k.items||[]).filter(Boolean).map(i=>{const o=CLS_ITEM_OPTS.find(z=>z[0]===i);return o?o[1].replace(/ \((card)\)$/,' card'):i});
  const sec=[[_T('Armors:'),armL.length?armL:['none']],[_T('Ability:'),clsWrap(abil,30)],[_T('Weapons:'),wpn.length?wpn:['fists']],[_T('Starting Items:'),std],...(uniq.length?[[_T('Unique Starting Items:'),uniq.flatMap(u=>clsWrap('1x '+u,30))]]:[])];
  const n=sec.reduce((s,[,l])=>s+1+l.length,0);const fs=Math.max(7.6,Math.min(10.6,232/(n*1.28)));const lh=fs*1.28;
  let y=74+fs,body='';for(const [h,ls] of sec){body+=`<text x="14" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" font-weight="700" fill="#2a1d12" text-decoration="underline">${x(h)}</text>`;y+=lh;
    for(const l of ls){body+=`<text x="16" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" fill="#2a1d12">${x(l)}</text>`;y+=lh}y+=lh*0.22}
  const nm=String(k.name||_T('Class')).toUpperCase();const ns=nm.length>12?Math.max(11,19-(nm.length-12)*0.9):19;const col=k.color||'#b0271c';
  const img=typeof assetURL==='function'?assetURL('avatar.png'):'assets/avatar.png';
  return `<svg viewBox="0 0 300 324" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${_T`${x(k.name||_T('Class'))} class card`}"><rect width="300" height="324" rx="10" fill="#5a1914"/><rect x="5" y="5" width="290" height="314" rx="7" fill="#efe3c6" stroke="${col}" stroke-width="2"/>
   <rect x="10" y="10" width="280" height="50" rx="4" fill="#e3d0a4" stroke="#3a2a1a" stroke-width="1.2"/><path d="M10 60 L290 60" stroke="#3a2a1a" stroke-width="0.8"/>
   <circle cx="24" cy="35" r="7" fill="${col}" stroke="#3a2a1a"/><text x="34" y="33" font-family="Georgia,serif" font-size="7.5" fill="#3a2a1a">${x(String(k.city||'').toUpperCase().slice(0,12))}</text>
   <text x="150" y="32" text-anchor="middle" font-family="Georgia,serif" font-size="${ns.toFixed(1)}" font-weight="700" fill="${col}" stroke="#3a1a10" stroke-width="0.5" letter-spacing="1">${x(nm)}</text>
   <text x="150" y="50" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#2a1d12">${x(k.hero||'')}</text><text x="280" y="34" text-anchor="end" font-family="Georgia,serif" font-size="9" fill="#3a2a1a">✦</text>
   <image href="${img}" x="176" y="70" width="112" height="238" preserveAspectRatio="xMidYMid meet" opacity=".92"/>${body}
   ${k.sandbox?_T('<text x="150" y="314" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" fill="#8a2a20">sandbox build</text>'):''}</svg>`}
const CLS_SZ={xs:64,sm:130,md:190,lg:260,xl:320};
function classCardHTML(ref,size='sm'){const w=CLS_SZ[size]||130;
  if(ref&&typeof ref==='object')return `<span class="clscard" style="display:inline-block;width:${w}px;line-height:0">${classCardSVG(ref)}</span>`;ref=ref==null?'':String(ref);
  if(ref&&ref.startsWith('cls:'))return `<span style="display:inline-block;width:${w}px">${cardHTML('k:'+ref.slice(4),size==='xs'?'sm':size==='sm'?'md':'lg')}</span>`;
  const c=ref&&ref.startsWith('ccl:')?(CUSTOM.classes||[]).find(x=>x.id===ref.slice(4)):ref&&typeof ref==='object'?ref:null;
  return `<span class="clscard" style="display:inline-block;width:${w}px;line-height:0">${classCardSVG(c||{})}</span>`}

/* ---------- storage and the one-time conversion of older characters ---------- */
async function saveClass(k){const d=JSON.parse(JSON.stringify(k));delete d._cls;await Store.put('customClasses',d.id,d).catch(()=>{});return d}
{const _lc=loadCustoms;loadCustoms=async function(){const r=await _lc.apply(this,arguments);
  try{CUSTOM.classes=(await Store.list('customClasses')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.classes=CUSTOM.classes||[]}
  let changed=0;
  for(const c of CUSTOM.chars||[]){if(c.classRef&&classLoadout(c.classRef)){const before=JSON.stringify([c.R,c.L,c.arm,c.coin,c.keys,c.abil,c.weak,c.items]);applyClassToChar(c);if(JSON.stringify([c.R,c.L,c.arm,c.coin,c.keys,c.abil,c.weak,c.items])!==before){changed++;Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{})}continue}
    /* v0.52: an older character keeps its exact gear as a class of its own */
    const first=String(c.name||_T('Custom')).split(/\s+/)[0];
    const have=CUSTOM.classes.find(x=>x.id==='k_'+c.id||x.from===c.id);if(have){c.classRef='ccl:'+have.id;applyClassToChar(c);changed++;Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{});continue}
    let nm0=(c.abilText&&c.abilText.length<=22?c.abilText:first+_T('’s Loadout'));{let i=2;const base=nm0;while(CUSTOM.classes.some(x=>String(x.name).toLowerCase()===nm0.toLowerCase())||BASE_CLS.some(b=>CLASSES[b].name.toLowerCase()===nm0.toLowerCase()))nm0=base+' '+(['II','III','IV','V','VI','VII'][i++-2]||i)}
    const k={id:'k_'+c.id,name:nm0,hero:c.name,city:c.city,color:c.color,
      abil:c.abil||'none',abilVal:c.abilVal||1,weak:c.weak||'none',abilText:c.abilText||'',R:c.R||null,L:c.L||null,arm:JSON.parse(JSON.stringify(c.arm||blankClass().arm)),coin:c.coin||0,keys:c.keys||0,cf:0,
      items:[...(c.items||[]),'','',''].slice(0,3),lore:_T`Carried over from ${c.name}’s original loadout.`,sandbox:!!c.sandbox,status:'active',created:new Date().toISOString().slice(0,10),custom:true,from:c.id};
    CUSTOM.classes.push(k);await saveClass(k);c.classRef='ccl:'+k.id;changed++;Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{})}
  if(changed)registerCustoms();return r}}
/* a character's class card figures carry the class's starting CF into play */
{const _cc=charClass;charClass=function(c){const r=_cc(c);try{const L=c.classRef?classLoadout(c.classRef):null;r.cf=L?+L.cf||0:0;r.clsRef=c.classRef||null;r.clsName=classNameOf(c.classRef)}catch(e){}return r}}
{const _gl=giveLoadout;giveLoadout=function(p){_gl(p);try{const C=CLASSES[p.cls];if(C&&+C.cf>0){cfWhy(_T('class starting CF'));p.cf+=+C.cf;cfWhy(null)}}catch(e){}}}

/* ---------- the character designer: the class replaces the loadout controls ---------- */
{const _bc=blankChar;blankChar=function(){const c=_bc();c.classRef='cls:'+pickOne(BASE_CLS);applyClassToChar(c);return c}}
function charClassPickHTML(c){const ref=c.classRef||'cls:soldier';const cust=ref.startsWith('ccl:');const k=cust?(CUSTOM.classes||[]).find(x=>'ccl:'+x.id===ref):null;
  return `<div class="card2 clspick" style="margin:0 0 10px"><div class="sect" style="margin-top:0">${_T`🎭 Class · the loadout`}</div>
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">${classCardHTML(ref,'sm')}<div style="flex:1;min-width:200px;display:grid;gap:6px">
     <label>${_T`Fights as${fSel('classRef',classOpts(),ref)}`}</label>
     <p class="rc-sub" style="margin:0">${_T`Weapons, armor, ability, coin, keys, starting CF and items come from the class.${k&&k.sandbox?' '+customTag({sandbox:1}):''}`}</p>
     <div class="mbtns" style="margin:0">${cust?`<button class="btn tksm" type="button" data-clsa="edit" data-v="${esc(ref.slice(4))}">${_T`✎ Edit this class`}</button>`:`<button class="btn tksm" type="button" data-clsa="copybase" data-v="${esc(ref.slice(4))}">${_T`⧉ Copy into a new class`}</button>`}<button class="btn tksm" type="button" data-clsa="new">${_T`✚ Design a class`}</button></div></div></div></div>`}
{const _ce=charEditorHTML;charEditorHTML=function(){const c=ST.draft;if(c){if(!c.classRef)c.classRef='cls:soldier';applyClassToChar(c)}return _ce()}}
{const _sd=stSaveDraft;stSaveDraft=function(){if(ST.tab==='chars'&&ST.draft){applyClassToChar(ST.draft)}return _sd.apply(this,arguments)}}

/* ---------- the Classes tab ---------- */
function classStudioHTML(){if(!ST.draft||!ST.draft._cls)ST.draft=blankClass();const k=ST.draft;const A=k.arm;const cost=classCost(k),over=cost>CLS_BUDGET&&!k.sandbox;
  const used=id=>(CUSTOM.chars||[]).filter(c=>c.classRef==='ccl:'+id);
  const armRow=s=>`<div class="card2"><div class="sect" style="margin-top:0">${s==='rarm'?_T('Right arm'):_T('Left arm')}</div><div class="formgrid" style="grid-template-columns:1fr 1fr">
     <label>${_T`Upper${fSel(_T`arm.${s}.upper`,armorOpts(a=>a.slot==='arm'&&a.pt==='upper'),A[s].upper)}`}</label><label>${_T`Lower${fSel(_T`arm.${s}.lower`,armorOpts(a=>a.slot==='arm'&&a.pt==='lower'&&!a.stack),A[s].lower)}`}</label></div>
     <div class="chkgrid" style="margin-top:6px">${fChk(_T`arm.${s}.wraps`,A[s].wraps,_T('Padded wraps'))}${fChk(_T`arm.${s}.cestus`,A[s].cestus,_T('Cestus (+1 damage)'))}</div></div>`;
  const mine=(CUSTOM.classes||[]).map(c=>`<div class="lrow" style="--pc:${esc(c.color||'#c9a44a')}">${classCardHTML('ccl:'+c.id,'xs')}<div class="t">${_T`<b>${esc(c.name)}</b> ${c.sandbox?customTag({sandbox:1}):''}<small>${esc(c.hero||'')} · ${c.abil&&c.abil!=='none'?esc(ABILITIES[c.abil][0]):_T('no ability')} · ${[c.R,c.L].filter(Boolean).map(w=>W[w]?W[w].n:w).join(' & ')||'fists'} · ${c.coin||0} coin${+c.cf?_T` · ${c.cf} CF`:''} · used by ${used(c.id).length}</small>`}</div>
     <div class="acts"><button class="btn tksm" type="button" data-clsa="edit" data-v="${c.id}">${_T`✎ Edit`}</button><button class="btn tksm" type="button" data-clsa="copy" data-v="${c.id}">${_T`⧉ Copy`}</button><button class="btn tksm" type="button" data-clsa="del" data-v="${c.id}">${_T`🗑 Delete`}</button></div></div>`).join('');
  const base=BASE_CLS.map(b=>`<div class="lrow" style="--pc:${CLASSES[b].color}">${classCardHTML('cls:'+b,'xs')}<div class="t"><b>${esc(CLASSES[b].name)}</b> <span class="cbadge" title="${_T`Printed class: locked — copy it to make your own`}">🔒 printed</span><small>${esc(CLASSES[b].sub)} · ${esc(String(CLASSES[b].ab||'').slice(0,90))}</small></div><div class="acts"><button class="btn tksm" type="button" data-clsa="copybase" data-v="${b}">${_T`⧉ Copy`}</button></div></div>`).join('');
  return `<p>${_T`Design a <b>class</b>: the loadout a gladiator fights with. It prints as a class card, like the rulebook’s. Characters pick their class in the Characters tab.`}</p>
  <div class="setup-grid" style="grid-template-columns:minmax(0,280px) minmax(0,1fr)">
   <div><div class="mbtns" style="margin:0 0 8px;justify-content:center"><button class="btn primary" type="button" data-clsa="fresh">${_T`✚ New class`}</button><button class="btn" type="button" data-clsa="random">${_T`🎲 Randomize`}</button></div>
    <div id="clsCard" style="display:flex;justify-content:center">${classCardHTML(k,'lg')}</div>
    <label style="display:grid;gap:3px;margin-top:8px;font-size:12.5px">${_T`Start from a printed class`}<span style="display:flex;gap:4px"><select class="tin" id="clsTpl">${BASE_CLS.map(b=>`<option value="${b}">${CLASSES[b].name}</option>`).join('')}</select><button type="button" class="btn tksm" data-clsa="tpl">${_T`Apply`}</button></span></label></div>
   <div><div class="card2 budgetcard" style="margin:0 0 10px;border-color:${over?'var(--blood2)':'var(--line2)'}"><b>${_T`Class budget:`} <span id="clsCost">${cost}</span> / ${CLS_BUDGET} points</b> <span class="rc-sub">${_T`weapons 2/4/7 · armor 1/3/5 · 1 per 2 coin · 1 per key · 1 per CF · 2 per item · abilities cost, weaknesses refund`}</span>
     <div class="meter" style="margin:6px 0"><i style="width:${Math.min(100,cost/CLS_BUDGET*100)}%;background:${over?'var(--blood2)':''}"></i></div>${fChk('sandbox',k.sandbox,_T('Sandbox: ignore the budget'))}${over?`<p style="color:var(--blood2);margin:6px 0 0">${_T`Over budget: trim the loadout or tick Sandbox.`}</p>`:''}</div>
    <div class="formgrid"><label>${_T`Class name${fTxt('name',k.name,'maxlength="20"')}`}</label><label>${_T`Champion (card subtitle)${fTxt('hero',k.hero,'maxlength="26"')}`}</label>
     <label>${_T`Home city${fSel('city',HOME_CITIES().map(c=>[c,c]),k.city)}`}</label><label>${_T`Color`}<input type="color" class="tin" data-f="color" value="${esc(k.color)}" style="height:34px;padding:2px"></label>
     <label>${_T`Ability${fSel('abil',Object.entries(ABILITIES).filter(([a])=>!STAT_ABILS.has(a)).map(([a,v])=>[a,`${v[0]} — ${v[3]}${v[2]?_T` (${v[2]} pts)`:''}`]),STAT_ABILS.has(k.abil)?'none':k.abil)}`}</label>${k.abil==='zora'?`<label>${_T`Tamed ally${fSel('ally',allyOpts(),k.ally||'zora')}`}</label>`:''}<p class="rc-sub" style="grid-column:1/-1;margin:0">${_T`Movement, damage, coin and CF now come from each gladiator's ratings (Speed, Strength, Luck, Charisma), not the class.`}</p><label>${_T`Weakness${fSel('weak',Object.entries(WEAKNESSES).map(([a,v])=>[a,`${v[0]}${v[2]?' (+'+v[2]+' pts)':''}`]),k.weak)}`}</label>
     <label>${_T`Ability name${fTxt('abilText',k.abilText||'',_T('maxlength="40" placeholder="e.g. Net of Neptune"'))}`}</label>${k.abil&&k.abil!=='none'?`<label>${_T`Ability value ${fNum('abilVal',k.abilVal||1,1,3)}`}</label>`:''}</div>
    <h4>${_T`Weapons`}</h4><div class="formgrid"><label>${_T`Right hand${fSel('R',weaponOpts(3,_T('Fist')),k.R)}`}</label><label>${_T`Left hand${fSel('L',weaponOpts(3,_T('Empty')),k.L)}`}</label></div>
    <h4>${_T`Armor`}</h4><div class="formgrid"><label>${_T`Head${fSel('arm.head',armorOpts(a=>a.slot==='head'),A.head)}`}</label><label>${_T`Chest${fSel('arm.chest',armorOpts(a=>a.slot==='chest'&&!a.stack),A.chest)}`}</label><label class="chk" style="align-self:end">${fChk('arm.belt',A.belt,_T('Gladiator belt'))}</label></div>
    <div class="formgrid" style="margin-top:8px">${armRow('rarm')}${armRow('larm')}</div>
    <div class="formgrid" style="margin-top:8px"><label>${_T`Legs, upper (pair)${fSel('arm.legU',armorOpts(a=>a.slot==='leg'&&a.pt==='upper'&&!a.stack),A.legU)}`}</label><label>${_T`Legs, lower (pair)${fSel('arm.legL',armorOpts(a=>a.slot==='leg'&&a.pt==='lower'&&!a.stack),A.legL)}`}</label><div class="chkgrid" style="align-self:end">${fChk('arm.legUp',A.legUp,_T('Padded upper'))}${fChk('arm.legLp',A.legLp,_T('Padded lower'))}</div></div>
    <h4>${_T`Starting purse, favor and hand`}</h4><div class="formgrid"><label>${_T`Coin ${fNum('coin',k.coin,0,8)}`}</label><label>${_T`Arena keys ${fNum('keys',k.keys,0,3)}`}</label><label>${_T`Crowd Favor ${fNum('cf',k.cf||0,0,6)}`}</label>
     <label>${_T`Item 1${fSel('items.0',CLS_ITEM_OPTS,k.items[0])}`}</label><label>${_T`Item 2${fSel('items.1',CLS_ITEM_OPTS,k.items[1])}`}</label><label>${_T`Item 3${fSel('items.2',CLS_ITEM_OPTS,k.items[2])}`}</label></div>
    <h4>${_T`Lore`}</h4><textarea class="tin" data-f="lore" maxlength="400" placeholder="${_T`Who fights this way, and why…`}">${esc(k.lore||'')}</textarea>
    <div class="mbtns"><button class="btn primary" type="button" data-clsa="save" ${over?'disabled':''}>${_T`Save class`}</button>${k.id?`<span class="rc-sub">${_T`used by ${used(k.id).length} character${used(k.id).length===1?'':'s'} — they update when you save`}</span>`:''}</div></div></div>
  <div class="stlist"><h4>${_T`Your classes · ${(CUSTOM.classes||[]).length}`}</h4>${mine?`<div class="list2">${mine}</div>`:`<p class="hint">${_T`None yet. Save one above.`}</p>`}<h4>${_T`Printed classes`}</h4><div class="list2">${base}</div></div>`}
async function classStudioClick(b,redraw){const a=b.dataset.clsa,v=b.dataset.v;
  if(a==='new'){ST.tab='classes';ST.draft=blankClass();redraw();try{$('#mBody').scrollTop=0}catch(e){}return}
  if(a==='fresh'){ST.draft=blankClass();redraw();return}
  if(a==='random'){const k=blankClass();const t=charFromClass({},pickOne(BASE_CLS));Object.assign(k,{R:t.R,L:t.L,arm:t.arm,coin:t.coin,keys:t.keys,abil:pickOne(Object.keys(ABILITIES).filter(a=>!STAT_ABILS.has(a))),weak:pickOne(Object.keys(WEAKNESSES)),cf:Math.floor(Math.random()*3)});
    const pool=CLS_ITEM_OPTS.filter(o=>o[0]).map(o=>o[0]);k.items=[pickOne(pool),Math.random()<.5?pickOne(pool):'',''];for(let i=0;i<4&&classCost(k)>CLS_BUDGET;i++){if(k.items[1])k.items[1]='';else if(k.cf)k.cf--;else if(k.abil!=='none')k.abil='none';else k.L=null}ST.draft=k;redraw();return}
  if(a==='tpl'){const b0=$('#clsTpl')&&$('#clsTpl').value;if(b0){const t=charFromClass({},b0);Object.assign(ST.draft,{R:t.R,L:t.L,arm:t.arm,coin:t.coin,keys:t.keys,abil:t.abil,weak:t.weak,items:[...(CLASSES[b0].items||[]),'','',''].slice(0,3)})}redraw();return}
  if(a==='copybase'){const k=blankClass();const t=charFromClass({},v);Object.assign(k,{name:CLASSES[v].name+' II',hero:CLASSES[v].hero,city:CLASSES[v].city||k.city,color:CLASSES[v].color,R:t.R,L:t.L,arm:t.arm,coin:t.coin,keys:t.keys,abil:t.abil,weak:t.weak,items:[...(CLASSES[v].items||[]),'','',''].slice(0,3),sandbox:classCost({...t,items:CLASSES[v].items||[]})>CLS_BUDGET});
    ST.tab='classes';ST.draft=k;redraw();try{$('#mBody').scrollTop=0}catch(e){}return}
  if(a==='edit'||a==='copy'){const c=(CUSTOM.classes||[]).find(x=>x.id===v);if(!c)return;const k={...JSON.parse(JSON.stringify(c)),_cls:1};if(a==='copy'){k.id=null;k.name=c.name+' II';delete k.created;delete k.from}k.items=[...(k.items||[]),'','',''].slice(0,3);ST.tab='classes';ST.draft=k;redraw();try{$('#mBody').scrollTop=0}catch(e){}return}
  if(a==='del'){const c=(CUSTOM.classes||[]).find(x=>x.id===v);if(!c)return;const us=(CUSTOM.chars||[]).filter(x=>x.classRef==='ccl:'+v);
    if(us.length){mToast(_T`🎭 ${esc(c.name)} is used by ${us.map(x=>esc(x.name)).slice(0,3).join(', ')}${us.length>3?'…':''}. Give them another class first.`);return}
    if(b.dataset.armed!=='1'){b.dataset.armed='1';b.textContent=_T('Confirm delete');return}
    await Store.del('customClasses',v).catch(()=>{});CUSTOM.classes=CUSTOM.classes.filter(x=>x.id!==v);if(ST.draft&&ST.draft.id===v)ST.draft=blankClass();redraw();return}
  if(a==='save'){const k=ST.draft;if(!String(k.name||'').trim())k.name=pickOne(CLS_TYPES);
    if((CUSTOM.classes||[]).some(c=>c.id!==k.id&&c.name.toLowerCase()===String(k.name).trim().toLowerCase())||BASE_CLS.some(b=>CLASSES[b].name.toLowerCase()===String(k.name).trim().toLowerCase())){mToast(_T('🎭 That class name is taken — pick another.'));return}
    if(!k.id)k.id='k'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);k.updated=new Date().toISOString().slice(0,10);if(!k.created)k.created=k.updated;k.custom=true;
    const d=await saveClass(k);const i=CUSTOM.classes.findIndex(x=>x.id===d.id);if(i>=0)CUSTOM.classes[i]=d;else CUSTOM.classes.push(d);CUSTOM.classes.sort((x,y)=>String(x.name).localeCompare(y.name));
    const us=(CUSTOM.chars||[]).filter(x=>x.classRef==='ccl:'+d.id);for(const c of us){applyClassToChar(c);await Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{})}registerCustoms();
    mToast(_T`✓ Saved the class <b>${esc(d.name)}</b>${us.length?_T` — ${us.length} character${us.length===1?'':'s'} updated`:''}`);ST.draft={...JSON.parse(JSON.stringify(d)),_cls:1};redraw();return}}
/* live card and cost while sliders move */
document.addEventListener('input',e=>{if(typeof ST==='undefined'||ST.tab!=='classes'||!ST.draft||!ST.draft._cls)return;const t=e.target;if(!t.dataset||!t.dataset.f)return;
  setTimeout(()=>{try{const cc=$('#clsCost');if(cc)cc.textContent=classCost(ST.draft);const cd=$('#clsCard');if(cd)cd.innerHTML=classCardHTML(ST.draft,'lg')}catch(err){}},0)});
