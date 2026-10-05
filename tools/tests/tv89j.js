/* v0.89 Japanese + CJK rendering (00-lang LANGS86 'ja', 01-head loader, 173-v89cjk):
   A a first run on a Japanese browser asks once, in Japanese (LANG_UI87.ja); はい → reloads in Japanese
   B in Japanese: <html lang="ja" class="cjk cjk-ja">, the CSS font variables carry the CJK stack, no letter-spacing / uppercase /
     small caps, canvas fonts get the CJK stack inserted before the generic family, Japanese draws on a canvas without errors,
     clsWrap/cjkWrap89 break Japanese by character (no line starts with 、。), Settings lists 日本語 (selected), a Play Now event
     reaches the first turn and the arena canvas font carries the stack
   C switching back: Settings → English reloads in English (no cjk class, canvas fonts untouched, clsWrap splits on spaces)
   D English untouched: a page without flavius_lang has no cjk class, no #cjk89 style and plain canvas fonts
   W when assets/lang_ja.js exists (the translated parts merged + mkdict), the tv86 screen walk runs in Japanese (WALK_LANG=ja,
     LEFT_MAX / CUT_MAX ceilings like the other languages). Without it a small stub pack stands in for A–C and W is skipped. */
const path=require('path'),fs=require('fs'),{spawnSync}=require('child_process');
const {chromium}=require('playwright');(async()=>{const URL0='file://'+path.resolve(process.argv[2]);
const REAL=fs.existsSync(path.join(path.dirname(path.resolve(process.argv[2])),'assets','lang_ja.js'));
const STUB=REAL?null:{l:'ja',d:{'Attack':'攻撃','Settings':'設定','Manager mode':'マネージャーモード','Play Now':'すぐ遊ぶ'},s:[]};
const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const mk=async(locale)=>{const ctx=await b.newContext({viewport:{width:1300,height:900},locale});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await ctx.addInitScript(st=>{if(st&&localStorage.getItem('flavius_lang')==='ja'&&!window.LANG_PACK)window.LANG_PACK=st},STUB);return ctx};
const ready=p=>p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:25000}).catch(()=>p.waitForTimeout(2400));
const open=async(ctx,n)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);await ready(p);return p};
const closeAll=async P=>{for(let i=0;i<6;i++){const m=await P.evaluate(()=>!!CUR_MODAL&&!document.getElementById('modal').hidden);if(!m)break;await P.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await P.waitForTimeout(350)}};

/* ── A · first run on a Japanese browser ── */
const ctx=await mk('ja-JP');const P=await open(ctx,'A');
out.ask=await P.waitForSelector('#lang86ask',{timeout:10000}).then(()=>P.evaluate(()=>({t:document.getElementById('lang86ask').innerText,LANG}))).catch(()=>null);
ok(out.ask&&out.ask.LANG==='en'&&/日本語でプレイしますか/.test(out.ask.t)&&/はい、日本語で/.test(out.ask.t),'A: Japanese browser asked in Japanese '+JSON.stringify(out.ask));
if(out.ask){await Promise.all([P.waitForNavigation({timeout:15000}).catch(()=>null),P.click('#lang86ask [data-lang86yes]')]);await ready(P)}

/* ── B · Japanese ── */
out.b=await P.evaluate(()=>{const cs=getComputedStyle(document.documentElement),bs=getComputedStyle(document.body);
  const h1=document.querySelector('.brand h1,.mbox h2,.loghead h3,.pname')||document.body;const hs=getComputedStyle(h1);
  const c=document.createElement('canvas');c.width=200;c.height=40;const x=c.getContext('2d');
  x.font='600 14px Alegreya Sans, sans-serif';const f1=x.font;x.font='700 20px "Marcellus SC", Georgia, serif';const f2=x.font;x.font='12px IBM Plex Mono';const f3=x.font;
  let drew=false;try{x.fillStyle='#000';x.fillText('剣闘士の攻撃 Gladius',4,24);drew=x.measureText('剣闘士').width>0}catch(e){}
  const long='剣闘士は砂の上で戦い、観衆の支持を得る。Gladiusを装備して、Leoに立ち向かう。';
  const L=clsWrap(long,16);const W=s=>[...s].reduce((a,ch)=>a+(/[　-鿿＀-￯]/.test(ch)?2:1),0);
  return {LANG,html:document.documentElement.lang,cls:document.documentElement.className,dict:!!LANG_DICT,tr:_T('Attack'),
    body:bs.fontFamily,display:cs.getPropertyValue('--display'),ls:hs.letterSpacing,tt:hs.textTransform,fv:hs.fontVariantCaps,
    f1,f2,f3,drew,lines:L,join:L.join('')===long.replace(/\s+/g,''),maxW:Math.max(...L.map(W)),badStart:L.some(l=>/^[、。）」]/.test(l)),
    en:clsWrap('Once per event you may reroll a die',12),hasJa:LANGS84.some(l=>l.k==='ja'&&l.n==='日本語')}});
