/* v0.97 (244-v96walk) · Match Week: the walk lives in the city banner, the road is one slim strip.
   1 · "Walk the city square" (the forum thumbnail of 185 city90Thumb behind it, no icon, banner lettering) moves INTO the city banner,
       bottom left under the "Match Week · week N of 12" line; the note (temple · walk the sand at the arena gate, "walked ✓") sits beside it.
       Same button, same data-mg="city" click (17-manager, 210 sitOut92 home square). No button (bye week) = nothing added.
   2 · The Road box (.travelcard: road / home sand / deals / road event / lock note / advisor note / sit-out row), the city card and the
       "Asking for a fight" line become ONE strip: the .travelcard element itself, flattened (every button + data attribute kept), with the
       asking line inside it. Nothing to say = no strip. A final mgrHTML wrapper (95 adds the banner around nightHTML) over the finished HTML (display only). */
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||MGR.tab!=='night'||h.indexOf('b73-night')<0)return h;{const w=W_();if(!w||!w.night||w.night.bye)return h}
  const T=document.createElement('template');T.innerHTML=h;const Q=s=>T.content.querySelector(s);
  /* 1 · the walk button into the banner */
  const cb=Q('[data-mg="city"]'),hd=Q('.roomhd.b73-night');
  if(cb&&hd){const note=Q('.city90n');const home=cb.classList.contains('home92');
    cb.innerHTML=home?cb.textContent.replace(/^[^\p{L}\p{N}]+/u,'').trim():_T('Walk the city square');cb.classList.add('walk96b');
    const box=document.createElement('div');box.className='walk96';box.appendChild(cb);if(note){note.classList.remove('rc-sub');box.appendChild(note)}
    hd.appendChild(box);hd.classList.add('has-walk96');
    if(window.innerWidth<=600){const sv=hd.querySelector(':scope > svg');if(sv)sv.setAttribute('preserveAspectRatio','xMidYMid slice')}
    for(const t of T.content.querySelectorAll('.road85t'))if(!t.children.length)t.remove()}
  /* 2 · one strip */
  const ml=Q('.mailline');let ask=null;
  if(ml){ask=[...ml.children].find(d=>/^🗣/.test((d.textContent||'').trim()));if(ask)ask.remove();if(!ml.children.length)ml.remove()}
  let strip=Q('.travelcard');
  if(strip){const main=strip.querySelector('.road85main');if(main){while(main.firstChild)strip.insertBefore(main.firstChild,main);main.remove()}
    const side=strip.querySelector('.road85side');if(side&&!side.children.length)side.remove();strip.classList.remove('road85');strip.classList.add('strip96')}
  else if(ask){strip=document.createElement('div');strip.className='card2 strip96';const at=Q('.roomhd');if(at&&at.parentNode)at.insertAdjacentElement('afterend',strip);else T.content.insertBefore(strip,T.content.firstChild)}
  if(strip&&ask){const s=document.createElement('span');s.className='ask96';s.innerHTML=ask.innerHTML;strip.appendChild(s)}
  return T.innerHTML}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
#mgrBody .roomhd.has-walk96{height:160px}
#mgrBody .has-walk96 .roomttl{bottom:56px}
#mgrBody .walk96{position:absolute;left:14px;bottom:10px;z-index:2;display:flex;align-items:center;gap:10px;max-width:58%}
#mgrBody .walk96 .btn.walk96b{margin:0;width:210px;min-height:0;height:38px;padding:0 14px;justify-content:center;align-items:center;text-align:center;background-size:cover;background-position:center 64%;border-color:#c9a458;color:#fff3d6;font:400 16px var(--display);letter-spacing:.05em;text-shadow:0 1px 3px #000,0 0 5px #000,0 0 2px #000;box-shadow:0 2px 8px rgba(0,0,0,.6)}
#mgrBody .walk96 .btn.walk96b:disabled{opacity:.6}
#mgrBody .walk96 .city90n{margin:0;font-size:11.5px;line-height:1.3;color:#f1e6c8;text-shadow:0 1px 3px #000,0 0 4px #000}
#mgrBody .travelcard.strip96,#mgrBody .card2.strip96{display:flex!important;flex-wrap:wrap;align-items:center;gap:4px 14px;width:auto;max-width:none;padding:6px 12px;margin-bottom:8px;font-size:13px;grid-template-columns:none}
#mgrBody .strip96>*{margin:0!important}
#mgrBody .strip96 .traveloffer{flex-basis:100%}
#mgrBody .strip96 .btn{padding:2px 10px}
#mgrBody .strip96 .sbye76row .btn{font-size:12px}
#mgrBody .strip96 .ask96{display:inline}
@media (max-width:600px){
#mgrBody .roomhd.has-walk96{height:126px}
#mgrBody .has-walk96 .roomttl{bottom:66px}
#mgrBody .walk96{flex-direction:column;align-items:flex-start;gap:2px;bottom:6px;max-width:60%}
#mgrBody .walk96 .btn.walk96b{width:164px;height:30px;font-size:14px}
#mgrBody .walk96 .city90n{font-size:10px;line-height:1.2}
#mgrBody .travelcard.strip96,#mgrBody .card2.strip96{font-size:12.5px}}`;document.head.appendChild(st)}
