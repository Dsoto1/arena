/* writes tools/i18n/names.json — every name that stays English (game terms, gear, beasts, cards, classes, events, cities) */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file://'+path.resolve(__dirname,'../../flavius-arena.html'));await p.waitForTimeout(1500);
  const n=await p.evaluate(()=>{const s=new Set(GAME_TERMS);const add=o=>{try{for(const k in o){const v=o[k];if(v&&typeof v==='object'){for(const f of ['n','name','nm','short'])if(typeof v[f]==='string'&&v[f].length<48)s.add(v[f])}}}catch(e){}};
    [W,ARM,NPCT,CARDS,CLASSES,EVENTS].forEach(add);try{add(LOCATIONS)}catch(e){}
    try{for(const c of LANISTA_CITIES)s.add(typeof c==='string'?c:c.n)}catch(e){}
    try{for(const k in AUD_THEMES){s.add(k);if(AUD_THEMES[k].nm)s.add(AUD_THEMES[k].nm)}}catch(e){}
    return [...s].filter(x=>x&&x.trim()).sort()});
  fs.writeFileSync(path.join(__dirname,'names.json'),JSON.stringify(n,null,0));console.log(n.length,'names');await b.close()})();
