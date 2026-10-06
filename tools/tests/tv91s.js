/* v0.91 188-v91sponsor — PAINTED SPONSORS: every built-in sponsor paints all 11 moods without errors and every mood differs visibly
   from calm (pixel diff); the portraits are cached; old sponsor objects (no new fields) still render; 'really' in FLAV_PRI/FLAV_LINES and
   every voice; the Studio designer shows the 11-mood row, the new parts, skin swatches and box colours; a sponsor's frame + curtain colours
   show in the box in a live event. SHOT=<png> saves the designer. */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:900}});await p.route(/fonts\.g/,r=>r.abort());const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_devEditor','1')});
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const o=await p.evaluate(()=>{const r={};const M=SP91_MOODS;r.nM=M.length;
  const shot=(sp,m)=>{const cv=document.createElement('canvas');cv.width=152;cv.height=120;const c=cv.getContext('2d');flavFace(c,76,60,148,116,m,false,sp);return c.getImageData(8,8,136,104).data};
  const diff=(a,b2)=>{let s=0;for(let i=0;i<a.length;i+=4)s+=Math.abs(a[i]-b2[i])+Math.abs(a[i+1]-b2[i+1])+Math.abs(a[i+2]-b2[i+2]);return s/(a.length/4)/3};
  r.diffs={};r.min=1e9;let bad=0;
  for(const sp of Object.values(CITY_SPONSORS)){const base=shot(sp,'calm');r.diffs[sp.id]={};for(const m of M){if(m==='calm')continue;let d=0;try{d=diff(base,shot(sp,m))}catch(e){bad++}r.diffs[sp.id][m]=+d.toFixed(1);r.min=Math.min(r.min,d)}}
  r.bad=bad;
  /* cache: a second draw adds nothing */
  const n0=SP91_CACHE.size;shot(CITY_SPONSORS[2],'angry');r.cache=SP91_CACHE.size===n0&&n0>0;
  /* old sponsor objects: the v0.28 fields only, and a bare one */
  const old1={id:'old1',name:'Old Patron',short:'Old',skin:'#d9a07a',hair:'#2a1c12',beard:'full',long:false,head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'flavius',lines:{cheer:'',angry:''},custom:true,v:1};
  const old2={id:'old2',name:'Bare'};
  r.old=[old1,old2].map(sp=>{const u=M.map(m=>flavFaceURL(m,sp));return u.every(x=>/^data:image\/png/.test(x)&&x.length>2000)&&new Set(u).size===M.length});
  /* every new part renders */
  const parts={hair2:['curls','cropped','receding','bald','long','bun','braids'],beard:['stubble','moustache','goatee'],head:['laurelg','circlet','veil','phrygian'],age:['young','old','elder'],ear:['hoops','pearls','gems'],torc:['gold','silver'],brooch:['silver','none']};
  r.parts=[];for(const [f,vs] of Object.entries(parts))for(const v of vs){try{const a=shot({...old1,id:'pp',[f]:v},'cheer'),b2=shot(old1,'cheer');if(diff(a,b2)<.5)r.parts.push(f+':'+v+' same')}catch(e){r.parts.push(f+':'+v+' '+e.message)}}
  r.really=FLAV_PRI.really>0&&(FLAV_LINES.really||[]).length>=3&&Object.values(SPONSOR_VOICES).every(v=>(v.really||[]).length>0);
  return r});
ok(o.nM===11,'11 moods');ok(o.bad===0,'no draw errors');ok(o.min>3.5,'every mood differs from calm (min diff '+o.min.toFixed(1)+')');
ok(o.cache,'portraits cached');ok(o.old.every(Boolean),'old sponsors render every mood '+JSON.stringify(o.old));ok(!o.parts.length,'new parts render + show '+o.parts.join(', '));ok(o.really,'really: priority, lines, voices');
/* the designer */
await p.evaluate(()=>{try{menuHide()}catch(e){}openStudio('sponsors')});await p.waitForSelector('#spPrev .sp91row',{timeout:15000}).catch(()=>{});await p.waitForTimeout(400);
const s=await p.evaluate(()=>{const r={};const q=x=>document.querySelector(x);
  r.row=document.querySelectorAll('#spPrev .sp91row img').length;r.big=!!q('#spPrev .sp91big img');
  r.sel=['hair2','age','ear','torc','brooch','beard','head'].filter(f=>q(`select[data-sonf="${f}"]`)).length;
  r.opts=['laurelg','phrygian','veil','circlet'].every(v=>q(`select[data-sonf="head"] option[value="${v}"]`))&&!!q('select[data-sonf="beard"] option[value="goatee"]');
  r.col=!!q('input[type=color][data-sonf="frame"]')&&!!q('input[type=color][data-sonf="curtain"]');r.sw=document.querySelectorAll('[data-sps="skin91"]').length;
  r.long=!q('select[data-sonf="long"]');return r});
