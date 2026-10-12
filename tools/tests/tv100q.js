/* v1.0 QUOTES IN NAMES: a gladiator called Galla "Fatum" A must not put a stray attribute name into any panel (morph95TplAttrs threw
   "not a valid attribute name"); no new 00c errors, no bogus attribute names anywhere, and a bad attribute name is skipped quietly. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  startEvent({ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}
  const mark=typeof ERR92!=='undefined'?ERR92.n:0;const NM='Galla "Fatum" A <b>&\' z';
  S.players.forEach((p,i)=>{p.name=NM+i;if('nick' in p)p.nick=NM;if('nickname' in p)p.nickname=NM});
  for(let k=0;k<4;k++){render();try{renderTurnInd()}catch(e){}draw();await W8(150)}
  const bad=[];for(const el of document.querySelectorAll('*'))for(const a of el.attributes)if(/["'<>=\s]/.test(a.name))bad.push(el.tagName+'.'+el.className+' '+a.name.slice(0,40));
  o.bad=bad.slice(0,8);o.errs=typeof ERR92!=='undefined'?ERR92.n-mark:0;
  const d=document.createElement('div');d.innerHTML='<p id="x" a="1">t</p>';const n=document.createElement('div');n.innerHTML='<p id="x" a="2" ok="y">t</p>';
  const oo=d.firstChild,nn=n.firstChild;p95Rec(oo);Object.defineProperty(nn,'attributes',{value:[{name:'Fatum"',value:'1',namespaceURI:null},{name:'ok',value:'y',namespaceURI:null},{name:'a',value:'2',namespaceURI:null}]});
  try{morph95TplAttrs(oo,nn);o.def=oo.getAttribute('ok')==='y'&&oo.getAttribute('a')==='2'}catch(e){o.def='threw '+e.message}
  return o});
ok(!r.bad.length,'stray attribute names '+JSON.stringify(r.bad));ok(r.errs===0,'00c errors '+r.errs);ok(r.def===true,'defensive '+r.def);
console.log(JSON.stringify(r));console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');await b.close();process.exit(miss.length||errs.length?1:0)})();
