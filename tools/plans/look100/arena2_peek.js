const L=require('./arena_lib');const fs=require('fs');const D=__dirname+'/';const SRC=fs.readFileSync(D+'arena_proto.js','utf8');
(async()=>{const {b,pg}=await L.open();await L.startAt(pg,6,3);await pg.evaluate(SRC);await pg.evaluate(()=>PR100.set({rail:'bronze',stone:'trav'}));
 console.log(await pg.evaluate(()=>{const n=N-1;return JSON.stringify({c00:center(0,0),c0n:center(0,n),cn0:center(n,0),cnn:center(n,n)})}));
 for(const [nm,r,c] of [['L',12,0],['R',0,12],['B',12,12]]){await pg.evaluate(([r,c])=>{const p=cur();p.r=r;p.c=c;CAM.z=2.4;S.zoomIn=true;CAM.fr=null;draw();draw()},[r,c]);await pg.waitForTimeout(200);
   await L.canvasShot(pg,'/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/peek_'+nm+'.png')}
 await b.close()})();
