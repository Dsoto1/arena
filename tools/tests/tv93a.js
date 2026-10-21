/* tv93a — v0.93 accessibility pass (220-v93a11y): keyboard-only start of a Play Now event (Tab/Enter only), focus moves into
   each window and is trapped there, the board takes focus and the arrow keys move the tile cursor, Enter takes a move, Escape
   goes back to Move, I reads the board (summary region + live region), a window opened from the top bar gives focus back to
   its button when it closes, icon-only buttons carry names, and a WCAG AA contrast ceiling on the menu, the Play Now setup,
   the arena and the Manager. Prints the contrast numbers. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const T=require('./_wait');await T.boot(pg,{menu:false,seed:false});const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const fails=[];const note=[];const ok=(c,m)=>{if(!c)fails.push(m)};
const until=async(fn,arg,ms=20000)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
/* the contrast scan (WCAG 2: 4.5:1, 3:1 for large text; text dimmed below 75% opacity = an inactive control, exempt) */
await pg.evaluate(()=>{window.CON93=function(sels){const roots=sels.map(s=>document.querySelector(s)).filter(Boolean);
  const parse=s=>{const m=s&&s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
  const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b)};
  const over=(t,b)=>{const a=t.a+b.a*(1-t.a);if(a<=0)return {r:0,g:0,b:0,a:0};return {r:(t.r*t.a+b.r*b.a*(1-t.a))/a,g:(t.g*t.a+b.g*b.a*(1-t.a))/a,b:(t.b*t.a+b.b*b.a*(1-t.a))/a,a}};
  const bgOf=el=>{const L=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;
      let c=parse(cs.backgroundColor);const g=cs.backgroundImage.match(/rgba?\([^)]+\)/g);if(g&&g.length&&(!c||c.a===0)){const q=g.map(parse);c={r:q.reduce((s,x)=>s+x.r,0)/q.length,g:q.reduce((s,x)=>s+x.g,0)/q.length,b:q.reduce((s,x)=>s+x.b,0)/q.length,a:q.reduce((s,x)=>s+x.a,0)/q.length}}
      if(c&&c.a>0){L.push(c);if(c.a>=0.99)break}}
    let acc=(!L.length||L[L.length-1].a<0.99)?(parse(getComputedStyle(document.body).backgroundColor)||{r:20,g:14,b:10,a:1}):{r:0,g:0,b:0,a:1};for(let i=L.length-1;i>=0;i--)acc=over(L[i],acc);return acc};
  const out={n:0,fail:0,dim:0,worst:{}};const seen=new Set();
  for(const root of roots){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let t;while((t=w.nextNode())){if(!/[\p{L}\p{N}]/u.test(t.nodeValue))continue;const el=t.parentElement;if(!el||seen.has(el))continue;seen.add(el);
    if(el.closest('svg,canvas,script,style,[hidden],.sr93,[aria-hidden="true"],button:disabled,[disabled]'))continue;const r=el.getBoundingClientRect();if(r.width<1||r.height<1)continue;
    if(el.checkVisibility&&!el.checkVisibility({visibilityProperty:true,opacityProperty:true}))continue;
    const cs=getComputedStyle(el);let fg=parse(cs.color);if(!fg)continue;let op=1;for(let e=el;e&&e.nodeType===1;e=e.parentElement){const o=+getComputedStyle(e).opacity;if(o<1)op*=o}if(op<0.75)continue;
    const bg=bgOf(el);if(!bg)continue;const f2=over({...fg,a:fg.a*op},bg);const ratio=(Math.max(lum(f2),lum(bg))+0.05)/(Math.min(lum(f2),lum(bg))+0.05);
    const px=parseFloat(cs.fontSize),wt=+cs.fontWeight||400;const need=(px>=24||(px>=18.66&&wt>=700))?3:4.5;out.n++;
    if(ratio+1e-6<need){out.fail++;if(cs.color==='rgb(125, 106, 85)')out.dim++;const sig=(el.className&&typeof el.className==='string'?el.className.split(/\s+/)[0]:el.tagName.toLowerCase())+' '+cs.color;out.worst[sig]=(out.worst[sig]||0)+1}}}
  return out}});
