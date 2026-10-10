/* ludus_scenes.js: MOCK-UP (v1.0 D5b) of RICHER room scenes for the Your ludus tiles AND the room banners (same picture = tile and room match).
   Same subjects as the game's flat banners (roomScene73 / roomScene / armoryScene96), painted in SVG: depth, one light from the UPPER LEFT,
   soft cast shadows to the lower right, stone/plaster grain (feTurbulence), vignette. Each scene is drawn wide (x −400…1000, y 0…240) so:
     SCENE99(k,'tile')   → viewBox 0 0 600 240, slice (a 2:1 … 16:9 tile)
     SCENE99(k,'banner') → viewBox −300 50 1200 150, slice (a wide room banner)
   Scenes: team (the barracks wall: helmets on pegs, shields, bench) · promote (forum wall with painted programmata + a crier) ·
   school (the ludus buildings with scaffolding + a treadwheel crane over the yard) · armory (forge: anvil, brazier, racks) ·
   council (the advisors' hall: drapes, columns, long table, candles). */
(function(){
let N=0;
const lin=(id,stops,x2=0,y2=1,x1=0,y1=0)=>`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</linearGradient>`;
const rad=(id,stops,cx=.5,cy=.5,r=.5)=>`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</radialGradient>`;
/* shared: grain, upper-left light, vignette */
function common(p,tone){return {defs:`<filter id="${p}gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 ${tone[0]} 0 0 0 0 ${tone[1]} 0 0 0 0 ${tone[2]} 0 0 0 .22 0"/></filter>
 <filter id="${p}st" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .35 0"/></filter>
 <filter id="${p}bl"><feGaussianBlur stdDeviation="3"/></filter><filter id="${p}bl8"><feGaussianBlur stdDeviation="9"/></filter>
 ${rad(p+'lt',[[0,'#fff3d6',.42],[.5,'#fff3d6',.08],[1,'#fff3d6',0]],.08,0,.9)}${rad(p+'vg',[[.55,'#000',0],[1,'#000',.55]],.5,.5,.75)}`,
 top:`<rect x="-400" y="0" width="1400" height="240" filter="url(#${p}gr)"/><rect x="-400" y="0" width="1400" height="240" fill="url(#${p}lt)"/><rect x="-400" y="0" width="1400" height="240" fill="url(#${p}vg)"/>`}}

function team(p){const c=common(p,[.6,.45,.3]);let s='';
 /* stone wall: blocks with varied tone, mortar, texture */
 for(let r=0;r<8;r++)for(let i=-6;i<14;i++){const x=i*80+(r%2?40:0),y=r*30,t=(i*7+r*13)%5;s+=`<rect x="${x+1}" y="${y+1}" width="78" height="28" rx="3" fill="${['#6e5640','#654e39','#755c44','#5f4934','#6a523c'][t]}"/>`}
 s+=`<rect x="-400" y="0" width="1400" height="240" filter="url(#${p}st)"/>`;
 /* window light shaft from the upper left */
 s+=`<path d="M-120 0H40L330 240H60z" fill="url(#${p}sh)"/>`;
 /* peg beam */
 s+=`<rect x="-400" y="118" width="1400" height="14" fill="url(#${p}wd)"/><rect x="-400" y="132" width="1400" height="6" fill="#000" opacity=".35" filter="url(#${p}bl)"/>`;
 const hel=(x,k)=>{const metal=k%3===1?`url(#${p}br)`:`url(#${p}stl)`;const crest=k%2===0;return `<ellipse cx="${x+10}" cy="124" rx="34" ry="8" fill="#000" opacity=".35" filter="url(#${p}bl)"/>
  <rect x="${x-3}" y="112" width="6" height="12" fill="#3a2a1a"/>
  ${crest?`<path d="M${x-26} ${62}q26-26 52 0q-6-8-26-10q-20 2-26 10z" fill="url(#${p}cr)"/><path d="M${x-24} 60q24-30 48 0" stroke="#4a0e08" stroke-width="1" fill="none" opacity=".6"/>`:''}
  <path d="M${x-28} 112q-4-48 28-50q32 2 28 50q-6 4-14 4v-18h-28v18q-8 0-14-4z" fill="${metal}" stroke="#2a1d12" stroke-width="1.2"/>
  <path d="M${x-14} 98h28" stroke="#1a120c" stroke-width="5"/><path d="M${x-14} 92h28" stroke="#1a120c" stroke-width="2" opacity=".7"/>
  <path d="M${x-36} 110q36 10 72 0" stroke="${metal}" stroke-width="6" fill="none"/>
  <ellipse cx="${x-12}" cy="74" rx="7" ry="11" fill="#fff" opacity=".45" transform="rotate(-25 ${x-12} 74)"/>`};
 for(let i=-4;i<12;i++)s+=hel(i*100+60,i+8);
 /* shields leaning below */
 const sh=(x,k)=>`<ellipse cx="${x+30}" cy="226" rx="44" ry="7" fill="#000" opacity=".4" filter="url(#${p}bl)"/>
  <g transform="rotate(${k%2?-6:5} ${x} 226)"><rect x="${x-32}" y="150" width="64" height="78" rx="10" fill="url(#${k%2?p+'rd':p+'bl2'})" stroke="#2a1608" stroke-width="2"/>
  <rect x="${x-32}" y="150" width="64" height="78" rx="10" fill="url(#${p}shs)"/><circle cx="${x}" cy="189" r="10" fill="url(#${p}br)" stroke="#5a3a10"/>
  <path d="M${x} 156v22M${x} 200v22" stroke="#e2b04e" stroke-width="3" opacity=".8"/></g>`;
 for(let i=-3;i<9;i++)s+=sh(i*150+20,i+5);
 s+=`<rect x="-400" y="222" width="1400" height="18" fill="url(#${p}fl)"/>`;
 /* dust motes in the shaft */
 for(let i=0;i<26;i++)s+=`<circle cx="${(i*53)%260+20+i*4}" cy="${(i*37)%220+10}" r="${1+(i%3)*.6}" fill="#fff4d0" opacity="${.25+(i%4)*.12}"/>`;
 return {defs:c.defs+lin(p+'sh',[[0,'#fff1c4',.28],[1,'#fff1c4',0]],.6,1)+lin(p+'wd',[[0,'#9a6a3a'],[.5,'#6e4622'],[1,'#3e260f']])+lin(p+'stl',[[0,'#f4f7f8'],[.45,'#aab3ba'],[1,'#4f575e']],1,1)+lin(p+'br',[[0,'#ffe9a8'],[.4,'#d6a24a'],[1,'#6e4614']],1,1)
  +lin(p+'cr',[[0,'#e2493a'],[1,'#6e140c']])+lin(p+'rd',[[0,'#c0433a'],[1,'#5e1a12']],1,1)+lin(p+'bl2',[[0,'#4f7fc4'],[1,'#1e3358']],1,1)+lin(p+'shs',[[0,'#fff',.25],[.4,'#fff',0],[1,'#000',.35]],1,0)+lin(p+'fl',[[0,'#3a2a1a'],[1,'#1a120c']]),body:s+c.top}}

function promote(p){const c=common(p,[.55,.45,.35]);let s='';
 s+=`<rect x="-400" y="0" width="1400" height="240" fill="url(#${p}sky)"/>`;
 /* far roofs */
 for(let i=-5;i<14;i++){const x=i*80,h=30+(i*17)%30;s+=`<rect x="${x}" y="${70-h}" width="70" height="${h+20}" fill="#c99a76" opacity=".55"/><path d="M${x-4} ${70-h}l39-14 39 14z" fill="#a2553a" opacity=".6"/>`}
 /* wall with eaves */
 s+=`<rect x="-400" y="62" width="1400" height="150" fill="url(#${p}pl)"/><rect x="-400" y="62" width="1400" height="150" filter="url(#${p}st)" opacity=".7"/>
  <rect x="-400" y="52" width="1400" height="12" fill="#8a4a2e"/><rect x="-400" y="64" width="1400" height="10" fill="#000" opacity=".25" filter="url(#${p}bl)"/>`;
 /* painted programmata */
 const prog=(x,a,b,rot)=>`<g transform="rotate(${rot} ${x} 130)"><rect x="${x-100}" y="86" width="200" height="88" fill="#f2e8d0" opacity=".55"/>
  <text x="${x}" y="118" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="26" fill="#a3281f" opacity=".9" letter-spacing="2">${a}</text>
  <text x="${x}" y="146" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="15" fill="#2a1a10" opacity=".8" letter-spacing="1">${b}</text>
  <path d="M${x-70} 158h140" stroke="#a3281f" stroke-width="2" opacity=".6"/></g>`;
 s+=prog(-150,'MVNERA','CAPVAE · VI · DIES',-1)+prog(150,'L · CRISPINVS','GLADIATORES · XX',1.5)+prog(430,'VENATIO','IN · AMPHITHEATRO',-1.2)+prog(720,'AVE · FLAVI','FELICITER',1);
 /* hanging banner */
 s+=`<path d="M30 74h44v96l-22-12-22 12z" fill="url(#${p}ban)" stroke="#e2b04e" stroke-width="2"/><path d="M52 100l6 10h-12z" fill="#e2b04e"/><path d="M74 74v96l-22-12" fill="#000" opacity=".25"/>`;
 /* the crier on a step, horn raised */
 s+=`<rect x="290" y="200" width="150" height="16" fill="url(#${p}stn)"/><ellipse cx="380" cy="214" rx="60" ry="5" fill="#000" opacity=".35" filter="url(#${p}bl)"/>
  <g transform="translate(355 200)"><path d="M-16 0l4-62q12-10 24 0l4 62z" fill="url(#${p}tg)"/><path d="M-12-60q-6 20 4 60" stroke="#a89878" stroke-width="2" fill="none" opacity=".6"/>
  <circle cx="0" cy="-74" r="11" fill="url(#${p}sk)"/><path d="M-11-78q11-10 22 0" stroke="#3a2414" stroke-width="5" fill="none"/>
  <path d="M8-56l20-24" stroke="url(#${p}sk)" stroke-width="7" stroke-linecap="round"/>
  <path d="M10-80l70-30l6 14l-68 22z" fill="url(#${p}hn)"/><path d="M80-110q14-6 14 6t-8 8" fill="url(#${p}hn)" stroke="#6e4614"/></g>`;
 /* crowd heads with rim light from the upper left */
 for(let i=-6;i<20;i++){const x=i*48+(i%2)*14,y=226+(i%3)*4;s+=`<ellipse cx="${x}" cy="${y+20}" rx="20" ry="22" fill="#2a1a10"/><circle cx="${x}" cy="${y-6}" r="11" fill="#3a2414"/><path d="M${x-10} ${y-10}q3-8 10-8" stroke="#f0c890" stroke-width="2" fill="none" opacity=".6"/>`}
 return {defs:c.defs+lin(p+'sky',[[0,'#7aa0c4'],[.6,'#e8c08a'],[1,'#d9a070']])+lin(p+'pl',[[0,'#eadcbc'],[.7,'#d8c39a'],[1,'#b89e74']],1,1)+lin(p+'ban',[[0,'#c0433a'],[1,'#6e140c']],1,0)
  +lin(p+'stn',[[0,'#d9cdb4'],[1,'#8a7a62']])+lin(p+'tg',[[0,'#f6f0e2'],[1,'#a89878']],1,0)+lin(p+'sk',[[0,'#e0b48c'],[1,'#8a5a3a']],1,1)+lin(p+'hn',[[0,'#ffe39a'],[.5,'#c9902e'],[1,'#6e4614']],0,1),body:s+c.top}}

function school(p){const c=common(p,[.6,.5,.35]);let s='';
 s+=`<rect x="-400" y="0" width="1400" height="240" fill="url(#${p}sky)"/>`;
 s+=`<path d="M-400 120q200-50 400-20t400-10 600 20V240H-400z" fill="#8aa07a" opacity=".55"/><path d="M-400 130q300-30 600-6t800 0V240H-400z" fill="#6f8a5e" opacity=".6"/>`;
 /* building: colonnade, terracotta roof */
 const bld=(x,w,h,cols)=>{let b=`<rect x="${x+8}" y="${190-h+10}" width="${w}" height="${h}" fill="#000" opacity=".3" filter="url(#${p}bl8)"/>
  <rect x="${x}" y="${190-h}" width="${w}" height="${h}" fill="url(#${p}wl)"/><rect x="${x}" y="${190-h}" width="${w}" height="${h}" filter="url(#${p}st)" opacity=".5"/>
  <path d="M${x-14} ${190-h}L${x+w/2} ${190-h-38}L${x+w+14} ${190-h}z" fill="url(#${p}rf)"/>`;
  for(let i=0;i<14;i++)b+=`<path d="M${x-10+i*(w+20)/14} ${190-h}l${(w/2-(i*(w+20)/14)+10)*.18} -8" stroke="#6e2a14" stroke-width="1" opacity=".5"/>`;
  b+=`<path d="M${x-14} ${190-h}h${w+28}" stroke="#6e2a14" stroke-width="3"/>`;
  for(let i=0;i<cols;i++){const cx=x+14+i*(w-28)/(cols-1);b+=`<rect x="${cx-6}" y="${190-h+8}" width="12" height="${h-12}" fill="url(#${p}col)"/><rect x="${cx-9}" y="${190-h+6}" width="18" height="4" fill="#f4ecd8"/>${i<cols-1?`<rect x="${cx+8}" y="${190-h+24}" width="${(w-28)/(cols-1)-16}" height="${h-30}" fill="#3a2414" opacity=".55"/>`:''}`}
  return b};
 s+=bld(-330,260,80,7)+bld(-40,300,96,8)+bld(300,200,70,6)+bld(560,320,90,8);
 /* scaffolding + treadwheel crane: the "upgrade" */
 s+=`<g stroke="#6e4622" stroke-width="4">${[262,290,318,346].map(x=>`<path d="M${x} 190V84"/>`).join('')}<path d="M256 112h96M256 140h96M256 168h96" stroke-width="5"/><path d="M262 84l84 84M346 84l-84 84" stroke-width="2" opacity=".6"/></g>
  <path d="M410 190L470 30" stroke="url(#${p}wd)" stroke-width="7"/><path d="M470 30L380 70" stroke="#6e4622" stroke-width="4"/><path d="M380 70v54" stroke="#3a2414" stroke-width="1.5"/>
  <rect x="368" y="124" width="24" height="18" fill="url(#${p}stn)" stroke="#5a4a34"/><circle cx="452" cy="170" r="22" fill="none" stroke="url(#${p}wd)" stroke-width="5"/>${[0,45,90,135].map(a=>`<path d="M452 170l${22*Math.cos(a/57.3)} ${22*Math.sin(a/57.3)}M452 170l${-22*Math.cos(a/57.3)} ${-22*Math.sin(a/57.3)}" stroke="#6e4622" stroke-width="2"/>`).join('')}`;
 /* sand yard, posts with shadows to the lower right */
 s+=`<rect x="-400" y="186" width="1400" height="54" fill="url(#${p}snd)"/><rect x="-400" y="186" width="1400" height="54" filter="url(#${p}gr)"/>`;
 for(let i=-4;i<12;i++){const x=i*110+30;s+=`<path d="M${x+6} 222l40 12h-30z" fill="#000" opacity=".25" filter="url(#${p}bl)"/><rect x="${x}" y="186" width="12" height="38" fill="url(#${p}wd)"/>`}
 return {defs:c.defs+lin(p+'sky',[[0,'#7aa8cc'],[.7,'#f0d6a8'],[1,'#f2c890']])+lin(p+'wl',[[0,'#f2e6cc'],[1,'#b8a07a']],1,0)+lin(p+'rf',[[0,'#d0663a'],[1,'#7a2a14']],1,1)
  +lin(p+'col',[[0,'#fffaf0'],[.5,'#e4d6b8'],[1,'#a8946e']],1,0)+lin(p+'wd',[[0,'#a87a46'],[1,'#5a3818']],1,0)+lin(p+'stn',[[0,'#e8dcc0'],[1,'#9a8a6e']])+lin(p+'snd',[[0,'#e6c88e'],[1,'#b8945a']]),body:s+c.top}}

function armory(p){const c=common(p,[.5,.35,.2]);let s='';
 for(let r=0;r<8;r++)for(let i=-6;i<14;i++){const x=i*80+(r%2?40:0),y=r*30,t=(i*5+r*11)%4;s+=`<rect x="${x+1}" y="${y+1}" width="78" height="28" rx="3" fill="${['#3a2a1c','#33251a','#40301f','#2e2116'][t]}"/>`}
 s+=`<rect x="-400" y="0" width="1400" height="240" filter="url(#${p}st)"/>`;
 /* high window, upper left */
 s+=`<rect x="20" y="14" width="60" height="40" fill="#e8d6a8" opacity=".6"/><path d="M20 54h60l220 186H120z" fill="url(#${p}sh)"/>`;
 /* rack: swords + spears */
 s+=`<rect x="-400" y="66" width="1400" height="8" fill="url(#${p}wd)"/>`;
 for(let i=-8;i<24;i++){const x=i*44+10;s+=i%3===2?`<path d="M${x} 20v150" stroke="url(#${p}wd)" stroke-width="4"/><path d="M${x-5} 22l5-18 5 18z" fill="url(#${p}stl)"/>`:`<path d="M${x} 70v80" stroke="url(#${p}stl)" stroke-width="5"/><path d="M${x-9} 70h18" stroke="#c9902e" stroke-width="4"/><path d="M${x} 50v20" stroke="#4a2a14" stroke-width="5"/>`}
 /* hung round shields */
 for(let i=-3;i<9;i++){const x=i*170+100;s+=`<ellipse cx="${x+8}" cy="120" rx="32" ry="32" fill="#000" opacity=".35" filter="url(#${p}bl)"/><circle cx="${x}" cy="112" r="30" fill="url(#${p}br)" stroke="#4a2a0a" stroke-width="2"/><circle cx="${x}" cy="112" r="20" fill="none" stroke="#6e4614" stroke-width="2" opacity=".6"/><circle cx="${x}" cy="112" r="7" fill="url(#${p}stl)"/><ellipse cx="${x-10}" cy="100" rx="8" ry="5" fill="#fff" opacity=".35"/>`}
 /* armor stand (lorica) */
 s+=`<g transform="translate(140 150)"><path d="M-4 0v74" stroke="#4a2a14" stroke-width="5"/><path d="M-30 -10q30-14 60 0l-4 46q-26 8-52 0z" fill="url(#${p}stl)" stroke="#2a1d12"/>${[4,14,24].map(y=>`<path d="M-30 ${y}q30 8 58 0" stroke="#3a3a3a" stroke-width="1.5" fill="none"/>`).join('')}<ellipse cx="-14" cy="0" rx="7" ry="12" fill="#fff" opacity=".35"/></g>`;
 /* anvil, lit by window (upper left) and fire (right) */
 s+=`<ellipse cx="300" cy="226" rx="90" ry="10" fill="#000" opacity=".5" filter="url(#${p}bl)"/>
  <path d="M232 168h120q10 0 28-10q-6 18-30 22h-20l-6 14h12v22h-90v-22h12l-6-14h-18q-14 0-12-12z" fill="url(#${p}anv)" stroke="#111" stroke-width="1.2"/>
  <path d="M232 168h120q10 0 28-10" stroke="#e8f0f4" stroke-width="2" fill="none" opacity=".7"/><path d="M350 170q20-4 30-12" stroke="#ff9a3a" stroke-width="3" fill="none" opacity=".8"/>
  <path d="M250 160l46-30" stroke="url(#${p}wd)" stroke-width="5"/><rect x="286" y="118" width="26" height="14" rx="2" fill="url(#${p}stl)" transform="rotate(-33 299 125)"/>`;
 /* brazier + glow */
 s+=`<circle cx="470" cy="150" r="170" fill="url(#${p}glow)"/><path d="M440 236l14-52h32l14 52" stroke="#2a1a0e" stroke-width="5" fill="none"/><path d="M432 180q38 18 76 0l-6 12q-32 12-64 0z" fill="url(#${p}br)"/>
  <path d="M440 180q8-40 20-30q2-26 14-34q4 26 14 20q10 20 12 44z" fill="url(#${p}fire)"/><path d="M456 180q6-22 14-18q4-16 10-12q2 16 8 30z" fill="#fff2a0" opacity=".8"/>`;
 for(let i=0;i<10;i++)s+=`<circle cx="${450+(i*13)%50}" cy="${120-(i*17)%70}" r="1.6" fill="#ffd07a" opacity="${.4+(i%3)*.2}"/>`;
 s+=`<rect x="-400" y="222" width="1400" height="18" fill="#140c06" opacity=".8"/>`;
 return {defs:c.defs+lin(p+'sh',[[0,'#ffeec0',.22],[1,'#ffeec0',0]],.6,1)+lin(p+'wd',[[0,'#8a5a2a'],[1,'#3e260f']],1,0)+lin(p+'stl',[[0,'#eef3f5'],[.5,'#9aa3ab'],[1,'#3e454c']],1,1)
  +lin(p+'br',[[0,'#ffe39a'],[.45,'#c98a2e'],[1,'#5a3410']],1,1)+lin(p+'anv',[[0,'#7c868e'],[.5,'#3c4248'],[1,'#1a1d20']],0,1)+rad(p+'glow',[[0,'#ff9a3a',.55],[.4,'#ff7a1a',.18],[1,'#ff7a1a',0]])
  +lin(p+'fire',[[0,'#ffe27a'],[.5,'#ff8a2a'],[1,'#c0301a']],0,0,0,1),body:s+c.top}}

function council(p){const c=common(p,[.55,.35,.3]);let s='';
 s+=`<rect x="-400" y="0" width="1400" height="240" fill="#2a1410"/>`;
 /* drapes with folds */
 for(let i=-10;i<26;i++){const x=i*40;s+=`<rect x="${x}" y="0" width="40" height="170" fill="url(#${p}dr)"/>`}
 s+=`<path d="M-400 0h1400v26q-50 18-100 0t-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0-100 0z" fill="#5a120c"/><path d="M-400 26q50 18 100 0" stroke="#e2b04e" stroke-width="0"/>`;
 for(let i=-4;i<10;i++)s+=`<path d="M${i*100} 26q50 18 100 0" stroke="#d6ab4c" stroke-width="2.5" fill="none"/>`;
 /* columns */
 for(const x of [-260,-60,520,720]){s+=`<rect x="${x+8}" y="20" width="44" height="200" fill="#000" opacity=".35" filter="url(#${p}bl8)"/><rect x="${x}" y="20" width="44" height="200" fill="url(#${p}col)"/>${[8,16,24,32].map(d=>`<path d="M${x+d+2} 30v184" stroke="#8a7a62" stroke-width="1" opacity=".5"/>`).join('')}<rect x="${x-8}" y="14" width="60" height="10" fill="#efe6d2"/><rect x="${x-8}" y="214" width="60" height="10" fill="#cfc2a6"/>`}
 /* mosaic floor */
 s+=`<rect x="-400" y="170" width="1400" height="70" fill="url(#${p}fl)"/>`;
 for(let i=-20;i<50;i++)s+=`<path d="M${i*30} 240L${300+(i*30-300)*.55} 170" stroke="#2a1a10" stroke-width="1" opacity=".35"/>`;
 /* long table with cloth, scrolls, candles */
 s+=`<ellipse cx="300" cy="216" rx="230" ry="14" fill="#000" opacity=".55" filter="url(#${p}bl)"/>
  <path d="M90 168h420l30 34H60z" fill="url(#${p}tb)"/><path d="M60 202h480v10H60z" fill="#3a1a0e"/><path d="M150 168h300l14 34H136z" fill="url(#${p}cl)"/>
  <path d="M220 182l40-4 4 8-40 4z" fill="#efe3cc"/><path d="M330 184h44" stroke="#efe3cc" stroke-width="6" stroke-linecap="round"/><circle cx="300" cy="184" r="9" fill="url(#${p}br)"/>`;
 for(const x of [130,230,370,470]){s+=`<circle cx="${x}" cy="140" r="46" fill="url(#${p}glow)"/><rect x="${x-3}" y="146" width="6" height="22" fill="#efe3cc"/><rect x="${x-7}" y="166" width="14" height="4" fill="url(#${p}br)"/><path d="M${x} 146q-5-8 0-16q5 8 0 16z" fill="#ffd36a"/>`}
 return {defs:c.defs+lin(p+'dr',[[0,'#7a1a12'],[.5,'#a3281f'],[1,'#4a0e08']],1,0)+lin(p+'col',[[0,'#fffaf0'],[.45,'#e4d6b8'],[1,'#8e7c5c']],1,0)+lin(p+'fl',[[0,'#6a4a30'],[1,'#3a2414']])
  +lin(p+'tb',[[0,'#8a5a2a'],[1,'#4a2a12']])+lin(p+'cl',[[0,'#e9dcbf'],[1,'#b8a47e']])+lin(p+'br',[[0,'#ffe39a'],[1,'#8a5a1a']],1,1)+rad(p+'glow',[[0,'#ffcf6a',.45],[1,'#ffcf6a',0]]),body:s+c.top}}

const SC={team,promote,school,armory,council};
window.SCENE99=function(k,mode){const p='s'+(N++)+k[0];const r=SC[k](p);
 const vb=mode==='banner'?'-300 40 1200 160':'0 0 600 240';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${r.defs}</defs>${r.body}</svg>`};
})();
