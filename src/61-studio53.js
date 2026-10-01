/* =====================================================================
   61-STUDIO53 · CLASS CARDS THAT KNOW THEIR FIGHTER, EIGHT NEW CLASSES,
                 THE LANISTA DESIGNER (v0.53)
   =====================================================================
   • Class cards: when a character is shown, the card carries that character's name, portrait and board
     token (in place of the plain body), and every armor line wears its token art.
   • A character fights in its class's colour.
   • Eight system classes (locked, copy to edit) join the nine printed ones: Murmillo, Thraex, Hoplomachus,
     Secutor, Dimachaerus, Sagittarius, Provocator, Crupellarius. Class refs: 'ccp:<key>'.
   • The Classes tab lists your classes with the same button row as every designer, and the system
     classes below with 🔒 System + Copy.
   • 🎩 Lanistas: a Creator Studio designer (Store 'customLanistas'); Manager mode's Create-a-lanista can
     start from one, and can save its lanista back to the Studio.
   • Roster sets can include classes, lanistas and tournaments.
   ===================================================================== */

/* ---------- eight system classes built from the printed pieces (TWEAK freely) ---------- */
/* each armor entry is [armorKey, bodyLocation]; the arm/leg structure is built from it */
const CLASS_PRESET_DEFS=[
  {key:'murmillo',name:'Murmillo',hero:'Marcus Attilius',city:'Roma',color:'#8a5cc0',R:'mace',L:'thracian',armor:[['murmillo','head'],['manica','rarm'],['wraps','larm'],['legwraps','rleg'],['legwraps','lleg']],coin:2,keys:1,cf:0,abil:'dmg',weak:'none',items:[],lore:'The fish-helmed heavy fighter: slow, patient, hard to break.'},
  {key:'thraex',name:'Thraex',hero:'Spiculus',city:'Pompeii',color:'#d4b13c',R:'sica',L:null,armor:[['cassis','head'],['wraps','rarm'],['wraps','larm'],['femoralia','rleg'],['femoralia','lleg']],coin:3,keys:1,cf:1,abil:'mv',weak:'none',items:[],lore:'Curved blade, quick feet, griffin on the helm.'},
  {key:'hoplomachus',name:'Hoplomachus',hero:'Priscus',city:'Capua',color:'#4f7fc4',R:'hasta',L:'pugio',armor:[['galea','head'],['wraps','rarm'],['legwrapsU','rleg'],['legwrapsU','lleg']],coin:3,keys:1,cf:0,abil:'none',weak:'none',items:['c:focus'],lore:'Spear first, dagger when it gets close.'},
  {key:'secutor',name:'Secutor',hero:'Flamma',city:'Syracusae',color:'#5fc7c0',R:'gladius',L:'scutum',armor:[['crista','head'],['balteus','chest'],['wraps','larm']],coin:2,keys:1,cf:0,abil:'none',weak:'noTunnel',items:[],lore:'The chaser: sent after nets and tridents.'},
  {key:'dimachaerus',name:'Dimachaerus',hero:'Tetraites',city:'Nemausus',color:'#dc7a34',R:'falcata',L:'scissor',armor:[['balteus','chest'],['wraps','rarm'],['wraps','larm'],['legwraps','rleg'],['legwraps','lleg']],coin:2,keys:1,cf:1,abil:'none',weak:'none',items:[],lore:'Two blades and no shield: the crowd loves the risk.'},
  {key:'sagittarius',name:'Sagittarius',hero:'Aquila',city:'Puteoli',color:'#4f9a57',R:'bow',L:null,armor:[['pectorale','chest'],['legwrapsU','rleg'],['legwrapsU','lleg']],coin:3,keys:1,cf:0,abil:'none',weak:'none',items:['ap2'],lore:'Keeps the sand between itself and everyone else.'},
  {key:'provocator',name:'Provocator',hero:'Hermes',city:'Verona',color:'#c0433a',R:'gladius',L:'thracian',armor:[['cassis','head'],['provmanica','rarm'],['ocrea','rleg'],['ocrea','lleg']],coin:2,keys:1,cf:0,abil:'cf',weak:'none',items:[],lore:'The challenger: a breastplate’s worth of arm guard and something to prove.'},
  {key:'crupellarius',name:'Crupellarius',hero:'Sacrovir',city:'Lugdunum',color:'#9a8f84',R:'mace',L:null,armor:[['cassis','head'],['lorica','chest'],['spaulder','rarm'],['femoralia','rleg'],['femoralia','lleg']],coin:1,keys:0,cf:0,abil:'none',weak:'tax',items:[],lore:'Iron from head to knee. Heavy, slow, stubborn.'}];