const con={};const scan=async(name,sels)=>{const r=await pg.evaluate(s=>CON93(s),sels);con[name]=r;note.push(`contrast ${name}: ${r.fail}/${r.n} below AA ${JSON.stringify(r.worst)}`)};
/* 0 · the pieces are in place */
const base=await pg.evaluate(()=>({css:!!document.getElementById('a11y93css'),live:document.getElementById('a11yLive93')&&document.getElementById('a11yLive93').getAttribute('aria-live'),
  sum:!!document.getElementById('a11ySum93'),cvTab:cv.tabIndex,cvRole:cv.getAttribute('role'),cvLabel:!!cv.getAttribute('aria-label')}));
ok(base.css&&base.live==='polite'&&base.sum&&base.cvTab===0&&base.cvRole==='application'&&base.cvLabel,'pieces '+JSON.stringify(base));
await scan('main menu',['#mainMenu']);
/* 1 · keyboard only: Tab to Play Now, Enter, focus lands inside the window */
const tabTo=async(test,max)=>{for(let i=0;i<max;i++){await pg.keyboard.press('Tab');if(await pg.evaluate(test))return i+1}return -1};
const tPlay=await tabTo(()=>document.activeElement&&document.activeElement.dataset.mm==='play',40);ok(tPlay>0,'Tab never reached Play Now');
await pg.keyboard.press('Enter');ok(await until(()=>!document.getElementById('modal').hidden&&document.getElementById('mboxEl').contains(document.activeElement),null,6000),'focus did not move into the Play now window');
const tNew=await tabTo(()=>/New event/.test(document.activeElement.textContent||''),12);ok(tNew>0,'Tab never reached New event');
await pg.keyboard.press('Enter');ok(await until(()=>!!document.getElementById('goBtn')&&document.getElementById('mboxEl').contains(document.activeElement),null,8000),'setup window without focus');
/* test plumbing (not the player's path): a Classic, seat 1 is you, fast CPUs */
await pg.evaluate(()=>{CFG.mode='event';CFG.ev='democritus';CFG.n=4;CFG.seats.forEach((s,i)=>{s.cpu=i!==0});if(typeof pnRedraw75==='function')pnRedraw75();setSpeedUI('fast')});await pg.waitForTimeout(600);
await scan('play now setup',['#mboxEl']);
/* the trap: 60 Tabs never leave the window */
let out=0;for(let i=0;i<60;i++){await pg.keyboard.press(i%7===6?'Shift+Tab':'Tab');if(!(await pg.evaluate(()=>document.getElementById('mboxEl').contains(document.activeElement)||!!document.activeElement.closest('#mtutCoach,#tutCoach'))))out++}
ok(out===0,`focus left the window ${out} times`);
const tGo=await tabTo(()=>document.activeElement.id==='goBtn',260);ok(tGo>0,'Tab never reached Begin Event');
await pg.keyboard.press('Enter');
/* start windows (briefing…): Enter on the focused primary */
for(let i=0;i<10;i++){await pg.waitForTimeout(900);const st=await pg.evaluate(()=>({m:!document.getElementById('modal').hidden,inside:document.getElementById('mboxEl').contains(document.activeElement),ph:S&&S.phase}));
  if(!st.m&&st.ph!=='setup')break;if(st.m){ok(st.inside,'a start window opened without focus');await pg.keyboard.press('Enter')}}
ok(await until(()=>S&&S.phase!=='setup'&&document.getElementById('modal').hidden,null,15000),'event did not start');
/* wait for our gladiator's choice (windows on the way: Enter) */
let mine=false;for(let i=0;i<120&&!mine;i++){await pg.waitForTimeout(400);const st=await pg.evaluate(()=>({m:!document.getElementById('modal').hidden,me:S&&!S.over&&!cur().cpu,ph:S&&S.phase,over:S&&S.over}));
  if(st.over)break;if(st.m){await pg.keyboard.press('Enter');continue}mine=st.me&&(st.ph==='choice'||st.ph==='action')}
