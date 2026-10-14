/* 159-v88set — v0.88 settings pass (agreed after his "we should organize these together", 2026-10-05):
   • GENERAL is grouped: Gameplay (CPU speed, Animations, Confirm before End turn, Follow camera, Event briefing, Context menus) ·
     Hints & help (the master switch and its parts) · On the board (floating numbers, card reveals, log on the arena, screen shake,
     see-through) · then Accessibility, Visuals, Voices & bubbles as before. Rows are moved, not rebuilt — their handlers stay.
   • NEW: Animations Full / Quick / Off (SETTINGS.anim88): Quick halves projectile flights and the market roll show; Off = no flying
     projectiles, corpse crews or roll show (animOn wrapper). Follow camera (SETTINGS.cam88, default on): when zoomed in, the view
     eases toward the gladiator whose turn it is (86 camFocus); off = it stays where you put it.
   • AUDIO: the music and effects volume sliders get a full-width track; the theme list shows the themes you have first and folds the
     locked ones ("🔒 N locked — win an event in their city"); audListRefresh maps rows by city, so the fold never mixes up the rows. */
const ANIM88=()=>SETTINGS.anim88||'full';
{const base=animOn;animOn=function(){return base.apply(this,arguments)&&ANIM88()!=='off'}}
{const base=projectile;projectile=function(kind,from,to,o){if(ANIM88()==='quick'&&o&&o.dur)o={...o,dur:Math.round(o.dur*0.5)};return base.call(this,kind,from,to,o)}}
{const base=camFocus;camFocus=function(){if(SETTINGS.cam88===false)return null;return base.apply(this,arguments)}}
/* the market roll show follows the setting too */
{const base=mk88Roll;mk88Roll=function(root,lv,slot,sides,onEnd){if(ANIM88()==='off'){const r=base.apply(this,arguments);r.skip();return r}return base.apply(this,arguments)}}

{const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);if(typeof h!=='string')return h;
  try{if(!tab||tab==='general')return set88General(h);if(tab==='audio')return h.replace(/class="setrow slider"(?=>[\s\S]{0,80}?data-audv|[^>]*>(?:(?!<\/label>)[\s\S])*?data-audv)/g,_T('class="setrow slider aud88"'))}catch(e){console.error(e)}return h}}
function set88General(h){const T=document.createElement('template');T.innerHTML=h;const g=T.content.querySelector('.setgrid');if(!g)return h;
  const rows=[...g.children];const by=sel=>rows.find(r=>r.matches(sel)||r.querySelector(sel));
  const row=sel=>{const r=by(sel);return r&&r.matches('.setrow')?r:null};
  const anim=ANIM88(),seg=(k,l)=>`<button type="button" data-anim88="${k}" class="${anim===k?'on':''}">${l}</button>`;
  const mk=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild};
  const animRow=mk(`<div class="setrow"><span>${_T`<b>Animations</b>`}<br><span class="hint" style="margin:0">${_T`Flying stones and spears, the clean-up crew, the market peeks. Quick halves them.`}</span></span><div class="seg">${seg('full',_T('Full'))}${seg('quick',_T('Quick'))}${seg('off',_T('Off'))}</div></div>`);
  const camRow=mk(`<label class="setrow"><input type="checkbox" data-set="cam88" ${SETTINGS.cam88!==false?'checked':''}><span>${_T`<b>Follow camera</b>`}<br><span class="hint" style="margin:0">${_T`When zoomed in, the view follows whoever's turn it is.`}</span></span></label>`);
  const head=t=>mk(`<h4 style="grid-column:1/-1;margin:6px 0 0">${t}</h4>`);
  const groups=[[_T('Gameplay'),[row('[data-sspeed]'),animRow,row('[data-set="confirmEnd"]'),camRow,row('[data-set="briefing"]'),row('[data-set="ctxMenu"]')]],
    [_T('Hints & help'),[row('.hint87')||row('[data-set="hints"]')]],
    [_T('On the board'),[row('[data-set="fx"]'),row('[data-set="reveals"]'),row('[data-set="capFeed"]'),row('[data-set="shake"]'),row('[data-sxray]')]]];
  const lang=row('.lang84');const anchor=lang?lang.nextSibling:g.firstChild;
  for(const [t,list] of groups){const L=list.filter(Boolean);if(!L.length)continue;g.insertBefore(head(t),anchor);for(const r of L)g.insertBefore(r,anchor)}
  return T.innerHTML}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-anim88]');if(!b)return;SETTINGS.anim88=b.dataset.anim88;applySettings();
  b.parentElement.querySelectorAll('[data-anim88]').forEach(x=>x.classList.toggle('on',x===b))});

/* the theme list: yours first, the locked ones folded */
{const base=audListHTML;audListHTML=function(){const h=base.apply(this,arguments);try{const T=document.createElement('template');T.innerHTML=h;const list=T.content.querySelector('.tracklist');if(!list)return h;
  const locked=[...list.querySelectorAll(':scope > .trackrow.locked')];if(!locked.length)return h;
  const d=document.createElement('details');d.className='lk88';d.innerHTML=`<summary>${_T`🔒 ${locked.length} locked — win an event in their city to hear each`}</summary>`;
  for(const r of locked)d.appendChild(r);list.appendChild(d);return T.innerHTML}catch(e){return h}}}
audListRefresh=function(){const el=document.getElementById('audTracks');if(!el)return;const ALL=[...AUD_TRACKS,...(typeof AUD_EXTRA!=='undefined'?AUD_EXTRA:[])];
  const rows=el.querySelectorAll('.trackrow');if(rows.length!==ALL.length){const open=!!el.querySelector('details.lk88[open]');el.innerHTML=audListHTML();if(open){const d=el.querySelector('details.lk88');if(d)d.open=true}return}
  rows.forEach(row=>{const b=row.querySelector('[data-trk="play"],[data-trk="pause"]');if(!b)return;const city=b.dataset.city;const on=AUD.loc===city&&AUD.playing;const paused=AUD.loc===city&&AUD.paused;
    row.classList.toggle('on',on);const want=on?'pause':'play';if(b.dataset.trk!==want){b.dataset.trk=want;b.textContent=on?'❚❚':'▶';b.title=on?_T('Pause'):_T('Play')}
    const st=row.querySelector('.trst');if(st){const t=on?_T('♪ now playing'):paused?_T('paused'):'';if(st.textContent!==t)st.textContent=t}})};

{const css=document.createElement('style');css.textContent=`
.setgrid .setrow.slider.aud88{grid-column:span 2;display:flex;align-items:center;gap:12px}
.setgrid .setrow.slider.aud88>span{flex:none;min-width:110px}
.setgrid .setrow.slider.aud88 input[type=range]{flex:1;min-width:120px;width:auto}
.setgrid .setrow.slider.aud88 output{flex:none;width:34px;text-align:right;font:600 12px var(--mono,monospace)}
details.lk88{margin-top:6px}details.lk88>summary{cursor:pointer;color:var(--muted);font-size:13px;padding:6px 4px}
details.lk88 .trackrow{opacity:.8}
@media (max-width:600px){.setgrid .setrow.slider.aud88{grid-column:1/-1}}`;document.head.appendChild(css)}
