/* =====================================================================
   258-V98HORSES · v0.98 — chariot horse tokens: two horses a token
   =====================================================================
   - HIS SHEET (tools/art/horses98/horse.pdf, cells rebuilt by tools/art/horses98/make.py): sharper art for the 8 horse
     faces on assets/chtok.webp + a 9th face, Saxo +1 / 10 HP (cell 17, `saxoC`).
   - EVERY TOKEN = TWO DIFFERENT HORSES (his design): `HORSE_SET98` = a POOL of 12 tokens (24 faces, each horse 6 times;
     printed faces reused, the art is per face). At chariotSetup every racer DRAWS a token from the shuffled pool (09
     chHorseDraw, seeded dice, without replacement), the floor spares come from what is left. Each face keeps its own
     art, name and printed numbers.
     Balance (tools/horsesim.js, 60 all-CPU 4-racer races, random starting face): a 3/1 token (sprint + lull) is weaker
     than an even 2/2 one; one +5 meta token (Vindex 3/8 ⇄ Ocianus 2/8, the fragile faces) — wins ≈ +5 62 %, 2/2 28 %,
     3/1 16 %. HP barely matters (a horse is lost ~0.02 times a race).
   - A token is dealt with a random face up (09 chHorseDeal, seeded dice); the horse's name = the face up. A gate flip
     names the new horse in the log (09 chStep), floats its name (76) and turns the token over beside the chariot on
     the board (`flip98Draw`, ~1.4 s; Reduce motion / animations Off = the new face held still) and on the panel's
     chariot card (`.fl98`). Tooltips: each face + the horses on its other side.
   ===================================================================== */
/* HORSE_FACES98 — the printed faces: n horse · mv movement bonus · hp HP · art chtok key. TWEAK: numbers only with his sheet. */
const HORSE_FACES98={
  palmatusA:{n:'Palmatus',mv:3,hp:10},palmatusB:{n:'Palmatus',mv:2,hp:12},
  ocianusA:{n:'Ocianus',mv:2,hp:8},ocianusB:{n:'Ocianus',mv:2,hp:10},
  saxoA:{n:'Saxo',mv:1,hp:8},saxoB:{n:'Saxo',mv:1,hp:12},saxoC:{n:'Saxo',mv:1,hp:10},
  vindexA:{n:'Vindex',mv:3,hp:8},vindexB:{n:'Vindex',mv:3,hp:12}};
/* HORSE_SET98 — the pool: [face, other face]. Palmatus 2/12 ×5 + 3/10, Ocianus 2/8 ×3 + 2/10 ×3, Saxo 1/8 · 1/10 · 1/12
   ×2 each, Vindex 3/8 ×3 + 3/12 ×3. TWEAK: rerun `node tools/horsesim.js flavius-arena.html deep 60 "a+b,…"`. */
const HORSE_SET98=[['vindexA','ocianusA'],['palmatusB','ocianusA'],['palmatusB','ocianusA'],['palmatusB','ocianusB'],['palmatusB','ocianusB'],['palmatusB','ocianusB'],
  ['palmatusA','saxoA'],['vindexA','saxoB'],['vindexA','saxoC'],['vindexB','saxoA'],['vindexB','saxoB'],['vindexB','saxoC']];
