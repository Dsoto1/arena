const topo=require('topojson-client');const t=require('world-atlas/land-50m.json');
const g=topo.feature(t,t.objects.land);
const W=+process.argv[2]||2400, LAT0=76, LAT1=-52, k=W/360, H=Math.round((LAT0-LAT1)*k);
const polys=[];
const unwrap=r=>{const o=[];let off=0,prev=null;for(const [lon,lat] of r){let L=lon+off;if(prev!=null){if(L-prev>180){off-=360;L-=360}else if(prev-L>180){off+=360;L+=360}}o.push([L,lat]);prev=L}return o};
for(const f of g.features){const geo=f.geometry;const list=geo.type==='Polygon'?[geo.coordinates]:geo.coordinates;
  for(const poly of list){const rings=poly.map(unwrap);if(rings[0].every(([,la])=>la<LAT1-1))continue;
    const xs=rings[0].map(p=>p[0]);const mn=Math.min(...xs),mx=Math.max(...xs);
    for(const sh of [0,360,-360]){if(mx+sh<-180||mn+sh>180)continue;
      polys.push(rings.map(r=>r.map(([lo,la])=>[Math.round((lo+sh+180)*k*10)/10,Math.round((LAT0-la)*k*10)/10])))}}}
require('fs').writeFileSync('land.json',JSON.stringify({W,H,LAT0,k,polys}));console.log(W,H,polys.length)