const B=out.b;
ok(B.LANG==='ja'&&B.html==='ja'&&/\bcjk\b/.test(B.cls)&&/cjk-ja/.test(B.cls)&&B.dict,'B: Japanese on, <html lang=ja class=cjk> '+JSON.stringify({L:B.LANG,h:B.html,c:B.cls}));
ok(REAL||B.tr==='攻撃','B: the dictionary translates '+B.tr);
ok(/Hiragino Sans/.test(B.body)&&/Noto Sans CJK JP/.test(B.body)&&/Alegreya Sans/.test(B.body),'B: body font = game font + CJK stack '+B.body);
ok(/Mincho/.test(B.display)&&/Marcellus SC/.test(B.display),'B: display font = Marcellus + Mincho '+B.display);
ok((B.ls==='normal'||B.ls==='0px')&&B.tt==='none'&&B.fv==='normal','B: no letter-spacing/uppercase/small caps '+[B.ls,B.tt,B.fv]);
ok(/Hiragino Sans/.test(B.f1)&&/sans-serif$/.test(B.f1)&&/Hiragino Sans/.test(B.f2)&&/Marcellus SC/.test(B.f2)&&/serif$/.test(B.f2)&&/Hiragino/.test(B.f3),'B: canvas fonts carry the CJK stack '+[B.f1,B.f2,B.f3].join(' ‖ '));
ok(B.drew,'B: Japanese draws on a canvas');
ok(B.lines.length>=4&&B.join&&B.maxW<=17&&!B.badStart,'B: clsWrap breaks Japanese by character '+JSON.stringify(B.lines));
ok(B.en.join('|')==='Once per|event you|may reroll a|die','B: Latin text still wraps on spaces '+B.en.join('|'));
ok(B.hasJa,'B: 日本語 in the language list');
/* Settings select */
await P.evaluate(()=>{menuHide();openSettings()});await P.waitForTimeout(900);
out.sel=await P.evaluate(()=>{const s=document.querySelector('select[data-lang84]');return s?{v:s.value,opts:[...s.options].map(o=>o.value+':'+o.textContent)}:null});
ok(out.sel&&out.sel.v==='ja'&&out.sel.opts.includes('ja:日本語'),'B: Settings → 日本語 selected '+JSON.stringify(out.sel));
await closeAll(P);
/* Play Now → the first turn, arena drawn with the CJK stack */
const step=async(n,fn)=>{try{await fn();return true}catch(e){errs.push('B step '+n+': '+e.message.split('\n')[0]);return false}};
out.play=await step('play',async()=>{await P.evaluate(()=>{menuShow()});await P.waitForTimeout(500);await P.click('#mainMenu [data-mm="play"]');await P.waitForTimeout(1200);await P.click('[data-mi="0"]');await P.waitForTimeout(1800);await P.click('#goBtn')});
let turn=false;for(let i=0;i<60&&!turn;i++){await P.waitForTimeout(500);const st=await P.evaluate(()=>({m:!!CUR_MODAL&&!document.getElementById('modal').hidden,h:typeof humanTurn==='function'&&humanTurn()&&S.phase}));
  if(st.m)await P.evaluate(()=>{const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');if(b)b.click()});else if(st.h==='choice')turn=true}
out.arena=await P.evaluate(()=>{try{draw()}catch(e){return {err:e.message}}const c=document.getElementById('cv')||document.querySelector('canvas');return {font:c?c.getContext('2d').font:''}});
ok(out.play&&turn&&!out.arena.err&&/Hiragino Sans/.test(out.arena.font),'B: Play Now turn in Japanese, arena font '+JSON.stringify(out.arena));
await P.evaluate(()=>{S.over=true});await closeAll(P);

/* ── C · back to English ── */
await P.evaluate(()=>{menuHide();openSettings()});await P.waitForTimeout(900);
await Promise.all([P.waitForNavigation({timeout:15000}).catch(()=>null),P.selectOption('select[data-lang84]','en')]);await ready(P);
out.c=await P.evaluate(()=>{const x=document.createElement('canvas').getContext('2d');x.font='600 14px Alegreya Sans, sans-serif';
  return {LANG,dict:!!LANG_DICT,html:document.documentElement.lang,cls:document.documentElement.className,font:x.font,style:!!document.getElementById('cjk89'),en:clsWrap('Once per event you may reroll a die',12).join('|')}});
ok(out.c.LANG==='en'&&!out.c.dict&&out.c.html==='en'&&!/cjk/.test(out.c.cls)&&!out.c.style&&!/Hiragino/.test(out.c.font)&&out.c.en==='Once per|event you|may reroll a|die','C: English again '+JSON.stringify(out.c));
await ctx.close();

/* ── D · English untouched ── */
{const c=await mk('en-US');const p=await open(c,'D');
  out.d=await p.evaluate(()=>{const x=document.createElement('canvas').getContext('2d');x.font='600 14px Alegreya Sans, sans-serif';
    return {LANG,cls:document.documentElement.className,style:!!document.getElementById('cjk89'),font:x.font,id:_T('Attack')==='Attack',ask:!!document.getElementById('lang86ask')}});
  ok(out.d.LANG==='en'&&!/cjk/.test(out.d.cls)&&!out.d.style&&!/Hiragino/.test(out.d.font)&&out.d.id&&!out.d.ask,'D: English untouched '+JSON.stringify(out.d));await c.close()}
await b.close();

/* ── W · the screen walk in Japanese (real pack only) ── */
if(REAL){const r=spawnSync(process.execPath,[path.join(__dirname,'tv86.js'),process.argv[2]],{env:{...process.env,WALK_LANG:'ja'},encoding:'utf8',timeout:400000});
  const o=(r.stdout||'')+(r.stderr||'');console.log('── walk ja exit='+r.status);console.log(o.split('\n').filter(x=>/^(ERRS|MISS|\{"c")/.test(x)).map(x=>x.slice(0,600)).join('\n'));
  ok(r.status===0,'W: the Japanese screen walk (tv86 WALK_LANG=ja)')}
else console.log('W skipped: no assets/lang_ja.js yet (stub pack used)');
console.log(JSON.stringify({b:{lines:B.lines,f1:B.f1},arena:out.arena}).slice(0,800));
console.log('ERRS',JSON.stringify(errs.slice(0,10)));console.log('MISS',JSON.stringify(miss));
process.exit(errs.length||miss.length?1:0)})();
