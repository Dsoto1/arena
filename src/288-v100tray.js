/* v1.0 (owner 2026-10-11): main-menu TRAY buttons (Multiplayer -> #mmMulti, Tutorials -> #mmLearn) wear a maroon slab with gold
   lettering, a gold chevron that turns when the tray is open, and the open tray sits in a maroon-tinted panel. Display only.
   Normal buttons keep the sandstone look. aria-expanded kept in step with the tray. No chevron animation under calm / Reduce motion / anim off. */
{const TR=[['[data-mm="multi"]','mmMulti'],['[data-mm82="tut"]','mmLearn']];
function tray100(){try{const box=document.querySelector('#mainMenu .mmbtns');if(!box)return;
  const still=typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off';
  for(const [sel,id] of TR){const b=box.querySelector(sel),t=document.getElementById(id);if(!b||!t)continue;
    b.classList.add('tray100');t.classList.add('tray100p');b.classList.toggle('still100',still);
    const open=id==='mmMulti'?!t.hidden:t.classList.contains('on');
    if(b.getAttribute('aria-expanded')!==String(open))b.setAttribute('aria-expanded',String(open));
    if(!b.getAttribute('aria-controls'))b.setAttribute('aria-controls',id)}}catch(e){}}
let q=0;function soon(){if(q)return;q=setTimeout(()=>{q=0;tray100()},0)}
{const box=document.querySelector('#mainMenu .mmbtns');
  if(box)new MutationObserver(soon).observe(box,{subtree:true,attributes:true,attributeFilter:['class','hidden'],childList:true})}
document.addEventListener('click',soon,true);
tray100();setTimeout(tray100,300);setTimeout(tray100,900);
const st=document.createElement('style');st.textContent=`
#mainMenu .mmbtns .ss98.tray100{padding-right:34px!important}
#mainMenu .mmbtns>.tray100p .ss98{isolation:isolate;color:#f0cf7d!important;text-shadow:0 1px 0 rgba(20,2,2,.85),0 -1px 0 rgba(255,236,190,.25)!important}
#mainMenu .mmbtns>.tray100p .ss98::after{z-index:-1}
#mainMenu .mmbtns>.tray100p .ss98::before{z-index:-1;inset:7px;border:0;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,180,150,.25),0 1px 0 rgba(255,238,204,.55)}
#mainMenu .mmbtns>.tray100p .ss98 .mm98t{background:linear-gradient(180deg,#fff2be 0%,#f0cf7d 30%,#b98a2a 62%,#e7c46c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85)) drop-shadow(0 -1px 0 rgba(255,236,190,.35));padding:2px 0}
#mainMenu .mmbtns .ss98.tray100::after{inset:auto;left:auto;top:50%;right:17px;z-index:2;width:8px;height:8px;border-radius:0;background:none;
  border-right:2.5px solid #4a3017;border-bottom:2.5px solid #4a3017;transform:translateY(-70%) rotate(45deg);transition:transform .18s}
#mainMenu .mmbtns .ss98.tray100[aria-expanded="true"]::after{transform:translateY(-30%) rotate(225deg)}
#mainMenu .mmbtns>.tray100p .ss98 svg{fill:#f0cf7d;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85))}
#mainMenu .mmbtns>.tray100p .ss98 small{color:#e6c37a!important;text-shadow:0 1px 0 rgba(20,2,2,.8)}
#mainMenu .mmbtns>.tray100p:not([hidden]){padding:7px 8px 3px;border-radius:6px;border:1px solid rgba(185,138,42,.6);
  background:linear-gradient(180deg,rgba(143,42,30,.45),rgba(90,22,15,.55));box-shadow:inset 0 0 18px rgba(20,2,2,.45),0 6px 14px rgba(0,0,0,.45)}
body.calm #mainMenu .mmbtns .ss98.tray100::after,#mainMenu .mmbtns .ss98.tray100.still100::after{transition:none}
@media (prefers-reduced-motion:reduce){#mainMenu .mmbtns .ss98.tray100::after{transition:none}}
@media (max-width:520px){#mainMenu .mmbtns>#mmLearn.tray100p:not([hidden]){flex-direction:column;gap:8px;height:auto}#mainMenu .mmbtns>#mmLearn>button{flex:0 0 auto;width:100%;white-space:nowrap}}`;
document.head.appendChild(st)}
