/* arena2_texgen.js — renders the 12 per-arena stone textures (512×512, tileable) in Chromium and saves them as WebP ≤ 90 KB
   to arena2_tex/<k>_<key>.webp, plus arena2_tex/sheet.png (all twelve, 2×2 tiled to show the repeat).
   Seeded (display only). Run: node arena2_texgen.js */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'arena2_tex');fs.mkdirSync(OUT,{recursive:true});
/* ---------------- runs inside the page ---------------- */
function GEN(){
const W=512,H=512;
const RNG=s=>{let q=s>>>0||1;return ()=>{q=(q*1103515245+12345)>>>0;return (q>>>8)/16777216}};
const hex=h=>{h=h.replace('#','');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]};
const mix=(a,b,t)=>a.map((x,i)=>Math.round(x+(b[i]-x)*t));
const rgb=(c,a)=>a==null?`rgb(${c[0]},${c[1]},${c[2]})`:`rgba(${c[0]},${c[1]},${c[2]},${a})`;
const cv=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return [c,c.getContext('2d')]};
/* draw f at the 9 wrap offsets so anything crossing an edge repeats */
const wrap=(f)=>{for(const dx of [-W,0,W])for(const dy of [-H,0,H])f(dx,dy)};
function noise(g,n,a,rn,dark=0.5){for(let i=0;i<n;i++){g.fillStyle=rn()<dark?`rgba(50,32,16,${(a*rn()).toFixed(3)})`:`rgba(255,250,236,${(a*rn()).toFixed(3)})`;const s=rn()<0.85?1:2;g.fillRect(rn()*W,rn()*H,s,s)}}
/* one course row of blocks in running bond across the width (wrapped) */
function row(y,h,lmin,lmax,rn,cb){let x=-rn()*lmax;const L=[];while(x<W){const l=lmin+rn()*(lmax-lmin);L.push([x,l]);x+=l}
  for(const [x0,l] of L){cb(x0,y,l,h);if(x0<0)cb(x0+W,y,l,h);if(x0+l>W)cb(x0-W,y,l,h)}}
