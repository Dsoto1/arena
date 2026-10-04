/* =====================================================================
   49-STUDIO47 · BEAST FACES, COHORTS, CUSTOM MARKERS, ROSTER FEEDBACK, SAVE CHECKS (v0.47)
   =====================================================================
   • The Beast designer works like the character creator now: every beast has a FACE (species, hide and
     markings, eyes, horns or antlers, mane, fangs, gear, scars, a backdrop — banners too). The face sits on
     top of the page like a portrait; the ROUND TOKEN below wears it inside the bronze ring (sculpt over it
     if you like), and the board FIGURE takes its colours. The old token letter is gone.
   • The Calydonian Boar joins the myth starters (with its printed round token), and every myth starter
     now has a face.
   • 🤝 Pairings are now COHORTS and live under Fighters. Their members come from Your Play Now Gladiators
     (the active roster) and from the beasts. More system cohorts.
   • Every picker marks custom content with ✦ … · custom.
   • Roster sets say which one is loaded (Play Now, and each career's own).
   • The Event Designer (and the other designers) refuse to save until the basics are in place.
   ===================================================================== */
const BF_SPECIES=[['feline',_T('Great cat — lion, tiger, leopard')],['canine',_T('Hound — wolf, hyena, Cerberus')],['ursine',_T('Bear')],['boar',_T('Boar')],['bovine',_T('Bull — aurochs, Minotaur')],['cervine',_T('Stag or hind')],['serpent',_T('Serpent — hydra, python')],['avian',_T('Bird — eagle, griffin, harpy')],['reptile',_T('Crocodile')],['arachnid',_T('Spider or scorpion')],['giant',_T('Giant — cyclops, bronze man')]];
const BF_HORNS=[['',_T('None')],['bull',_T('Bull horns')],['ram',_T('Ram horns')],['antlers',_T('Antlers')],['spikes',_T('Spikes')]];
const BF_PATTERN=[['',_T('Plain')],['stripes',_T('Stripes')],['spots',_T('Spots')],['scales',_T('Scales')]];
const BF_GEAR=[['',_T('Nothing')],['collar',_T('Spiked collar')],['crown',_T('Laurel crown')],['helm',_T('War helm')],['chains',_T('Broken chains')],['ring',_T('Nose ring')]];
const BF_KIND={lion:'feline',liger:'feline',tiger:'feline',leopard:'feline',panther:'feline',wolf:'canine',hyena:'canine',bear:'ursine',boar:'boar',aurochs:'bovine',stag:'cervine',viper:'serpent',eagle:'avian',ostrich:'avian',crocodile:'reptile',scorpion:'arachnid'};
const BF_TYPE={snake:'serpent',wolf:'canine',bear:'ursine',lion:'feline',tholo:'giant',commodus:'giant',zora:'avian',boar:'boar',croc:'reptile',crocodile:'reptile'};
function faceBlank(n){const k=n&&typeof kindKeyOf==='function'?kindKeyOf(n):null;const sp=BF_KIND[k]||'feline';return {species:sp,c1:(n&&n.color)||'#b8782e',c2:'#e8d4a0',eyes:'#f0cf7d',eyeT:sp==='arachnid'?'many':'two',horns:sp==='bovine'?'bull':sp==='cervine'?'antlers':'',mane:k==='lion',fangs:sp!=='cervine'&&sp!=='avian',pattern:'',gear:'',scar:false,bg:'#2a1f17'}}
function bfShade(c,f){try{return shade(c,f)}catch(e){return c}}
/* a beast's face, 100 × 100 — its own portrait */
function beastFaceSVG(F,opt={}){F={...faceBlank(),...(F||{})};const c1=F.c1,c2=F.c2,dk=bfShade(c1,-0.35),lt=bfShade(c1,0.2),ey=F.eyes;const P=[];
  const bgk=String(F.bg||'').startsWith('flag:')&&typeof flagURIk==='function'?flagURIk(String(F.bg).slice(5)):null;
  if(!opt.nobg)P.push(`<rect width="100" height="100" fill="${bgk?'#1a120c':F.bg||'#2a1f17'}"/>${bgk?`<image href="${bgk}" x="-60" y="0" width="220" height="100" preserveAspectRatio="xMidYMid slice" opacity=".8"/><rect width="100" height="100" fill="rgba(10,6,4,.2)"/>`:''}<circle cx="50" cy="52" r="46" fill="${c1}" opacity=".12"/>`);
  const eye=(x,y,r=4.6,slit)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*0.78}" fill="${ey}" stroke="#1a0e08" stroke-width="1"/>${slit?`<ellipse cx="${x}" cy="${y}" rx="${r*0.24}" ry="${r*0.72}" fill="#120a06"/>`:`<circle cx="${x}" cy="${y}" r="${r*0.45}" fill="#120a06"/>`}<circle cx="${x-r*0.3}" cy="${y-r*0.3}" r="${r*0.2}" fill="#fff" opacity=".8"/>`;
  const eyes=(y,dx,r,slit)=>F.eyeT==='one'?eye(50,y,r*1.6,slit):eye(50-dx,y,r,slit)+eye(50+dx,y,r,slit);
  const pattern=(cx,cy,rx,ry)=>F.pattern==='stripes'?[-1,0,1].map(i=>`<path d="M${cx+i*9} ${cy-ry+2}q${3} 8 0 ${14}" stroke="${dk}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')+`<path d="M${cx-rx+3} ${cy}q6 2 10 -2M${cx+rx-3} ${cy}q-6 2 -10 -2" stroke="${dk}" stroke-width="2.4" fill="none"/>`
    :F.pattern==='spots'?Array.from({length:9},(_,i)=>{const a=i*2.4,d=0.35+((i*37)%10)/16;return `<circle cx="${(cx+Math.cos(a)*rx*d).toFixed(1)}" cy="${(cy+Math.sin(a)*ry*d*0.8-4).toFixed(1)}" r="${1.6+(i%3)*0.6}" fill="${dk}" opacity=".8"/>`}).join('')
    :F.pattern==='scales'?Array.from({length:12},(_,i)=>`<path d="M${cx-rx*0.6+(i%4)*rx*0.4} ${cy-ry*0.5+Math.floor(i/4)*7}q3 4 6 0" stroke="${dk}" stroke-width="1.2" fill="none"/>`).join(''):'';
  const horns=()=>F.horns==='bull'?`<path d="M30 36C18 34 10 24 12 12C18 22 24 26 34 28Z" fill="#e8dcc0" stroke="#6a5a40"/><path d="M70 36C82 34 90 24 88 12C82 22 76 26 66 28Z" fill="#e8dcc0" stroke="#6a5a40"/>`
    :F.horns==='ram'?`<path d="M32 30c-14-6-22 6-14 16 6 7 16 2 12-5" stroke="#cdbb90" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M68 30c14-6 22 6 14 16-6 7-16 2-12-5" stroke="#cdbb90" stroke-width="7" fill="none" stroke-linecap="round"/>`
    :F.horns==='antlers'?`<path d="M38 30L30 8M33 20L22 14M31 12L24 4M62 30L70 8M67 20L78 14M69 12L76 4" stroke="#b08a54" stroke-width="3.4" stroke-linecap="round"/>`
    :F.horns==='spikes'?[20,35,50,65,80].map((x,i)=>`<path d="M${x-5} ${30+Math.abs(2-i)*4}L${x} ${12+Math.abs(2-i)*5}L${x+5} ${30+Math.abs(2-i)*4}Z" fill="${dk}"/>`).join(''):'';
  const fangs=(y)=>F.fangs?`<path d="M44 ${y}l2 7 2-7Z" fill="#f5efe0"/><path d="M52 ${y}l2 7 2-7Z" fill="#f5efe0"/>`:'';
  const sp=F.species;
  if(F.mane&&sp!=='avian'){let d='';for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=i%2?34:44;d+=(i?'L':'M')+(50+Math.cos(a)*r).toFixed(1)+' '+(54+Math.sin(a)*r).toFixed(1)}P.push(`<path d="${d}Z" fill="${bfShade(c2,-0.45)}"/>`)}
  if(!['bovine','cervine','giant'].includes(sp))P.push(horns());
  if(sp==='feline'){P.push(`<path d="M28 38L30 20L44 30Z" fill="${c1}" stroke="${dk}"/><path d="M72 38L70 20L56 30Z" fill="${c1}" stroke="${dk}"/><path d="M31 33L32 25L39 30Z" fill="#d89a8a"/><path d="M69 33L68 25L61 30Z" fill="#d89a8a"/>
    <ellipse cx="50" cy="56" rx="27" ry="25" fill="${c1}"/>${pattern(50,50,24,20)}<ellipse cx="43" cy="68" rx="9" ry="7" fill="${c2}"/><ellipse cx="57" cy="68" rx="9" ry="7" fill="${c2}"/><path d="M45 60h10l-5 6Z" fill="#6a3a30"/><path d="M50 66v5M44 74q6 4 12 0" stroke="#3a2016" stroke-width="1.4" fill="none"/>
    ${eyes(50,10,4.8,true)}<path d="M36 67h-14M36 70l-13 4M64 67h14M64 70l13 4" stroke="#f5efe0" stroke-width=".7" opacity=".7"/>${fangs(72)}`)}
  else if(sp==='canine'){P.push(`<path d="M28 44L26 14L44 32Z" fill="${c1}" stroke="${dk}"/><path d="M72 44L74 14L56 32Z" fill="${c1}" stroke="${dk}"/><path d="M30 38L29 22L39 32Z" fill="${bfShade(c1,-0.25)}"/><path d="M70 38L71 22L61 32Z" fill="${bfShade(c1,-0.25)}"/>
    <path d="M26 50Q26 30 50 30Q74 30 74 50Q74 66 62 76L50 86L38 76Q26 66 26 50Z" fill="${c1}"/>${pattern(50,48,22,16)}<path d="M40 62Q50 58 60 62L58 80L50 86L42 80Z" fill="${c2}"/><ellipse cx="50" cy="66" rx="6" ry="4.4" fill="#1a1210"/><path d="M50 70v6M44 80q6 4 12 0" stroke="#2a1a12" stroke-width="1.3" fill="none"/>${eyes(48,11,4.2,false)}<path d="M36 44l8 2M64 44l-8 2" stroke="${dk}" stroke-width="2"/>${fangs(78)}`)}
  else if(sp==='ursine'){P.push(`<circle cx="28" cy="32" r="9" fill="${c1}"/><circle cx="72" cy="32" r="9" fill="${c1}"/><circle cx="28" cy="32" r="4.5" fill="${dk}"/><circle cx="72" cy="32" r="4.5" fill="${dk}"/>
    <ellipse cx="50" cy="56" rx="30" ry="28" fill="${c1}"/>${pattern(50,50,26,20)}<ellipse cx="50" cy="70" rx="15" ry="12" fill="${c2}"/><ellipse cx="50" cy="64" rx="7.5" ry="5" fill="#1a1210"/><path d="M50 69v5M44 77q6 4 12 0" stroke="#2a1a12" stroke-width="1.3" fill="none"/>${eyes(50,13,3.6,false)}${fangs(76)}`)}
  else if(sp==='boar'){P.push(`<path d="M24 40L20 22L36 32Z" fill="${c1}" stroke="${dk}"/><path d="M76 40L80 22L64 32Z" fill="${c1}" stroke="${dk}"/><path d="M32 30l4-8 4 7 4-9 4 8 4-9 4 9 4-8 4 7 4-8" stroke="${dk}" stroke-width="2.4" fill="none"/>
    <ellipse cx="50" cy="54" rx="31" ry="25" fill="${c1}"/>${pattern(50,48,26,16)}<ellipse cx="50" cy="72" rx="14" ry="10" fill="${c2}" stroke="${dk}"/><ellipse cx="45" cy="72" rx="2.6" ry="3.6" fill="#3a1a14"/><ellipse cx="55" cy="72" rx="2.6" ry="3.6" fill="#3a1a14"/>
    <path d="M36 72Q28 66 30 54Q34 64 40 68Z" fill="#f5efe0" stroke="#8a7a60"/><path d="M64 72Q72 66 70 54Q66 64 60 68Z" fill="#f5efe0" stroke="#8a7a60"/>${eyes(48,13,3.2,false)}`)}
  else if(sp==='bovine'){P.push(horns(),`<ellipse cx="24" cy="44" rx="9" ry="5" fill="${c1}" transform="rotate(-20 24 44)"/><ellipse cx="76" cy="44" rx="9" ry="5" fill="${c1}" transform="rotate(20 76 44)"/>
    <path d="M28 34Q50 26 72 34Q70 60 64 74Q50 86 36 74Q30 60 28 34Z" fill="${c1}"/>${pattern(50,46,20,14)}<path d="M44 34q6 8 12 0" stroke="${lt}" stroke-width="3" fill="none"/><ellipse cx="50" cy="76" rx="15" ry="9" fill="${c2}"/><ellipse cx="44" cy="76" rx="2.6" ry="3.4" fill="#2a1a12"/><ellipse cx="56" cy="76" rx="2.6" ry="3.4" fill="#2a1a12"/>${eyes(48,14,3.8,false)}${F.gear==='ring'?'':''}`)}
  else if(sp==='cervine'){P.push(horns(),`<ellipse cx="26" cy="42" rx="11" ry="5" fill="${c1}" transform="rotate(-25 26 42)"/><ellipse cx="74" cy="42" rx="11" ry="5" fill="${c1}" transform="rotate(25 74 42)"/>
    <path d="M34 36Q50 28 66 36Q66 62 56 82Q50 88 44 82Q34 62 34 36Z" fill="${c1}"/>${pattern(50,48,14,14)}<ellipse cx="50" cy="80" rx="7" ry="5" fill="#1a1210"/><path d="M42 40q8 4 16 0" stroke="${c2}" stroke-width="2" fill="none"/>${eyes(50,11,4.2,false)}`)}
  else if(sp==='serpent'){P.push(`<path d="M50 24Q78 34 76 54Q72 76 50 84Q28 76 24 54Q22 34 50 24Z" fill="${c1}"/>${pattern(50,54,22,20)||[0,1,2].map(i=>`<path d="M36 ${44+i*9}q14 6 28 0" stroke="${dk}" stroke-width="1.4" fill="none"/>`).join('')}<path d="M40 70q10 6 20 0" stroke="${c2}" stroke-width="3" fill="none"/>
    <path d="M50 84v10M50 94l-4 4M50 94l4 4" stroke="#c0302a" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="45" cy="64" r="1.6" fill="#1a1210"/><circle cx="55" cy="64" r="1.6" fill="#1a1210"/>${eyes(46,13,5,true)}<path d="M32 40l12 4M68 40l-12 4" stroke="${dk}" stroke-width="2.4"/>${fangs(76)}`)}
  else if(sp==='avian'){P.push(`${F.mane?`<path d="M20 50L10 30L28 38L24 16L40 30L50 10L60 30L76 16L72 38L90 30L80 50Z" fill="${bfShade(c2,-0.2)}"/>`:''}<path d="M30 30l-6-12 12 8M70 30l6-12-12 8" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="27" fill="${c1}"/><path d="M26 44Q50 30 74 44Q70 32 50 26Q30 32 26 44Z" fill="${c2}" opacity=".9"/>${pattern(50,50,22,16)}<path d="M50 54L62 58Q60 74 50 86Q52 72 44 66Q42 58 50 54Z" fill="#e6b93a" stroke="#6a4a14"/><path d="M50 86q-6-4-8-12" stroke="#6a4a14" stroke-width="1.4" fill="none"/>
    ${eyes(46,13,4.4,false)}<path d="M30 38l14 6M70 38l-14 6" stroke="#1a1210" stroke-width="3" stroke-linecap="round"/>`)}
  else if(sp==='reptile'){P.push(`<ellipse cx="50" cy="60" rx="34" ry="19" fill="${c1}"/>${pattern(50,58,28,12)||[0,1,2,3].map(i=>`<circle cx="${32+i*12}" cy="54" r="2.6" fill="${dk}"/>`).join('')}<circle cx="36" cy="42" r="9" fill="${c1}"/><circle cx="64" cy="42" r="9" fill="${c1}"/>${eye(36,41,4.4,true)}${eye(64,41,4.4,true)}
    <path d="M20 66Q50 78 80 66" stroke="#1a1210" stroke-width="2" fill="none"/>${Array.from({length:9},(_,i)=>`<path d="M${24+i*6.5} ${66+Math.sin(i/8*Math.PI)*5}l2.5 5 2.5-5Z" fill="#f5efe0"/>`).join('')}<circle cx="46" cy="52" r="1.8" fill="#1a1210"/><circle cx="54" cy="52" r="1.8" fill="#1a1210"/>`)}
  else if(sp==='arachnid'){P.push(`${[-1,1].flatMap(s=>[0,1,2,3].map(i=>`<path d="M${50+s*24} ${46+i*9}Q${50+s*40} ${36+i*12} ${50+s*46} ${58+i*10}" stroke="${dk}" stroke-width="3" fill="none"/>`)).join('')}<circle cx="50" cy="56" r="28" fill="${c1}"/>${pattern(50,58,22,18)}<path d="M36 70q14 8 28 0" stroke="${c2}" stroke-width="2" fill="none"/>
    ${F.eyeT==='one'?eye(50,48,7,false):[[42,48,4.2],[58,48,4.2],[34,40,2.4],[66,40,2.4],[44,38,2],[56,38,2],[38,56,1.8],[62,56,1.8]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${ey}" stroke="#1a0e08" stroke-width=".8"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.3}" fill="#fff" opacity=".7"/>`).join('')}
    <path d="M42 76q-6 8 0 14M58 76q6 8 0 14" stroke="#1a1210" stroke-width="4" fill="none" stroke-linecap="round"/>`)}
  else{/* giant */P.push(horns(),`<ellipse cx="24" cy="54" rx="5" ry="8" fill="${c1}"/><ellipse cx="76" cy="54" rx="5" ry="8" fill="${c1}"/><ellipse cx="50" cy="54" rx="25" ry="31" fill="${c1}"/>${pattern(50,50,20,20)}<path d="M26 40Q50 30 74 40L72 34Q50 20 28 34Z" fill="${c2}"/><path d="M30 46h40" stroke="${dk}" stroke-width="5" stroke-linecap="round"/>
    ${F.eyeT==='one'?eye(50,52,7,false):eyes(52,11,3.8,false)}<path d="M48 58l-3 10h8" stroke="${dk}" stroke-width="2" fill="none"/><path d="M38 76q12 6 24 0" stroke="#3a1a12" stroke-width="2.4" fill="none"/>${fangs(76)}${F.mane?`<path d="M30 72Q50 100 70 72Q64 88 50 90Q36 88 30 72Z" fill="${c2}"/>`:''}`)}
  if(F.scar)P.push(`<path d="M34 36L52 62" stroke="#8a1c14" stroke-width="2.4" stroke-linecap="round"/><path d="M38 44l4-2M43 51l4-2" stroke="#8a1c14" stroke-width="1.4"/>`);
  if(F.gear==='collar')P.push(`<path d="M22 86Q50 98 78 86" stroke="#3a2a1a" stroke-width="7" fill="none"/>${[28,39,50,61,72].map(x=>`<path d="M${x-3} ${x===50?92:90}l3 7 3-7Z" fill="#c9d0d6"/>`).join('')}`);
  if(F.gear==='crown')P.push(`<path d="M26 30q24-14 48 0" stroke="#6f9a4a" stroke-width="5" fill="none" stroke-dasharray="4 2"/>`);
  if(F.gear==='helm')P.push(`<path d="M28 34Q50 12 72 34L70 40Q50 30 30 40Z" fill="#8a8f98" stroke="#3a3e44"/><path d="M50 18v-8" stroke="#a3281f" stroke-width="5"/>`);
  if(F.gear==='chains')P.push(`<path d="M18 88q8-6 16 0t16 0 16 0 16 0" stroke="#8a8f98" stroke-width="3" fill="none"/>`);
  if(F.gear==='ring')P.push(`<circle cx="50" cy="${sp==='bovine'?84:74}" r="5" fill="none" stroke="#e6b93a" stroke-width="2.4"/>`);
  const bgPart=opt.nobg?'':P.shift(); /* v0.48: the face sits a little back from the frame, centred */
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${opt.size?`width="${opt.size}" height="${opt.size}"`:''}>${bgPart}<g transform="translate(50 50) scale(0.8) translate(-50 -53)">${P.join('')}</g></svg>`}
function faceTok(n){const F=n.face;if(!F)return null;const base=(typeof kindTok==='function'&&kindTok(n))||autoTokenForNpc(n);const body={serpent:'serpent',avian:'bird',arachnid:'spider',giant:'biped'}[F.species]||base.body||'quad';
  return {...base,body,c1:F.c1,c2:F.c2,eyes:F.eyes,horns:!!F.horns&&F.horns!=='spikes',mane:!!F.mane,spikes:F.horns==='spikes'||!!base.spikes,eyeT:F.eyeT==='one'?'cyclops':'two',extra:F.gear==='collar'?'collar':F.gear==='chains'?'chains':base.extra}}