CHTOK_IDX.saxoC=17;
HORSES.splice(0,HORSES.length,...HORSE_SET98.map(([a,b])=>({n:HORSE_FACES98[a].n,sides:[a,b].map(k=>({n:HORSE_FACES98[k].n,mv:HORSE_FACES98[k].mv,hp:HORSE_FACES98[k].hp,art:k}))})));
/* horseTok98 — "Vindex ⇄ Saxo" for a horse (token object or HORSES entry). */
function horseTok98(H){return H&&H.sides?H.sides.map(s=>s.n||H.name||H.n||'?').join(' ⇄ '):''}
/* horseOther98 — the faces on the other side of tokens that carry this face key */
function horseOther98(k){const out=[];for(const H of HORSES){const i=H.sides.findIndex(s=>s.art===k);if(i<0)continue;const o=H.sides[1-i];if(!out.some(x=>x.art===o.art))out.push(o)}return out}
{const base=cardText;cardText=function(ref){if(ref&&ref[0]==='h'&&HORSE_FACES98[ref.slice(2)]){const k=ref.slice(2),f=HORSE_FACES98[k];
  const oth=horseOther98(k).map(o=>_T`${o.n} (+${o.mv}, ${o.hp} HP)`).join(_T(' or '));
  return _T`<b>${f.n}</b> · chariot horse · +${f.mv} movement, ${f.hp} HP on this face`+(oth?'<br>'+_T`Other side: ${oth}. The token flips at each pillar gate and the other horse takes the reins (fresh HP).`:'')}
  return base.apply(this,arguments)}}
{const base=cardLabel;cardLabel=function(ref){if(ref&&ref[0]==='h'&&HORSE_FACES98[ref.slice(2)])return _T`${HORSE_FACES98[ref.slice(2)].n} (horse token)`;return base.apply(this,arguments)}}
/* ---------- the flip, seen ---------- */
const FLIP98={ms:1400,loop:0};
const flip98Calm=()=>(typeof reduceMotion==='function'&&reduceMotion())||(typeof animOn==='function'&&!animOn());
/* flip98Tick — keeps the board redrawing while a horse token turns over */
function flip98Tick(){if(FLIP98.loop||HEADLESS)return;const step=()=>{FLIP98.loop=0;try{const now=performance.now();const live=S&&!S.sim&&(S.players||[]).some(p=>p.ch&&p.ch.horse&&p.ch.horse.flipT&&now-p.ch.horse.flipT<FLIP98.ms+80);draw();if(live)FLIP98.loop=requestAnimationFrame(step)}catch(e){}};FLIP98.loop=requestAnimationFrame(step)}
/* flip98Draw — the horse token rises beside the chariot, turns over (old face → new face) and fades */
function flip98Draw(p){const H=p.ch&&p.ch.horse;if(!H||!H.flipT||HEADLESS||typeof chTok!=='function')return;const t=(performance.now()-H.flipT)/FLIP98.ms;if(t<0||t>=1)return;
  const m=center(p.r,p.c),d=TW*0.62,x=m.x+TW*0.5,y=m.y-TW*0.55-TW*0.12*Math.sin(Math.PI*Math.min(1,t*1.6));
  let face=H.face,sx=1;if(!flip98Calm()&&t<0.6){const u=t/0.6;sx=Math.abs(Math.cos(Math.PI*u));if(u<0.5)face^=1}
  const a=t>0.8?(1-t)/0.2:1;chTok(H.sides[face].art,x,y,d,sx,a);
  if(sx>0.3){ctx.save();ctx.globalAlpha=a;ctx.font=`700 ${Math.max(10,Math.round(TW*0.2))}px var(--display),serif`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.fillStyle='#f0cf7d';
    const s=H.sides[face];const tx=`${s.n} +${s.mv}`;ctx.strokeText(tx,x,y+d*0.68);ctx.fillText(tx,x,y+d*0.68);ctx.restore()}}
{const base=drawPlayer;drawPlayer=function(player){const r=base.apply(this,arguments);try{if(player&&player.ch&&player.ch.horse&&player.ch.horse.flipT&&typeof isChariot==='function'&&isChariot())flip98Draw(player)}catch(e){}return r}}
{const base=chStep;chStep=async function(p){const H=p&&p.ch&&p.ch.horse,f0=H?H.face:null;const r=await base.apply(this,arguments);
  try{if(H&&p.ch.horse===H&&H.face!==f0){if(!H.flipT)H.flipT=performance.now();flip98Tick()}}catch(e){}return r}}
/* the panel's chariot card: the horse token names both horses and turns over when it flips */
{const st=document.createElement('style');st.textContent=`@keyframes fl98{0%{transform:translate(-50%,-50%) rotateY(0)}50%{transform:translate(-50%,-50%) rotateY(90deg)}100%{transform:translate(-50%,-50%) rotateY(0)}}
.chcomp .chtk.horse.fl98{animation:fl98 .7s ease-in-out 1;box-shadow:0 0 0 2px #f0cf7d;border-radius:50%}body.calm .chcomp .chtk.horse.fl98{animation:none}
.chcomp .chnm98{position:absolute;left:74.5%;top:62%;transform:translateX(-50%);font:600 11px var(--display),serif;color:#f0cf7d;text-shadow:0 1px 2px #000;white-space:nowrap;pointer-events:none}`;document.head.appendChild(st)}
{const base=chCardComp;chCardComp=function(p){let h=base.apply(this,arguments);try{const H=p&&p.ch&&p.ch.horse;if(H&&H.sides){const f=H.sides[H.face]||{};
  const recent=H.flipT&&performance.now()-H.flipT<1500;
  h=h.replace(/<span class="chtk horse"([^>]*?) title="[^"]*"/,(m0,a)=>`<span class="chtk horse${recent?' fl98':''}"${a} title="${esc(horseTok98(H))}"`);
  h=h.replace(/<\/span>$/,`<span class="chnm98">${esc(f.n||H.name||'')} +${f.mv}</span></span>`)}}catch(e){}return h}}
