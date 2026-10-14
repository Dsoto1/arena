/* tools/sitewhatsnew.js — writes the newest MILESTONES entry (src/meta/34-notes.js) into site/play.html's
   "New in vX" box, so the site never lags the game. Run by tools/release.sh; by hand: node tools/sitewhatsnew.js */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(R,'src/meta/34-notes.js'),'utf8');
const m=src.match(/\{v:'([^']+)'[^\n]*?hi:\[(.*?)\]/);if(!m){console.error('sitewhatsnew: no MILESTONES entry');process.exit(1)}
const v=m[1],items=[...m[2].matchAll(/_T\('((?:[^'\\]|\\.)*)'\)/g)].map(x=>x[1].replace(/\\'/g,"'"));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ver=/^\d+\.\d$/.test(v)?v+'':v;
const box=`<section class="whatsnew">\n          <h2>New in v${esc(ver)}</h2>\n          <ul>\n${items.map(t=>`            <li>${esc(t)}.</li>`).join('\n')}\n          </ul>\n        </section>`;
const f=path.join(R,'site/play.html');const h=fs.readFileSync(f,'utf8');
const out=h.replace(/<section class="whatsnew">[\s\S]*?<\/section>/,box);
if(out===h&&!h.includes(box)){console.error('sitewhatsnew: no whatsnew section in site/play.html');process.exit(1)}
fs.writeFileSync(f,out);console.log('site/play.html: New in v'+ver+' ('+items.length+' lines)');
