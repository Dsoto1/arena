/* v0.89 J — online ARMOR AFFIXES II + the Ranked stone rule + the ⓘ odds card, through the MOCK (two windows):
   a Veteranus brings three named pieces (helm: Lapidarius + Missilis · chest: Spinosus + Venatorius + Fortunae · greaves: Firmus) into a
   RANKED room; both screens build the same ARM entries with the new flags. Then, on the live sand (window A):
   the stone rule (Ranked: a stone stops at 1 HP on a lethal location; Custom and offline: it kills), lapid 0, spin −1 HP to the attacker,
   venat −1, miss −1 from range, firm 0 on the leg (2 elsewhere), fort +1 on the Thumb d6 (3 → 4: spared; without it: condemned).
   ⓘ odds: on the landing stage and the Domus; hover + click open the card; every table sums to 100% and matches ONLC.
   SHOT=<dir> saves screenshots j89_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await A.reload();
const B=await pg('B');for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const shot=async(p,n)=>{if(!SHOT)return;for(const vw of [1300,390]){await p.setViewportSize({width:vw,height:vw===390?844:900});await p.waitForTimeout(400);await p.screenshot({path:path.join(SHOT,`j89_${n}_${vw}.png`)})}await p.setViewportSize({width:1300,height:900});await p.waitForTimeout(200)};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return {ch:ONL.char.id,dom:ONL.domus.id,acct:ONL.acct.id}},[name,cls]);
const sa=await setup(A,'Vettii','hero'),sb=await setup(B,'Aemilii','soldier');
const world=(p,fn,arg)=>p.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);

/* ── 1 · three named pieces with the new affixes, worn by a Veteranus ── */
const keys=await world(A,(w,[ca,cb])=>{w.chars[ca].glory=600;w.chars[cb].glory=600;const ch=w.chars[ca];
  const defs=[{kind:'a',base:'galea',lv:4,slot:'head',pt:'helm',ap:3,n:'Galea Lapidaria',rar:'epic',aff:['lapid','miss'],lapid:1,miss:1,named84:1},
    {kind:'a',base:'lorica',lv:4,slot:'chest',pt:'chest',ap:4,n:'Lorica Spinosa',rar:'legendary',aff:['spin','venat','fort'],spin:1,venat:1,fort:1,named84:1},
    {kind:'a',base:'ocrea',lv:4,slot:'leg',pt:'lower',ap:4,pair:1,n:'Ocrea Firma',rar:'rare',aff:['firm'],firm:1,named84:1}];
  return defs.map(d=>{const P=ONLC.namedPiece(d,ch);ONLC.putPiece(ch,P,true);return P.pc.w.key})},[sa.ch,sb.ch]);
const kit=await A.evaluate(async()=>{const c=(await NET.req('char.mine',{})).find(x=>x.alive);return ONLC.kitOf(c)});
ok(keys.every(k=>kit.gear.includes(k)),'all three pieces are brought '+JSON.stringify(kit.gear));
ok(kit.named.some(d=>d.lapid&&d.miss)&&kit.named.some(d=>d.spin&&d.venat&&d.fort)&&kit.named.some(d=>d.firm),'the kit carries the flags');

/* ── 2 · ⓘ odds: landing stage + Domus ── */
const odds=await A.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('play');await new Promise(r=>setTimeout(r,900))}ONL.tab='play';await onlRefresh();onlRedraw();await new Promise(r=>setTimeout(r,300));
  const land=document.querySelectorAll('#onl .a81-stage [data-odds89], #onl [data-odds89]').length;
  ONL.tab='char';ONL.newGlad=false;await onlRefresh();onlRedraw();await new Promise(r=>setTimeout(r,400));const dom=document.querySelectorAll('#onl .dom89 [data-odds89], #onl [data-odds89]').length;return {land,dom}});
