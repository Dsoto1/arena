/* Orbis Terrarum — step 1: project Natural Earth land, big lakes and major rivers to pixels.
   Run from a scratch dir holding the npm deps (see README.md):  node <repo>/tools/art/orbis/proj.js [W] [pad]
   Writes orbis_geo.json in the current dir: {W,H,pad,k,LAT0,LAT1,land:[[ring,…]…],lakes:[…],rivers:[[pt,…]…]}.
   Equirectangular, lat 76 … -52 (Antarctica cut): x = (lon+180)/360*W + pad, y = (76-lat)/128*H.
   pad = extra columns each side holding the wrapped copies, so bands and coasts meet across the seam. */
const req=require('module').createRequire(process.cwd()+'/');
const topo=req('topojson-client');
const land=req('world-atlas/land-50m.json');          /* ISC; data Natural Earth (public domain) */
const sane=req('sane-topojson/dist/world_50m.json');   /* MIT; data Natural Earth (public domain) */
const sane110=req('sane-topojson/dist/world_110m.json');
const W=+process.argv[2]||3200, PAD=+process.argv[3]||64, LAT0=76, LAT1=-52, k=W/360, H=Math.round((LAT0-LAT1)*k);
const padDeg=PAD/k+1;
/* points exactly on the antimeridian are pushed 0.05° outward so the two halves overlap (no hairline seam) */
const EPS=0.05;
const unwrap=r=>{const o=[];let off=0,prev=null;for(let [lon,lat] of r){
  if(Math.abs(Math.abs(lon)-180)<1e-7)lon=lon>0?180+EPS:-180-EPS;
  let L=lon+off;if(prev!=null){if(L-prev>180){off-=360;L-=360}else if(prev-L>180){off+=360;L+=360}}o.push([L,lat]);prev=L}return o};
const px=(lo,la)=>[Math.round(((lo+180)*k+PAD)*10)/10,Math.round(((LAT0-la)*k)*10)/10];
const polysOf=(fc,skip)=>{const out=[];for(const f of fc.features){const geo=f.geometry;if(!geo)continue;
  const list=geo.type==='Polygon'?[geo.coordinates]:geo.type==='MultiPolygon'?geo.coordinates:[];
  for(const poly of list){const rings=poly.map(unwrap);if(skip&&skip(rings))continue;
    const xs=rings[0].map(p=>p[0]);const mn=Math.min(...xs),mx=Math.max(...xs);
    for(const sh of [0,360,-360]){if(mx+sh<-180-padDeg||mn+sh>180+padDeg)continue;
      out.push(rings.map(r=>r.map(([lo,la])=>px(lo+sh,la))))}}}return out};
const area=r=>{let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=(r[j][0]+r[i][0])*(r[j][1]-r[i][1]);return Math.abs(a/2)};
const landP=polysOf(topo.feature(land,land.objects.land),rings=>rings[0].every(([,la])=>la<LAT1-1));
/* big lakes only (area in px² at this width) */
const lakeMin=(W/1600)**2*30;
const lakes=polysOf(topo.feature(sane,sane.objects.lakes)).filter(p=>area(p[0])>=lakeMin);
/* a few major rivers (the 110m set: Nile, Amazon, Mississippi, Volga, Danube, Ob, Yenisei, Lena, Congo, Ganges, Yangtze …) */
const rivers=[];
for(const f of topo.feature(sane110,sane110.objects.rivers).features){const geo=f.geometry;
  const lines=geo.type==='LineString'?[geo.coordinates]:geo.coordinates;
  for(const l of lines){if(l.length<3)continue;const u=unwrap(l);for(const sh of [0,360,-360]){
    const xs=u.map(p=>p[0]);if(Math.max(...xs)+sh<-180-padDeg||Math.min(...xs)+sh>180+padDeg)continue;
    rivers.push(u.map(([lo,la])=>px(lo+sh,la)))}}}
require('fs').writeFileSync('orbis_geo.json',JSON.stringify({W,H,pad:PAD,k,LAT0,LAT1,land:landP,lakes,rivers}));
console.log('W',W,'H',H,'land',landP.length,'lakes',lakes.length,'rivers',rivers.length);