ok(mine,'never reached our turn');
await scan('arena',['header.bar','main.layout']);
/* 2 · the choice from the action dock by Tab + Enter */
if(await pg.evaluate(()=>S.phase==='choice')){await pg.evaluate(()=>{cv.focus()});const tC=await tabTo(()=>{const a=document.activeElement;return !!a&&!!a.closest('#actions')&&/^(coin|card)$/.test(a.dataset.act||'')},60);ok(tC>0,'Tab never reached the choice buttons');
  await pg.keyboard.press('Enter');ok(await until(()=>S.phase==='action'||!!document.querySelector('#modal:not([hidden])'),null,10000),'choice not taken');
  for(let i=0;i<6;i++){if(await pg.evaluate(()=>S.phase==='action'&&document.getElementById('modal').hidden&&!S.busy))break;if(await pg.evaluate(()=>!document.getElementById('modal').hidden))await pg.keyboard.press('Enter');await pg.waitForTimeout(500)}}
ok(await until(()=>S.phase==='action'&&!cur().cpu&&!S.busy,null,10000),'not in our action phase');
/* 3 · the board: Shift+Tab back to it, arrows move the cursor (screen directions, the view may be turned) */
const tB=await (async()=>{for(let i=0;i<60;i++){if(await pg.evaluate(()=>document.activeElement===cv))return i;await pg.keyboard.press('Shift+Tab')}return -1})();ok(tB>=0,'Shift+Tab never reached the board');
const c0=await pg.evaluate(()=>A93.cur&&{...A93.cur});await pg.keyboard.press('ArrowUp');const c1=await pg.evaluate(()=>A93.cur&&{...A93.cur});
ok(c1&&(!c0||c0.r!==c1.r||c0.c!==c1.c),'ArrowUp did not move the cursor '+JSON.stringify([c0,c1]));
const dirOk=await pg.evaluate(c=>{const a=center(c[0].r,c[0].c),z=center(c[1].r,c[1].c);return z.y<a.y},[c0||c1,c1]).catch(()=>false);ok(!c0||dirOk,'ArrowUp did not go up the screen');
ok(await until(()=>/[A-M]-\d/.test(document.getElementById('a11yLive93').textContent),null,3000),'cursor tile not spoken');
/* Escape on the board: back to Move (an attack mode set from the dock first, when there is one; else set for the check) */
{const m=await pg.evaluate(()=>{const b=[...document.querySelectorAll('#actions [data-act^="m-"]')].find(x=>!x.disabled&&x.dataset.act!=='m-move');if(b){b.click();cv.focus();return b.dataset.act}S.mode='atkR';render();cv.focus();return 'forced'});
  const was=await pg.evaluate(()=>S.mode);
  /* an open tooltip takes the first Escape (52-v50), the board the next */
  for(let i=0;i<3;i++){await pg.keyboard.press('Escape');if(await pg.evaluate(()=>S.mode==='move'))break}ok(was!=='move'&&await until(()=>S.mode==='move',null,3000),'Escape on the board did not go back to Move ('+m+') '+JSON.stringify(await pg.evaluate(()=>({mode:S.mode,ph:S.phase,busy:S.busy,cpu:cur().cpu,ht:humanTurn(),ae:document.activeElement.id,modal:!document.getElementById('modal').hidden,over:S.over,acts:document.getElementById('actions').textContent.slice(0,80)}))))}
/* 4 · a move by keyboard: walk the cursor to a lit move tile, Enter */
const tgt=await pg.evaluate(()=>{const p=cur();let best=null;for(const [k,h] of HL){if(h.t!=='move')continue;const r=Math.floor(k/N),c=k%N;if(r===p.r&&c===p.c)continue;const d=Math.abs(r-p.r)+Math.abs(c-p.c);if(!best||d<best.d)best={r,c,d}}return best});
ok(!!tgt,'no move tile lit');let moved=false;
if(tgt){for(let i=0;i<40;i++){const k=await pg.evaluate(t=>{const c=A93.cur;if(c.r===t.r&&c.c===t.c)return null;let bk=null,bd=1e9;for(const key of Object.keys(A93_DIR)){const n=a11yNext93(key,c);if(!n)continue;const d=Math.abs(n.r-t.r)+Math.abs(n.c-t.c);if(d<bd){bd=d;bk=key}}return bk},tgt);if(!k)break;await pg.keyboard.press(k)}
  ok(await pg.evaluate(t=>A93.cur.r===t.r&&A93.cur.c===t.c,tgt),'cursor never reached the move tile');
  await pg.keyboard.press('Enter');moved=await until(t=>{const p=cur();return (p.r===t.r&&p.c===t.c)||S.players.some(q=>!q.cpu&&q.r===t.r&&q.c===t.c)},tgt,10000);ok(moved,'Enter did not move the gladiator to '+JSON.stringify(tgt))}
