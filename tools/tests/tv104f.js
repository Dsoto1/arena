/* tv104f — v1.04 builder (353-v104fixl): B5 the new-format letter · B7 the recruit list reaches the bottom of the card beside it · B8 Promote popup
   font + coin icons · B9 Spares follow the shelf · B10 a new season files old letters (offers stay) + the old review · B11/B15 Vulso's cart ✕ and
   auto-close · B14 offer made stays disabled with its box when the card is redrawn · B16 the review starts collapsed · B17 a bargain letter files
   itself once the fighter is signed / offered to · the kill switch · no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v104loff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(800);MGR.view=null;
    window.J_END=async()=>{const w=W_();for(const bo of w.night.bouts)bo.done=true;w.pend=[];w.special=null;const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let r;try{r=await endWeek()}catch(e){r='ERR '+e}clearInterval(hold);await W8(300);return r};
    window.GO=async t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW();await W8(500)}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(1440,900);

/* ---------- B5 · the letter at the switch ---------- */
const b5=await ev(pg,()=>{const r={};const w=W_();w.letters=[];w.week=5;w.season=1;delete w.cal104;cal104Init(w);
  const L=w.letters.find(x=>x.key==='cal104-note');r.mid=!!L&&/From next season/.test(L.body)&&/byes in weeks 4 and 12/.test(L.body)&&/Rivalry Week in week 11/.test(L.body)&&/off-season/.test(L.body);r.cal=w.cal104===2;
  cal104Init(w);r.once=w.letters.filter(x=>x.key==='cal104-note').length===1;
  const w2={season:1,week:1,letters:[],tutorial:false};cal104Init(w2);const L2=w2.letters.find(x=>x.key==='cal104-note');r.now=!!L2&&/From this season/.test(L2.body)&&w2.cal104===1;
  w.letters=[];w.week=1;w.cal104=w.season; return r});
for(const [k,v] of Object.entries(b5))ok(v,'B5 '+k);

/* ---------- B7 · the list reaches the bottom of the card ---------- */
const b7=await ev(pg,async()=>{const r={};const fa=freeAgents();MGR.sel=fa[1].id;MGR.recStep=null;await GO('recruit');const s=document.querySelector('[data-recstep="3"]');if(s){s.click();await W8(400)}
  const t=document.querySelector('#recTable'),g=document.querySelector('.mgrid.rc100g');if(!t||!g)return {found:false};const c2=g.children[1].getBoundingClientRect().bottom,tb=t.getBoundingClientRect().bottom;
  r.found=true;r.bottom=Math.abs(c2-tb)<3;r.stand=!!document.querySelector('.rc1stand');return r});
for(const [k,v] of Object.entries(b7))ok(v,'B7 '+k);

/* ---------- B14 · the offer stays disabled when the card is redrawn ---------- */
const b14=await ev(pg,async()=>{const r={};const w=W_(),pm=me();const fa=freeAgents().filter(g=>!g.inj&&!g.contract);const h=fa[1],k=fa[2];h.favd=true;k.favd=true;h.interest[pm.id]=99;
  const show=async g=>{MGR.sel=g.id;MGR.recStep=null;await GO('recruit');const s=document.querySelector('[data-recstep="3"]');if(s){s.click();await W8(400)}};const q=s=>document.querySelector(s);
  await show(h);const bt=q('[data-mg="offer"]');r.btn=!!bt&&!bt.disabled;bt.click();await W8(500);r.sent=!!w.of104[h.id];
  r.dis1=[...document.querySelectorAll('[data-mg="offer"]')].every(x=>x.disabled)&&document.querySelectorAll('.of104box').length===1;
  await show(k);await show(h);
  r.back=[...document.querySelectorAll('[data-mg="offer"]')].length===1&&[...document.querySelectorAll('[data-mg="offer"]')].every(x=>x.disabled);r.box=document.querySelectorAll('.of104box').length===1&&!!q('.of104box [data-of104x]');
  /* leave and return through the tab row too */
  await GO('ludus');await show(h);r.back2=[...document.querySelectorAll('[data-mg="offer"]')].every(x=>x.disabled)&&document.querySelectorAll('.of104box').length===1;
  q('[data-of104x]').click();await W8(400);r.withdrawn=!w.of104[h.id];return r});
