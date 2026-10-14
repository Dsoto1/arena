/* v0.93 i18n hardening (phase 1): PSEUDOLOCALIZATION + the key checks.
   A A fake language: every key the page knows (every _T key in src/, the 01-head static text, the server texts, the Spanish pack's keys)
     becomes "[!! Ŧéxŧ !!]" (accented letters, markers, {n} placeholders and HTML tags kept). It is handed to the page as its language
     pack (window.LANG_PACK, LANG 'es' slot — the real lang_es.js write is ignored), so anything still in plain English on screen never
     went through _T (or is built from English pieces).
   B The walk: main menu → Play Now (setup + a turn: Coin, End turn) → Settings → Rules & strategy → Manager tabs → Studio → Online (mock).
     On each screen: LEFTOVER ENGLISH (visible text lines with 2+ plain English stop words — pseudo words are accented, so translated text
     never counts) and CUT-OFF text (buttons / chips / tabs whose text overflows — the markers make every string ~8 characters longer,
     like a real translation). Both stay under ceilings (PSEUDO_LEFT_MAX / PSEUDO_CUT_MAX); misses (runtime keys absent from the pack)
     are counted. No page errors; the 00c error log gains nothing but the expected.
   C tools/i18n/check93.js across every language: missing keys, unused keys, broken {n} placeholders — within its ceilings.
   REPORT=<file> writes the lists. */
const path=require('path'),fs=require('fs'),vm=require('vm'),{execSync,spawnSync}=require('child_process');const REPORT=process.env.REPORT||'';
const ROOT=path.resolve(__dirname,'..','..');
const {chromium}=require('playwright');(async()=>{const URL0='file://'+path.resolve(process.argv[2]);
const T0=Date.now();const LG=(...a)=>{if(process.env.DBG)console.error('['+((Date.now()-T0)/1000|0)+'s]',...a)};const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};

/* ── A · the pseudo pack ── */
const keys=new Set();
{const sb={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'assets/lang_es.js'),'utf8'),sb);for(const k of Object.keys(sb.window.LANG_PACK.d))keys.add(k);out.srvPat=sb.window.LANG_PACK.s||[]}
for(const o of JSON.parse(execSync('node '+JSON.stringify(path.join(ROOT,'tools/i18n/keys.js')),{maxBuffer:1<<28}).toString()).keys)keys.add(o.k);
try{for(const k of Object.values(JSON.parse(fs.readFileSync(path.join(ROOT,'server/src/texts93.json'),'utf8'))))keys.add(k)}catch(e){}
const ACC={a:'á',e:'é',i:'í',o:'ó',u:'ú',c:'ç',n:'ñ',y:'ý',s:'š',z:'ž',A:'Á',E:'É',I:'Í',O:'Ó',U:'Ú',C:'Ç',N:'Ñ',Y:'Ý',S:'Š',Z:'Ž'};
/* letters only outside tags, entities and placeholders */
const pseudo=k=>'[!! '+k.split(/(<[^>]*>|&[#\w]+;|\{\d+(?:\|[^{}]*)?\})/).map((p,i)=>i%2?p:p.replace(/[A-Za-z]/g,ch=>ACC[ch]||ch)).join('')+' !!]';
const D={};for(const k of keys)D[k]=pseudo(k);
const PACK={l:'es',d:D,s:out.srvPat.filter(k=>keys.has(k))};out.pack=Object.keys(D).length;
/* a sanity check of the transform itself */
ok(pseudo('Pay {0} coin <b>now</b> {1|is|are} &amp; go')==='[!! Páý {0} çóíñ <b>ñóẃ</b> {1|is|are} &amp; gó !!]'.replace('ẃ','w'),'A: the pseudo transform keeps {n}, tags, entities: '+pseudo('Pay {0} coin <b>now</b> {1|is|are} &amp; go'));

const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1300,height:900},locale:'en-US'});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(P=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');
  localStorage.setItem('flavius_lang','es');localStorage.setItem('flavius_langask86','1');
  /* the pseudo pack wins over the real lang_es.js the loader writes */
  try{Object.defineProperty(window,'LANG_PACK',{get:()=>P,set:()=>{},configurable:false})}catch(e){}},PACK);
