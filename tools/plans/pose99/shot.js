/* v0.99 token modeller screenshots: node tools/plans/pose99/shot.js flavius-arena.html [outdir]
   → presets.png (the grouped picture buttons), joints.png (the Joints tab with a joint selected + its gizmo), phone.png (390 px), grid.png (every preset larger) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const out=process.argv[3]||__dirname;const errs=[];
const open=async(pg)=>{pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+require('path').resolve(process.argv[2]),{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='pose99';c.name='Marcus Posturus';charFromClass(c,'soldier');c.classRef='cls:soldier';
    c.portrait.bs='full';c.portrait.hs='crop';await Store.put('customChars',c.id,c);await loadCustoms();t93Open(JSON.parse(JSON.stringify(c)))});
  await pg.waitForFunction(()=>{const b=document.querySelector('#t93m [data-t93m="save"]');return b&&!b.disabled},null,{timeout:180000});
  await pg.waitForFunction(()=>document.querySelector('#t93m')&&document.querySelector('#t93m').dataset.t93th==='1',null,{timeout:240000})};
const pg=await b.newPage({viewport:{width:1300,height:900}});await open(pg);
await pg.evaluate(()=>document.querySelector('#t93m [data-t93pre="overhead"]').click());await pg.waitForTimeout(900);
await pg.screenshot({path:out+'/presets.png'});
await pg.evaluate(()=>{document.querySelector('#t93m [data-t93tab="joints"]').click();T93.ui.pick('sR');T93.ui.nudge(2,-20);T93.ui.commit()});await pg.waitForTimeout(900);
await pg.screenshot({path:out+'/joints.png'});
/* every preset at a readable size, from the rig itself */
const grid=await pg.evaluate(()=>{const api=T93.api;const ps=api.presets;const W=150,H=172,per=8;const c=document.createElement('canvas');c.width=W*per;c.height=(H+18)*Math.ceil(ps.length/per);const g=c.getContext('2d');
  g.fillStyle='#2a2520';g.fillRect(0,0,c.width,c.height);ps.forEach(([k],i)=>{const t=api.thumb(ps[i][2],W);const x=(i%per)*W,y=Math.floor(i/per)*(H+18);g.drawImage(t,x,y+18);g.fillStyle='#efe6d6';g.font='13px sans-serif';g.fillText((T93_PRE[k]||k)+' · '+ps[i][2].length+' B',x+4,y+13)});return c.toDataURL('image/png')});
require('fs').writeFileSync(out+'/grid.png',Buffer.from(grid.split(',')[1],'base64'));
const ph=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,isMobile:true});await open(ph);
await ph.evaluate(()=>document.querySelector('#t93m [data-t93tab="joints"]').click());await ph.waitForTimeout(700);
await ph.screenshot({path:out+'/phone.png'});
console.log('ERRS',JSON.stringify(errs));await b.close()})();