/* armorListToArm: [[key,loc]…] → the arm structure the designers use (same rules as charFromClass) */
function armorListToArm(list){const arm={head:null,chest:null,belt:false,rarm:{upper:null,lower:null,wraps:false,cestus:false},larm:{upper:null,lower:null,wraps:false,cestus:false},legU:null,legUp:false,legL:null,legLp:false};
  for(const [key,loc] of list){const a=ARM[key];if(!a)continue;
    if(a.slot==='head')arm.head=key;else if(a.slot==='chest'){if(a.stack)arm.belt=true;else arm.chest=key}
    else if(a.slot==='arm'){const side=arm[loc];if(a.pt==='upper')side.upper=key;else if(a.pt==='hand')side.cestus=true;else if(a.stack)side.wraps=true;else side.lower=key}
    else{if(a.pt==='upper'){if(a.stack)arm.legUp=true;else arm.legU=key}else{if(a.stack)arm.legLp=true;else arm.legL=key}}}
  return arm}
const CLASS_PRESETS=CLASS_PRESET_DEFS.map(d=>({...d,id:'p_'+d.key,sys:1,arm:armorListToArm(d.armor),items:[...d.items,'','',''].slice(0,3),abilVal:1,abilText:''}));
CLASS_PRESETS.forEach(k=>{k.sandbox=classCost(k)>CLS_BUDGET});
const presetByRef=ref=>ref&&ref.startsWith('ccp:')?CLASS_PRESETS.find(k=>k.key===ref.slice(4)):null;
/* class refs: printed 'cls:', system preset 'ccp:', yours 'ccl:' */
{const baseLoadout=classLoadout;classLoadout=function(ref){const k=presetByRef(ref);if(k)return JSON.parse(JSON.stringify({R:k.R,L:k.L,arm:k.arm,coin:k.coin,keys:k.keys,cf:k.cf,items:k.items.filter(Boolean),abil:k.abil,abilVal:1,weak:k.weak,abilText:'',sandbox:false}));return baseLoadout(ref)}}
{const baseName=classNameOf;classNameOf=function(ref){const k=presetByRef(ref);return k?k.name:baseName(ref)}}
/* classColorOf(ref): the colour a class dresses its fighters in */
function classColorOf(ref){if(!ref)return null;if(ref.startsWith('cls:'))return (CLASSES[ref.slice(4)]||{}).color||null;const k=presetByRef(ref)||(CUSTOM.classes||[]).find(x=>'ccl:'+x.id===ref);return k?k.color:null}
classOpts=function(){return [...BASE_CLS.map(k=>['cls:'+k,`🛡 ${CLASSES[k].name} · printed`]),...CLASS_PRESETS.map(k=>['ccp:'+k.key,`🔒 ${k.name} · system`]),...(CUSTOM.classes||[]).filter(c=>c.status!=='retired'&&c.rolls!==false).map(c=>['ccl:'+c.id,`✦ ${c.name}${c.sandbox?' · sandbox':''}`])]};
/* a character wears its class colour */
{const baseApply=applyClassToChar;applyClassToChar=function(c){const r=baseApply(c);try{const col=classColorOf(c&&c.classRef);if(col)c.color=col}catch(e){}return r}}

