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
#mainMenu .mmbtns .ss98.tray100{color:#f0cf7d!important;padding-right:34px!important;
  background:linear-gradient(180deg,rgba(255,200,170,.12),transparent 40%,rgba(0,0,0,.22)),linear-gradient(176deg,#6a1f1b 0%,#52161a 55%,#3f1013 100%)!important;
  text-shadow:0 1px 0 rgba(20,2,2,.9);
  box-shadow:inset 0 2px 0 rgba(255,214,150,.28),inset 0 -3px 0 rgba(20,2,2,.55),inset 0 0 0 1px #b98a2a,0 5px 0 #2b0a0c,0 6px 0 #1b0506,0 12px 20px rgba(0,0,0,.65)!important}
#mainMenu .mmbtns .ss98.tray100::before{border:1px solid rgba(240,207,125,.55);box-shadow:0 1px 0 rgba(20,2,2,.7),inset 0 1px 0 rgba(255,214,150,.18)}
#mainMenu .mmbtns .ss98.tray100::after{inset:auto;left:auto;top:50%;right:15px;width:8px;height:8px;border-radius:0;background:none;
  border-right:2.5px solid #f0cf7d;border-bottom:2.5px solid #f0cf7d;transform:translateY(-70%) rotate(45deg);transition:transform .18s}
#mainMenu .mmbtns .ss98.tray100[aria-expanded="true"]::after{transform:translateY(-30%) rotate(225deg)}
#mainMenu .mmbtns .ss98.tray100 svg{fill:#f0cf7d;filter:drop-shadow(0 1px 0 rgba(20,2,2,.9))}
#mainMenu .mmbtns .ss98.tray100 small{color:#e6c37a!important;text-shadow:0 1px 0 rgba(20,2,2,.8)}
#mainMenu .mmbtns .ss98.tray100:hover,#mainMenu .mmbtns .ss98.tray100:focus-visible,#mainMenu .mmbtns .ss98.tray100.on{
  box-shadow:inset 0 2px 0 rgba(255,214,150,.35),inset 0 -3px 0 rgba(20,2,2,.55),inset 0 0 0 1px #d9a93a,0 7px 0 #2b0a0c,0 8px 0 #1b0506,0 16px 26px rgba(0,0,0,.7),0 0 0 2px rgba(240,207,125,.55),0 0 22px rgba(190,60,40,.3)!important}
#mainMenu .mmbtns>.tray100p:not([hidden]){padding:7px 8px 3px;border-radius:6px;border:1px solid rgba(185,138,42,.6);
  background:linear-gradient(180deg,rgba(110,30,26,.5),rgba(60,14,16,.55));box-shadow:inset 0 0 18px rgba(20,2,2,.45),0 6px 14px rgba(0,0,0,.45)}
body.calm #mainMenu .mmbtns .ss98.tray100::after,#mainMenu .mmbtns .ss98.tray100.still100::after{transition:none}
@media (prefers-reduced-motion:reduce){#mainMenu .mmbtns .ss98.tray100::after{transition:none}}`;
document.head.appendChild(st)}
