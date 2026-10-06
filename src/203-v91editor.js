/* 203-v91editor — v0.91 THE EDITOR PICKER (his pick 2026-10-06: keep custom editors, make them easy to pick).
   The Event Designer's "Editor in the box" select becomes a row of painted face tiles: the city's seated editor (default), Flavius,
   every city patron (locked ones greyed — "Win a match in X"), your own editors (✦), and "+ Make an editor" (opens the Studio's
   Editor designer; locked until a win in all twelve cities, with the count). A click sets the hidden select and fires its change,
   so the designer saves exactly as before. Display only. */
function edp91HTML(cur){const face=sp=>typeof flavFaceURL==='function'?`<img src="${flavFaceURL('calm',sp)}" alt="">`:'🎭';
  const tile=(id,sp,name,sub,lock)=>`<button type="button" class="edp91t${String(cur||'')===String(id)?' on':''}${lock?' lock':''}" data-edp91="${esc(id)}" ${lock?'disabled':''} title="${esc(lock||sub||'')}">${sp?face(sp):'<span class="edp91c">🏛</span>'}<b>${esc(name)}</b><small>${esc(lock?_T('🔒 locked'):sub||'')}</small></button>`;
  let h=tile('',null,_T('The city’s editor'),_T('default'));h+=tile('flavius',SPONSOR_FLAVIUS,'Flavius','Roma');
  for(const [li,sp] of Object.entries(CITY_SPONSORS)){const ok=cityUnlocked(li);h+=tile(sp.id,sp,sp.short||sp.name,sp.city,ok?'':_T`Win a match in ${sp.city} to seat ${sp.short||sp.name}`)}
  for(const s of ((typeof CUSTOM!=='undefined'&&CUSTOM.sponsors)||[]))h+=tile(s.id,s,'✦ '+(s.short||s.name),_T('your editor'));
  const open=typeof creatorUnlocked==='function'&&creatorUnlocked();const n=new Set(typeof HALL_LOCS!=='undefined'?HALL_LOCS:[]).size;
  h+=`<button type="button" class="edp91t mk${open?'':' lock'}" data-edp91mk="1" ${open?'':'disabled'} title="${esc(open?_T('Design your own editor in the Creator Studio'):_T`Win a match in all twelve cities to open the Editor designer (${n}/12)`)}"><span class="edp91c">＋</span><b>${_T`Make an editor`}</b><small>${open?_T('Creator Studio'):_T`${n}/12 cities`}</small></button>`;
  return `<div class="edp91">${h}</div>`}
{const tick=()=>{try{for(const s of document.querySelectorAll('select[data-f="sponsor"]:not([data-edp91])')){s.dataset.edp91='1';s.hidden=true;s.insertAdjacentHTML('afterend',edp91HTML(s.value))}}catch(e){console.error(e)}};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-edp91],[data-edp91mk]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.edp91mk){if(typeof ST!=='undefined'){ST.tab='sponsors';if(typeof studioRedraw==='function')studioRedraw()}return}
  const box=b.closest('.edp91');const s=box&&box.previousElementSibling;if(!s||s.tagName!=='SELECT')return;
  s.value=b.dataset.edp91;box.querySelectorAll('.edp91t').forEach(x=>x.classList.toggle('on',x===b));
  s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))},true);
{const st=document.createElement('style');st.textContent=`
.edp91{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.edp91t{display:flex;flex-direction:column;align-items:center;gap:2px;width:78px;padding:5px 4px;border:1px solid rgba(201,162,78,.3);border-radius:6px;background:rgba(20,12,6,.35);color:#e8dcc0;cursor:pointer;font:inherit;text-transform:none}
.edp91t b,.edp91t small{color:#e8dcc0}
.edp91t img{width:52px;height:52px;border-radius:5px;object-fit:cover}
.edp91t .edp91c{width:52px;height:52px;display:grid;place-items:center;font-size:26px;border-radius:5px;background:rgba(255,255,255,.05)}
.edp91t b{font-size:11px;line-height:1.15;text-align:center;font-weight:600}
.edp91t small{font-size:10px;opacity:.7;text-align:center;line-height:1.1}
.edp91t.on{border-color:var(--gold,#c9a24e);box-shadow:0 0 0 1px var(--gold,#c9a24e) inset;background:#3a2a18}
.edp91t.lock{opacity:.55;cursor:not-allowed;filter:grayscale(.7)}
.edp91t:not(.lock):hover{border-color:var(--gold2,#f0cf7d)}`;document.head.appendChild(st)}
