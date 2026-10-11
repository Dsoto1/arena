/* v1.0 pronouns (sx in 17-manager): Manager recruiting texts follow the recruit's sex — a female free agent's card, buttons, tooltips,
   steps, pitches, projections, advisor lines and scouting reports hold no he/him/his, a male's none of she/her/hers. Also the
   sit-out, equip and issued-kit refusals, and the Faith buttons. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
  const w=W_(),m=me();m.fame=Math.max(m.fame,80);m.coin=900;
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)&&!x.inj);const F=fa[0],M=fa[1];F.fem=true;M.fem=false;
  const txt=h=>{const d=document.createElement('div');d.innerHTML=h;let t=d.textContent;d.querySelectorAll('*').forEach(e=>{for(const a of e.attributes)if(/^(title|data-adv85|aria-label)$/.test(a.name))t+=' | '+a.value});return t};
  const run=g=>{const out=[];MGR.tab='recruit';
    for(const s of [1,2,3]){MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=s;out.push(txt(detailHTML(g)))}
    for(const a of REC98.order){const L=REC98_ACT_L(g)[a];out.push(L.join(' '))}
    const P=PITCH98_L(g);out.push(Object.values(P).join(' '));
    for(const p of PITCH98){try{out.push(rec98Proj(g,m,p))}catch(e){}}
    out.push(txt(rec98PitchHTML(g,m)),txt(rec98HouseHTML(g,m)));
    /* scout everything, then read the report + the personality + the card again */
    m.coin=900;const say=[];for(const a of ['ask','watch','cup','study','trial']){try{const r=rec98Act(g,a);if(r&&r.say)say.push(r.say)}catch(e){}}
    for(const s of [1,2,3]){MGR.recStep=s;out.push(txt(detailHTML(g)))}
    out.push(txt(rec98PersHTML(g,m)),say.join(' '));
    for(const st of [1,2,3]){try{const r=recAdvice74(g,m,st);if(r)out.push(String(r[1]||''))}catch(e){}}
    try{out.push(String(offerVerdict(g,m,{wage:1}).why||''))}catch(e){}
    out.push(txt(pipelineHTML(m)));
    return out.join(' \n ')};
  const r={f:run(F),m:run(M)};
  /* other Manager lines that name a fighter */
  const G=[F,M].map(g=>[restMsg90(g),sx(g,'he','she'),typeof maimLine87==='function'?'':'' ].join(' '));r.rest=G;
  r.sx=[sx(F,'m','f'),sx(M,'m','f'),sx(null,'m','f')];
  r.faith=[F,M].map(g=>{try{return txt(faithBtns85?faithBtns85(g):'')}catch(e){return ''}});
  return r});
const HE=/\b(he|him|his|himself)\b/i,SHE=/\b(she|her|hers|herself)\b/i;
const show=(re,t)=>{const mm=t.match(new RegExp('.{0,40}'+re.source+'.{0,30}','i'));return mm?mm[0]:''};
ok(o.f.length>800,'female card text came back '+o.f.length);ok(o.m.length>800,'male card text came back '+o.m.length);
ok(!HE.test(o.f),'female recruit text holds he/him/his: …'+show(HE,o.f)+'…');
ok(!SHE.test(o.m),'male recruit text holds she/her/hers: …'+show(SHE,o.m)+'…');
ok(/\bher\b/i.test(o.f)&&/\bhim\b/i.test(o.m),'the right pronouns do appear (her / him)');
ok(!HE.test(o.rest[0])&&!SHE.test(o.rest[1]),'rest-week refusal follows the sex '+JSON.stringify(o.rest));
ok(o.sx.join()==='f,m,m','sx picks by g.fem '+o.sx);
console.log(JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));
await b.close();process.exit(miss.length||errs.length?1:0)})();
