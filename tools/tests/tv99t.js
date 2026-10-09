/* tv99t — 266-v99themes (proposal behind localStorage flavius_themes99=1): flag OFF = the arena presets, location flavours and stones
   exactly as before; flag ON = each of the 12 arena presets has its own panels (ink/panel2/gold differ pairwise) and board (tileA),
   the location flavour carries only board keys (no highlight / ring / class colours), the accessibility + house themes are untouched,
   a preset's stone follows THEME.arena99, every text token reaches AA over every surface, no page errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};
const get=async on=>{const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_themes99',o?'1':'0')},on);
  const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push((on?'on ':'off ')+e.message));await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
  const r=await pg.evaluate(()=>{const P={};for(const k of Object.keys(THEME_PRESETS))P[k]=JSON.stringify(THEME_PRESETS[k].v);const L={};for(const k of Object.keys(LOC_THEMES))L[k]={...LOC_THEMES[k].v};const M={};for(const k of Object.keys(AR91MAT))M[k]=AR91MAT[k].n;
    applyTheme({...THEME_PRESETS.loc5.v},false);const mat5=ar91Mat().n;applyTheme({},false);const matDef=ar91Mat().n;
    const lum=h=>{const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*r+0.7152*g+0.0722*b};
    const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};const low=[];
    for(let k=1;k<=12;k++){const t={...BASE_THEME,...THEME_PRESETS['loc'+k].v};if(!THEMES99.on)break;for(const bg of ['ink','panel','panel2'])for(const fg of ['bone','muted','gold','gold2','blood2'])if(cr(t[fg],t[bg])<4.5)low.push(`loc${k} ${fg}/${bg}`);if(cr(t.bone,t.blood)<4.5)low.push(`loc${k} button`)}
    return {P,L,M,mat5,matDef,on:THEMES99.on,low}});
  await ctx.close();return r};
const off=await get(false),on=await get(true);
ok(!off.on&&on.on,'flag state');
/* OFF: nothing changed vs the original tables */
ok(/"tileA":"#e3bc7e"/.test(off.P.loc5)&&off.M[5]==='Burnt sienna'&&off.L[1].tileA==='#dccfa8','flag off changed the arena tables');
/* untouched presets */
for(const k of ['arena','flavius','imperial','fresco','marble','deut','trit','contrast','large'])ok(off.P[k]===on.P[k],'preset changed: '+k);
/* ON: 12 distinct palettes */
const pick=(s,k)=>JSON.parse(s)[k];const keys=['ink','panel2','gold','tileA','rim'];
for(let a=1;a<=12;a++)for(let c=a+1;c<=12;c++){const same=keys.filter(k=>pick(on.P['loc'+a],k)===pick(on.P['loc'+c],k));ok(same.length<=1,`loc${a} vs loc${c} share ${same}`)}
for(let k=1;k<=12;k++){const L=on.L[k];ok(['ring','hlMove','hlAtk','hlPush','hp','ap','mv','classColors','blood','gold','ink'].every(x=>!(x in L)),`loc flavour ${k} carries non-board keys`);ok(L.arena99===k,'arena99 '+k);ok(on.M[k]!==off.M[k],'stone '+k+' unchanged')}
ok(on.mat5==='Desert amber 99'&&off.mat5===off.matDef,'theme stone '+on.mat5+' / '+off.mat5);
ok(on.low.length===0,'below AA: '+on.low.join(', '));
ok(errs.length===0,'errors');console.log('ERRS',JSON.stringify(errs));await b.close();
console.log(fails.length?'FAIL '+JSON.stringify(fails):'OK arena themes 99');process.exit(fails.length?1:0)})();