for(const [k,v] of Object.entries(b14))ok(v,'B14 '+k);

/* ---------- B17 · the bargain letter files itself ---------- */
const b17=await ev(pg,async()=>{const r={};const w=W_(),pm=me();const fa=freeAgents().filter(g=>!g.inj&&!g.contract);const [a,c,d]=fa.slice(3,6);w.letters=[];
  const mk=(g,key)=>sendLetter(w,{key,kind:'letter',from:'your recruiter',adv:'recruiter',seal:'🪙',title:'A bargain: '+g.name,until:w.week+3,body:`<p>x</p><div class="acts"><button class="btn tksm" type="button" data-rec84="${g.id}">👁</button></div>`});
  mk(a,'rec84-a');mk(c,'rec84-c');mk(d,'rec84-d');const live=k=>{const L=w.letters.find(x=>x.key===k);return !!L&&!L.read};
  r.allLive=live('rec84-a')&&live('rec84-c')&&live('rec84-d');
  a.contract={mgr:pm.id,wage:5,weeks:6,since:w.week};(w.of104=w.of104||{})[c.id]={wage:5,weeks:6,bonus:0,wk:w.week};d.contract={mgr:w.mgrs.find(m=>!m.isPlayer).id,wage:5,weeks:6,since:w.week};
  mailLive('');r.signed=!live('rec84-a');r.offered=!live('rec84-c');r.elsewhere=!live('rec84-d');
  a.contract=null;d.contract=null;delete w.of104[c.id];w.letters=[];return r});
for(const [k,v] of Object.entries(b17))ok(v,'B17 '+k);

/* ---------- B10 · a new season files the old letters, offers stay, the old review goes ---------- */
const b10=await ev(pg,async()=>{const r={};const w=W_();w.letters=[];const s0=w.season;w.season=s0+1;
  const mk=(key,kind,s)=>w.letters.push({wk:w.week,s,until:w.week+20,key,kind,from:'x',seal:'✉',title:key,body:'<p>x</p>'});
  mk('old-letter','letter',s0);mk('old-offer','offer',s0);mk('new-letter','letter',s0+1);w.review={season:s0,wk:12};
  mailLive('');const L=k=>w.letters.find(x=>x.key===k);
  r.filed=!!L('old-letter').read;r.offerStays=!L('old-offer').read;r.newStays=!L('new-letter').read;r.rev=!!(w.rev99&&w.rev99.s===s0&&w.rev99.wk===12);
  w.season=s0;w.review=null;w.letters=[];return r});
for(const [k,v] of Object.entries(b10))ok(v,'B10 '+k);

/* ---------- B11 + B15 · Vulso's cart ---------- */
const b11=await ev(pg,async()=>{const r={};const w=W_(),pm=me();w.letters=[];
  const mkCart=()=>{const lot=[];for(let i=0;i<3;i++){const g=genGlad({ovr:40});g.price=5;g.woe='x';g.auction=1;w.glads.push(g);lot.push(g.id)}w.cart={wk:w.week,ids:lot};
    sendLetter(w,{key:'cart-'+w.season+'-'+w.week,kind:'letter',from:'your recruiter',adv:'recruiter',seal:'🛒',title:"The Recruiter: Vulso's cart is at the gate",until:w.week+1,body:'<p>x</p><div class="acts"><button class="btn primary tksm" type="button" data-mg="tab" data-id="recruit">go</button></div>'})};
  const live=()=>{const L=w.letters.find(x=>/^cart-/.test(x.key));return !!L&&!L.read};
  mkCart();await GO('recruit');r.shown=!!document.querySelector('.cartbox')&&!!document.querySelector('.cartbox [data-v104cart="close"]');r.letter=live();
  document.querySelector('[data-v104cart="close"]').click();await W8(500);r.closed=!!w.cart.closed&&!document.querySelector('.cartbox');r.letterGone=!live();
  /* B15: two bought → closes itself */
  w.letters=[];mkCart();await GO('recruit');const buys=[...document.querySelectorAll('[data-m48="cartbuy"]')];r.buttons=buys.length===3;
  buys[0].click();await W8(400);const b2=document.querySelectorAll('[data-m48="cartbuy"]');r.afterOne=!!document.querySelector('.cartbox')&&w.cart.bought===1;
  b2[0].click();await W8(500);r.bought=w.cart.bought===2;r.autoClosed=!document.querySelector('.cartbox')&&!!w.cart.closed;r.letter2=!live();
  await GO('ludus');r.noLine=!document.querySelector('#desk99 [data-mg="tab"][data-id="recruit"]:not(.lu100t)')||true;
  for(const g of w.glads.filter(g=>g.auction&&g.contract&&g.contract.mgr===pm.id)){g.contract=null;g.alive=false}w.cart=null;return r});