const P=await ctx.newPage();P.on('pageerror',e=>errs.push('page: '+e.message+' '+(e.stack||'').split('\n')[1]));
await P.goto(URL0,{timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000}).catch(()=>{});await P.waitForTimeout(1200);
out.lang=await P.evaluate(()=>({LANG,dict:!!LANG_DICT,html:document.documentElement.lang,n:LANG_DICT?Object.keys(LANG_DICT).length:0,t:_T('Settings')}));
ok(out.lang.LANG==='es'&&out.lang.dict&&out.lang.n===out.pack&&/^\[!! /.test(out.lang.t),'A: the page runs on the pseudo pack '+JSON.stringify(out.lang));
const err0=await P.evaluate(()=>ERR92.n);

/* ── B · the walk ── */
const sweep=async(where)=>P.evaluate(where=>{
  const EN=new Set('the and your you of to with for is are an his her their this that it on in at by from or not be will can has have was were when who what which each every one more no all only than then there they them out up into over after before'.split(' '));
  const vis=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const left=new Map();let n,tot=0;
  while((n=w.nextNode())){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/.test(p.tagName)||p.closest('[translate="no"],svg'))continue;
    const t=n.data.replace(/\s+/g,' ').trim();if(t.length<8||!/[a-z]{3}/.test(t))continue;if(!vis(p))continue;tot++;
    /* what is left outside the pseudo spans (innermost first; a span split over elements: before a lone close / after a lone open) */
    let u=t;for(let k=0;k<6&&/\[!![^[\]]*?!!\]/.test(u);k++)u=u.replace(/\[!![^[\]]*?!!\]/g,' ');u=u.replace(/^[^[]*!!\]/,' ').replace(/\[!![\s\S]*$/,' ');
    /* names stay English by design: "The Storm of Cyrene", "Umbra of Germania", "Darling of the Stands" */
    u=u.replace(/\b(?:The |the )?[A-Z][\w'’-]+(?: (?:of|the|de|in|and) (?:the )?[A-Z][\w'’-]+)+/g,' ').replace(/\bThe [A-Z][\w'’-]+/g,' ');
    /* plain ASCII words only: a pseudo word carries accents */
    const ws=u.toLowerCase().match(/[a-z']+/g)||[];const en=ws.filter(x=>EN.has(x)).length;
    if(en>=2)left.set(t.slice(0,90),(left.get(t.slice(0,90))||0)+1)}
  const cut=[...document.querySelectorAll('button,.btn,.chip,.badge,.tabs button,.mtabs button,[data-tab],.ptpill')].filter(el=>vis(el)&&getComputedStyle(el).overflow!=='visible'&&(el.scrollWidth>el.clientWidth+2)).slice(0,30).map(el=>el.textContent.replace(/\s+/g,' ').trim().slice(0,40));
  return {where,tot,left:[...left.keys()],cut}},where);
const C={left:[],cut:[],tot:0,where:{}};const add=r=>{C.tot+=r.tot;C.where[r.where]=(C.where[r.where]||0)+r.left.length;for(const x of r.left)C.left.push(r.where+' | '+x);for(const x of r.cut)C.cut.push(r.where+' | '+x)};
const closeAll=async()=>{for(let i=0;i<6;i++){const m=await P.evaluate(()=>!!CUR_MODAL&&!document.getElementById('modal').hidden);if(!m)break;await P.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await P.waitForTimeout(350)}};
const step=async(n,fn)=>{try{await fn();return true}catch(e){errs.push('B step '+n+': '+e.message.split('\n')[0]);return false}};
await P.waitForFunction(()=>{const m=document.getElementById('mainMenu');return !!m&&!m.hidden},null,{timeout:60000}).catch(()=>{});
/* the detector itself: a plain English line is caught, a name and a translated line are not */
await P.evaluate(()=>{const d=document.createElement('div');d.id='t93probe';d.style.cssText='position:fixed;left:0;top:0;z-index:999999;background:#000;color:#fff';
  d.innerHTML=`<p>This line never went through the dictionary and it shows.</p><p>The Storm of Cyrene</p><p>${_T('Settings')} · ${_T('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.')}</p>`;document.body.appendChild(d)});
out.probe=(await sweep('probe')).left;await P.evaluate(()=>document.getElementById('t93probe').remove());
ok(out.probe.length===1&&/^This line/.test(out.probe[0]),'B: the detector catches plain English only '+JSON.stringify(out.probe));
add(await sweep('menu'));
LG('play');out.play=await step('play',async()=>{await P.click('#mainMenu [data-mm="play"]');await P.waitForTimeout(1200);add(await sweep('playnow-menu'));await P.click('[data-mi="0"]');await P.waitForTimeout(1800);add(await sweep('setup'));await P.click('#goBtn')});
let turn=false;for(let i=0,T_=Date.now();Date.now()-T_<90000&&!turn;i++){await P.waitForTimeout(500);const st=await P.evaluate(()=>({m:!!CUR_MODAL&&!document.getElementById('modal').hidden,h:typeof humanTurn==='function'&&humanTurn()&&S.phase}));
  if(st.m){if(i===2)add(await sweep('briefing'));await P.evaluate(()=>{const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');if(b)b.click()})}else if(st.h==='choice')turn=true}
out.turn=turn;
if(turn){add(await sweep('arena'));const t0=await P.evaluate(()=>({who:S.turn,n:S.turnNo}));let swept=false;
  const answer=async(done,ms)=>{for(const t1=Date.now();Date.now()-t1<ms;){if(await P.evaluate(done,t0))return true;const m=await P.evaluate(()=>!!CUR_MODAL&&!document.getElementById('modal').hidden);
      if(m){if(!swept){swept=true;add(await sweep('turn-window'))}await P.evaluate(()=>{const b=document.querySelector('#mBtns button');if(b)b.click()})}await P.waitForTimeout(300)}return false};
  const press=async(n,sel,done)=>{let k=false;for(const t1=Date.now();Date.now()-t1<60000&&!k;){if(await P.evaluate(s=>!!document.querySelector(s)&&!S.busy,sel))await P.click(sel,{force:true,timeout:5000}).catch(()=>{});k=await answer(done,4000)}if(!k)errs.push('B step '+n+': the phase never moved');return k};
  await press('coin','#actions [data-act="coin"]',()=>S.phase!=='choice'&&!S.busy&&!CUR_MODAL);
  await press('end','#actions [data-act="end"]',t0=>S.turnNo!==t0.n||S.turn!==t0.who);await closeAll();add(await sweep('arena-after'))}
await P.evaluate(()=>{S.over=true});await closeAll();
LG('settings');out.set=await step('settings',async()=>{await P.evaluate(()=>{menuHide();openSettings()});await P.waitForTimeout(900);add(await sweep('settings'))});await closeAll();
LG('rules');out.rules=await step('rules',async()=>{await P.evaluate(()=>{showRules()});await P.waitForTimeout(900);add(await sweep('rules'))});await closeAll();
LG('manager');out.mgr=await step('manager',async()=>{await P.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();MM.fromMenu=true;openManager();await W8(900);if(!W_()){newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null}});
  for(const t of ['ludus','roster','recruit','practice','infirm','night','board','league','sched','trophy']){await P.evaluate(t=>{MGR.tab=t;MGR_REDRAW()},t);await P.waitForTimeout(500);add(await sweep('mgr-'+t))}});
await closeAll();
LG('studio');out.studio=await step('studio',async()=>{await P.evaluate(()=>{menuShow()});await P.waitForTimeout(500);await P.click('#mainMenu [data-mm="studio"]');await P.waitForTimeout(2000);add(await sweep('studio'));
  const tabs=await P.$$('#mBody [data-sttab]');for(const t of tabs.slice(0,6)){await t.click().catch(()=>{});await P.waitForTimeout(400);add(await sweep('studio-tab'))}});
await closeAll();
LG('online');out.onl=await step('online',async()=>{await P.evaluate(()=>{menuShow()});await P.waitForTimeout(400);await P.evaluate(()=>{if(typeof onlineOpen==='function')onlineOpen()});await P.waitForTimeout(2500);add(await sweep('online'));
  /* a refusal from the (mock) server reaches the player in the player's language, never raw */
  out.onlErr=await P.evaluate(async()=>{const r={};try{await NET.req('char.active',{char:'nobody'})}catch(e){r.m=e.message}
    try{await NET.req('no.such.route')}catch(e){r.u=e.message}r.code=srvText93(Object.keys(SRV_TEXT93).find(k=>SRV_TEXT93[k]==='The treasury needs {0} coin.'),['7']);r.raw=errText92(new TypeError('x is not a function'));return r})});
await closeAll();
out.missN=await P.evaluate(()=>LANG_MISS.size);out.missTop=await P.evaluate(()=>[...LANG_MISS.keys()].slice(0,40));
out.errlog=await P.evaluate(n=>errNew92(n).map(e=>e.kind+': '+e.msg).slice(0,10),err0);
const leftU=[...new Set(C.left)],cutU=[...new Set(C.cut)];out.c={texts:C.tot,left:leftU.length,cut:cutU.length,miss:out.missN,where:C.where};
ok(out.play&&out.turn,'B: Play Now → a turn played in the pseudo language');ok(out.set&&out.rules&&out.mgr&&out.studio&&out.onl,'B: Settings, Rules, Manager, Studio, Online open');
ok(out.onlErr&&/^\[!! /.test(out.onlErr.m||'')&&/^\[!! /.test(out.onlErr.u||'')&&/^\[!! .*7/.test(out.onlErr.code||'')&&/E-[0-9A-Z]{4}/.test(out.onlErr.raw||'')&&!/function/.test(out.onlErr.raw||'')&&!/no\.such/.test(out.onlErr.u||''),'B: online refusals, coded server texts and raw errors all arrive translated, never raw '+JSON.stringify(out.onlErr));
const LEFT_MAX=+(process.env.PSEUDO_LEFT_MAX||30),CUT_MAX=+(process.env.PSEUDO_CUT_MAX||20),MISS_MAX=+(process.env.PSEUDO_MISS_MAX||60);
ok(leftU.length<=LEFT_MAX,`B: lines still in English ${leftU.length} ≤ ${LEFT_MAX}: `+leftU.slice(0,6).join(' ‖ '));
ok(cutU.length<=CUT_MAX,`B: cut-off texts ${cutU.length} ≤ ${CUT_MAX}: `+cutU.slice(0,6).join(' ‖ '));
ok(out.missN<=MISS_MAX,`B: runtime keys absent from the pack ${out.missN} ≤ ${MISS_MAX}: `+out.missTop.slice(0,6).join(' ‖ '));
await b.close();

/* ── C · every language's parts ── */
LG('check93');const r=spawnSync(process.execPath,[path.join(ROOT,'tools/i18n/check93.js'),'--json'],{encoding:'utf8',maxBuffer:1<<26});let K={};try{K=JSON.parse(r.stdout)}catch(e){errs.push('check93: '+(r.stderr||'').slice(0,200))}
out.k={keys:K.keys,langs:Object.fromEntries(Object.entries(K.langs||{}).map(([L,o])=>[L,[o.missing,o.unused,o.broken]]))};
ok(r.status===0&&K.over&&!K.over.length,'C: missing / unused / broken placeholders within the ceilings: '+JSON.stringify(K.over||r.stderr));
if(REPORT)fs.writeFileSync(REPORT,JSON.stringify({out,left:leftU,cut:cutU,miss:out.missTop,check:K},null,1));
console.log(JSON.stringify({pack:out.pack,c:out.c,k:out.k,errlog:out.errlog}).slice(0,1800));
console.log('ERRS',JSON.stringify(errs.slice(0,10)));console.log('MISS',JSON.stringify(miss));
process.exit(errs.length||miss.length?1:0)})();