/* ---------- the card ---------- */
/* nestSVG: place a standalone <svg> string inside another at x,y with a given size */
function nestSVG(svg,x,y,w,h){return String(svg).replace(/<svg([^>]*)>/,(m,attrs)=>`<svg${attrs.replace(/\s(width|height|x|y|xmlns)="[^"]*"/g,'')} x="${x}" y="${y}" width="${w}" height="${h}">`)}
/* classCardSVG(klass, character?) — character (optional) puts its name, portrait and token on the card */
classCardSVG=function(k,ch){k=k||{};const x=esc;const A=charArmor({arm:k.arm||{}});const groups={};
  for(const [key,loc] of A){const a=ARM[key];if(!a)continue;(groups[key]||(groups[key]={key,a,locs:[]})).locs.push(loc)}
  const armorLines=Object.values(groups).map(g=>{const pair=g.locs.length>1;const where=pair?LOCS_SHORT[g.locs[0]]:LOCN[g.locs[0]];const part=g.a.pt==='upper'?'Upper ':g.a.pt==='lower'&&g.a.slot!=='chest'?'Lower ':'';return {key:g.key,text:`[${g.a.ap} AP] ${part}${where}${pair?' *For each':''}`}});
  const abilText=(k.abilText?k.abilText+': ':'')+(k.abil&&k.abil!=='none'?abilDesc(k.abil,k.abilVal||1):'No class ability')+(k.weak&&k.weak!=='none'&&WEAKNESSES[k.weak]?'. Weakness: '+WEAKNESSES[k.weak][0]:'');
  const weaponLines=[k.R,k.L].filter(Boolean).map(w=>W[w]?`1x LVL ${W[w].lv} “${W[w].n}”`:'').filter(Boolean);
  const startLines=[`[${k.coin||0}x Coin]`];if(k.keys)startLines.push(`${k.keys}x Arena Key`);if(+k.cf)startLines.push(`[${k.cf} CF]`);
  const itemLines=(k.items||[]).filter(Boolean).map(i=>{const o=CLS_ITEM_OPTS.find(z=>z[0]===i);return o?o[1].replace(/ \((card)\)$/,' card'):i});
  const sections=[['Armors:',armorLines.length?armorLines:[{text:'none'}]],['Ability:',clsWrap(abilText,30).map(t=>({text:t}))],['Weapons:',(weaponLines.length?weaponLines:['fists']).map(t=>({text:t}))],['Starting Items:',startLines.map(t=>({text:t}))],...(itemLines.length?[['Unique Starting Items:',itemLines.flatMap(u=>clsWrap('1x '+u,30)).map(t=>({text:t}))]]:[])];
  const lineCount=sections.reduce((s,[,l])=>s+1+l.length,0);const fs=Math.max(7.6,Math.min(10.6,232/(lineCount*1.28)));const lh=fs*1.28;
  let y=74+fs,body='';
  for(const [head,lines] of sections){body+=`<text x="14" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" font-weight="700" fill="#2a1d12" text-decoration="underline">${x(head)}</text>`;y+=lh;
    for(const l of lines){const icon=l.key&&typeof armSVG==='function'?nestSVG(armSVG(l.key),15,(y-fs*0.95).toFixed(1),fs*1.15,fs*1.15):'';
      body+=`${icon}<text x="${l.key?16+fs*1.3:16}" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" fill="#2a1d12">${x(l.text)}</text>`;y+=lh}y+=lh*0.22}
  const title=String(k.name||'Class').toUpperCase();const ts=title.length>12?Math.max(11,19-(title.length-12)*0.9):19;const col=k.color||'#b0271c';
  /* v0.54: the figure is the character's board token; a printed class shows its own token; otherwise a marked placeholder */
  const figure=ch&&typeof figureSVG==='function'&&typeof tokenOfChar==='function'?nestSVG(figureSVG(tokenOfChar(ch)),176,78,112,190)
    :k.sysKey&&typeof figureSVG==='function'&&typeof tokenForCls==='function'?nestSVG(figureSVG(tokenForCls(k.sysKey)),176,78,112,190)
    :`<rect x="184" y="92" width="96" height="180" rx="10" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"/><text x="232" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6a5a44">The token of</text><text x="232" y="184" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6a5a44">the character</text><text x="232" y="198" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6a5a44">who takes</text><text x="232" y="212" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6a5a44">this class</text>`;
  const face=ch&&ch.portrait?`<clipPath id="ccp${k.id||'x'}"><rect x="13" y="13" width="30" height="44" rx="4"/></clipPath><g clip-path="url(#ccp${k.id||'x'})">${nestSVG(portraitSVG(ch.portrait,col),13,13,30,44)}</g><rect x="13" y="13" width="30" height="44" rx="4" fill="none" stroke="#3a2a1a"/>`:`<circle cx="24" cy="35" r="7" fill="${col}" stroke="#3a2a1a"/>`;
  return `<svg viewBox="0 0 300 324" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${x(k.name||'Class')} class card"><rect width="300" height="324" rx="10" fill="${shade(col,-0.55)}"/><rect x="5" y="5" width="290" height="314" rx="7" fill="#efe3c6" stroke="${col}" stroke-width="2"/>
   <rect x="10" y="10" width="280" height="50" rx="4" fill="#e3d0a4" stroke="#3a2a1a" stroke-width="1.2"/>${face}<text x="${ch?48:34}" y="33" font-family="Georgia,serif" font-size="7.5" fill="#3a2a1a">${x(String(k.city||'').toUpperCase().slice(0,12))}</text>
   <text x="158" y="32" text-anchor="middle" font-family="Georgia,serif" font-size="${ts.toFixed(1)}" font-weight="700" fill="${col}" stroke="#3a1a10" stroke-width="0.5" letter-spacing="1">${x(title)}</text>
   <text x="158" y="50" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#2a1d12">${x(ch?ch.name:k.sysKey?(k.hero||''):'— its champion —')}</text>
   ${figure}${body}${k.sandbox?'<text x="150" y="314" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" fill="#8a2a20">sandbox build</text>':''}</svg>`};
