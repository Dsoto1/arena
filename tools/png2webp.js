/* png → webp (width 1200, quality 0.82) through Chromium's canvas: release.sh's fallback when python's PIL is missing/broken.
   node tools/png2webp.js in.png out.webp */
const fs=require('fs'),{chromium}=require('playwright');
(async()=>{const[i,o]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage();
const d='data:image/png;base64,'+fs.readFileSync(i).toString('base64');
const u=await p.evaluate(async d=>{const im=new Image();im.src=d;await im.decode();const w=1200,h=Math.round(im.height*1200/im.width);
const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,w,h);
return c.toDataURL('image/webp',0.82)},d);await b.close();
if(!u.startsWith('data:image/webp'))throw new Error('no webp');fs.writeFileSync(o,Buffer.from(u.split(',')[1],'base64'));console.log('webp',o)})();
