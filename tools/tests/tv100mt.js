/* v1.0 main-menu tray buttons: maroon class, aria-expanded toggles, gold-on-maroon contrast >= 4.5, shots */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const out={};const errs=[];
for(const [tag,w,h] of [['desk',1400,950],['phone',390,800]]){
const ctx=await b.newContext({viewport:{width:w,height:h}});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000}).catch(()=>{});await pg.waitForSelector('[data-mm82="tut"].tray100',{timeout:15000}).catch(()=>{});await pg.waitForTimeout(500);
const info=()=>pg.evaluate(()=>['[data-mm="multi"]','[data-mm82="tut"]'].map(s=>{const el=document.querySelector(s);return {cls:el.classList.contains('tray100'),ax:el.getAttribute('aria-expanded')}}));
out[tag+'_closed']=await info();
const lum=c=>{const v=c.map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
/* his note: the tray BUTTON stays sandstone; the buttons that appear in the tray wear Play Now's porphyry red with gold letters */
const rgb=await pg.evaluate(()=>{const t=document.querySelector('#mmLearn .ss98,#mmMulti .ss98');return t?getComputedStyle(t).color.match(/\d+/g).slice(0,3).map(Number):[0,0,0]});
const L1=lum(rgb),L2=lum([0x6d,0x1c,0x13]);out[tag+'_contrast']=+((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)).toFixed(2);
await pg.screenshot({path:`tools/plans/menu100/tray_${tag}_closed.png`});
await pg.click('[data-mm="multi"]');await pg.waitForTimeout(300);out[tag+'_multiOpen']=(await info())[0].ax;await pg.screenshot({path:`tools/plans/menu100/tray_${tag}_multi.png`});await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(400);
out[tag+'_open']=await info();
await pg.screenshot({path:`tools/plans/menu100/tray_${tag}_open.png`});
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);out[tag+'_tutclosed']=(await info())[1].ax;
await pg.mouse.click(5,5);await pg.waitForTimeout(300);out[tag+'_multiOutside']=(await info())[0].ax;
await ctx.close()}
const ok=['desk','phone'].every(t=>out[t+'_closed'].every(x=>x.cls&&x.ax==='false')&&out[t+'_multiOpen']==='true'&&out[t+'_open'][1].ax==='true'&&out[t+'_tutclosed']==='false'&&out[t+'_multiOutside']==='false'&&out[t+'_contrast']>=4.5);
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log(ok&&!errs.length?'PASS':'FAIL');await b.close();process.exit(ok&&!errs.length?0:1)})();