/* classCardHTML(ref|class, size, character?) */
classCardHTML=function(ref,size='sm',ch){const w=CLS_SZ[size]||130;const wrap=svg=>`<span class="clscard" style="display:inline-block;width:${w}px;line-height:0">${svg}</span>`;
  if(ref&&typeof ref==='object')return wrap(classCardSVG(ref,ch));ref=ref==null?'':String(ref);
  if(ref.startsWith('cls:'))return `<span style="display:inline-block;width:${w}px">${cardHTML('k:'+ref.slice(4),size==='xs'?'sm':size==='sm'?'md':'lg')}</span>`;
  const k=presetByRef(ref)||(ref.startsWith('ccl:')?(CUSTOM.classes||[]).find(c=>c.id===ref.slice(4)):null);return wrap(classCardSVG(k||{},ch))};
/* the character designer's picker shows the card as this character */
{const basePick=charClassPickHTML;charClassPickHTML=function(c){let h=basePick(c);try{const ref=c.classRef||'cls:soldier';if(!ref.startsWith('cls:'))h=h.replace(/<span class="clscard"[\s\S]*?<\/svg><\/span>/,classCardHTML(ref,'md',c));
    if(ref.startsWith('ccp:'))h=h.replace(/<button class="btn tksm" type="button" data-clsa="edit"[^>]*>✎ Edit this class<\/button>/,`<button class="btn tksm" type="button" data-clsa="copypreset" data-v="${esc(ref.slice(4))}">⧉ Copy into a new class</button>`)}catch(e){console.error(e)}return h}}
/* the character's own colour picker gives way to the class colour */
{const baseEd=charEditorHTML;charEditorHTML=function(){let h=baseEd();return h.replace(/<label>Color<input type="color" class="tin" data-f="color"[^>]*><\/label>/,'')}}