ok(odds.land>=1,'ⓘ beside the chest token on the landing '+JSON.stringify(odds));ok(odds.dom>=1,'ⓘ beside the chest token on the Domus '+JSON.stringify(odds));
if(odds.dom){await A.hover('#onl [data-odds89]');await A.waitForTimeout(250);ok(await A.evaluate(()=>{const f=document.getElementById('odds89f');return !!f&&!f.hidden&&!!f.querySelector('[data-o89="kinds"]')}),'hover shows the odds card');
  await A.click('#onl [data-odds89]');await A.waitForTimeout(300);await shot(A,'odds');
  const card=await A.evaluate(()=>{const bg=document.querySelector('.odds89pop');if(!bg)return null;const num=el=>[...el.querySelectorAll('.o89n')].map(x=>parseFloat(x.textContent));
    const kinds=num(bg.querySelector('[data-o89="kinds"]'));const tr=[...bg.querySelectorAll('.o89t')][1];const rows=[...tr.querySelectorAll('tr')].slice(1).map(r=>num(r));
    const G=ONLC.giftOdds89();const want=G.kinds.map(x=>x[1]*100);const affa=bg.querySelector('[data-o89="affa"]');
    const box=bg.querySelector('.pop83box').getBoundingClientRect();
    return {kinds,want,rows,armT:ONLC.RAR_A89.map(x=>x[1]),wT:ONLC.RAR_W.map(x=>x[1]),fort:affa.textContent.includes('Fortunae'),lapid:affa.textContent.includes('Lapidarius'),
      uniq:ONLC.UNIQUES_A.every(u=>bg.textContent.includes(u.n))&&ONLC.UNIQUES.every(u=>bg.textContent.includes(u.n)),w:box.width}});
  ok(card,'click pins the odds card');
  if(card){const s=a=>Math.round(a.reduce((x,y)=>x+y,0)*10)/10;ok(s(card.kinds)===100,'gift kinds sum to 100% '+s(card.kinds));ok(card.kinds.every((v,i)=>Math.abs(v-card.want[i])<0.06),'gift kinds = ONLC.GIFT_W '+JSON.stringify(card.kinds));
    ok(card.rows.length===2&&card.rows.every(r=>s(r)===100),'tier rows sum to 100% '+JSON.stringify(card.rows));ok(JSON.stringify(card.rows[0])===JSON.stringify(card.armT),'armor tiers = RAR_A89 '+JSON.stringify(card.rows[0]));
    ok(JSON.stringify(card.rows[1])===JSON.stringify(card.wT.map(x=>x/card.wT.reduce((a,b)=>a+b,0)*100)),'weapon tiers = RAR_W');ok(card.fort&&card.lapid&&card.uniq,'affixes + uniques listed')}
  await A.setViewportSize({width:390,height:844});await A.waitForTimeout(300);const w390=await A.evaluate(()=>{const x=document.querySelector('.odds89pop .pop83box');return x?Math.round(x.getBoundingClientRect().right):null});
  ok(w390!==null&&w390<=390,'the odds card fits a phone '+w390);await A.setViewportSize({width:1300,height:900});
  await A.evaluate(()=>{for(const x of document.querySelectorAll('.odds89pop'))x.remove()})}

/* ── 3 · a RANKED room: both screens build the same flags ── */
const L1=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:true,cry:false,abandon:'cpu'}));await B.evaluate(async id=>await NET.req('lobby.join',{id}),L1.id);
const L1s=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L1.id);await B.evaluate(L=>onlEnter(L),L1s);
const seatA=L1s.players.findIndex(p=>p.id===sa.acct);
const drive=async p=>{const r=await p.evaluate(()=>{try{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){return document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null}
  if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return null;if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return '[data-act="coin"]';
  if(S.phase==='action'&&document.querySelector('[data-act="end"]'))return '[data-act="end"]'}catch(e){}return null});if(r)await p.click(r,{timeout:2000}).catch(()=>{});return r};
