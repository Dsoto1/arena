/* v0.89 part I (176-v89sculpt3d): sculpted figure tokens on the board are lit (per-part filter, whole-figure form light, thick
   bevelled base), drawn from a cached canvas (cache hit on the next frame), with a soft shadow; figureSVG / tokenImg / figureHTML
   elsewhere are unchanged; standee/minis tokens never pass through the 3D path; the Studio sculpt preview shows the lit figure. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v107tokoff','1') /* v1.07: 400 retires the sculpted figures on the board — the 176 path is tested under its kill switch (custom beasts still use it) */});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{const r={};const L=(t,x,y,w,h,c,rr=0)=>({t,x,y,w,h,c,r:rr,o:1});
  const spec={kind:'human',body:'tunic',helm:'none',c1:'#2f6aa8',c2:'#d6ab4c',weapon:'none',shield:'none',baked:[L('star',50,100,14,14,'#e6b93a',30),L('line',50,118,30,6,'#5a3a20')],layers:[L('circle',40,90,10,10,'#000')]};
  spec.layers[0].cut=1;
  const plain=figureSVG(spec),lit=sc3dSVG(plain);
  r.plainNoFilter=!/filter=/.test(plain);
  r.litFilter=(lit.match(/filter="url\(#s3f\)"/g)||[]).length>=5&&/<filter id="s3f"/.test(lit)&&/<filter id="s3fo"/.test(lit)&&/filter="url\(#s3fo\)"/.test(lit);
  r.litBase=/id="s3s"/.test(lit)&&/A31 7 0 0 0 81 163/.test(lit)&&!/cx="50" cy="160" rx="31"/.test(lit);
  r.maskKept=/<mask id="scm[^"]*"[^>]*><rect[^>]*fill="#fff"\/>/.test(lit)&&!/<mask[^>]*>[^]*?filter=[^]*?<\/mask>/.test(lit.replace(/<\/mask>[^]*$/,'</mask>'));
  r.rotLitOutside=/<g filter="url\(#s3f\)"><g transform="translate\(50 100\) rotate\(30\)"/.test(lit);
  r.validXML=!new DOMParser().parseFromString(lit,'image/svg+xml').querySelector('parsererror');
  r.htmlPlain=/filter=/.test(figureHTML(spec,60))&&!/filter=/.test(figureHTML(spec,20));r.htmlStudio=/s3pf/.test(figureHTML(spec,230,null,{selLayer:-1}));
  /* the board */
  menuHide();SETTINGS.briefing=false;SETTINGS.tokenStyle='figure';POPPED.add('firstTurn');SPEED='pause';
  const seats=['soldier','hero','amazonia','royalty'].map((c,i)=>({cls:c,cpu:true,diff:'easy',name:'P'+i})).map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}});
  await new Promise(res=>setTimeout(res,1500));for(let i=0;i<8;i++){if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(res=>setTimeout(res,120))}
  S.players[0]._onlSc={...spec,layers:[]};SPEED='pause';
  let calls=0;const bF=drawFigureTok;drawFigureTok=function(){calls++;return bF.apply(this,arguments)};
  /* v1.0: the printed seats wear 311's stand-ins (no sculpted canvas), so wait for THIS figure's own canvas, not any miss */
  const myKey=JSON.stringify(S.players[0]._onlSc)+'|';const mine=()=>[...SC3D_CV.keys()].some(k=>k.startsWith(myKey));
  for(let i=0;i<40&&!mine();i++){draw();await new Promise(res=>setTimeout(res,100))}
  r.miss=SC3D.miss;const h0=SC3D.hits;draw();draw();r.hits=SC3D.hits-h0;r.cv=SC3D_CV.size;r.calls=calls;
  const c=[...SC3D_CV.values()][0];r.shadow=!!c&&c.width>c._w;
  /* tokenImg (cards, corpses, menus) unchanged: its image is the plain figure */
  const im=tokenImg(S.players[0]._onlSc);r.tokenImgPlain=!im||decodeURIComponent(im.src).includes('filter=');
  /* standees/minis: printed classes never draw a figure */
  SETTINGS.tokenStyle='standee';delete S.players[0]._onlSc;calls=0;const m0=SC3D.miss,h1=SC3D.hits;draw();draw();r.standeeCalls=calls;r.standeeNo3d=SC3D.miss===m0&&SC3D.hits===h1;
  drawFigureTok=bF;SETTINGS.tokenStyle='figure';return r});
const miss=[];for(const k of ['plainNoFilter','litFilter','litBase','maskKept','rotLitOutside','validXML','htmlPlain','htmlStudio','shadow','tokenImgPlain','standeeNo3d'])if(!o[k])miss.push(k);
if(!(o.miss>0))miss.push('cache built');if(!(o.hits>0))miss.push('cache hit');if(o.standeeCalls)miss.push('standee drew figures');
console.log(JSON.stringify({o,miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