/* 5 · an attack by keyboard when a target is in range, else Escape out of an attack mode */
await until(()=>!S.busy&&document.getElementById('modal').hidden,null,8000);
const atk=await pg.evaluate(()=>{if(S.over||cur().cpu||S.phase!=='action')return null;const b=[...document.querySelectorAll('#actions [data-act^="m-atk"]')].find(x=>!x.disabled);return b?b.dataset.act:null});
if(atk){const tA=await tabTo((a)=>document.activeElement&&document.activeElement.dataset.act===a,80);
  await pg.evaluate(a=>{const e=document.querySelector(`#actions [data-act="${a}"]`);if(e&&document.activeElement!==e)e.focus()},atk);await pg.keyboard.press('Enter');
  ok(await until(()=>/^atk/.test(S.mode),null,4000),'attack mode not set by Enter');
  const hit=await pg.evaluate(()=>{for(const [k,h] of HL)if(h.t==='atk')return {r:Math.floor(k/N),c:k%N};return null});
  if(hit){await pg.evaluate(()=>cv.focus());for(let i=0;i<40;i++){const k=await pg.evaluate(t=>{const c=A93.cur;if(c.r===t.r&&c.c===t.c)return null;let bk=null,bd=1e9;for(const key of Object.keys(A93_DIR)){const n=a11yNext93(key,c);if(!n)continue;const d=Math.abs(n.r-t.r)+Math.abs(n.c-t.c);if(d<bd){bd=d;bk=key}}return bk},hit);if(!k)break;await pg.keyboard.press(k)}
    const a0=await pg.evaluate(()=>cur().attacks||0);await pg.keyboard.press('Enter');note.push('attack by keyboard on '+JSON.stringify(hit)+' → '+(await until(a=>(cur().attacks||0)>a||S.busy||!document.getElementById('modal').hidden,a0,6000)))}
  else{for(let i=0;i<3;i++){await pg.keyboard.press('Escape');if(await pg.evaluate(()=>S.mode==='move'))break}ok(await until(()=>S.mode==='move',null,3000),'Escape from the dock left the attack mode on')}}
