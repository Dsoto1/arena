/* node tools/plans/mock100/recruit_extract.js — pulls real game art + data for recruit.html: the recruit's + champion's faces, rival house banners */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1200,height:900}});await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(__dirname,'../../../flavius-arena.html'));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const d=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'custom',mgr:{name:'Virgilante',ludus:'Ludus Virgilanti',city:'Capua',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
 const m=me();m.fame=60;const fa=freeAgents().filter(x=>m.fame>=reqFame(x)&&x.cls==='royalty').sort((a,b)=>effOvr(b)-effOvr(a));const g=fa[0]||freeAgents()[0];
 const S=suitors(g).filter(x=>x.m!==m).slice(0,4).map(x=>{const f=mgrFlagOf(x.m);return {n:x.m.ludus,c:x.m.color,v:x.v,flag:f?houseFlagURI(f):''}});
 const champ=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a))[0];
 const box=document.createElement('div');box.id='xx';box.style.cssText='position:fixed;left:0;top:0;z-index:99999;display:flex;gap:10px;background:transparent;padding:0';
 box.innerHTML=`<div id="f1" style="width:240px;height:240px">${gArt(g,'xl')}</div><div id="f2" style="width:120px;height:120px">${champ?gArt(champ,'lg'):''}</div>`;document.body.appendChild(box);
 box.querySelectorAll('svg,img,.portrait,div').forEach(e=>{if(e!==box&&e.id!=='f1'&&e.id!=='f2'){}});
 const mk=MGR_KEYS.map(([k,l])=>[k,l,trait96Grade(m.p[k]||0)]);
 return {g:{name:g.name,cls:g.cls,age:gAge(g),city:g.city,fame:g.fame},S,champ:champ&&champ.name,champG:champ&&trait96Grade(effOvr(champ)),mk,ask:askWage(g)}});
await pg.waitForTimeout(1500);
for(const id of ['f1','f2']){const el=await pg.$('#'+id);const inner=await el.$(':scope > *');await (inner||el).screenshot({path:path.resolve(__dirname,`img/rec_${id}.png`),omitBackground:true})}
d.S.forEach((s,i)=>{if(s.flag.startsWith('data:image/svg+xml')){const raw=s.flag.includes(';base64,')?Buffer.from(s.flag.split(',')[1],'base64').toString():decodeURIComponent(s.flag.split(',').slice(1).join(','));fs.writeFileSync(path.resolve(__dirname,`img/rec_flag${i}.svg`),raw)}delete s.flag});
fs.writeFileSync(path.resolve(__dirname,'img/rec_data.json'),JSON.stringify(d,null,1));console.log(JSON.stringify(d));await b.close()})();
