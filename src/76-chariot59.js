/* =====================================================================
   76-CHARIOT59 · v0.59
   =====================================================================
   CHARIOT RACING BY THE RULEBOOK (pp.50-51):
   - THE DRAFT is a snake draft (order reverses every round): the chariot card, head armor, chest armor and a level 1-2
     weapon; wheel and horse tokens are dealt at random (rulebook note).
   - A PILLAR GATE's step: one free tile beyond the gate, adjacent or diagonal (was +2 movement): +1 movement, and the
     first step out of the gate tile costs 1 even on the diagonal.
   - THE TOKENS ON THE CHARIOT: each mounted chariot carries its horse token (the face up) and wheel token on the board,
     each with a durability bar; the horse token flips over at a gate; a broken wheel or a lost horse falls off.
   ===================================================================== */
const CH_CARDS59=[['chRed',_T('Invicta Gloria')],['chBlue',_T('Azureus Magnus')],['chTeal',_T('Bellum Quadriga')],['chGold',_T('Aureus Triumphus')],['chSilver',_T('Bellator Aequus')],['chPurple',_T('Fulgens Velox')]];
chariotDraft=async function(){
  log(_T('Chariot draft — a snake draft: every racer drafts a chariot card, head armor, chest armor and a level 1-2 weapon; wheel and horse tokens are dealt at random.'),'hd');
  const heads=['galea','galea','cassis','crista','murmillo','cassis'],chests=['balteus','pectorale','pectorale','lorica','lorica','balteus1'],weps=[...MARKET_W[1],...MARKET_W[2]];
  const rounds=[[_T('Chariot'),CH_CARDS59.map(x=>x[0]),'c'],[_T('Head armor'),heads,'a'],[_T('Chest armor'),chests,'a'],[_T('Weapon'),weps,'w']];
  rounds.forEach(([title,pool,kind],ri)=>rounds[ri].avail=[...pool]);
  for(let ri=0;ri<rounds.length;ri++){const [title,,kind]=rounds[ri];const avail=rounds[ri].avail;const order=ri%2?[...S.players].reverse():S.players;
    for(const p of order){let k;
      if(kind==='c'){const want=p.ch?p.ch.art:null;
        if(p.cpu)k=avail.includes(want)?want:avail[0];
        else{const i=await modal(_T`Draft · ${p.name} · ${title}`,`<p>${_T`Pick your chariot card.`}</p>`,avail.map((x,i)=>({label:CH_CARDS59.find(c=>c[0]===x)[1],value:i,card:'g:'+x})));k=avail[i??0]}
        avail.splice(avail.indexOf(k),1);if(p.ch){p.ch.art=k;p.ch.name=CH_CARDS59.find(c=>c[0]===k)[1]}log(_T`${nm(p)} drafts the chariot <b>${esc(p.ch?p.ch.name:k)}</b>.`);continue}
      if(p.cpu)k=avail.sort((a,b)=>itemValue(kind,b)-itemValue(kind,a))[0];
      else{const i=await modal(_T`Draft · ${p.name} · ${title}`,`<p>${_T`Pick one.`}</p>`,avail.map((x,i)=>({label:kind==='w'?W[x].n:ARM[x].n,sub:kind==='w'?wStats(mkW(x)):armorDesc(x),value:i})));k=avail[i??0]}
      avail.splice(avail.indexOf(k),1);
      if(kind==='w')p.wR=mkW(k);else equipPiece(p,k,ARM[k].slot);
      log(_T`${nm(p)} drafts ${kind==='w'?W[k].n:ARM[k].n}.`)}}
  for(const p of S.players){p.wL=mkW('chariotCard');if(p.ch)p.wL.gart='g:'+p.ch.art;p.keys=2;p.cf+=3}
  log(_T`Each racer receives an Arena Key token (2 keys) and ${cfAmt87(3)}. The chariot card fills the secondary weapon slot.`);
};
/* the gate step: base chStep gives +2 movement; the rulebook gives one free tile (adjacent or diagonal) */
{const base=chStep;chStep=async function(p,or,oc){const ch=p&&p.ch;const mv0=p?p.mv:0;const flip0=ch&&ch.horse?ch.horse.face:null;
  if(ch&&ch.gateAt!=null&&ch.gateAt!==p.r*N+p.c)ch.gateAt=null;
  const r=await base.apply(this,arguments);
  try{if(ch&&ch.mounted&&CH_GATES.some(([a,b])=>a===p.r&&b===p.c)&&p.mv>=mv0+2){p.mv-=1;ch.gateAt=p.r*N+p.c}
    if(ch&&ch.horse&&flip0!=null&&ch.horse.face!==flip0){ch.horse.flipT=performance.now();if(typeof fx==='function')fx(p.r,p.c,'🐎 '+(ch.horse.name||'flip'),'#f0cf7d')}}catch(e){}
  return r}}