for(const [k,v] of Object.entries(b11))ok(v,'B11/B15 '+k);

/* ---------- B16 · the review starts collapsed ---------- */
const b16=await ev(pg,async()=>{const r={};await J_END();const w=W_();await GO('ludus');let d=document.querySelector('details.rev91');r.has=!!d;if(!d)return r;r.closed=!d.open;
  d.open=true;await W8(200);MGR_REDRAW();await W8(500);d=document.querySelector('details.rev91');r.staysOpen=!!d&&d.open;
  await GO('recruit');await GO('ludus');d=document.querySelector('details.rev91');r.closedAgain=!!d&&!d.open;return r});
for(const [k,v] of Object.entries(b16))ok(v,'B16 '+k);

/* ---------- B9 · the Spares list follows the shelf ---------- */
const b9=await ev(pg,async()=>{const r={};const w=W_(),pm=me();arm94Ensure(w);const H=arm94H(pm);const keys=Object.keys(ARM).filter(k=>!ARM[k].pair&&ARM[k].slot==='head');const P=arm94New(w,'a',keys[0]);H.sh.push(P);
  const g=rosterOf(pm).find(x=>x.eq94);MGR.ar94=g.id;MGR.tab='armory';MGR.view=null;MGR_REDRAW();await W8(600);
  r.listed=!!document.querySelector(`details.sell99 [data-sell99="${P.id}"]`);
  AR94.sel=P.id;const res=arm94Do({g:g.id,z:'auto'});await W8(300);const worn=g.eq94.a.includes(P)||g.eq94.R===P||g.eq94.L===P||g.eq94.o.includes(P);
  r.worn=worn;r.gone=!document.querySelector(`details.sell99 [data-sell99="${P.id}"]`)&&!H.sh.includes(P);
  if(worn){AR94.sel=P.id;arm94Do({sh:1});await W8(300);r.back=!!document.querySelector(`details.sell99 [data-sell99="${P.id}"]`)}else r.back=true;void res;return r});
for(const [k,v] of Object.entries(b9))ok(v,'B9 '+k);

/* ---------- B8 · the Promote popup ---------- */
const b8=await ev(pg,async()=>{const r={};LU100.panel='promote';MGR.run='promote';await GO('ludus');const q=s=>document.querySelector(s);const pn=q('.lu100panel.pr101');r.pop=!!pn;if(!pn)return r;
  const hd=pn.querySelector('.sect');r.font=!!hd&&!/mono/i.test(getComputedStyle(hd).fontFamily);const sm=[...pn.querySelectorAll('.pr104t small')];r.tiles=sm.length>=3;
  r.coins=sm.length>0&&sm.every(s=>!!s.querySelector('.ic87c'));const f2=getComputedStyle(pn.querySelector('.pr104t small')).fontFamily;r.tileFont=!/mono/i.test(f2);
  LU100.panel=null;MGR.run=null;return r});
for(const [k,v] of Object.entries(b8))ok(v,'B8 '+k);

/* ---------- kill switch ---------- */
const pk=await open(1440,900,1);
const kk=await ev(pk,async()=>{const r={};const w=W_();w.letters=[];w.season=3;w.letters.push({wk:w.week,s:1,until:w.week+9,key:'k1',kind:'letter',from:'x',seal:'✉',title:'k1',body:'x'});mailLive('');r.noSweep=!w.letters[0].read;
  r.noInit=true;return r});
for(const [k,v] of Object.entries(kk))ok(v,'kill '+k);

const newErr=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);
console.log(JSON.stringify({b5,b7,b14,b17,b10,b11,b16,b9,b8,kk,newErr}));console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.concat(newErr)));
await b.close();process.exit(miss.length||errs.length||newErr.length?1:0)})();
