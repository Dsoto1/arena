/* arena_before.js — BEFORE shots: zoomed out, zoomed in, phone landscape */
const L=require('./arena_lib');const D=__dirname+'/';
(async()=>{const {b,pg,errs}=await L.open();await L.startAt(pg,6,5);
  await pg.screenshot({path:D+'arena_before_full.png'});
  await L.canvasShot(pg,D+'arena_before_out.png');
  const info=await pg.evaluate(()=>({TW,OX,OY,N,cw:cv.width,ch:cv.height,dpr:devicePixelRatio,rot:ROT89.k,mat:ar91Mat().n,arena99:THEME.arena99,near:ar91Edges(0.19).filter(e=>!e.far).map(e=>[e.a,e.b])}));
  console.log(JSON.stringify(info));
  await L.zoom(pg,1.8);await L.canvasShot(pg,D+'arena_before_in.png');
  const p2=await L.open({browser:b,phone:true});await L.startAt(p2.pg,6,5);await p2.pg.screenshot({path:D+'arena_before_phone.png'});
  console.log('ERRS',errs.concat(p2.errs).slice(0,5));await b.close()})();