ok(s.row===11&&s.big,'mood row of 11 + big portrait '+JSON.stringify(s));ok(s.sel===7&&s.opts,'new part selects '+JSON.stringify(s));ok(s.col&&s.sw>=8,'box colours + skin swatches');ok(s.long,'old Long hair select folded into Hair style');
const before=await p.evaluate(()=>document.querySelector('#spPrev .sp91row img').src);
await p.selectOption('select[data-sonf="hair2"]','braids');await p.waitForTimeout(200);
const after=await p.evaluate(()=>({src:document.querySelector('#spPrev .sp91row img').src,long:ST.spd2.long,h:ST.spd2.hair2}));
ok(after.src!==before&&after.long&&after.h==='braids','hair style updates the preview + long flag');
await p.click('[data-sps="skin91"][data-v="#5e3a22"]');await p.waitForTimeout(250);ok(await p.evaluate(()=>ST.spd2.skin==='#5e3a22'),'skin swatch');
const seed0=await p.evaluate(()=>typeof RNG_STATE!=='undefined'?JSON.stringify(RNG_STATE):'');
await p.click('[data-sps="rand"]');await p.waitForTimeout(250);ok(await p.evaluate(()=>!!ST.spd2.hair2!=null&&!!ST.spd2.age&&document.querySelectorAll('#spPrev .sp91row img').length===11),'Surprise me fills the new parts');
if(process.env.SHOT)await p.screenshot({path:process.env.SHOT});
/* box colours in a live event */
const live=await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);try{closeStudio&&closeStudio()}catch(e){}
  const sp={id:'cs91box',name:'Boxed Patron',short:'Boxed',skin:'#e0ac7e',hair:'#2a1c12',beard:'full',head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'merchant',frame:'#00ff00',curtain:'#0000ff',custom:true};
  CUSTOM.sponsors=[...(CUSTOM.sponsors||[]),sp];
  try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  for(let i=0;i<40;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}SPEED='pause';
  S.sponsorId='cs91box';CURTAIN.from=0;CURTAIN.to=0;CURTAIN.t0=0;FLAV.until=0;
  const r={};const seen=[];const f0=flavFace;flavFace=function(...a){seen.push((a[7]||curSponsor()||{}).id);return f0.apply(this,a)};
  try{draw()}catch(e){r.err=e.message}flavFace=f0;r.seen=seen.includes('cs91box');
  /* the main canvas is tainted on file:// — draw the box (the live sponsor, the live curtain code) on a clean canvas */
  const oc=document.createElement('canvas');oc.width=200;oc.height=160;const c=oc.getContext('2d');const cx=100,cy=80,w=150,h=116;
  const raw=(x,y)=>Array.from(c.getImageData(Math.round(x),Math.round(y),1,1).data);
  flavFace(c,cx,cy,w,h,'calm',true,null);drawCurtain(c,cx,cy,w,h);r.frame=raw(cx-w/2,cy);r.drape=raw(cx-w/2+4+(w-8)*.03,cy+h*.1);
  CURTAIN.from=1;CURTAIN.to=1;try{draw()}catch(e){r.err2=e.message}flavFace(c,cx,cy,w,h,'calm',true,null);drawCurtain(c,cx,cy,w,h);r.curt=raw(cx-w*.3,cy+h*.2);r.val=raw(cx,cy-h/2+5);
  CURTAIN.from=0;CURTAIN.to=0;
  /* the same moods in the box draw without errors */
  let bad=0;for(const m of SP91_MOODS){FLAV.until=0;flaviusMood(m,4000,0);try{draw()}catch(e){bad++}}r.bad=bad;
  r.voice=(sponsorVoice().really||[]).length>0;return r});
const G=([r,g,bb])=>g>150&&r<110&&bb<110,B=([r,g,bb])=>bb>120&&r<90&&g<90;
ok(live.seen,'the live box draws the seated sponsor');ok(!live.err&&!live.err2&&!live.bad,'live box draws '+JSON.stringify(live));ok(G(live.frame),'frame colour in the box '+JSON.stringify(live.frame));
ok(B(live.drape),'curtain drapes in the sponsor colour '+JSON.stringify(live.drape));ok(B(live.curt)||live.curt[2]>live.curt[0],'drawn curtain in the sponsor colour '+JSON.stringify(live.curt));
ok(G(live.val),'valance in the frame colour '+JSON.stringify(live.val));ok(live.voice,'sponsor voice has really');
console.log(JSON.stringify({min:o.min,diffs:o.diffs}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(errs.length||miss.length?1:0)})();