/* ---------- the Classes tab lists: your classes with the common button row, system classes below ---------- */
CR_KINDS.cl={list:()=>CUSTOM.classes||[],set:v=>{CUSTOM.classes=v},store:'customClasses',nm:'classes',rolls:'the character designer',
  on:x=>x.rolls!==false,toggle:x=>{x.rolls=x.rolls===false},edit:x=>{ST.tab='classes';ST.draft={...JSON.parse(JSON.stringify(x)),_cls:1};ST.draft.items=[...(ST.draft.items||[]),'','',''].slice(0,3)}};
{const baseStudio=classStudioHTML;classStudioHTML=function(){let h=baseStudio();try{
  const used=id=>(CUSTOM.chars||[]).filter(c=>c.classRef==='ccl:'+id).length;
  const mine=(CUSTOM.classes||[]).map(c=>`<div class="lrow" style="--pc:${esc(c.color||'#c9a44a')}">${classCardHTML('ccl:'+c.id,'xs')}<div class="t"><b>${esc(c.name)}</b> ${c.sandbox?customTag({sandbox:1}):''}<small>${c.abil&&c.abil!=='none'?esc(ABILITIES[c.abil][0]):'no ability'} · ${[c.R,c.L].filter(Boolean).map(w=>W[w]?W[w].n:w).join(' & ')||'fists'} · ${c.coin||0} coin${+c.cf?` · ${c.cf} CF`:''} · used by ${used(c.id)}</small></div>${crActs('cl',c)}</div>`).join('');
  const printed=BASE_CLS.map(b=>`<div class="lrow" style="--pc:${CLASSES[b].color}">${classCardHTML('cls:'+b,'xs')}<div class="t"><b>${esc(CLASSES[b].name)}</b><small>printed · ${esc(CLASSES[b].sub)}</small></div>${sysActs(`data-clsa="copybase" data-v="${b}"`)}</div>`).join('');
  const presets=CLASS_PRESETS.map(k=>`<div class="lrow" style="--pc:${k.color}">${classCardHTML(k,'xs')}<div class="t"><b>${esc(k.name)}</b><small>${esc(k.lore)}</small></div>${sysActs(`data-clsa="copypreset" data-v="${k.key}"`)}</div>`).join('');
  h=h.replace(/<div class="stlist"><h4>Your classes[\s\S]*$/,`<div class="stlist"><h4>Your classes · ${(CUSTOM.classes||[]).length}</h4>${mine?`<div class="list2 onecol">${mine}</div>`:'<p class="hint">None yet — save one above, or copy a system class.</p>'}<h4>System classes · ${BASE_CLS.length+CLASS_PRESETS.length}</h4><div class="list2 onecol">${printed}${presets}</div></div>`)}catch(e){console.error(e)}return h}}
{const baseClick=classStudioClick;classStudioClick=async function(b,redraw){if(b.dataset.clsa==='copypreset'){const p=CLASS_PRESETS.find(k=>k.key===b.dataset.v);if(!p)return;const k={...JSON.parse(JSON.stringify(p)),_cls:1,id:null,sys:0,name:p.name+' II'};delete k.key;ST.tab='classes';ST.draft=k;redraw();try{$('#mBody').scrollTop=0}catch(e){}return}return baseClick(b,redraw)}}
/* the studio's lock button for a class goes through crClick (it keys on data-cr) — nothing else needed */

/* ---------- 🎩 the Lanista designer ---------- */
CUSTOM.lanistas=CUSTOM.lanistas||[];
{const baseLoad=loadCustoms;loadCustoms=async function(){const r=await baseLoad.apply(this,arguments);try{CUSTOM.lanistas=(await Store.list('customLanistas')).sort((a,b)=>String(a.name).localeCompare(String(b.name)))}catch(e){CUSTOM.lanistas=CUSTOM.lanistas||[]}return r}}
if(typeof SAVE_COLS!=='undefined'&&!SAVE_COLS.includes('customLanistas'))SAVE_COLS.push('customLanistas');
function blankLanista(){return {id:null,name:genName(),ludus:'Ludus '+pickOne(NAMEBANK.cog),city:pickOne(HOME_CITIES()),color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),portrait:randomPortrait(),nick:'',bio:'',p:{...MGR_PRESETS.balanced[1]}}}
CR_KINDS.ln={list:()=>CUSTOM.lanistas||[],set:v=>{CUSTOM.lanistas=v},store:'customLanistas',nm:'lanistas',rolls:'Manager mode’s lanista picker',
  on:x=>x.rolls!==false,toggle:x=>{x.rolls=x.rolls===false},edit:x=>{ST.lnd=JSON.parse(JSON.stringify(x))}};
