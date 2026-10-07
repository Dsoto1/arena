/* v0.95 perf tools: the page's folder over http on a free port (the site serves it this way; from file:// a page cannot read a sprite
   sheet's pixels back, so 230's cut-outs stay off). FILE=1 → plain file:// instead. pageURL(path) → Promise<url>. */
const http=require('http'),fs=require('fs'),path=require('path');
const TYPES={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
module.exports=async function pageURL(p){const abs=path.resolve(p);if(process.env.FILE==='1')return 'file://'+abs;
  const root=path.dirname(abs);const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));
    if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
    r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));srv.unref();return 'http://127.0.0.1:'+srv.address().port+'/'+path.basename(abs)};