chReach=function(p){
  const start=p.r*N+p.c;const gate=p.ch&&p.ch.gateAt===start;
  let nb;
  if(p.ch&&p.ch.mounted)nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;if(!chFwdOK(r,c,dr,dc))continue;const nr=r+dr,nc=c+dc;if(!chTrackOK(nr,nc,p))continue;out.push([nr*N+nc,dr&&dc&&!(gate&&k===start)?2:1])}return out};
  else nb=k=>{const r=Math.floor(k/N),c=k%N,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(!inB(nr,nc)||pillarAt(nr,nc)||chHatched(nr,nc)||mountedAt(nr,nc)||(playerAt(nr,nc)&&playerAt(nr,nc)!==p))continue;out.push([nr*N+nc,dr&&dc?2:1])}return out};
  const {dist,prev}=dijN(start,nb);
  const tiles=new Map();for(const [k,d] of dist)if(d>0)tiles.set(k,d);
  return {tiles,path:k=>statePath(prev,dist,start,k,kk=>({k:kk}))};
};
{const base=beginTurn;beginTurn=async function(){try{for(const q of (S&&S.players)||[])if(q.ch)q.ch.gateAt=null}catch(e){}return base.apply(this,arguments)}}
/* ---------- the tokens on the chariot ---------- */
let CHTOK_IMG=null;
function chTokImg(){if(HEADLESS)return null;if(!CHTOK_IMG){CHTOK_IMG=new Image();CHTOK_IMG.onload=()=>{try{draw()}catch(e){}};CHTOK_IMG.src=assetURL('chtok.webp')}return CHTOK_IMG.complete&&CHTOK_IMG.naturalWidth?CHTOK_IMG:null}
/* chTok — one round token from chtok.webp at (x,y), d px across; sx squashes it horizontally (the flip) */
function chTok(art,x,y,d,sx=1,alpha=1){const im=chTokImg();const i=CHTOK_IDX[art];if(!im||i==null)return;const cw=im.naturalWidth/5;
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(Math.max(0.06,sx),1);ctx.fillStyle='rgba(0,0,0,.35)';ell(2,3,d*0.5,d*0.5);ctx.fill();
  ctx.drawImage(im,(i%5)*cw,Math.floor(i/5)*cw,cw,cw,-d/2,-d/2,d,d);ctx.restore()}
function chBar(x,y,w,frac,col){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-w/2,y,w,4);ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*Math.max(0,Math.min(1,frac)),4)}
const CH_DROPS=[];
{const base=drawPlayer;drawPlayer=function(player){const r=base.apply(this,arguments);
  try{const ch=player.ch;if(false&&!HEADLESS&&isChariot()&&ch&&ch.mounted&&player.alive){ /* v0.64: horse/wheel tokens moved onto the chariot card (84-v64) */const m=center(player.r,player.c);const d=TW*0.4,y=m.y+TW*0.02;
    if(ch.horse){const H=ch.horse;let face=H.face,sx=1;if(H.flipT){const t=(performance.now()-H.flipT)/700;if(t<1){sx=Math.abs(Math.cos(Math.PI*t));if(t<0.5)face^=1}else H.flipT=0}
      const side=H.sides[face];chTok(side.art,m.x-TW*0.42,y,d,sx);const f=H.sides[H.face];chBar(m.x-TW*0.42,y+d*0.52,d*0.9,(f.hp-H.dmg)/f.hp,'#9cc46e')}
    if(ch.wheel){chTok(ch.wheel.art,m.x+TW*0.42,y,d);chBar(m.x+TW*0.42,y+d*0.52,d*0.9,ch.wheel.hp/ch.wheel.max,'#d8b878')}}}catch(e){}
  return r}}
{const base=chHitPart;chHitPart=function(p,part,dmg){const ch=p&&p.ch;const before=ch&&ch[part]?(part==='horse'?ch.horse.sides[ch.horse.face].art:ch.wheel.art):null;
  const r=base.apply(this,arguments);
  try{if(before&&!ch[part]&&!HEADLESS){CH_DROPS.push({r:p.r,c:p.c,art:before,dx:part==='horse'?-0.42:0.42,t0:performance.now()});if(typeof fx==='function')fx(p.r,p.c,part==='horse'?'🐎 lost':'⚙ shattered','#e05a44')}}catch(e){}
  return r}}
{const base=drawFX;drawFX=function(){const r=base.apply(this,arguments);
  try{const now=performance.now();for(let i=CH_DROPS.length-1;i>=0;i--){const q=CH_DROPS[i];const t=(now-q.t0)/900;if(t>=1){CH_DROPS.splice(i,1);continue}
    const m=center(q.r,q.c);chTok(q.art,m.x+TW*q.dx*(1+t*0.6),m.y+TW*0.02+TW*0.5*t*t,TW*0.4*(1-t*0.3),1,1-t)}}catch(e){}
  return r}}