else note.push('no attack in range after the move');
/* close anything the attack opened (Enter = the focused primary) */
for(let i=0;i<8;i++){if(await pg.evaluate(()=>document.getElementById('modal').hidden))break;await pg.keyboard.press('Enter');await pg.waitForTimeout(600)}
/* 6 · I reads the board */
await pg.evaluate(()=>cv.focus());await pg.keyboard.press('i');
const sum=await pg.evaluate(()=>({t:document.getElementById('a11ySum93').textContent,live:document.getElementById('a11yLive93').textContent,names:S.players.map(p=>p.name),tile:tl(S.players[0].r,S.players[0].c)}));
ok(sum.names.every(n=>sum.t.includes(n))&&sum.t.includes(sum.tile)&&/head/.test(sum.t)&&/round/i.test(sum.t),'summary incomplete: '+sum.t.slice(0,200));
ok(await until(()=>document.getElementById('a11yLive93').textContent.length>40,null,3000),'summary not spoken');
/* 7 · a window from the top bar: focus in, Escape, focus back on its button */
const opener=await pg.evaluate(()=>{const b=['btnRules','btnSettings','btnHall'].map(id=>document.getElementById(id)).find(e=>e&&e.getClientRects().length&&!e.disabled);return b?b.id:null});
ok(!!opener,'no top-bar window button');
if(opener){await pg.evaluate(id=>document.getElementById(id).focus(),opener);await pg.keyboard.press('Enter');
  ok(await until(()=>!document.getElementById('modal').hidden&&document.getElementById('mboxEl').contains(document.activeElement),null,6000),'window from '+opener+' without focus');
  /* v1.08c: Escape only once the window is filed in a11y93's stack with its opener and the 40 ms a11ySync93 debounce has run
     (1 local run in 8 lost the focus return when Escape raced the debounce under load) */
  ok(await T.until(pg,'window from '+opener+' filed in A93.stack, a11y sync settled',id=>!A93.syncT&&A93.stack.some(x=>x.el&&x.el.id==='mboxEl'&&x.opener&&x.opener.id===id),opener,6000),'window from '+opener+' not filed with its opener');
  /* the focused control may carry a tooltip (52's focusin opens [data-tip]); Escape closes an open tooltip FIRST (WCAG 1.4.13, 52-v50:106)
     — the 20x proof caught it: WAIT dump "modal still open, focus on a BUTTON". Close the tooltip, then Escape closes the window. */
  for(let k=0;k<3&&await pg.evaluate(()=>typeof TT!=='undefined'&&TT.stack.length>0);k++){await pg.keyboard.press('Escape');await T.until(pg,'tooltip closed by Escape',()=>!TT.stack.length,null,3000)}
  await pg.keyboard.press('Escape');ok(await T.until(pg,'focus back on '+opener+' (modal hidden, a11y sync done)',id=>document.getElementById('modal').hidden&&!A93.syncT&&document.activeElement&&document.activeElement.id===id,opener,6000),'focus did not return to '+opener+' (now '+(await pg.evaluate(()=>document.activeElement&&(document.activeElement.id||document.activeElement.tagName)))+')')}
/* 8 · icon-only buttons have names (menu bar, arena, dock) */
const unnamed=await pg.evaluate(()=>{const w=t=>/[\p{L}\p{N}]/u.test(t||'');return [...document.querySelectorAll('header.bar button,main.layout button,#actions [data-act]')].filter(e=>e.getClientRects().length&&!(w(e.getAttribute('aria-label'))||w(e.textContent)||e.hasAttribute('aria-labelledby'))).map(e=>e.id||e.outerHTML.slice(0,80))});
ok(!unnamed.length,'buttons without a name: '+JSON.stringify(unnamed.slice(0,6)));
const named=await pg.evaluate(()=>['mClose','mPeek','btnSettings','btnZoom'].map(id=>{const e=document.getElementById(id);return e?id+'='+(e.getAttribute('aria-label')||''):id+'=—'}));note.push('labels '+named.join(' · '));
/* 9 · the Manager screen (sandbox lesson world) */
await pg.evaluate(()=>{if(S)S.over=true;startManagerTutorial()});await until(()=>!!document.getElementById('mgrBody'),null,10000);await pg.waitForTimeout(800);
ok(await until(()=>document.getElementById('mboxEl').contains(document.activeElement)||!!document.activeElement.closest('#mtutCoach'),null,4000),'Manager window without focus');
await scan('manager',['#mboxEl']);
await pg.evaluate(()=>{MGR.tab='practice';MGR_REDRAW()});await pg.waitForTimeout(700);await scan('training yard',['#mboxEl']);
await pg.evaluate(()=>{try{mtCleanup()}catch(e){}});
/* the ceiling: none of the old --dim text, at most 6 runs below AA over the five screens (text on his art the scan cannot see) */
const tot=Object.values(con).reduce((s,r)=>s+r.fail,0),totn=Object.values(con).reduce((s,r)=>s+r.n,0),dim=Object.values(con).reduce((s,r)=>s+r.dim,0);
ok(dim===0,`${dim} runs still in the old --dim colour`);ok(tot<=6,`contrast: ${tot} runs below AA (ceiling 6)`);
console.log(note.join('\n'));console.log(`contrast total ${tot}/${totn} below AA`);
console.log(fails.length?'FAIL '+JSON.stringify(fails):'OK keyboard, windows, summary, labels, contrast');
console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();process.exit(fails.length?1:0)})();