/* a block with a body colour, optional chamfer (carved edge), drafted margin, mortar joint */
function block(g,x,y,w,h,o,rn){const j=o.j||2;const c=mix(hex(o.c0),hex(o.c1),rn());
  if(o.grad){const gr=g.createLinearGradient(x,y,x+w*0.3,y+h);gr.addColorStop(0,rgb(mix(c,[255,250,236],0.12)));gr.addColorStop(1,rgb(mix(c,[60,36,16],0.14)));g.fillStyle=gr}else g.fillStyle=rgb(c);
  g.fillRect(x+j/2,y+j/2,w-j,h-j);
  if(o.streak)for(let k=0;k<o.streak;k++){const yy=y+4+rn()*(h-8);g.fillStyle=rn()<0.5?'rgba(150,110,60,.18)':'rgba(255,248,230,.28)';g.fillRect(x+3,yy,w-6,0.8+rn()*1.6)}
  if(o.voids)for(let k=0;k<o.voids*(0.5+rn());k++){const px=x+5+rn()*(w-10),py=y+5+rn()*(h-10),pw=1.5+rn()*6,ph=0.8+rn()*1.6;g.fillStyle='rgba(110,80,48,.55)';g.beginPath();g.ellipse(px,py,pw,ph,0,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,248,232,.5)';g.fillRect(px-pw*0.6,py+ph,pw*1.2,0.8)}
  if(o.pores)for(let k=0;k<o.pores;k++){const px=x+3+rn()*(w-6),py=y+3+rn()*(h-6),r=0.6+rn()*1.6;g.fillStyle='rgba(90,70,30,.45)';g.beginPath();g.arc(px,py,r,0,Math.PI*2);g.fill()}
  if(o.boss){/* rusticated: rough raised centre */for(let k=0;k<60;k++){const px=x+o.boss+rn()*(w-2*o.boss),py=y+o.boss+rn()*(h-2*o.boss),r=2+rn()*7;g.fillStyle=rn()<0.5?'rgba(20,8,4,.12)':'rgba(255,220,200,.08)';g.beginPath();g.arc(px,py,r,0,Math.PI*2);g.fill()}}
  if(o.draft){const m=o.draft;g.strokeStyle=o.draftC||'rgba(255,250,240,.35)';g.lineWidth=1;g.strokeRect(x+j/2+m,y+j/2+m,w-j-2*m,h-j-2*m);
    g.strokeStyle='rgba(60,40,24,.18)';for(let t=x+j;t<x+w-j;t+=3){g.beginPath();g.moveTo(t,y+j/2+1);g.lineTo(t+1.5,y+j/2+m-1);g.stroke()}}
  if(o.chamfer){const b=o.chamfer,m=j/2;g.fillStyle='rgba(255,244,214,.55)';g.beginPath();g.moveTo(x+m,y+m);g.lineTo(x+w-m,y+m);g.lineTo(x+w-m-b,y+m+b);g.lineTo(x+m+b,y+m+b);g.lineTo(x+m+b,y+h-m-b);g.lineTo(x+m,y+h-m);g.closePath();g.fill();
    g.fillStyle='rgba(80,50,22,.5)';g.beginPath();g.moveTo(x+w-m,y+m);g.lineTo(x+w-m,y+h-m);g.lineTo(x+m,y+h-m);g.lineTo(x+m+b,y+h-m-b);g.lineTo(x+w-m-b,y+h-m-b);g.lineTo(x+w-m-b,y+m+b);g.closePath();g.fill()}
  if(o.worn){/* soft rounded edges */const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(255,240,210,.25)');gr.addColorStop(.15,'rgba(255,240,210,0)');gr.addColorStop(.85,'rgba(70,40,10,0)');gr.addColorStop(1,'rgba(70,40,10,.3)');g.fillStyle=gr;g.fillRect(x+j/2,y+j/2,w-j,h-j)}
  if(o.shadow!==false){g.fillStyle='rgba(50,34,18,.28)';g.fillRect(x+j/2,y+j/2,w-j,1);g.fillRect(x+j/2,y+j/2,1,h-j)}}
function veins(g,rn,n,col,amin,amax,ang,len,wid){const V=[];for(let i=0;i<n;i++){let x=rn()*W,y=rn()*H;const p=[[x,y]];const a0=ang+(rn()-0.5)*0.6;for(let k=0;k<len;k++){x+=Math.cos(a0+(rn()-0.5)*1.1)*24;y+=Math.sin(a0+(rn()-0.5)*1.1)*24;p.push([x,y])}V.push({p,w:wid[0]+rn()*(wid[1]-wid[0]),a:amin+rn()*(amax-amin)})}
  wrap((dx,dy)=>{for(const v of V){g.strokeStyle=rgb(hex(col),v.a.toFixed(2));g.lineWidth=v.w;g.beginPath();v.p.forEach(([x,y],i)=>i?g.lineTo(x+dx,y+dy):g.moveTo(x+dx,y+dy));g.stroke()}})}
function cloud(g,rn,n,c1,c2){for(let i=0;i<n;i++){const x=rn()*W,y=rn()*H,r=30+rn()*90;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rn()<0.5?c1:c2);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;wrap((dx,dy)=>g.fillRect(x+dx-r,y+dy-r,r*2,r*2))}}
function slabs(g,rn,rh,lmin,lmax,jc,hl){for(let y=0;y<H;y+=rh)row(y,rh,lmin,lmax,rn,(x,y,w,h)=>{g.fillStyle=jc;g.fillRect(x,y,w,1.3);g.fillRect(x,y,1.3,h);g.fillStyle=hl;g.fillRect(x+1.3,y+1.3,w,1)})}
function bricks(g,y,h,rn,c0,c1,jc){g.fillStyle=jc;g.fillRect(0,y,W,h);row(y,h,56,84,rn,(x,yy,w,hh)=>{g.fillStyle=rgb(mix(hex(c0),hex(c1),rn()));g.fillRect(x+1.5,yy+1.5,w-3,hh-3);g.fillStyle='rgba(255,220,190,.18)';g.fillRect(x+1.5,yy+1.5,w-3,1)})}
const T={
/* 1 Syracusae — Greek (Parian) marble: cool white, blue-grey veins, large polished slabs */
syracusae(){const [c,g]=cv(),rn=RNG(101);g.fillStyle='#eef1f3';g.fillRect(0,0,W,H);cloud(g,rn,36,'rgba(200,212,224,.35)','rgba(255,255,255,.55)');
  veins(g,rn,8,'#6f8698',0.18,0.4,-0.4,14,[0.5,1.6]);slabs(g,rn,128,230,300,'rgba(130,145,160,.6)','rgba(255,255,255,.75)');noise(g,4000,0.06,rn);return c},
/* 2 Verona — rosso Verona: pink nodular limestone-marble, darker nodules, pale stylolites */
verona(){const [c,g]=cv(),rn=RNG(202);g.fillStyle='#d9a090';g.fillRect(0,0,W,H);cloud(g,rn,30,'rgba(200,120,104,.35)','rgba(244,200,184,.4)');
  const N=[];for(let i=0;i<320;i++)N.push([rn()*W,rn()*H,4+rn()*16,2.5+rn()*9,rn()*3,rn()]);
  wrap((dx,dy)=>{for(const [x,y,a,b,r,t] of N){g.fillStyle=t<0.55?'rgba(176,96,82,.55)':'rgba(240,190,172,.6)';g.beginPath();g.ellipse(x+dx,y+dy,a,b,r,0,Math.PI*2);g.fill();g.strokeStyle='rgba(140,70,60,.35)';g.lineWidth=0.8;g.stroke()}});
  veins(g,rn,10,'#f6e6dc',0.35,0.6,0.1,12,[0.6,1.4]);slabs(g,rn,128,220,290,'rgba(140,80,70,.55)','rgba(255,236,226,.6)');noise(g,5000,0.08,rn);return c},
/* 3 Arles — Gallic limestone, honey, petit appareil (small near-square blocks) */
arles(){const [c,g]=cv(),rn=RNG(303);g.fillStyle='#b49a6a';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=32)row(y,32,40,62,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#ead39e',c1:'#d8bd84',j:3,grad:1,streak:1,voids:1},rn));noise(g,9000,0.12,rn);return c},
/* 4 Capua — dark red Campanian stone, rusticated opus quadratum with drafted margins */
capua(){const [c,g]=cv(),rn=RNG(404);g.fillStyle='#2a1410';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=85.333)row(y,85.333,170,250,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#86443a',c1:'#6c3329',j:3,boss:12,draft:7,draftC:'rgba(255,200,180,.25)'},rn));noise(g,12000,0.14,rn,0.6);return c},
/* 5 Thysdrus — African sandstone: amber-orange, low wide courses, wind-worn edges, strata */
thysdrus(){const [c,g]=cv(),rn=RNG(505);g.fillStyle='#7a4a20';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=73.143)row(y,73.143,120,210,rn,(x,y,w,h)=>{block(g,x,y,w,h,{c0:'#e8b373',c1:'#c48448',j:2.5,grad:1,chamfer:4,shadow:false},rn);
    for(let k=0;k<3;k++){const yy=y+10+rn()*(h-20);g.fillStyle=rn()<0.5?'rgba(140,80,30,.14)':'rgba(255,230,180,.16)';g.fillRect(x+8,yy,w-16,2+rn()*4)}
    g.strokeStyle='rgba(120,70,24,.16)';g.lineWidth=1;for(let k=0;k<4;k++){const x0=x+10+rn()*(w-30),y0=y+10+rn()*(h-24);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+16,y0+8);g.stroke()}});
  noise(g,22000,0.18,rn,0.55);return c},
/* 6 Roma — travertine of the Colosseum: warm cream, voids, bedding streaks, pale mortar */
roma(){const [c,g]=cv(),rn=RNG(606);g.fillStyle='#cdbb98';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=64)row(y,64,130,220,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#ecdcbd',c1:'#dcc7a2',j:2.2,streak:6,voids:9},rn));noise(g,9000,0.12,rn);return c},
/* 7 Nemausus — grey-green Gallic limestone, petit appareil laced with red brick courses (opus mixtum) */
nemausus(){const [c,g]=cv(),rn=RNG(707);g.fillStyle='#8a8a74';g.fillRect(0,0,W,H);
  for(let u=0;u<4;u++){const y0=u*128;for(let r=0;r<3;r++)row(y0+r*32,32,36,56,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#d6d4bc',c1:'#c2c2a4',j:3,grad:1,voids:1},rn));bricks(g,y0+96,16,rn,'#a65538','#8c432c','#cfc8b0');bricks(g,y0+112,16,rn,'#a65538','#8c432c','#cfc8b0')}
  noise(g,9000,0.12,rn);return c},
/* 8 Pompeii — grey volcanic tuff in opus reticulatum (diamond net) with brick courses */
pompeii(){const [c,g]=cv(),rn=RNG(808);g.fillStyle='#4a4440';g.fillRect(0,0,W,H);const d=32,s=d*0.66;
  for(let j=0;j<=H/d*2;j++)for(let i=-1;i<=W/d;i++){const x=i*d+(j%2?d/2:0),y=j*d/2;const c0=mix(hex('#a39d94'),hex('#8a847c'),rn());
    for(const [dx,dy] of [[0,0],[W,0],[0,H]]){g.fillStyle=rgb(c0);g.beginPath();g.moveTo(x+dx,y+dy-s/2*1.05);g.lineTo(x+dx+s/2*1.05,y+dy);g.lineTo(x+dx,y+dy+s/2*1.05);g.lineTo(x+dx-s/2*1.05,y+dy);g.closePath();g.fill();
      g.fillStyle='rgba(255,250,240,.18)';g.beginPath();g.moveTo(x+dx,y+dy-s/2*1.05);g.lineTo(x+dx-s/2*1.05,y+dy);g.lineTo(x+dx-s/2*0.85,y+dy);g.lineTo(x+dx,y+dy-s/2*0.85);g.closePath();g.fill()}}
  for(const y of [0,256]){bricks(g,y,13,rn,'#a8462c','#8a3620','#5a4c44');bricks(g,y+13,13,rn,'#a8462c','#8a3620','#5a4c44');bricks(g,y+26,13,rn,'#a8462c','#8a3620','#5a4c44')}
  noise(g,9000,0.14,rn,0.55);return c},
/* 9 Leptis Magna — Proconnesian marble: warm white with streaky parallel grey bands, big panels */
leptis(){const [c,g]=cv(),rn=RNG(909);g.fillStyle='#f5f3ee';g.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){const y=rn()*H,h=2+rn()*14,a=0.05+rn()*0.14;g.fillStyle=`rgba(120,124,128,${a.toFixed(2)})`;wrap((dx,dy)=>{g.save();g.translate(dx,dy);g.beginPath();g.moveTo(0,y);for(let x=0;x<=W;x+=32)g.lineTo(x,y+Math.sin(x*0.012+i)*6);g.lineTo(W,y+h);for(let x=W;x>=0;x-=32)g.lineTo(x,y+h+Math.sin(x*0.012+i)*6);g.closePath();g.fill();g.restore()})}
  veins(g,rn,5,'#7a7e84',0.15,0.3,0.05,16,[0.4,1]);slabs(g,rn,128,250,320,'rgba(150,146,140,.55)','rgba(255,255,255,.8)');noise(g,3000,0.05,rn);return c},
/* 10 Uthina — Punic opus africanum: tall ashlar piers between rubble panels, dusk-violet sandstone */
uthina(){const [c,g]=cv(),rn=RNG(1010);g.fillStyle='#8a7072';g.fillRect(0,0,W,H);
  const P=[];for(let i=0;i<620;i++)P.push([rn()*W,rn()*H,10+rn()*9,8+rn()*7,rn(),rn()]);
  wrap((dx,dy)=>{for(const [x,y,a,b,t,r] of P){const cc=mix(hex('#b8968e'),hex('#9a7a7c'),t);g.fillStyle=rgb(cc);g.beginPath();const n=6;for(let k=0;k<n;k++){const an=k/n*Math.PI*2+r,rr=(k%2?a:b)*(0.8+0.3*Math.sin(k+r*9));const px=x+dx+Math.cos(an)*rr,py=y+dy+Math.sin(an)*rr*0.75;k?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.fill();g.fillStyle='rgba(255,240,236,.15)';g.fill()}});
  for(const px of [0,128,256,384]){for(let y=0;y<H;y+=64){/* alternating upright + flat blocks */block(g,px,y,44,40,{c0:'#dcbcae',c1:'#ccaa9a',j:3,grad:1},rn);block(g,px-10,y+40,64,24,{c0:'#dcbcae',c1:'#ccaa9a',j:3,grad:1},rn)}
    if(px===0)for(let y=0;y<H;y+=64){block(g,W,y,44,40,{c0:'#dcbcae',c1:'#ccaa9a',j:3,grad:1},rn);block(g,W-10,y+40,64,24,{c0:'#dcbcae',c1:'#ccaa9a',j:3,grad:1},rn)}}
  noise(g,10000,0.12,rn);return c},
/* 11 Pola — Istrian white stone: pale grey-white, large smooth ashlar, drafted margins, hair joints */
pola(){const [c,g]=cv(),rn=RNG(1111);g.fillStyle='#b8b6ae';g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=102.4)row(y,102.4,220,330,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#eeede8',c1:'#e2e1da',j:1.6,draft:6,draftC:'rgba(150,148,140,.45)'},rn));noise(g,5000,0.07,rn);return c},
/* 12 Puteoli — yellow Neapolitan tuff, porous, in opus listatum (two tuff courses, two brick rows) */
puteoli(){const [c,g]=cv(),rn=RNG(1212);g.fillStyle='#8c7a3c';g.fillRect(0,0,W,H);
  for(let u=0;u<4;u++){const y0=u*128;for(let r=0;r<2;r++)row(y0+r*48,48,74,120,rn,(x,y,w,h)=>block(g,x,y,w,h,{c0:'#dcc67c',c1:'#cbb064',j:3,pores:26},rn));bricks(g,y0+96,16,rn,'#b0563a','#94442c','#d6c99a');bricks(g,y0+112,16,rn,'#b0563a','#94442c','#d6c99a')}
  noise(g,10000,0.13,rn);return c}};
return T}
/* ---------------- node side ---------------- */
const KEYS=['syracusae','verona','arles','capua','thysdrus','roma','nemausus','pompeii','leptis','uthina','pola','puteoli'];
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.setContent('<html><body></body></html>');
  await pg.evaluate(`window.TEX=(${GEN.toString()})()`);const rep={};
  for(let i=0;i<KEYS.length;i++){const k=KEYS[i];
    const r=await pg.evaluate(k=>{const c=TEX[k]();window['C_'+k]=c;let q=0.94,u;for(;q>0.3;q-=0.04){u=c.toDataURL('image/webp',q);if(u.length*0.75<=90*1024)break}return {u,q:+q.toFixed(2)}},k);
    const buf=Buffer.from(r.u.split(',')[1],'base64');const fn=`${i+1}_${k}.webp`;fs.writeFileSync(path.join(OUT,fn),buf);rep[fn]={kb:+(buf.length/1024).toFixed(1),q:r.q}}
  /* sheet: each texture tiled 2×2 at 256 px (shows the repeat) with its name */
  const sheet=await pg.evaluate(K=>{const S=document.createElement('canvas');S.width=4*270;S.height=3*290;const g=S.getContext('2d');g.fillStyle='#1c1611';g.fillRect(0,0,S.width,S.height);
    K.forEach((k,i)=>{const c=window['C_'+k];const x=(i%4)*270+7,y=Math.floor(i/4)*290+24;for(const dx of [0,128])for(const dy of [0,128])g.drawImage(c,x+dx,y+dy,128,128);g.fillStyle='#f0cf7d';g.font='bold 15px sans-serif';g.fillText((i+1)+' · '+k,x,y-7)});return S.toDataURL('image/png')},KEYS);
  fs.writeFileSync(path.join(OUT,'sheet.png'),Buffer.from(sheet.split(',')[1],'base64'));
  fs.writeFileSync(path.join(OUT,'sizes.json'),JSON.stringify(rep,null,1));console.log(JSON.stringify(rep));await b.close()})();