/* the round token wears the face */
function rtokFaceSVG(sp,n){const F=n&&n.face;if(!F||(sp&&sp.useFace===false))return '';return `<svg x="${sp&&sp.base?10:13}" y="${sp&&sp.base?10:13}" width="${sp&&sp.base?80:74}" height="${sp&&sp.base?80:74}" viewBox="0 0 100 100">${beastFaceSVG(F).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>`}

/* ---------------- the beast designer, face first ---------------- */
{const _ne=npcEditorHTML;npcEditorHTML=function(){const n=ST.draft;if(!n.face)n.face=faceBlank(n);if(n.rtok&&n.rtok.faceMig!==1){n.rtok.glyph=false;n.rtok.faceMig=1}const F=n.face;let h=_ne();
  const sel=(f,opts,v)=>fSel(_T('face.')+f,opts,v);
  h=h.replace('<div id="rtPrev"',`<div class="bfprev" id="bfPrev" title="${esc(n.name)}’s face">${beastFaceSVG(F)}</div><div class="rc-sub" style="font:600 10px var(--mono);letter-spacing:.1em">THE FACE</div><div id="rtPrev"`);
  h=h.replace(/<label>Token letter[\s\S]*?<\/label>(<label>Color)/,'$1');
  h=h.replace(/<label>Letter color[\s\S]*?<\/label><\/div>/,'</div>').replace(/<div class="chkgrid" style="margin-top:4px">\s*<label class="chk"><input type="checkbox" data-f="rtok\.glyph"[^<]*<\/label>[^<]*<\/div>/,`<div class="chkgrid" style="margin-top:4px">${fChk('rtok.useFaceOff',n.rtok&&n.rtok.useFace===false,_T('Hide the face on the token (sculpt your own instead)'))}</div>`);
  const faceCard=`<div class="card2 bfcard">${_T`<b>🦁 The face</b>`} <span class="rc-sub">${_T`like a character's portrait — it heads this page, fills the round token and colours the board figure`}</span>
    <div class="formgrid" style="margin-top:6px"><label>${_T`Species${sel('species',BF_SPECIES,F.species)}`}</label><label>${_T`Horns${sel('horns',BF_HORNS,F.horns||'')}`}</label><label>${_T`Pattern${sel('pattern',BF_PATTERN,F.pattern||'')}`}</label><label>${_T`Gear${sel('gear',BF_GEAR,F.gear||'')}`}</label>
     <label>${_T`Eyes${sel('eyeT',[['two',_T('Two')],['one',_T('One great eye')],['many',_T('Many (spiders)')]],F.eyeT||'two')}`}</label>
     <label>${_T`Hide`}<input type="color" data-f="face.c1" value="${esc(F.c1)}" style="width:44px;height:30px;border:0;background:none;padding:0"></label><label>${_T`Markings &amp; muzzle`}<input type="color" data-f="face.c2" value="${esc(F.c2)}" style="width:44px;height:30px;border:0;background:none;padding:0"></label><label>${_T`Eye colour`}<input type="color" data-f="face.eyes" value="${esc(F.eyes)}" style="width:44px;height:30px;border:0;background:none;padding:0"></label>
     <label style="grid-column:span 2">${_T`Backdrop${sel('bg',BGS.map((v,i)=>[v,BG_NAMES[i]||_T('Backdrop ')+(i+1)]).concat(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F2])=>['flag:'+k,_T('🏳 City banner · ')+F2.n]):[]).concat((CUSTOM.flags||[]).map(f=>['flag:c:'+f.id,(f.fmt==='portrait'?'🖼 ':'✦ ')+(f.name||_T('your banner'))+' · custom'])),F.bg)}`}</label></div>
    <div class="chkgrid" style="margin-top:4px">${fChk('face.mane',F.mane,'Mane / crest / beard')}${fChk('face.fangs',F.fangs,_T('Fangs'))}${fChk('face.scar',F.scar,_T('Battle scar'))}</div>
    <div class="acts" style="margin-top:6px"><button type="button" class="btn tksm" data-bf="rand">${_T`🎲 Another face`}</button><button type="button" class="btn tksm" data-bf="kind">${_T`↺ Face of its kind`}</button></div></div>`;
  h=h.replace('<div class="card2 rtcard">',faceCard+'<div class="card2 rtcard">');
  h=h.replace(/fSel\('tokenRef'/,'fSel(\'tokenRef\'');return h}}
function bfRefresh(){const n=ST&&ST.draft;if(!n||!n.face)return;const pv=document.getElementById('bfPrev');if(pv)pv.innerHTML=beastFaceSVG(n.face);if(typeof rtPrevRefresh==='function')rtPrevRefresh()}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&/^face\./.test(t.dataset.f||'')&&typeof ST!=='undefined'&&ST.draft){if(t.type==='color')setPath(ST.draft,t.dataset.f,t.value);bfRefresh()}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.f==='rtok.useFaceOff'&&typeof ST!=='undefined'&&ST.draft){ST.draft.rtok=ST.draft.rtok||{};ST.draft.rtok.useFace=!t.checked;setTimeout(()=>{try{studioRedraw()}catch(err){}},0)}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-bf]');if(!b||typeof ST==='undefined'||!ST.draft)return;e.stopPropagation();const n=ST.draft;
  if(b.dataset.bf==='kind')n.face=faceBlank(n);
  else{const col=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');n.face={...n.face,species:pickOne(BF_SPECIES)[0],c1:pickOne(['#b8782e','#6f6a62','#4a3424','#3f6a2a','#26222a','#d8a040','#8a5a30','#c9d0d6','#6a3a22',col()]),c2:pickOne(['#e8d4a0','#f5efe0','#3a2a1a','#b8c07a',col()]),eyes:pickOne(['#f0cf7d','#e04a2a','#9bd070','#62d0c0','#f5efe0']),horns:pickOne(BF_HORNS)[0],pattern:pickOne(BF_PATTERN)[0],gear:pickOne(BF_GEAR)[0],mane:Math.random()<.4,fangs:Math.random()<.7,scar:Math.random()<.25}}
  studioRedraw()},true);
/* every new beast starts with a face; copies of stock beasts get the face of their kind */
{const _bn=blankNpc;blankNpc=function(){const n=_bn();n.face=faceBlank(n);return n}}
{const _an=applyNpcBase;applyNpcBase=function(n,k){_an(n,k);n.face={...faceBlank(n),species:BF_TYPE[k]||n.face&&n.face.species||'feline',c1:(NPCT[k]||{}).col||n.color}}}
/* the myth starters get faces — and the Calydonian Boar joins them */
const MYTH_FACES={'Nemean Lion':{species:'feline',c1:'#d8a040',c2:'#f0dca8',eyes:'#f0cf7d',mane:true,fangs:true,gear:'crown'},'Lernaean Hydra':{species:'serpent',c1:'#3f6a2a',c2:'#b8c07a',eyes:'#e0d040',pattern:'scales',horns:'spikes',fangs:true},
  'Cerberus':{species:'canine',c1:'#26222a',c2:'#5a4a52',eyes:'#ff5a3a',fangs:true,gear:'collar',scar:true},'The Minotaur':{species:'bovine',c1:'#6a3a22',c2:'#b08a6a',eyes:'#e04a2a',horns:'bull',gear:'ring'},'The Chimera':{species:'feline',c1:'#c98a3a',c2:'#5f8a3a',eyes:'#ff8a2a',mane:true,horns:'ram',fangs:true},
  'Harpy of the Strophades':{species:'avian',c1:'#4a3a6a',c2:'#d8b090',eyes:'#e0d040',mane:true},'Stymphalian Bird':{species:'avian',c1:'#9a6a2a',c2:'#e6b93a',eyes:'#f0cf7d',horns:'spikes'},'Erymanthian Boar':{species:'boar',c1:'#4a3424',c2:'#c8a080',eyes:'#e04a2a',pattern:'spots'},
  'Cretan Bull':{species:'bovine',c1:'#e8e0cc',c2:'#d8a0a0',eyes:'#3a2a1a',horns:'bull'},'Griffin of Apollo':{species:'avian',c1:'#c9a050',c2:'#f5efe0',eyes:'#f0cf7d',mane:true,gear:'crown'},'Polyphemus':{species:'giant',c1:'#c98e62',c2:'#6a4a2a',eyes:'#f0cf7d',eyeT:'one',mane:true,fangs:true},
  'Pegasus':{species:'cervine',c1:'#f0ece4',c2:'#c9d0d6',eyes:'#3a5a8a',horns:'',mane:true},'Ceryneian Hind':{species:'cervine',c1:'#c08a44',c2:'#e6b93a',eyes:'#3a2a1a',horns:'antlers'},'Arachne':{species:'arachnid',c1:'#3a2a3a',c2:'#c8c0d8',eyes:'#e04a2a',eyeT:'many'},
  'Python of Delphi':{species:'serpent',c1:'#5f8a3a',c2:'#d8c88a',eyes:'#e0d040',pattern:'scales',fangs:true,gear:'crown'},'Talos':{species:'giant',c1:'#b87333',c2:'#e6b93a',eyes:'#ffb04a',gear:'helm'},'The Calydonian Boar':{species:'boar',c1:'#3a2a1c',c2:'#9a7a5a',eyes:'#ff4a2a',horns:'spikes',scar:true}};
if(typeof MYTH_BEASTS!=='undefined'){MYTH_BEASTS.push({name:'The Calydonian Boar',kind:'Calydonian Boar',kindKey:'boar',glyph:'B',color:'#3a2a1c',hp:18,ap:5,rng:1,mv:3,coin:14,cf:9,beh:'hunt',tameable:false,states:true,lore:_T('Sent by Artemis to ravage Calydon — the heroes of Greece gathered to hunt it. The same boar that storms out of the arena deck.'),
    tok:{kind:'beast',body:'quad',c1:'#3a2a1c',c2:'#6a5040',size:1.15,tail:'none',bulk:1,spikes:true,extra:'fangs',eyes:'#ff4a2a'},rt:{ring:'bronze',bg:'#2a1a0e',glyph:false,base:'boar',useFace:false,layers:[]}}); /* its printed round token, from the sheets */
  for(const M of MYTH_BEASTS){M.face={...faceBlank(),...(MYTH_FACES[M.name]||{}),bg:M.rt&&M.rt.bg||'#2a1f17'};if(M.rt&&!M.rt.base){M.rt.layers=[];M.rt.glyph=false}}}
{const _md=mythDraft;mythDraft=function(i){const n=_md(i);const M=MYTH_BEASTS[i];if(n&&M&&M.face)n.face=JSON.parse(JSON.stringify(M.face));return n}}
/* the gallery cards show the faces */
{const _bg2=beastGalleryHTML;beastGalleryHTML=function(){let i=0;return _bg2().replace(/<span class="mythtok">[\s\S]*?<\/svg><\/span>/g,()=>{const M=MYTH_BEASTS[i++];return M?`<span class="mythtok">${rtokSVG({...rtokBlank(M),...M.rt},{...M,face:M.face})}</span>`:''})}}

/* ---------------- 🤝 COHORTS (were Pairings), under Fighters ---------------- */
SYS_PAIRINGS.push(
  {id:'sys_dominus',sys:1,name:'Dominus & Servus',type:'duo',rel:'Master & slave',members:['cls:royalty','cls:slave'],blurb:_T('The master fights beside the man he owns — and never turns his back on him.')},
  {id:'sys_colleagues',sys:1,name:'Colleagues of the Sand',type:'duo',rel:'Co-workers',members:['cls:soldier','cls:veteranus'],blurb:_T('Same ludus, same drills, same bad soup for twenty years.')},
  {id:'sys_rivals',sys:1,name:'The Rivals of Rome',type:'duo',rel:_T('Rivals'),members:['cls:hero','cls:damnatio'],blurb:_T('The crowd’s darling and the condemned man who swore to end him.')},
  {id:'sys_artemis',sys:1,name:'The Hunt of Artemis',type:'handler',rel:_T('Friends'),members:['cls:venatore','npc:wolf','npc:wolf'],blurb:_T('The huntress and the hounds of the goddess.')},
  {id:'sys_bearpit',sys:1,name:'The Bear Pit',type:'pack',members:['npc:bear','npc:bear'],blurb:_T('Two bears, one pit, no patience.')},
  {id:'sys_serpents',sys:1,name:'The Serpent Cult of Glykon',type:'pack',members:['npc:snake','npc:snake','npc:snake'],blurb:_T('The oracle’s snakes, loosed on the sand.')},
  {id:'sys_lionsleptis',sys:1,name:'The Lions of Leptis',type:'pack',members:['npc:lion','npc:lion'],blurb:_T('A pride brought over from Africa for the games.')},
  {id:'sys_amazons',sys:1,name:'The Daughters of Ares',type:'trio',members:['cls:amazonia','cls:amazonia','cls:venatore'],blurb:_T('Three women of the sword, and a debt to settle.')});
{const _pp=pmParse;pmParse=function(ref){const [k,id]=String(ref||'').split(':');if(k==='lg'){const g=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).find(x=>x.id===id);return g?{char:1,cls:g.cls,name:g.name,label:g.name,lg:g}:null}return _pp(ref)}}
{const _pt=pmTok;pmTok=function(ref,size=40){const m=pmParse(ref);if(m&&m.lg)return `<span class="pmtok" style="width:${size}px;height:${size}px">${gladFace(m.lg,'xs')}</span>`;return _pt(ref,size)}}
/* keepers are matched by name when they come from your roster */
{const _pe=pairEnter;pairEnter=async function(P,drawer,why){const M=(P.members||[]).map(pmParse).filter(Boolean);if(M.some(m=>m.lg)){const P2={...P,members:P.members.map(r=>{const m=pmParse(r);if(m&&m.lg){const p=S.players.find(q=>q.name===m.name);return p?'cls:'+p.cls:r}return r})};return _pe(P2,drawer,why)}return _pe(P,drawer,why)}}
function cohortStudioHTML(){const h=specialStudioHTML();const a=h.indexOf('<h3 class="sxh3">');if(a<0)return h;
  let c=h.slice(a).replace('<h3 class="sxh3">🤝 Pairings</h3>','<h3 class="sxh3" style="border:0;margin-top:0">🤝 Cohorts</h3>').replace(/pairing/g,'cohort').replace(/Pairing/g,'Cohort').replace(/Your cohorts/,'Your cohorts').replace(/The system cohorts/,'The system cohorts');
  return `<p>${_T`A <b>cohort</b> is a group bound by something — a duo with a bond (family, friends, master &amp; slave, co-workers, the Blood of Asclepius…), a team of four, a keeper and their beasts, a pack. Members come from <b>Your Play Now Gladiators</b> (the active roster) and from the beasts. A cohort can ride in a ⭐ special event, join the <b>arena deck</b> as a card, and be placed in any custom event. ${customTag()}`}</p>`+c}
function specialOnlyHTML(){const h=specialStudioHTML();const a=h.indexOf('<h3 class="sxh3">');return (a<0?h:h.slice(0,a)).replace('and the <b>pairings</b> that make them memorable','and the <b>cohorts</b> that make them memorable (made under Fighters → 🤝 Cohorts)').replace(/🤝 Pairings in this event/,'🤝 Cohorts in this event').replace(/Pairings in this event/,'Cohorts in this event')}
/* member choices: your roster first, then the beasts */
{const _sp=specialStudioHTML;specialStudioHTML=function(){let h=_sp();const ros=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>g.roster&&gladActive(g));
  const optsRos=ros.map(g=>`<option value="lg:${g.id}">⭐ ${esc(g.name)} · ${esc((CLASSES[g.cls]||{}).name||'')}</option>`).join('');
  h=h.replace(/(<select class="tin" data-pxm="(\d+)">)<option value=""\s*(?:selected)?\s*>— empty —<\/option>([\s\S]*?)<\/select>/g,(m,open,i,rest)=>{const cur=((ST.pxd||{}).members||[])[+i]||'';const beasts=rest.replace(/<option value="(cls|cc):[^"]*"[^>]*>[^<]*<\/option>/g,'').replace(/ selected/g,'');
    const all=`<option value="">— empty —</option><optgroup label="Your Play Now Gladiators (active roster)">${optsRos}</optgroup><optgroup label="Beasts">${beasts}</optgroup>`;return open+all.replace(`value="${cur}"`,`value="${cur}" selected`)+'</select>'});
  h=h.replace(/(<label class="chk[^"]*"><input type="checkbox" data-sxpair="[^"]*"[^>]*>) ✦ ([^<]*)/g,'$1 ✦ $2 <span class="cbadge">custom</span>');
  return h}}
{const _pb=pairBlank;pairBlank=function(){const P=_pb();const ros=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>g.roster&&gladActive(g));P.members=ros.length>=2?['lg:'+ros[0].id,'lg:'+ros[1].id]:P.members;return P}}
/* the All creations table calls them cohorts */
{const _ae=allRowsExtra;allRowsExtra=function(){return _ae().map(r=>r.t==='Pairing'?{...r,t:_T('Cohort'),k:'pairings'}:r)}}
/* the Event Designer lists cohorts, marked */
{const _ro=edRosterHTML;edRosterHTML=function(){return _ro().replace('🤝 Pairings <span','🤝 Cohorts <span').replace(/(data-edpair="[^"]*"[^>]*>) ✦ ([^<]*)/g,'$1 ✦ $2 <span class="cbadge">custom</span>').replace('Make pairings on the ⭐ Special events tab.','Make cohorts under Fighters → 🤝 Cohorts.')}}
/* every other picker marks custom content */
{const _ao=armorOpts;armorOpts=function(f){return _ao(f).map(([k,l])=>k&&ARM[k]&&ARM[k].custom?[k,'✦ '+l+' · custom']:[k,l])}}
{const _to=trophyOptions;trophyOptions=function(){return _to().map(([k,l])=>/^✦ /.test(l)?[k,l+' · custom']:[k,l])}}

/* ---------------- 📚 which roster set is loaded ---------------- */
{const _rs=rosterStudioHTML;rosterStudioHTML=function(){const cur=rosterById((typeof CFG!=='undefined'&&CFG.roster)||'classic');const w=typeof MGR!=='undefined'&&MGR.world;
  return `<div class="card2 rsloaded">${_T`<b>▶ Loaded now</b> · Play Now / New event: <b>${esc(cur.name)}</b>${w&&w.roster?_T` · your open career (${esc((w.mgrs.find(m=>m.isPlayer)||{}).ludus||'')}) plays with <b>${esc(w.roster.name)}</b> — chosen at its founding, it never changes`:''}`}</div>`+_rs().replace(/<span class="badge gold">New event uses this<\/span>/,'<span class="badge gold">▶ LOADED for Play Now</span>')}}
{const _me=meHTML;meHTML=function(){const w=W_();const h=_me();if(!w||!w.roster)return h;return h.replace('<div class="card2"><div class="sect" style="margin-top:0">🏜 Sandbox',`<div class="card2"><div class="sect" style="margin-top:0">📚 Roster set <span class="rc-sub">locked at the founding</span></div><p style="margin:0">This career plays with <b>${esc(w.roster.name)}</b>${w.roster.sel?` — ${esc(rosterSummary(w.roster))}`:''}.</p></div><div class="card2"><div class="sect" style="margin-top:0">🏜 Sandbox`)}}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.roster==='cfg'&&typeof mToast==='function')mToast(_T`📚 Loaded for Play Now: <b>${esc(rosterById(t.value).name)}</b>`)});

/* ---------------- save checks ---------------- */
{const _ee=eventErrors;eventErrors=function(e){const out=_ee(e);if(!(e.rounds||[]).length)out.push(_T('Add at least one round.'));
  (e.rounds||[]).forEach((r,i)=>{if(!r.end)out.push(_T`Round ${i+1} needs an end condition.`);if(!String(r.n||'').trim())out.push(_T`Name round ${i+1}.`);
    if(/alive/.test(r.end||'')&&!r.pvp&&e.mode!=='coop'&&(e.layout.npcs||[]).length===0)out.push(_T`Round ${i+1} ends when gladiators fall, but PVP is off and there are no beasts — nobody could fall.`);
    if(/^npc/.test(r.end||'')&&!(e.layout.npcs||[]).length&&!(e.deck&&Object.values(e.deckSpawns||{}).some(Boolean))&&!(e.pairs||[]).length)out.push(_T`Round ${i+1} ends on slain beasts, but there are none on the board or in the deck.`)});
  if(+e.max>(e.layout.starts||[]).filter(Boolean).length&&!out.some(x=>/start tiles/.test(x)))out.push(_T('Place one start tile per player.'));
  if(e.mode==='teams'&&+e.max<2)out.push(_T('A team event needs at least two players.'));return [...new Set(out)]}}
{const _sd=stSaveDraft;stSaveDraft=function(){const d=ST.draft;if(ST.tab==='events'){const er=eventErrors(d);if(er.length){if(typeof mToast==='function')mToast('⚠ '+esc(er[0]));return Promise.resolve(null)}}
  if(ST.tab==='npcs'){if(!(+d.hp>0)){mToast(_T('⚠ A beast needs at least 1 HP.'));return Promise.resolve(null)}if(!(+d.mv>=0)){mToast(_T('⚠ Set the beast’s movement.'));return Promise.resolve(null)}}
  if(ST.tab==='chars'&&!String(d.name||'').trim()&&typeof genName==='function')d.name=genName();return _sd()}}
