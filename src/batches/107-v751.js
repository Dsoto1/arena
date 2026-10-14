/* =====================================================================
   107-V751 · v0.75 follow-up (Virgilante)
   =====================================================================
   • His weapon card backs (tools/art/cardbacks → assets/weapon_back1-4.webp): market slot 4 wears its level's back; opening the
     Arena Chest flips the Level 4 back over to the weapon inside (people only; CPUs and sims skip it).
   • Match Week banner: the week's host city is the big title, and each of the 12 arenas has its own banner — its colours and a
     landmark (CITY75: Roma's Colosseum, Pompeii's Vesuvius, Nemausus' aqueduct, Puteoli's lighthouse …). Byes keep the old banner.
   • The fighter panel's weapon chips wear his weapon-card icons (weaponChips replaced; same chips, same tips).
   • Settings: "Skip the main menu" is gone; the game always opens on the menu (anyone who had it on is switched off once).
   ===================================================================== */
/* ---------- card backs ---------- */
const WBACK75=lv=>assetURL('weapon_back'+lv+'b.webp'); /* v0.83: every level from his full-size scans (weapon_back1b-4b) */
{const base=boardHTML75;boardHTML75=function(){let h=base.apply(this,arguments);try{h=h.replace(/<span class="mb-back" data-lv="(\d)" title="([^"]*)"><b>FLAVIUS<br>RULE<\/b><small>(×\d+)<\/small><\/span>/g,
  (m,lv,t,n)=>`<span class="mb-back mb-back75" title="${t}" style="background-image:url('${WBACK75(lv)}')"><small>${n}</small></span>`)}catch(e){}return h}}
{const base=openChest;openChest=async function(player){try{if(player&&!player.cpu&&!HEADLESS&&!(S&&S.sim)&&S.chest&&S.chest.weapons.length){const key=S.chest.weapons[S.chest.weapons.length-1];
    if(W[key]&&typeof modal==='function')await askW(player,'chestShow',_T('🗝 The Arena Chest'),`<div class="chest75"><div class="chest75-card"><span class="chest75-face chest75-back" style="background-image:url('${WBACK75(4)}')"></span><span class="chest75-face chest75-front"><span class="cimg" style="${cardStyle('w:'+key)}"></span></span></div><p><b>${esc(W[key].n)}</b> · ${esc(wStats(mkW(key)))}</p></div>`,[{label:_T('Take it'),value:1,primary:1}])}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------- Match Week: the host city's banner ---------- */
const CITY75={
  Roma:{sky:['#4a2440','#d4955a'],g:'#6a4a34',land:'colosseum',st:'#d9c49c'},
  Verona:{sky:['#6f9cc4','#efdcc0'],g:'#5a6a44',land:'alps',st:'#d9a49a'},
  Arles:{sky:['#d99a3a','#f6e0b0'],g:'#7a6a3a',land:'towers',st:'#e0c27a'},
  Capua:{sky:['#a04e2e','#f1c48a'],g:'#5a4a2a',land:'vines',st:'#c9805a'},
  Thysdrus:{sky:['#e6a84a','#fbe7b8'],g:'#d9b06a',land:'desert',st:'#e6c48a'},
  Nemausus:{sky:['#86aac4','#efe0c0'],g:'#5a6a44',land:'aqueduct',st:'#e3d6b4'},
  Pompeii:{sky:['#6a1e14','#e0884a'],g:'#4a3424',land:'vesuvius',st:'#c9a07a'},
  Syracusae:{sky:['#2f6f90','#f0d8a8'],g:'#8a7a50',land:'theatre',st:'#e6d6b0'},
  'Leptis Magna':{sky:['#d8843e','#fadcae'],g:'#d9b47a',land:'arch',st:'#d8a46a'},
  Uthina:{sky:['#8aa05a','#f0e2b0'],g:'#6a7a3a',land:'olives',st:'#d4b47a'},
  Pola:{sky:['#3f6f9e','#dfe8ef'],g:'#5a6a6a',land:'harbour',st:'#e6e0d0'},
  Puteoli:{sky:['#5f8099','#e9d9b0'],g:'#6a6044',land:'lighthouse',st:'#d9c8a4'}};
function citySky75(k,C){return `<defs><linearGradient id="c75${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky[0]}"/><stop offset="1" stop-color="${C.sky[1]}"/></linearGradient></defs><rect x="-700" width="2000" height="120" fill="url(#c75${k})"/>`}
/* an amphitheatre seen side-on: tiers of arches */
function amph75(cx,base,w,tiers,st,dark='#3a2618'){const th=16;let s=`<rect x="${cx-w/2}" y="${base-th*tiers}" width="${w}" height="${th*tiers}" fill="${st}"/>`;
  for(let t=0;t<tiers;t++){const y=base-th*(t+1);const n=Math.floor(w/18);for(let i=0;i<n;i++){const x=cx-w/2+9+i*(w-18)/(n-1||1)-4;s+=`<path d="M${x} ${y+th}v-${th-6}a4 4 0 0 1 8 0v${th-6}z" fill="${dark}" opacity=".75"/>`}
    s+=`<rect x="${cx-w/2}" y="${y}" width="${w}" height="2" fill="${dark}" opacity=".35"/>`}return s}
const palm75=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0q-3-22 2-40" stroke="#5a3c22" stroke-width="4" fill="none"/>${[[-20,-34],[18,-36],[-14,-48],[14,-50],[0,-54]].map(([a,b])=>`<path d="M2-40q${a/2} ${(b+40)/2-6} ${a} ${b+40}" stroke="#3f6a2a" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
const olive75=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M0 0v-12" stroke="#5a4a2a" stroke-width="3"/><ellipse cx="0" cy="-18" rx="12" ry="9" fill="#6f7f3f"/></g>`;
const boat75=(x,y,c='#7a4a2a')=>`<g transform="translate(${x} ${y})"><path d="M-20 0h40l-8 8h-24z" fill="${c}"/><path d="M0 0v-26" stroke="#3a2618" stroke-width="2"/><path d="M1-24l14 18H1z" fill="#efe4c9"/></g>`;
function cityScene75(name){const C=CITY75[name];if(!C)return null;const k=name.replace(/\W/g,'');let s=citySky75(k,C);const g=C.g,st=C.st;
  const ground=`<rect x="-700" y="104" width="2000" height="16" fill="${g}"/>`;
  switch(C.land){
    case 'colosseum':s+=`<path d="M-700 104q120-34 240-6t240-10 240 4 240-8 240 6 240-10 240 0 240 8v32H-700z" fill="#5a3a2a" opacity=".55"/>${amph75(300,104,300,4,st,'#5a3a24')}<rect x="150" y="38" width="300" height="4" fill="#efe0c0" opacity=".6"/>${[60,540].map(x=>`<g transform="translate(${x} 104)"><path d="M0 0v-30" stroke="#4a3220" stroke-width="3"/><ellipse cx="0" cy="-36" rx="18" ry="8" fill="#2f4a2a"/></g>`).join('')}${ground}`;break;
    case 'alps':s+=`<path d="M-700 80l140-56 120 50 140-62 130 58 120-48 150 60 140-52 140 56 130-46 160 60 130-40v80H-700z" fill="#8aa0b4"/><path d="M-560 24l-13 10h26zM-300 12l-13 10h26zM-50 22l-13 10h26zM240 30l-13 10h26zM510 40l-13 10h26z" fill="#f4f6f8"/>${amph75(300,104,240,2,st,'#7a4a44')}${ground}`;break;
    case 'towers':s+=`<rect x="-700" y="96" width="2000" height="10" fill="#4f7f9a" opacity=".8"/>${amph75(300,104,260,2,st,'#6a4a1a')}${[190,410].map(x=>`<rect x="${x-14}" y="40" width="28" height="34" fill="${st}"/><rect x="${x-14}" y="40" width="28" height="4" fill="#6a4a1a" opacity=".5"/>${[0,1,2].map(i=>`<rect x="${x-14+i*11}" y="34" width="6" height="6" fill="${st}"/>`).join('')}`).join('')}${ground}`;break;
    case 'vines':s+=`<path d="M-700 100q160-40 320-12t320-18 320 10 320-14 320 8 320-6v52H-700z" fill="#6a7a3a"/>${Array.from({length:30},(_,i)=>`<path d="M${-650+i*66} 112l40-14" stroke="#3f5a22" stroke-width="3"/>`).join('')}${amph75(300,104,320,3,st,'#5a2a1a')}${ground}`;break;
    case 'desert':s+=`<path d="M-700 100q150-24 300-4t300-14 300 8 300-12 300 6 300-4v46H-700z" fill="#e8c890"/>${amph75(300,104,340,3,st,'#7a5020')}${palm75(70,104,.9)}${palm75(110,106,.7)}${palm75(520,104,.9)}${ground}`;break;
    case 'aqueduct':s+=`<rect x="-700" y="92" width="2000" height="12" fill="#4f7f9a" opacity=".85"/>${[0,1,2].map(t=>{const h=[24,16,10][t],y=[68,52,42][t],w=[40,28,16][t];return Array.from({length:Math.ceil(520/w)},(_,i)=>`<path d="M${-100+i*w} ${y+h}v-${h}h${w}v${h}h-${w*0.18}a${w*0.32} ${w*0.32} 0 0 0-${w*0.64} 0z" fill="${st}" stroke="#8a7a54" stroke-width=".6"/>`).join('')}).join('')}<g transform="translate(470 104)"><rect x="-34" y="-30" width="68" height="30" fill="${st}"/><path d="M-40-30h80l-40-16z" fill="${st}" stroke="#8a7a54"/>${[-26,-13,0,13,26].map(x=>`<rect x="${x-2}" y="-28" width="4" height="26" fill="#a8987a"/>`).join('')}</g>${ground}`;break;
    case 'vesuvius':s+=`<path d="M-700 104L40 104 200 30q30-10 60 0l160 74H1300z" fill="#3a2a22"/><path d="M200 30q30-10 60 0" stroke="#e0603a" stroke-width="3" fill="none"/>${[0,1,2,3].map(i=>`<circle cx="${230+i*14}" cy="${22-i*10}" r="${10+i*5}" fill="#6a5a54" opacity="${.65-i*.12}"/>`).join('')}${amph75(470,104,180,2,st,'#4a2a1a')}${ground}`;break;
    case 'theatre':s+=`<path d="M380 104L470 28l60 20 60-10v66z" fill="#7a8a90"/><path d="M462 34l8-6 10 6z" fill="#f4f6f8"/><rect x="-700" y="92" width="2000" height="14" fill="#2f6f90" opacity=".85"/><path d="M150 104q0-44 110-44t110 44z" fill="${st}"/>${[0,1,2,3,4].map(i=>`<path d="M${158+i*9} 104q0-${38-i*7} ${102-i*9}-${38-i*7}t${102-i*9} ${38-i*7}" stroke="#a89a74" stroke-width="2" fill="none"/>`).join('')}<rect x="236" y="84" width="48" height="20" fill="#c9b48a"/>${ground}`;break;
    case 'arch':s+=`<rect x="-700" y="90" width="2000" height="14" fill="#3aa0a8" opacity=".85"/>${boat75(520,90)}<g transform="translate(300 104)"><rect x="-70" y="-74" width="140" height="74" fill="${st}"/><path d="M-30 0v-36a30 30 0 0 1 60 0v36z" fill="#5a3418"/><rect x="-80" y="-84" width="160" height="12" fill="${st}" stroke="#8a5a2a"/>${[-58,46].map(x=>`<rect x="${x}" y="-66" width="12" height="60" fill="#c9905a"/>`).join('')}</g>${palm75(120,104)}${palm75(460,104,.8)}${ground}`;break;
    case 'olives':s+=`<path d="M-700 104q300-70 600-60t600 20 600 40v40H-700z" fill="#7a8a4a"/>${amph75(300,62,200,2,st,'#6a4a1a')}<path d="M180 62h240v42H180z" fill="#7a8a4a"/>${[40,90,140,460,510,560,200,400].map((x,i)=>olive75(x,104-(i%3)*6)).join('')}${ground}`;break;
    case 'harbour':s+=`<rect x="-700" y="88" width="2000" height="18" fill="#2f5f8e"/>${amph75(330,96,260,3,st,'#5a6a7a')}${[200,460].map(x=>`<rect x="${x-10}" y="38" width="20" height="58" fill="${st}"/>`).join('')}${boat75(70,92,'#5a3a2a')}${boat75(560,94,'#7a2a1a')}<rect x="-700" y="104" width="2000" height="16" fill="${g}"/>`;break;
    case 'lighthouse':s+=`<rect x="-700" y="86" width="2000" height="20" fill="#3f6f8e"/><g transform="translate(470 86)"><rect x="-18" y="-20" width="36" height="20" fill="${st}"/><rect x="-13" y="-46" width="26" height="26" fill="${st}"/><rect x="-9" y="-66" width="18" height="20" fill="${st}"/><circle cx="0" cy="-72" r="7" fill="#ffd36a"/><circle cx="0" cy="-72" r="16" fill="#ffd36a" opacity=".25"/></g>${boat75(140,90)}${boat75(260,92,'#5a3a2a')}${boat75(360,88,'#7a2a1a')}${[30,80,580].map((x,i)=>`<circle cx="${x}" cy="${92-i*4}" r="${8+i*3}" fill="#e8e0c0" opacity=".35"/>`).join('')}${ground}`;break}
  return `<svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet" style="overflow:hidden" aria-hidden="true">${s}</svg>`}
{const base=banner73;banner73=function(k){try{if(k==='night'){const w=W_();const L=w&&w.night&&LOCATIONS[w.night.loc];const sc=L&&cityScene75(L.n);
    if(sc)return `<div class="roomhd b73 b73-night b75city">${sc}<div class="roomttl">${_T`<b>${esc(L.n)}</b><span>⚔️ Match Week · week ${typeof wkOf==='function'?wkOf(w.week):w.week} of 12 · three days of games</span>`}</div>${bannerStat73(k)}</div>`}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------- Settings: no "Skip the main menu" ---------- */
try{if(SETTINGS.skipMenu){SETTINGS.skipMenu=false;applySettings()}}catch(e){}
{const base=settingsHTML;settingsHTML=function(){let h=base.apply(this,arguments);if(typeof h==='string')h=h.replace(/<label class="setrow"><input type="checkbox" data-set="skipMenu"[\s\S]*?<\/label>/,'');return h}}

(()=>{const st=document.createElement('style');st.textContent=`
.mb-back.mb-back75{background-size:cover;background-position:center;border:none;box-shadow:0 3px 8px rgba(0,0,0,.55);justify-content:flex-end;padding-bottom:4px}.mb-back75 small{background:rgba(0,0,0,.65);border-radius:6px;padding:0 5px}
.chest75{display:grid;justify-items:center;gap:8px;perspective:900px}.chest75-card{position:relative;width:170px;aspect-ratio:274/374;transform-style:preserve-3d;animation:chest75 1.1s .3s ease-in-out forwards}
.chest75-face{position:absolute;inset:0;border-radius:8px;backface-visibility:hidden;background-size:cover;box-shadow:0 8px 24px rgba(0,0,0,.6)}.chest75-front{transform:rotateY(180deg);background:#2a1f17;display:grid;place-items:center;overflow:hidden}.chest75-front .cimg{position:absolute;left:50%;top:50%;width:228px!important;aspect-ratio:600/416;transform:translate(-50%,-50%) rotate(-90deg);box-shadow:none}
@keyframes chest75{to{transform:rotateY(180deg)}}@media (prefers-reduced-motion:reduce){.chest75-card{animation-duration:.01s}}
.b75city .roomttl b{font-size:30px;letter-spacing:.06em;color:#fff3d6;text-shadow:0 2px 8px #000,0 0 2px #000}.b75city .roomttl span{color:#fff3d6;text-shadow:0 1px 4px #000}`;document.head.appendChild(st)})();

/* ---------- the fighter panel's weapon chips: his icons ---------- */
weaponChips=function(w){const I=(k,v,t)=>`<span class="wchip wchip75" title="${esc(t)}"><img src="${WICO75[k]}" alt="">${v}</span>`;
  if(!w)return I('dmg','1',_T('Power (fists)'))+I('rng','1',_T('Range'));if(w.lyre)return '<span class="wchip">🎵 lyre</span>';if(w.noAtk)return '<span class="wchip">✋ held</span>';const c=[];
  if(w.p)c.push(I('dmg',w.p,_T('Attack power')));if(w.r)c.push(I('rng',w.r,_T('Range')));if(w.ammo!=null)c.push(I('ammo',w.ammoLeft??w.ammo,_T('Ammo')));
  if(w.throw)c.push(I('thr',`${w.throw.p}·${w.throw.r}`,_T('Throw: power · range')));if(w.shield)c.push(I('abs',`${w.absorb}×${w.usesLeft??w.uses}`,_T('Shield: absorb × uses')));
  if(w.atkUses)c.push(I('use',w.atkLeft??w.atkUses,_T('Uses left')));if(w.both)c.push(I('both','',_T('Both attacks')));if(w.cfw)c.push(I('cf','+'+w.cfw,_T('Crowd favor per hit')));if(w.soul)c.push(I('soul','+'+w.soul,_T('Soul steal')));return c.join('')};
(()=>{const st=document.createElement('style');st.textContent=`.wchip.wchip75{display:inline-flex;align-items:center;gap:3px;padding-left:2px}.wchip75 img{width:18px;height:18px;display:block}`;document.head.appendChild(st)})();
