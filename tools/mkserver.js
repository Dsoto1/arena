/* Prepares server/src for packaging: copies the shared online rules (src/111-onlcore.js → server/src/onlcore.js) and
   writes server/src/catalog.json (the market's printed weapons and armor by level) from the built game.
   Run from the repo root after sh build.sh:  node tools/mkserver.js */
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
fs.copyFileSync(path.join(root,'src/111-onlcore.js'),path.join(root,'server/src/onlcore.js'));
(async()=>{const {chromium}=require('playwright');const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
  await pg.goto('file://'+path.join(root,'flavius-arena.html'));await pg.waitForTimeout(2000);
  const cat=await pg.evaluate(()=>onlCatalog());
  /* v0.92 the class kits (each printed class's armor, a pair once) from the game's class data → server/src/kits92.json */
  const kits=await pg.evaluate(()=>typeof onlKits92==='function'?onlKits92():null);await b.close();
  fs.writeFileSync(path.join(root,'server/src/catalog.json'),JSON.stringify(cat,null,1));
  if(kits)fs.writeFileSync(path.join(root,'server/src/kits92.json'),JSON.stringify(kits,null,1));
  console.log('catalog',Object.keys(cat).length,'pieces ·',kits?Object.keys(kits).length+' class kits ·':'',' onlcore copied')})();
