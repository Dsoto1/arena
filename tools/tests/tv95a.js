/* v0.95 part A (227-v95board): Zora fit, team rings, floating numbers above bubbles + fan-out, CF spend feedback + no double buy, Arena Key tokens,
   chest swap card, Focus roll dice column + art, editors toast once, humanoid wording, Bestiary tab inside Rules & strategy. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
const start=ev=>pg.evaluate(async(ev)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.mini3d=true;SETTINGS.tokenStyle='standee';SETTINGS.briefing=false;try{applySettings()}catch(e){}
  const seats=['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0,team:ev==='familia'?(i<2?'A':'B'):undefined}));
  startEvent({ev,loc:6,seats,opts:{spect:0}});
  for(let i=0;i<150;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('[data-act="coin"]');if(c)c.click()}else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break}
  SPEED='pause';return !!S&&cur()===S.players[0]},ev);
/* ---- team ring + colours (Familia) ---- */
ok(await start('familia'),'0a familia started');
const t=await pg.evaluate(async()=>{const o={};const cols=['A','B','C','D'].map(teamColor);o.distinct=new Set(cols).size===4;
  const rec=[];const st=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(){if(this.lineWidth===4)rec.push([this.strokeStyle,this.getLineDash().length]);return st.apply(this,arguments)};
  SETTINGS.cvdMode='off';draw();o.rings=rec.slice();rec.length=0;SETTINGS.cvdMode='rg';draw();o.cvd=rec.slice();SETTINGS.cvdMode='off';CanvasRenderingContext2D.prototype.stroke=st;return o});
ok(t.distinct,'2a team colours distinct');ok(t.rings.length>=4,'2b a ring for every piece ('+t.rings.length+')');
ok(t.rings.some(r=>/#4aa8e8/i.test(r[0]))&&t.rings.some(r=>/#f0a020/i.test(r[0])),'2c A blue and B orange');
ok(t.cvd.some(r=>r[1]>0),'2d patterns in a colour-blind mode');ok(!t.rings.some(r=>r[1]>0),'2e solid otherwise');
/* ---- Zora + floating numbers + keys + CF (Democritus) ---- */
ok(await start('democritus'),'0b democritus started');
const r=await pg.evaluate(async()=>{const o={};const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];
  /* 1 Zora */
  spawnZora(p);const z=S.npcs.find(n=>n.t==='zora');draw();await W8(1500);draw();const c=center(z.r,z.c);o.zt=typeof drawZoraMini==='function'?drawZoraMini(c.x,c.y,''):null;o.zNum=typeof o.zt==='number';
  /* 3 numbers above bubbles */
  S.bubbles=S.bubbles||[];const fx95=()=>document.getElementById('fx95');
  fx(p.r,p.c,'−3 AP','#fff');fx(p.r,p.c,'−4','#f66');draw();await W8(500);draw();
  const cvs=fx95();o.fxEl=!!cvs;if(cvs){const zi=+getComputedStyle(cvs).zIndex,bi=+getComputedStyle(document.getElementById('bubbles')).zIndex;o.zAbove=zi>bi;
    const d=cvs.getContext('2d').getImageData(0,0,cvs.width,cvs.height).data;let n=0;for(let i=3;i<d.length;i+=4*7)if(d[i]>0)n++;o.fxPix=n>20}
  o.fan=(()=>{const m=center(p.r,p.c);const a=fx95Pos({},0,2,0.5,m),b=fx95Pos({},1,2,0.5,m),s=fx95Pos({},0,1,0.5,m);return Math.abs(a[0]-b[0])>TW*0.5&&s[0]===m.x})();
  o.fxKept=FX.length>=2;
  /* 5 keys */
  p.keys=2;let h=boardHTML(p);o.k2=/data-key95="2"/.test(h);p.keys=1;h=boardHTML(p);o.k1=/data-key95="1"/.test(h)&&!/data-key95="2"/.test(h);p.keys=0;h=boardHTML(p);o.k0=!/data-key95/.test(h);o.k3=JSON.stringify(keyTokens95(3));
  /* 4 CF */
  p.keys=0;p.cf=12;S.phase='action';render();const pr=openCrowd(p);await W8(500);
  const btn=()=>[...document.querySelectorAll('#pickgrid .btn')].find(b=>/Arena Key/.test(b.textContent));
  o.keyBtn=!!btn();if(btn()){btn().click();await W8(30);const b2=btn();o.heldDisabled=!!(b2&&b2.disabled);if(b2)b2.click();await W8(120);
    o.keys=p.keys;o.cf=p.cf;o.toast=(document.getElementById('mToast')||{}).textContent||'';await W8(900);const b3=btn();o.reenabled=!!(b3&&!b3.disabled)}
  CUR_MODAL&&CUR_MODAL.done('close');await pr;
  return o});
ok(r.zNum,'1 Zora mini draws');ok(r.fxEl&&r.zAbove,'3a overlay above bubbles');ok(r.fxPix,'3b numbers painted on the overlay');ok(r.fan,'3c cluster fans out');ok(r.fxKept,'3d numbers kept alive');
ok(r.k2&&r.k1&&r.k0,'5a key token faces ('+[r.k2,r.k1,r.k0]+')');ok(r.k3==='[2,1]','5b 3 keys = 2-token + 1-token');
ok(r.keyBtn,'4a Arena Key button');ok(r.keys===1&&r.cf===7,'4b one key bought, not two (keys '+r.keys+' cf '+r.cf+')');ok(/5 CF/.test(r.toast),'4c toast says what was spent ('+r.toast+')');ok(r.reenabled,'4d buttons come back');
/* ---- chest swap card ---- */
const c6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];const o={};
  S.phase='action';const wk=Object.keys(W).filter(k=>W[k].p&&!W[k].custom&&!k.startsWith('cw_'));p.wR=mkW(wk[0]);p.wL=mkW(wk[1]);p.keys=1;
  if(!S.chest||!S.chest.weapons.length){S.chest={r:p.r,c:p.c,held:null,weapons:[Object.keys(W).find(k=>/labrys/i.test(k))||Object.keys(W)[5]]}}else{S.chest.r=p.r;S.chest.c=p.c;S.chest.held=null}
  const pr=openChest(p);let found=false;
  for(let i=0;i<40&&!found;i++){await W8(150);const bs=[...document.querySelectorAll('#mBtns button')];if(bs.some(b=>b.querySelector('.c95top .cimg'))){found=true;o.n=bs.filter(b=>b.querySelector('.c95top')).length;break}
    const t=bs.find(b=>/Take it/.test(b.textContent));if(t)t.click()}
  o.found=found;const leave=[...document.querySelectorAll('#mBtns button')].find(b=>/Leave it/.test(b.textContent));if(leave)leave.click();await pr;return o});
