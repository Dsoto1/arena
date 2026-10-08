/* ONE FACE phase 1 shots: node tools/plans/face99/shots.js <before.html> <after.html>
   The same calls on both pages (portraitHTML / gArt-like / mgrPortrait / Ludus record / online look / specFaceSVG / council face83 /
   onlPatronFace82) → tools/plans/face99/<kind>_before.png, <kind>_after.png (python3 compose.py joins them into before_after.png). */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const out=__dirname;
const shot=async(f,tag)=>{const pg=await b.newPage({viewport:{width:1200,height:1500}});await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+f);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);
    const K={};
    K.studio=[{name:'Marcus Varro',portrait:{skin:SKINS[4],hair:HAIRS[2],helm:'galea',bs:'full',eyes:'#5a3a1e'},color:'#c0433a'},
      {name:'Aurelia',portrait:{skin:SKINS[1],hair:HAIRS[3],helm:'none',hs:'long',fem:true,garb:'scale',mark:'kohl',ear:'1',neck:'torque'},color:'#4f7fc4'},
      {name:'Archer',portrait:{skin:SKINS[10],hair:HAIRS[0],helm:'murmillo',garb:'chain'},color:'#4f9a57'},
      {name:'Brutus',portrait:{skin:SKINS[6],hair:HAIRS[9],helm:'laurel',hs:'crop',bs:'full',mark:'scar',garb:'fur'},color:'#d4b13c'}].map(x=>portraitHTML(x,'lg'));
    K.lanista=MGR_PRE.slice(0,4).map(m=>mgrPortrait(m,'md'));
    K.manager=['g_401','g_77','g_1203','g_9'].map((id,i)=>{const cls=['soldier','hero','amazonia','venatore'][i];return portraitHTML({name:id,portrait:gladPortrait(id,cls),color:CLASSES[cls].color},'sm')});
    K.annals=['Spartacus','Crixus','Verus','Priscus'].map((n,i)=>{const cls=['slave','soldier','hero','royalty'][i];return gladFace({name:n,cls,portrait:gladPortrait(n,cls)},'md')});
    K.online=[{name:'Onl',look:{portrait:{skin:SKINS[3],hair:HAIRS[4],helm:'thraex',hs:'curly',bs:'goatee'},color:'#7a3a9a'},cls:'hero'},{name:'Two',look:{portrait:{skin:SKINS[8],fem:true,hs:'braid'}},cls:'amazonia'}].map(c=>onl80Face(c,'md'));
    const spect=[{skin:'#e6cfa8',hair:'#4a2c17',beard:true,hat:'pileus',tunic:'#e8dcc0',robe:'#7a2230'},{skin:'#c68e5f',hair:'#1f1510',fem:true,long:true,hat:'veil',tunic:'#d8c8a8',robe:'#35606a'},
      {skin:'#96603b',hair:'#2e2019',hat:'straw',tunic:'#cdb48a',robe:'#a86a2a'},{skin:'#f1c9a5',hair:'#9a6a30',beard:true,hat:'',tunic:'#e8dcc0',robe:'#5a4636'},{skin:'#a86b43',hair:'#8a8a8a',hat:'hood'},{skin:'#e0ac7e',hair:'#7a4a22',hat:'wreath',beard:true},{skin:'#6b3f24',hair:'#1f1510',hat:'turban'},{skin:'#f6dcc0',hair:'#d8c28a',hat:'helm'}];
    K.spectator=spect.map(l=>specFaceSVG(l));K.spectator_big=spect.map(l=>specFaceSVG(l).replace('width="20" height="20"','width="72" height="72"'));
    K.council=council83Make('demo-career-7').map(a=>face83(a,58));
    K.patron=['acc1','acc2','acc3','acc4'].map(id=>onlPatronFace82(onlPatronDef82(id,'house '+id),72));
    const box=document.createElement('div');box.id='f99shot';box.style.cssText='position:fixed;inset:0;z-index:999999;background:#140f0b;color:#efe3cc;padding:10px;font:12px system-ui;overflow:auto';
    box.innerHTML=Object.entries(K).map(([k,a])=>`<div data-k="${k}" style="display:flex;gap:8px;align-items:flex-end;margin:0 0 6px;padding:6px;border:1px solid #4a3826;width:max-content"><b style="width:90px">${k}</b>${a.map(s=>`<span style="display:inline-block">${s}</span>`).join('')}</div>`).join('');document.body.appendChild(box)});
  await pg.waitForTimeout(400);for(const el of await pg.$$('#f99shot [data-k]')){const k=await el.getAttribute('data-k');await el.screenshot({path:path.join(out,k+'_'+tag+'.png')})}
  await pg.locator('#f99shot').screenshot({path:path.join(out,'all_'+tag+'.png')});await pg.close()};
await shot(path.resolve(process.argv[2]),'before');await shot(path.resolve(process.argv[3]),'after');await b.close()})();
