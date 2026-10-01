/* =====================================================================
   82-ACCESS · v0.63 ACCESSIBILITY (Settings → General → Accessibility)
   =====================================================================
   • Reduce motion (SETTINGS.calm): the same as the system's reduced-motion request, in-game — no CSS animations or
     transitions (body.calm), no screen shake, no flying projectiles or corpse-crew walks (animOn), dice land at once.
     reduceMotion() (11-extra) reads it too, so everything that already honoured the system setting follows.
   • Text size (SETTINGS.tscale 100 / 115 / 130): CSS zoom on the panels, the log, the side column, windows and the menu —
     never on the arena canvas (its hit-testing stays exact).
   • Colour-blind palette (SETTINGS.cvd): the eight printed classes take the Okabe–Ito colours (distinct under red-green and
     blue-yellow colour blindness), each token carries its class letter, and good/bad badges turn blue/orange.
     Custom classes keep their own colours. TWEAK: CVD_COLORS.
   ===================================================================== */
const CVD_COLORS={soldier:'#D55E00',royalty:'#0072B2',hero:'#009E73',slave:'#F0E442',veteranus:'#EDEDED',amazonia:'#E69F00',venatore:'#CC79A7',damnatio:'#56B4E9'};
const CLS_COLOR0={};for(const k of Object.keys(CVD_COLORS))if(CLASSES[k])CLS_COLOR0[k]=CLASSES[k].color;
{const st=document.createElement('style');st.textContent=`
body.calm *,body.calm *::before,body.calm *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
body.ts115 #actions,body.ts115 .logbar,body.ts115 aside.side,body.ts115 #mBody,body.ts115 #mainMenu .mmbtns,body.ts115 #tip{zoom:1.15}
body.ts130 #actions,body.ts130 .logbar,body.ts130 aside.side,body.ts130 #mBody,body.ts130 #mainMenu .mmbtns,body.ts130 #tip{zoom:1.3}
body.cvd .badge.good{border-color:#2f5d8a;color:#9cc8f0}body.cvd .badge.bad{border-color:#8a5a1e;color:#f2b46a}
.a11yrow .seg button.on{outline:1px solid var(--gold2)}`;document.head.appendChild(st)}
function applyAccess(){try{const b=document.body;if(!b)return;b.classList.toggle('calm',!!SETTINGS.calm);
  b.classList.remove('ts115','ts130');if(+SETTINGS.tscale===115||+SETTINGS.tscale===130)b.classList.add('ts'+SETTINGS.tscale);
  b.classList.toggle('cvd',!!SETTINGS.cvd);
  for(const [k,c] of Object.entries(CVD_COLORS))if(CLASSES[k])CLASSES[k].color=SETTINGS.cvd?c:CLS_COLOR0[k];
  if(typeof S!=='undefined'&&S&&typeof draw==='function')try{draw()}catch(e){}}catch(e){}}
{const base=applySettings;applySettings=function(){const r=base.apply(this,arguments);applyAccess();return r}}
{const base=animOn;animOn=function(){return base.apply(this,arguments)&&!(typeof reduceMotion==='function'&&reduceMotion())}}
/* the class letter on each token (colour-blind palette) */
{const base=drawPlayer;drawPlayer=function(player){const r=base.apply(this,arguments);try{if(SETTINGS.cvd&&player&&player.alive&&!player.exited&&typeof ctx!=='undefined'){
  const C=CLASSES[player.cls]||{};const L=((C.n||C.name||player.cls||'?')+'').replace(/^the\s+/i,'').charAt(0).toUpperCase();const {x,y}=center(player.r,player.c);
  ctx.save();ctx.font=`700 ${Math.max(9,Math.round(TW*0.24))}px IBM Plex Mono, monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(L,x,y+TH*0.18);ctx.fillStyle='#fff';ctx.fillText(L,x,y+TH*0.18);ctx.restore()}}catch(e){}return r}}
/* Settings → General: the three controls, just above Visuals */
{const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);if(tab!=='general'&&tab)return h;try{
  const ts=+SETTINGS.tscale||100;
  const block=`<h4 style="grid-column:1/-1;margin:6px 0 0">Accessibility</h4>
    <label class="setrow"><input type="checkbox" data-set="calm" ${SETTINGS.calm?'checked':''}><span><b>Reduce motion</b><br><span class="hint" style="margin:0">No shakes, flashes, flying missiles or animated panels. On by itself when your system asks for reduced motion.</span></span></label>
    <label class="setrow"><input type="checkbox" data-set="cvd" ${SETTINGS.cvd?'checked':''}><span><b>Colour-blind palette</b><br><span class="hint" style="margin:0">Class colours anyone can tell apart, a class letter on every token, blue/orange for good/bad.</span></span></label>
    <div class="setrow a11yrow"><span><b>Text size</b><br><span class="hint" style="margin:0">Panels, log, windows and menus. The arena keeps its size.</span></span><div class="seg">${[100,115,130].map(v=>`<button type="button" data-tscale="${v}" class="${ts===v?'on':''}">${v}%</button>`).join('')}</div></div>`;
  const mark='<h4 style="grid-column:1/-1;margin:6px 0 0">Visuals</h4>';return h.includes(mark)?h.replace(mark,block+mark):h}catch(e){return h}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tscale]');if(!b)return;SETTINGS.tscale=+b.dataset.tscale;applySettings();
  b.parentElement.querySelectorAll('[data-tscale]').forEach(x=>x.classList.toggle('on',x===b))});
applyAccess();