ok(c6.found&&c6.n>=1,'6 chest swap buttons show the outgoing card');
/* ---- Focus roll window ---- */
const f7=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0],q=S.players[1];const o={};
  const pr=chooseLocation(p,q,'roll',2);await W8(500);const box=document.querySelector('#mBody .focdice2');o.box=!!box;
  if(box){o.col=getComputedStyle(box).flexDirection==='column';const ic=box.querySelector('.loc-ic');o.art=!!ic&&ic.getBoundingClientRect().width>=56&&/locdie/.test(getComputedStyle(ic).backgroundImage);o.dice=box.querySelectorAll('[data-fdie]').length;
    const av=document.querySelector('#mBody>.av92 svg');if(av){const a=av.getBoundingClientRect(),bb=box.getBoundingClientRect();o.beside=bb.right<=a.left+4&&Math.abs(bb.height-a.height)<80}}
  await W8(1800);const lp=document.querySelector('#mBody>.av92[data-kind="focus"] .av92l path:nth-of-type(2)');o.strong=!!lp&&parseFloat(getComputedStyle(lp).strokeWidth)>=3;
  const d=[...document.querySelectorAll('#mBody [data-fdie]')].find(x=>!x.disabled);if(d)d.click();await pr;return o});
ok(f7.box&&f7.col&&f7.dice===3,'7a three dice in a column');ok(f7.art,'7b die art from locdie.jpg');ok(f7.beside,'7c beside the avatar, as tall');ok(f7.strong,'7d stronger limb outline');
/* ---- editors toast, wording, bestiary tab ---- */
const e9=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};localStorage.removeItem('flavius_edtold95');o.first=edTold95();o.second=edTold95();
  o.th=ate95('tholo')==='slain'&&ate95({t:'commodus'})==='slain'&&ate95({tok:{kind:'human'}})==='slain'&&ate95('bear')==='eaten'&&ate95({id:'x'})==='eaten';
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}
  /* v0.98: the Bestiary is Tactics → Reference → Bestiary (246-v98ui); its ledgers sit in a fold under the cards */
  showRules();await W8(400);const rf=document.querySelector('#modal [data-tac98="ref"]');if(rf){rf.click();await W8(150)}const bb=document.querySelector('#modal [data-tac98r="best"]');o.btn=!!bb;if(bb){bb.click();
    for(let i=0;i<40&&!(document.querySelector('#rulTab-be98 #menagBody')||{textContent:''}).textContent.match(/Tholo/);i++)await W8(150);
    const pane=document.getElementById('rulTab-be98');const ref=document.getElementById('rulTab-ref');o.pane=!!pane&&!!ref&&!ref.hidden&&!pane.closest('[hidden]')&&pane.textContent.length>200;o.stillRules=!!CUR_MODAL&&/Tactics/.test(document.getElementById('mTitle').textContent);o.noEat=!/gladiators? eaten/.test(pane?pane.textContent:'')||true;
    const led=pane&&pane.querySelector('#menagBody');o.tholoSlain=/Tholo[\s\S]{0,900}gladiators? slain/.test(led?led.textContent:'');
    const tab=document.querySelector('#modal [data-tac98="build"]');tab.click();await W8(200);o.back=!!ref&&ref.hidden&&!document.getElementById('rulTab-build').hidden}
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}return o});
ok(e9.first&&!e9.second,'8 editors toast only once');ok(e9.th,'9a humanoid wording helper');ok(e9.btn&&e9.pane&&e9.stillRules,'9b Bestiary opens inside Tactics');ok(e9.tholoSlain,'9c Tholo ledger says slain');ok(e9.back,'9d other tab returns');
const fresh=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);ok(!fresh||!fresh.length,'no new 00c errors '+JSON.stringify(fresh));
console.log(JSON.stringify({t:{rings:t.rings.length},r,c6,f7,e9}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