for(let i=0;i<60&&!(await A.evaluate(()=>!!(ONLM.on&&S&&S.onl&&S.players.some(p=>p._na84))));i++){await drive(A);await drive(B);await A.waitForTimeout(400)}
await A.waitForTimeout(800);
const flags=p=>p.evaluate(ks=>ks.map(k=>ARM[k]?['lapid','miss','spin','venat','fort','firm'].filter(f=>ARM[k][f]).join(','):null),keys);
const fa=await flags(A),fb=await flags(B);ok(JSON.stringify(fa)===JSON.stringify(fb)&&fa[0]==='lapid,miss'&&fa[1]==='spin,venat,fort'&&fa[2]==='firm','ARM flags the same on both screens '+JSON.stringify([fa,fb]));
ok(await A.evaluate(()=>!!S.onl.ranked),'the match is Ranked');
/* stop the clock: freeze the lockstep on A (local checks only from here) */
await B.evaluate(()=>{try{S.over=true;ONLM.on=false}catch(e){}});
const R=await A.evaluate(async([sA,keys])=>{ONLM.on=false;const me=S.players[sA];const others=S.players.filter((p,i)=>i!==sA);const [q,c1,c2]=others;const out={};
  for(const p of S.players){p.wL=p.wL&&p.wL.shield?null:p.wL;p.wR=p.wR&&p.wR.shield?null:p.wR}
  out.worn=keys.map(k=>Object.values(me.pieces).some(l=>l.some(pc=>pc.key===k)));const stone={type:'env',spect:{name:'Pleb',sec:0}};const L0=S.logLines?S.logLines.length:0;
  /* lapid: a stone on the helm deals 0 */
  me.ap.head=0;me.hp.head=4;await hurt(me,'head',1,stone,'stone');out.lapid=me.hp.head;
  /* miss: from 3 tiles, −1 (head, AP 0) */
  q.r=me.r;q.c=me.c+3;me.hp.head=5;await hurt(me,'head',2,{type:'player',p:q,w:{n:'Sling'}},'shot');out.miss=me.hp.head;
  /* spin: adjacent melee on the chest: the victim takes 2, the attacker loses 1 HP on his striking arm */
  q.c=me.c+1;me.ap.chest=0;me.hp.chest=8;q.hp.rarm=4;await hurt(me,'chest',2,{type:'player',p:q,w:{n:'Gladius'}},'cut');out.spin=[me.hp.chest,q.hp.rarm];
  /* venat: a beast's 3 on the chest → 2 */
  me.hp.chest=8;await hurt(me,'chest',3,{type:'npc',n:(S.npcs||[])[0]||{name:'Leo'}},'claw');out.venat=me.hp.chest;
  /* firm: a floor spike on the leg → 0; on the chest → 2 */
  me.ap.rleg=0;me.hp.rleg=4;await hurt(me,'rleg',2,{type:'env'},_T('Floor spike'));me.hp.chest=8;await hurt(me,'chest',2,{type:'env'},_T('Floor spike'));out.firm=[me.hp.rleg,me.hp.chest];
  /* fort: Thumb of Flavius at 18 CF, the d6 forced to 3: +1 → spared; a fighter without it → condemned */
  const rng=RNG;RNG={next:()=>0.34};let f1,f2;try{finalCF(me,false);f1=fateFor(18);finalCF(q,false);f2=fateFor(18)}finally{RNG=rng}out.fort=[f1&&f1[0],f1&&f1.d6,f2&&f2[0],f2&&f2.d6];
  /* THE RANKED STONE RULE: a stone on a 1-HP head stops at 1; Custom: it kills; offline: it kills */
  c1.ap.head=0;c1.hp.head=1;await hurt(c1,'head',1,stone,'stone');out.ranked=[c1.alive,c1.hp.head];
  c1.hp.head=3;await hurt(c1,'head',1,stone,'stone');out.rankedHurt=c1.hp.head;
  S.onl.ranked=false;c1.hp.head=1;await hurt(c1,'head',1,stone,'stone');out.custom=c1.alive;
  const onl=S.onl;S.onl=null;try{c2.ap.head=0;c2.hp.head=1;await hurt(c2,'head',1,stone,'stone');out.offline=c2.alive}finally{S.onl=onl}
  out.log=(S.logLines||[]).slice(L0).map(l=>l.text||l.html||String(l)).join('\n');return out},[seatA,keys]);
ok(R.worn.every(Boolean),'the three pieces are worn '+JSON.stringify(R.worn));
ok(R.lapid===4,'Lapidarius: the stone deals 0 '+R.lapid);ok(R.miss===4,'Missilis: 2 from range → 1 '+R.miss);
ok(R.spin[0]===6&&R.spin[1]===3,'Spinosus: the hit lands, the attacker loses 1 HP '+JSON.stringify(R.spin));ok(R.venat===6,'Venatorius: 3 → 2 '+R.venat);
ok(R.firm[0]===4&&R.firm[1]===6,'Firmus: 0 on the leg, 2 on the chest '+JSON.stringify(R.firm));
ok(/spared/.test(R.fort[0]||'')&&R.fort[1]===4&&!/spared/.test(R.fort[2]||'')&&R.fort[3]===3,'Fortunae: 3+1 = spared; without it condemned '+JSON.stringify(R.fort));
ok(R.ranked[0]===true&&R.ranked[1]===1,'Ranked: the stone cannot kill '+JSON.stringify(R.ranked));ok(R.rankedHurt===2,'Ranked: a stone still wounds '+R.rankedHurt);
ok(R.custom===false,'Custom: the stone kills');ok(R.offline===false,'offline: the stone kills');
ok(/Flavius kills/.test(R.log)&&/Lapidarius/.test(R.log)&&/Spinosus/.test(R.log),'the log names the rule and the affixes');
await shot(A,'match');
/* ── 4 · the card names each affix ── */
const card=await A.evaluate(ks=>{const d=ONLC.cleanNamedA({...ARM[ks[1]],key:ks[1]});const h=nw83Card({named:true,kind:'a',item:'na#'+ks[1].slice(3),rar:'legendary',w:d,n:d.n,st:'whole',hist:[]},{});return h},keys);
ok(/Spinosus/.test(card)&&/Venatorius/.test(card)&&/Fortunae/.test(card),'the armor card lists the affixes by name');
for(const p of [A,B])await p.evaluate(()=>{try{if(S&&S.onl){S.over=true;ONLM.on=false}ONL.live=null;ONL.watching=null}catch(e){}});
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
