/* =====================================================================
   71-V58 · v0.58
   =====================================================================
   NAUMACHIA — the ships are the printed 3 x 5 hulls (every tile of the rectangle is deck, the cut corners
   included), set in a pinwheel around the middle (two north-south, two east-west, bows chasing clockwise), painted with Virgilante's deck art (assets/ship.webp: 256 px a
   tile, a 110 px bow above the first row). drawShipTile (called from draw's tile loop) paints each deck tile's
   slice through an affine map from the art onto the tile's diamond; the bows go on after the last tile so the
   water never covers them. The hull bar reads only its HP; hovering the pillar (or the bar above it) names it.
   THE PROTOTYPE — 'D.Soto' in the main menu and a line in the Play Now guide open the photographs of the
   hand-built board this game was distilled from (assets/proto1-5.jpg).
   ===================================================================== */
const SHIP_ART={tile:256,bow:110,cols:3,rows:5}; /* matches tools/mkscans.py */
/* the four hulls ring the middle like a pinwheel: two run north-south, two east-west, each bow chasing the next ship (clockwise).
   rot: 0 bow north (low r) · 1 bow east (high c) · 2 bow south (high r) · 3 bow west (low c). TWEAK */
const SHIP_LAYOUT=[{r0:1,c0:1,rows:5,cols:3,pillar:[3,2],rot:0},{r0:1,c0:7,rows:3,cols:5,pillar:[2,9],rot:1},{r0:7,c0:9,rows:5,cols:3,pillar:[9,10],rot:2},{r0:9,c0:1,rows:3,cols:5,pillar:[10,3],rot:3}];
SHIPS_DEF.forEach((d,i)=>{const L=SHIP_LAYOUT[i];if(!L)return;d.tiles=[];for(let r=L.r0;r<L.r0+L.rows;r++)for(let c=L.c0;c<L.c0+L.cols;c++)d.tiles.push([r,c]);d.pillar=L.pillar;d.box={...L}});
{const base=naumSetup;naumSetup=function(){const r=base.apply(this,arguments);try{for(const sh of S.ships||[]){const d=SHIPS_DEF[sh.id];if(d&&d.box)sh.box={...d.box}}}catch(e){}return r}}
let SHIP_IMG=null;
function shipImg(){if(HEADLESS)return null;if(!SHIP_IMG){SHIP_IMG=new Image();SHIP_IMG.onload=()=>{try{draw()}catch(e){}};SHIP_IMG.src=assetURL('ship.webp')}return SHIP_IMG.complete&&SHIP_IMG.naturalWidth?SHIP_IMG:null}
/* shipXform — the art-to-screen affine map for a ship box: [a,b,c,d,e,f]. In tile units, the art's (X,Y) (Y measured
   from the top of the bow) lands at col = a1·X + b1·Y + e1, row = a2·X + b2·Y + e2 — a pure rotation per B.rot. */
function shipXform(B){const T=SHIP_ART.tile,bw=SHIP_ART.bow/T,L=SHIP_ART.rows,Wd=SHIP_ART.cols;const O=iso(B.r0,B.c0);
  const M=[[1/T,0,0,0,1/T,-bw],[0,-1/T,L+bw,1/T,0,0],[-1/T,0,Wd,0,-1/T,L+bw],[0,1/T,-bw,-1/T,0,Wd]][B.rot||0];
  const [a1,b1,e1,a2,b2,e2]=M;const Cx=TW/2,Cy=TH/2,Rx=-TW/2,Ry=TH/2;
  return [a1*Cx+a2*Rx,a1*Cy+a2*Ry,b1*Cx+b2*Rx,b1*Cy+b2*Ry,O.x+e1*Cx+e2*Rx,O.y+e1*Cy+e2*Ry]}
const shipLive=()=>S&&isNaum()&&!S.drained;
function drawShipTile(r,c){if(!shipLive())return;if(S.drainLine!=null&&r+c<=S.drainLine){if(r===N-1&&c===N-1)drawShipBows();return}
  const sh=shipAt(r,c);const img=shipImg();
  if(sh&&sh.box&&img){ctx.save();tilePath(r,c);ctx.fillStyle=(r+c)%2?'#4f8f97':'#46838b';ctx.fill();ctx.clip(); /* water under the cut corners */ctx.transform(...shipXform(sh.box));ctx.drawImage(img,0,0);ctx.restore()}
  if(r===N-1&&c===N-1)drawShipBows()}
