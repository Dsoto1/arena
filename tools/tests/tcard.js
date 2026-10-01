const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const h=await pg.evaluate(()=>{const mk=(o)=>{const d=blankCW();Object.assign(d,o.top||{});Object.assign(d.stats,o.st||{});Object.assign(d.art,o.art||{});return d};
  const cards=[mk({top:{name:'Fang of Nemausus'},st:{p:1,r:1}}),
    mk({top:{name:'The Widow-Maker of Leptis Magna'},st:{p:2,r:3,thrN:3,thrP:2,thrR:4,cfw:1},art:{type:'spear'}}),
    mk({top:{name:'Aegis of Pola'},st:{shield:1,absorb:2,uses:9,flav:1},art:{type:'shield'}}),
    mk({top:{name:'Wrath of Capua'},st:{p:4,r:2,both:1,soul:1},art:{type:'axe',layers:[{t:'star',x:46,y:30,w:12,h:12,c:'#e6b93a'}]}})];
  return cards.map(c=>`<div style="display:inline-block;width:320px;margin:8px">${cwCardSVG(c)}</div>`).join('')});
await pg.evaluate(x=>{document.body.innerHTML=`<div style="background:#1c140e;padding:10px;width:1380px">${x}</div>`},h);
await pg.waitForTimeout(300);await pg.screenshot({path:'cards36.png',clip:{x:0,y:0,width:1400,height:470}});
// the designer: shield toggle swaps the stat fields
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(800);
await pg.click('[data-cwf="s.shield"]');await pg.waitForTimeout(300);
const f=await pg.evaluate(()=>({absorb:!!document.querySelector('[data-cwf="s.absorb"]'),power:!!document.querySelector('[data-cwf="s.p"]'),flav:!!document.querySelector('[data-cwf="s.flav"]')}));
console.log(JSON.stringify(f),errs.slice(0,3));await b.close()})();
