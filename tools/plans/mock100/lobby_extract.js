/* node tools/plans/mock100/lobby_extract.js — pulls real game art (portraits, Domus rank banners, region flags, sculpted tokens) into lobby_art.js for lobby.html */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
await pg.goto('file://'+path.resolve(__dirname,'../../../flavius-arena.html'));
await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000}).catch(()=>{});await pg.waitForTimeout(1500);
const out=await pg.evaluate(()=>{const R={por:{},dr:{},rg:{},tok:{},err:[]};
 const P=[['alpha','hero','#3d8b4a'],['marcus','soldier','#b0322a'],['thrax','veteranus','#7a5a3a'],['livia','amazonia','#8a4aa0'],['cato','royalty','#c09030'],['nerva','slave','#5a6a7a'],['brennus','venatore','#2f6a8a'],['quintus','damnatio','#6a2a2a']];
 for(const [s,c,col] of P){try{R.por[s]=portraitSVG(gladPortrait(s,c),col)}catch(e){R.err.push('por '+e.message)}
   try{R.tok[s]=onlFig(c,null,96)}catch(e){R.err.push('tok '+e.message)}}
 for(const r of ONLC.DRANKS98){try{R.dr[r.k]=dr98URI(r.k)}catch(e){R.err.push('dr '+e.message)}}
 try{for(const r of (ONLC.REGIONS98||[])){R.rg[r.k]={n:r.n,u:rg98Flag(r.k)}}}catch(e){R.err.push('rg '+e.message)}
 R.ranks=(ONLC.RANKS||[]).map(r=>r.n||r.k);return R});
fs.writeFileSync(path.join(__dirname,'lobby_art.js'),'window.ART='+JSON.stringify(out)+';');
console.log(out.err, Object.keys(out.por).length, Object.keys(out.dr).length, Object.keys(out.rg).length, out.ranks, Object.values(out.tok).map(x=>(x||'').length));
await b.close()})();