function lanistaStudioHTML(){const d=ST.lnd||(ST.lnd=blankLanista());
  const list=(CUSTOM.lanistas||[]).map(x=>`<div class="lrow" style="--pc:${esc(x.color)}">${portraitHTML({name:x.name,portrait:x.portrait,color:x.color},'sm')}<div class="t"><b>${esc(x.name)}</b>${x.nick?` <i>“${esc(x.nick)}”</i>`:''}<small>${esc(x.ludus)} · ${esc(x.city)}</small></div>${crActs('ln',x)}</div>`).join('');
  const sys=MGR_PRE.map(t=>`<div class="lrow" style="--pc:${t.color}"><div class="t"><b>${esc(t.name)}</b><small>${esc(t.ludus)} · ${esc(t.city)} · ${esc(t.bio||'')}</small></div>${sysActs(`data-lna="copysys" data-v="${t.key}"`)}</div>`).join('');
  return `<p>Design a <b>lanista</b>: the face, the house and the temperament. Manager mode’s <b>Create your lanista</b> can start from any lanista on the rolls.</p>
  <div class="setup-grid" style="grid-template-columns:minmax(0,300px) minmax(0,1fr)"><div><div class="mbtns" style="margin:0 0 8px;justify-content:center"><button class="btn primary" type="button" data-lna="new">✚ New lanista</button><button class="btn" type="button" data-lna="rlook">🎲 Random look</button></div>
    <div id="lnPortrait" style="display:flex;justify-content:center">${portraitHTML({name:d.name,portrait:d.portrait,color:d.color},'lg')}</div>${portraitControlsHTML(d.portrait,'data-lnpt')}</div>
   <div><div class="formgrid"><label>Name<input class="tin" data-lnf="name" value="${esc(d.name)}" maxlength="28"></label><label>Epithet<span style="display:flex;gap:4px"><input class="tin" data-lnf="nick" value="${esc(d.nick||'')}" maxlength="30"><button type="button" class="btn" data-lna="nick" style="padding:4px 8px" aria-label="Generate an epithet">🎲</button></span></label>
     <label>Ludus name<input class="tin" data-lnf="ludus" value="${esc(d.ludus)}" maxlength="32"></label><label>Home city<select class="tin" data-lnf="city">${HOME_CITIES().map(c=>`<option ${c===d.city?'selected':''}>${esc(c)}</option>`).join('')}</select></label>
     <label>Color<input type="color" class="tin" data-lnf="color" value="${esc(d.color)}" style="height:34px;padding:2px"></label></div>
    <h4>Personality</h4><div class="presets">${Object.entries(MGR_PRESETS).map(([k,[n]])=>`<button type="button" class="preset" data-lna="pre" data-v="${k}">${esc(n)}</button>`).join('')}</div>
    <div class="perswrap" style="margin-top:8px">${MGR_KEYS.map(([k,l,desc])=>`<label class="slider" title="${esc(desc)}"><span>${l}</span><input type="range" min="1" max="100" data-lnp="${k}" value="${d.p[k]}"><output>${d.p[k]}</output></label>`).join('')}</div>
    <h4>Story</h4><textarea class="tin" data-lnf="bio" maxlength="600">${esc(d.bio||'')}</textarea><div class="mbtns" style="margin-top:4px"><button class="btn tksm" type="button" data-lna="bio">🎲 Write a story</button></div>
    <div class="mbtns"><button class="btn primary" type="button" data-lna="save">Save lanista</button></div></div></div>
  <div class="stlist"><h4>Your lanistas · ${(CUSTOM.lanistas||[]).length}</h4>${list?`<div class="list2 onecol">${list}</div>`:'<p class="hint">None yet.</p>'}<h4>System lanistas · ${MGR_PRE.length}</h4><div class="list2 onecol">${sys}</div></div>`}