function drawShipBows(){const img=shipImg();if(!img||!S.ships)return;
  for(const sh of S.ships){if(sh.sunk||!sh.box)continue;ctx.save();ctx.transform(...shipXform(sh.box));ctx.beginPath();ctx.rect(0,0,img.naturalWidth,SHIP_ART.bow);ctx.clip();ctx.drawImage(img,0,0);ctx.restore()}}
/* the hull's name, on hover of its pillar or the bar above it */
{const base=describeTile;describeTile=function(t){let h=base.apply(this,arguments);try{if(t&&S&&isNaum()&&S.ships){const {r,c}=t;
  const sh=S.ships.find(s=>!s.sunk&&s.pillar&&[0,1,2].some(k=>s.pillar[0]-k===r&&s.pillar[1]-k===c));
  if(sh)h=`⛵ <b>${esc(sh.name)}</b> · Team ${esc(String(sh.team))} · ${Math.max(0,sh.hp)}/12 HP — smash its pillar to sink it · `+h}}catch(e){}return h}}
/* ---------- the prototype ---------- */
const PROTO=[['proto1.jpg','The board, mid-game'],['proto2.jpg','The arena and its pillars'],['proto3.jpg','Cards, tokens and the market'],['proto4.jpg','The arena, lit'],['proto5.jpg','The sand, close up']]; /* TWEAK: captions */
function protoOpen(){let o=document.getElementById('protoBox');if(o){o.hidden=false;return}
  o=document.createElement('div');o.id='protoBox';o.setAttribute('role','dialog');o.setAttribute('aria-label','The prototype');
  o.innerHTML=`<div class="protoin"><button type="button" class="mclose" data-protox aria-label="Close">×</button><h2>The prototype</h2><p class="rc-sub">The hand-built board game that Flavius Rule Arena was distilled from — by D.Soto.</p>
    <div class="protogrid">${PROTO.map(([f,c],i)=>`<figure><img src="${assetURL(f)}" alt="${esc(c)}" loading="lazy" data-protoz="${i}"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div></div>`;
  document.body.appendChild(o)}
document.addEventListener('click',e=>{const t=e.target;if(t.closest&&t.closest('[data-proto]')){e.preventDefault();e.stopPropagation();protoOpen();return}
  const box=document.getElementById('protoBox');if(!box||box.hidden)return;
  if(t.closest('[data-protox]')||t===box){box.hidden=true;return}
  const z=t.closest('[data-protoz]');if(z){const f=z.closest('figure');const on=!f.classList.contains('big');box.querySelectorAll('figure.big').forEach(x=>x.classList.remove('big'));if(on)f.classList.add('big')}},true);
document.addEventListener('keydown',e=>{const box=document.getElementById('protoBox');if(e.key==='Escape'&&box&&!box.hidden){box.hidden=true;e.stopPropagation()}},true);
{const base=playGuideHTML;playGuideHTML=function(){return base.apply(this,arguments).replace(/<\/div>\s*$/,`<p class="rc-sub" style="margin-top:12px">📷 <button type="button" class="mmlink" data-proto>See the prototype</button> — the hand-built board this game was distilled from.</p></div>`)}}
{const st=document.createElement('style');st.textContent=`
.mmlink{all:unset;cursor:pointer;color:var(--gold2);text-decoration:underline dotted;text-underline-offset:2px}.mmlink:hover,.mmlink:focus-visible{color:#fff3c8;outline:none}
#protoBox{position:fixed;inset:0;z-index:4000;background:rgba(8,5,3,.86);display:flex;align-items:center;justify-content:center;padding:16px}
#protoBox[hidden]{display:none}.protoin{background:var(--panel);border:1px solid var(--gold);border-radius:8px;max-width:min(1200px,96vw);max-height:92vh;overflow:auto;padding:16px 18px}
.protoin h2{font:400 26px var(--display);color:var(--gold2);margin:0 0 4px}.protogrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-top:10px;align-items:start}
.protogrid figure{margin:0;background:var(--panel2);border:1px solid var(--line2);border-radius:6px;overflow:hidden}.protogrid img{display:block;width:100%;height:auto;cursor:zoom-in}
.protogrid figcaption{font-size:12.5px;color:var(--muted);padding:4px 8px}.protogrid figure.big{grid-column:1/-1}.protogrid figure.big img{cursor:zoom-out}`;document.head.appendChild(st)}