function lnRefreshFace(){const box=$('#lnPortrait');if(box&&ST.lnd)box.innerHTML=portraitHTML({name:ST.lnd.name,portrait:ST.lnd.portrait,color:ST.lnd.color},'lg')}
async function lanistaStudioClick(b,redraw){const a=b.dataset.lna,d=ST.lnd||(ST.lnd=blankLanista());
  if(a==='new'){ST.lnd=blankLanista();return redraw()}
  if(a==='rlook'){d.portrait=randomPortrait(d.portrait&&d.portrait.fem);return redraw()}
  if(a==='nick'){d.nick=genNickname();return redraw()}
  if(a==='bio'){d.bio=lanistaStory(d.name,d.city);return redraw()}
  if(a==='pre'){const P=MGR_PRESETS[b.dataset.v];if(P)d.p={...P[1]};return redraw()}
  if(a==='copysys'){const t=MGR_PRE.find(x=>x.key===b.dataset.v);if(!t)return;ST.lnd={...blankLanista(),name:t.name+' II',ludus:t.ludus,city:HOME_CITIES().includes(t.city)?t.city:HOME_CITIES()[0],color:t.color,bio:t.bio||'',p:{...t.p}};return redraw()}
  if(a==='save'){if(!String(d.name||'').trim())d.name=genName();const now=new Date().toISOString().slice(0,10);if(!d.id){d.id='ln'+Date.now().toString(36);d.created=now}d.updated=now;
    const copy=JSON.parse(JSON.stringify(d));CUSTOM.lanistas=[...(CUSTOM.lanistas||[]).filter(x=>x.id!==d.id),copy].sort((x,y)=>String(x.name).localeCompare(String(y.name)));await Store.put('customLanistas',d.id,copy).catch(()=>{});
    mToast(`✓ Saved the lanista <b>${esc(d.name)}</b>`);return redraw()}}
/* wiring: tab list + renderer live in 15-custom/32-rail; clicks and inputs here */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lna]');if(!b||typeof ST==='undefined'||ST.tab!=='lanistas')return;e.stopPropagation();lanistaStudioClick(b,()=>{const st=$('#studio'),box=$('#mBody');if(!st)return;const sc=box.scrollTop;st.innerHTML=studioHTML();box.scrollTop=sc})},true);
document.addEventListener('input',e=>{const t=e.target;if(typeof ST==='undefined'||ST.tab!=='lanistas'||!ST.lnd||!t.dataset)return;
  if(t.dataset.lnf){ST.lnd[t.dataset.lnf]=t.value;if(t.dataset.lnf==='color'||t.dataset.lnf==='name')lnRefreshFace()}
  if(t.dataset.lnp){ST.lnd.p[t.dataset.lnp]=+t.value;if(t.nextElementSibling)t.nextElementSibling.textContent=t.value}});
document.addEventListener('change',e=>{const t=e.target;if(typeof ST==='undefined'||ST.tab!=='lanistas'||!ST.lnd||!t.dataset||!t.dataset.lnpt)return;
  const f=t.dataset.lnpt;const P=ST.lnd.portrait=ST.lnd.portrait||{};let v=t.value;if(f==='fem'||f==='smile')v=v==='1';if(f==='bs')P.beard=false;if(f==='hs')P.long=false;if(f==='mark'){P.scar=false;P.paint=false}P[f]=v;lnRefreshFace()});

/* ---------- Manager mode: start from a Studio lanista, or save yours to the Studio ---------- */
function lanistasForPicker(){const all=(CUSTOM.lanistas||[]).filter(x=>x.rolls!==false);const R=NEWMGR&&NEWMGR.roster&&typeof rosterById==='function'?rosterById(NEWMGR.roster):null;const pick=R&&R.sel&&R.sel.lanistas;return pick&&pick.length?all.filter(x=>pick.includes(x.id)):all}
{const baseStart=startHTML;startHTML=function(){let h=baseStart.apply(this,arguments);try{if(MGR.view==='create'&&NEWMGR&&!NEWMGR.takeKey){const L=lanistasForPicker();
    const row=`<div class="card2" style="margin:0 0 8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><b>🎩 Studio lanistas</b>${L.length?`<select class="tin" data-nmlan="1" style="width:auto"><option value="">— start from one —</option>${L.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}${x.nick?' “'+esc(x.nick)+'”':''}</option>`).join('')}</select>`:'<span class="rc-sub">none yet — design them in the Creator Studio</span>'}<button class="btn tksm" type="button" data-nmxa="savelan">💾 Save this lanista to the Studio</button></div>`;
    h=h.replace('<div class="formgrid"><label>Name<span',row+'<div class="formgrid"><label>Name<span')}}catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.nmlan||!t.value||typeof NEWMGR==='undefined'||!NEWMGR)return;const x=(CUSTOM.lanistas||[]).find(l=>l.id===t.value);if(!x)return;
  Object.assign(NEWMGR,{lanId:x.id,name:x.name,ludus:x.ludus,color:x.color,portrait:JSON.parse(JSON.stringify(x.portrait||{})),nick:x.nick||'',bio:x.bio||'',p:{...x.p}});if(HOME_CITIES().includes(x.city))NEWMGR.city=x.city;if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-nmxa="savelan"]');if(!b||typeof NEWMGR==='undefined'||!NEWMGR)return;
  const same=(CUSTOM.lanistas||[]).find(l=>l.id===NEWMGR.lanId||(l.name===NEWMGR.name&&l.ludus===NEWMGR.ludus));
  const x={...(same||{}),id:same?same.id:'ln'+Date.now().toString(36),name:NEWMGR.name,ludus:NEWMGR.ludus,city:NEWMGR.city,color:NEWMGR.color,portrait:JSON.parse(JSON.stringify(NEWMGR.portrait||{})),nick:NEWMGR.nick||'',bio:NEWMGR.bio||'',p:{...NEWMGR.p},created:(same&&same.created)||new Date().toISOString().slice(0,10),updated:new Date().toISOString().slice(0,10)};
  NEWMGR.lanId=x.id;CUSTOM.lanistas=[...(CUSTOM.lanistas||[]).filter(l=>l.id!==x.id),x];await Store.put('customLanistas',x.id,x).catch(()=>{});mToast(`🎩 <b>${esc(x.name)}</b> is saved in the Creator Studio`)},true);

/* ---------- roster sets know the new designers ---------- */
for(const k of [['classes','🎭 Classes'],['lanistas','🎩 Lanistas'],['tourneys','🏆 Tournaments']])if(!RS_KINDS.some(r=>r[0]===k[0]))RS_KINDS.push(k);
{const baseItems=rsItems;rsItems=function(kind){if(kind==='classes'){return {sys:[...BASE_CLS.map(k=>[k,CLASSES[k].name]),...CLASS_PRESETS.map(k=>['ccp:'+k.key,k.name])],mine:(CUSTOM.classes||[]).map(c=>[c.id,c.name,''])}}
  if(kind==='lanistas')return {sys:MGR_PRE.map(t=>[t.key,t.name]),mine:(CUSTOM.lanistas||[]).map(x=>[x.id,x.name,portraitHTML({name:x.name,portrait:x.portrait,color:x.color},'xs')])};
  if(kind==='tourneys')return {sys:(typeof SYS_TOURNEYS!=='undefined'?SYS_TOURNEYS:[]).map(t=>[t.id,t.name]),mine:(CUSTOM.tourneys||[]).map(t=>[t.id,t.name,'🏆'])};
  return baseItems(kind)}}
