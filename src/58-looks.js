/* =====================================================================
   58-LOOKS · MORE TO WEAR, AND ONE LOOK MAKER FOR EVERY DESIGNER (v0.52)
   =====================================================================
   • Portrait accessories roughly double: nine more headgear, five hairstyles, four beards, six marks,
     five garbs, and three new slots: earrings (four kinds), neckwear (six) and face pieces (three).
   • portraitControlsHTML(pt,attr) is the one look maker: the character designer and the Lanista creator
     both use the same controls, so a feature added to one lands in the other.
   • The Lanista creator gets the full look maker, an epithet, a story, and can borrow the look of any
     Studio character.
   ===================================================================== */
HELMS.push(['plumed',_T('Plumed galea')],['hoplo',_T('Hoplomachus plumes')],['secutor',_T('Secutor egg helm')],['phrygian',_T('Phrygian cap')],['turban',_T('Eastern turban')],['kerchief',_T('Headscarf')],['flowers',_T('Flower crown')],['goldwreath',_T('Golden wreath')],['lion',_T('Lion pelt (Hercules)')]);
HAIRSTYLES.push(['bun',_T('Bun')],['ponytail',_T('Ponytail')],['topknot',_T('Topknot')],['wild',_T('Wild')],['twinbraid',_T('Twin braids')]);
BEARDS.push(['braided',_T('Braided beard')],['chin',_T('Chinstrap')],['mutton',_T('Mutton chops')],['longbeard',_T('Philosopher’s beard')]);
MARKS.push(['freckles',_T('Freckles')],['mole',_T('Beauty mark')],['kohl',_T('Kohl-lined eyes')],['tears',_T('Painted tears')],['cheek',_T('Cheek stripes')],['bruise',_T('Black eye')]);
GARBS.push(['lorica',_T('Lorica segmentata')],['cape',_T('Red cape')],['leopard',_T('Leopard pelt')],['robe',_T('Eastern robe')],['pteruges',_T('Leather pteruges')]);
const EARRINGS=[['',_T('None')],['1',_T('Gold ring')],['hoop',_T('Large hoop')],['pearl',_T('Pearl drop')],['double',_T('Double studs')]];
const NECKS=[['',_T('None')],['torque',_T('Gold torque')],['bulla',_T('Bulla amulet')],['chain',_T('Iron chain')],['pearls',_T('Pearl string')],['fang',_T('Beast-fang cord')],['collar',_T('Slave collar')]];
const FACES=[['',_T('None')],['nosering',_T('Nose ring')],['goldtooth',_T('Gold tooth')],['brow',_T('Brow ring')]];
const NEW_HELMS=new Set(['plumed','hoplo','secutor','phrygian','turban','kerchief','flowers','goldwreath','lion']);
const NEW_BEARDS=new Set(['chin','mutton','longbeard','braided']);
{const _ps=portraitSVG;portraitSVG=function(pt={},color='#c0433a'){pt=pt||{};const acc=color,dk=h=>shade(h,-0.35),mt='#a9b2ba',mtd='#5d656d';
  const helm=pt.helm||'none',hair=pt.hair||HAIRS[1],skin=pt.skin||SKINS[1],hs=pt.hs||'',bs=pt.bs||'';
  const base={...pt};if(NEW_HELMS.has(helm))base.helm='none';if(NEW_BEARDS.has(bs)&&bs!=='braided'){base.bs='';base.beard=false}if(pt.ear&&pt.ear!=='1'&&pt.ear!==true)base.ear=false;
  let s=_ps(base,color);let o='';
  const bare=['none','laurel','diadem','flowers','goldwreath','circlet','band'].includes(helm);
  const galea=`<path d="M25 58C25 24 75 24 75 58L70 59C68 40 32 40 30 59Z" fill="${mt}" stroke="${mtd}" stroke-width="1.2"/><path d="M27 57L29 78L38 76L36 57Z M73 57L71 78L62 76L64 57Z" fill="#949da6" stroke="${mtd}"/>`;
  /* garb (over the shoulders, under the face) */
  const gb=pt.garb;
  if(gb==='lorica')o+=`<path d="M20 140C22 117 34 107 50 107S78 117 80 140Z" fill="#9aa3ab"/><path d="M22 118h56M21 126h58M20 134h60" stroke="#5d656d" stroke-width="1.4"/><path d="M12 124C16 110 26 105 36 106L34 116C26 116 18 119 12 124Z M88 124C84 110 74 105 64 106L66 116C74 116 82 119 88 124Z" fill="#b3bcc4" stroke="#5d656d"/>`;
  if(gb==='cape')o+=`<path d="M6 140C8 110 26 99 50 99S92 110 94 140H84C82 120 68 108 50 108S18 120 16 140Z" fill="#8a1c1c"/><circle cx="34" cy="106" r="3.4" fill="#e8c86a" stroke="#8a5a1e"/><circle cx="66" cy="106" r="3.4" fill="#e8c86a" stroke="#8a5a1e"/>`;
  if(gb==='leopard')o+=`<path d="M8 124C18 102 36 100 50 104S82 102 92 124C80 116 66 114 50 116S20 116 8 124Z" fill="#d9a441" stroke="#8a5a1e"/>${[[18,116],[28,110],[40,108],[60,108],[72,110],[82,116],[34,114],[66,114]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8" fill="#3a2a12"/>`).join('')}`;
  if(gb==='robe')o+=`<path d="M20 140C22 117 34 107 50 107S78 117 80 140Z" fill="${acc}"/><path d="M36 109L50 130L64 109" fill="none" stroke="#e8c86a" stroke-width="3"/><path d="M22 136h56" stroke="#e8c86a" stroke-width="2"/>`;
  if(gb==='pteruges')o+=`${[0,1,2,3].map(i=>`<rect x="${14+i*4}" y="${110+i*2}" width="3.2" height="14" rx="1" fill="#7a4a22" stroke="#3f2812" stroke-width=".6"/><rect x="${82-i*4}" y="${110+i*2}" width="3.2" height="14" rx="1" fill="#7a4a22" stroke="#3f2812" stroke-width=".6"/>`).join('')}`;
  /* neckwear */
  const nk=pt.neck;
  if(nk==='torque')o+=`<path d="M38 99Q50 109 62 99" fill="none" stroke="#e8c86a" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="99" r="2.4" fill="#e8c86a" stroke="#8a5a1e"/><circle cx="62" cy="99" r="2.4" fill="#e8c86a" stroke="#8a5a1e"/>`;
  if(nk==='bulla')o+=`<path d="M40 98Q50 108 60 98" fill="none" stroke="#5a3a1e" stroke-width="1.2"/><circle cx="50" cy="109" r="4.2" fill="#e8c86a" stroke="#8a5a1e"/><circle cx="50" cy="109" r="1.4" fill="#8a5a1e"/>`;
  if(nk==='chain')o+=`<path d="M36 98Q50 114 64 98" fill="none" stroke="#9aa0a6" stroke-width="2.4" stroke-dasharray="2.4 1.4"/>`;
  if(nk==='pearls')o+=[...Array(9)].map((_,i)=>{const t=i/8;const x=38+24*t,y=98+Math.sin(Math.PI*t)*10;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" fill="#f2efe6" stroke="#b8b0a0" stroke-width=".5"/>`}).join('');
  if(nk==='fang')o+=`<path d="M40 98Q50 108 60 98" fill="none" stroke="#5a3a1e" stroke-width="1.2"/><path d="M47 104L50 114L53 104Z" fill="#efe6d2" stroke="#8a7a5a" stroke-width=".8"/>`;
  if(nk==='collar')o+=`<path d="M40 92h20v7H40Z" fill="#5d656d" stroke="#2e3338"/><circle cx="50" cy="102" r="2.6" fill="none" stroke="#5d656d" stroke-width="1.4"/>`;
  /* hair extras */
  if(bare&&hs==='bun')o+=`<circle cx="50" cy="29" r="7.5" fill="${hair}"/><path d="M44 31Q50 27 56 31" stroke="${dk(hair)}" stroke-width="1.2" fill="none"/>`;
  if(bare&&hs==='topknot')o+=`<ellipse cx="50" cy="27" rx="4.6" ry="6" fill="${hair}"/><rect x="46" y="31" width="8" height="2.4" fill="${acc}"/>`;
  if(bare&&hs==='wild')o+=`<path d="M27 50L22 38L31 40L30 28L39 34L42 22L49 31L55 20L59 32L67 25L67 36L77 33L73 44L79 50Z" fill="${hair}"/>`;
  if(hs==='ponytail'&&!['hood','veil','pelt','lion','kerchief','turban'].includes(helm))o+=`<path d="M70 46q14 8 10 30q-2 10 -6 14q2 -16 -8 -30z" fill="${hair}"/><rect x="69" y="47" width="5" height="3" rx="1" fill="${acc}" transform="rotate(30 71 48)"/>`;
  if(hs==='twinbraid'&&!['hood','veil','pelt','lion'].includes(helm))o+=[28,72].map(x=>`<path d="M${x} 64q${x<50?-6:6} 12 0 22q${x<50?-6:6} 10 0 20" fill="none" stroke="${hair}" stroke-width="5.5" stroke-linecap="round"/>`).join('');
  /* beards */
  if(bs==='chin')o+=`<path d="M29 62C31 84 42 90 50 90S69 84 71 62" fill="none" stroke="${hair}" stroke-width="3.2"/>`;
  if(bs==='mutton')o+=`<path d="M29 58C29 74 34 80 42 80L40 70C36 68 33 64 31 58Z M71 58C71 74 66 80 58 80L60 70C64 68 67 64 69 58Z" fill="${hair}"/><path d="M40 76Q50 70 60 76Q56 73 50 74Q44 73 40 76Z" fill="${hair}"/>`;
  if(bs==='longbeard')o+=`<path d="M29 62C30 96 42 118 50 121S70 96 71 62C68 77 60 83 50 83S32 77 29 62Z" fill="${hair}"/><path d="M44 92v18M50 94v22M56 92v18" stroke="${dk(hair)}" stroke-width="1" opacity=".6"/>`;
  if(bs==='braided')o+=`<path d="M45 90v14M55 90v14" stroke="${hair}" stroke-width="5" stroke-linecap="round"/><path d="M42 100h6M52 100h6" stroke="${acc}" stroke-width="2"/>`;
  /* marks */
  const mk=pt.mark;
  if(mk==='freckles')o+=[[38,65],[42,67],[36,68],[60,65],[64,67],[58,68],[40,70],[62,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9" fill="${shade(skin,-0.4)}"/>`).join('');
  if(mk==='mole')o+=`<circle cx="61" cy="73" r="1.2" fill="#2a1a10"/>`;
  if(mk==='kohl')o+=`<path d="M37 56.5Q41 54 45 56.5L48 55M55 56.5Q59 54 63 56.5L66 55" fill="none" stroke="#1a120c" stroke-width="1.3"/>`;
  if(mk==='tears')o+=`<path d="M40 61v8M60 61v8" stroke="#2f4f8a" stroke-width="1.6" stroke-linecap="round"/><circle cx="40" cy="70" r="1.3" fill="#2f4f8a"/><circle cx="60" cy="70" r="1.3" fill="#2f4f8a"/>`;
  if(mk==='cheek')o+=`<path d="M32 66l8 2M32 70l8 2M68 66l-8 2M68 70l-8 2" stroke="${acc}" stroke-width="1.8" stroke-linecap="round"/>`;
  if(mk==='bruise')o+=`<ellipse cx="41" cy="60" rx="5" ry="3.6" fill="#5a3a6a" opacity=".45"/>`;
  /* face pieces */
  const fc=pt.face;
  if(fc==='nosering')o+=`<circle cx="50" cy="71.5" r="2.2" fill="none" stroke="#e8c86a" stroke-width="1.1"/>`;
  if(fc==='goldtooth')o+=`<rect x="48" y="77" width="3" height="2.4" rx=".5" fill="#e8c86a"/>`;
  if(fc==='brow')o+=`<circle cx="64" cy="52" r="1.6" fill="none" stroke="#c9ced4" stroke-width="1"/>`;
  /* earrings */
  const er=pt.ear,covered=['hood','veil','murmillo','provocator','secutor','lion','kerchief','turban'].includes(helm),ex=pt.fem?30:28,ey=pt.fem?71:72;
  if(!covered&&er==='hoop')o+=`<circle cx="${ex}" cy="${ey+2}" r="4" fill="none" stroke="#e8c86a" stroke-width="1.5"/>`;
  if(!covered&&er==='pearl')o+=`<path d="M${ex} ${ey-1}v4" stroke="#e8c86a" stroke-width="1"/><circle cx="${ex}" cy="${ey+5}" r="2.3" fill="#f2efe6" stroke="#b8b0a0" stroke-width=".5"/>`;
  if(!covered&&er==='double')o+=`<circle cx="${ex}" cy="${ey}" r="1.4" fill="#e8c86a"/><circle cx="${ex}" cy="${ey-4}" r="1.2" fill="#e8c86a"/><circle cx="${100-ex}" cy="${ey}" r="1.4" fill="#e8c86a"/>`;
  /* the new headgear, on top */
  if(helm==='plumed')o+=`<path d="M50 32C44 20 44 8 52 2C52 12 62 16 64 30Z" fill="${acc}" stroke="${dk(acc)}"/>${galea}`;
  if(helm==='hoplo')o+=`${galea}<path d="M20 58Q50 52 80 58" stroke="${mt}" stroke-width="4" fill="none"/><path d="M30 40C22 20 26 8 30 4C32 16 34 26 36 38Z M70 40C78 20 74 8 70 4C68 16 66 26 64 38Z" fill="#e8dcc0" stroke="#8a7a5a"/>`;
  if(helm==='secutor')o+=`<path d="M24 62C22 18 78 18 76 62C76 84 64 92 50 92S24 84 24 62Z" fill="${mt}" stroke="${mtd}" stroke-width="1.2"/><circle cx="41" cy="58" r="3" fill="#1a120c"/><circle cx="59" cy="58" r="3" fill="#1a120c"/><path d="M50 21V91" stroke="${mtd}" stroke-width="1.4"/>`;
  if(helm==='phrygian')o+=`<path d="M27 54C24 26 44 16 62 20C74 22 80 30 76 40C72 34 66 32 64 36C70 40 73 48 73 54Z" fill="${acc}" stroke="${dk(acc)}"/><path d="M27 54Q50 46 73 54" fill="none" stroke="${dk(acc)}" stroke-width="3"/>`;
  if(helm==='turban')o+=`<path d="M24 56C18 22 82 22 76 56C70 40 30 40 24 56Z" fill="#e8dcc0" stroke="#a89a78"/><path d="M26 48Q50 34 74 48M28 42Q50 28 72 42" fill="none" stroke="#a89a78" stroke-width="1.4"/><circle cx="50" cy="40" r="3" fill="${acc}" stroke="#8a5a1e"/>`;
  if(helm==='kerchief')o+=`<path d="M25 56C21 26 79 26 75 56C67 43 33 43 25 56Z" fill="${acc}" stroke="${dk(acc)}"/><path d="M73 50l10 8l-7 4z" fill="${dk(acc)}"/>`;
  if(helm==='flowers')o+=`<path d="M27 47Q50 33 73 47" fill="none" stroke="#5f8a3a" stroke-width="2"/>${[29,36,43,50,57,64,71].map((x,i)=>{const y=46-Math.sin(i/6*Math.PI)*8;const c=['#e07b9a','#f2efe6','#e8c86a'][i%3];return `<circle cx="${x}" cy="${y.toFixed(1)}" r="3" fill="${c}"/><circle cx="${x}" cy="${y.toFixed(1)}" r="1" fill="#c9a44a"/>`}).join('')}`;
  if(helm==='goldwreath')o+=`<path d="M26 46Q50 30 74 46" fill="none" stroke="#b8963a" stroke-width="2.6"/>${[30,38,46,54,62,70].map((x,i)=>{const y=44-Math.sin(i/5*Math.PI)*6;return `<ellipse cx="${x}" cy="${y.toFixed(1)}" rx="4" ry="2.3" fill="#e8c86a" stroke="#8a5a1e" stroke-width=".5" transform="rotate(${i<3?-30:30} ${x} ${y.toFixed(1)})"/>`}).join('')}`;
  if(helm==='lion')o+=`<path d="M14 90C4 40 26 14 50 14S96 40 86 90C80 62 68 46 50 46S20 62 14 90Z" fill="#b8862a" stroke="#6b4d17"/>${[20,28,72,80].map((x,i)=>`<path d="M${x} ${60+i%2*10}q${x<50?-6:6} 8 0 16" fill="none" stroke="#8a5a1e" stroke-width="2"/>`).join('')}<path d="M36 30Q50 20 64 30L60 38Q50 32 40 38Z" fill="#c9983a" stroke="#6b4d17"/><ellipse cx="43" cy="30" rx="2" ry="1.4" fill="#2a1a10"/><ellipse cx="57" cy="30" rx="2" ry="1.4" fill="#2a1a10"/>`;
  return o?s.replace(/<\/svg>$/,o+'</svg>'):s}}
/* one random look, with the new pieces in the mix */
function randomPortrait(fem){fem=fem==null?Math.random()<.35:!!fem;const r=p=>Math.random()<p;
  return {skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(HELMS)[0],fem,beard:false,long:false,smile:r(.3),bg:sysBG(),hs:pickOne(HAIRSTYLES)[0],bs:fem?'':(r(.6)?pickOne(BEARDS)[0]:''),eyes:pickOne(EYES)[0],
    mark:r(.4)?pickOne(MARKS)[0]:'',garb:r(.55)?pickOne(GARBS)[0]:'',ear:r(.3)?pickOne(EARRINGS.slice(1))[0]:'',neck:r(.3)?pickOne(NECKS.slice(1))[0]:'',face:r(.12)?pickOne(FACES.slice(1))[0]:''}}
/* the shared look maker: attr names the data attribute each control writes through */
function portraitControlsHTML(pt,attr){pt=pt||{};const sel=(f,opts,v)=>`<select class="tin" ${attr}="${f}">${opts.map(([k,l])=>`<option value="${esc(k??'')}" ${String(v??'')===String(k??'')?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  return `<div class="formgrid lookgrid" style="grid-template-columns:1fr 1fr;margin-top:8px">
   <label>${_T`Skin${sel('skin',SKINS.map((v,i)=>[v,SKIN_NAMES[i]||_T('Tone ')+(i+1)]),pt.skin)}`}</label><label>${_T`Hair${sel('hair',HAIRS.map((v,i)=>[v,HAIR_NAMES[i]||_T('Shade ')+(i+1)]),pt.hair)}`}</label>
   <label>${_T`Headgear${sel('helm',HELMS,pt.helm||'none')}`}</label><label>${_T`Backdrop${sel('bg',BGS.map((v,i)=>[v,BG_NAMES[i]||_T('Backdrop ')+(i+1)]).concat(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F])=>['flag:'+k,'🏳 '+F.n]):[]),pt.bg)}`}</label>
   <label>${_T`Hairstyle${sel('hs',HAIRSTYLES,pt.hs||(pt.long?'long':''))}`}</label><label>${_T`Beard${sel('bs',BEARDS,pt.bs&&pt.bs!=='none'?pt.bs:(pt.beard?'full':''))}`}</label>
   <label>${_T`Eyes${sel('eyes',EYES,pt.eyes||EYES[0][0])}`}</label><label>${_T`Marks${sel('mark',MARKS,pt.mark||'')}`}</label>
   <label>${_T`Garb${sel('garb',GARBS,pt.garb||'')}`}</label><label>${_T`Build${sel('fem',[['',_T('Lanista')],['1',_T('Lanista (woman)')]],pt.fem?'1':'')}`}</label>
   <label>${_T`Earring${sel('ear',EARRINGS,pt.ear===true?'1':pt.ear||'')}`}</label><label>${_T`Neck${sel('neck',NECKS,pt.neck||'')}`}</label>
   <label>${_T`Face${sel('face',FACES,pt.face||'')}`}</label><label>${_T`Expression${sel('smile',[['',_T('Stern')],['1',_T('Grin')]],pt.smile?'1':'')}`}</label></div>`}

/* ---------- the Lanista creator, rebuilt ---------- */
function nmLookRefresh(){const box=document.getElementById('nmPortrait');if(!box||!NEWMGR)return;const p=box.querySelector('.portrait');if(p)p.outerHTML=portraitHTML({name:NEWMGR.name,portrait:NEWMGR.portrait,color:NEWMGR.color},'lg')}
{const _sh=startHTML;startHTML=function(){let h=_sh.apply(this,arguments);try{if(MGR.view==='create'&&NEWMGR){const c=NEWMGR;
    const chars=(CUSTOM.chars||[]).filter(x=>x.portrait);
    const look=`<div class="mbtns"><button class="btn" type="button" data-mg="nmlook">${_T`🎲 Random look`}</button></div>${chars.length?`<label style="display:grid;gap:3px;font-size:12.5px;text-align:left">${_T`Borrow a Studio character’s look`}<select class="tin" data-nmimport="1"><option value="">— choose —</option>${chars.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select></label>`:''}<div style="text-align:left">${portraitControlsHTML(c.portrait,'data-nmpt')}</div></div>`;
    h=h.replace('<div class="mbtns"><button class="btn" type="button" data-mg="nmlook">🎲 Random look</button></div></div>',look);
    const extra=`<div class="formgrid" style="margin-top:8px"><label>${_T`Epithet`}<span style="display:flex;gap:4px"><input class="tin" data-nmx="nick" value="${esc(c.nick||'')}" maxlength="30" placeholder="${_T`e.g. the Iron Purse`}"><button type="button" class="btn" data-nmxa="nick" style="padding:4px 8px" aria-label="${_T`Generate an epithet`}">🎲</button></span></label></div>
     <label style="display:grid;gap:3px;margin-top:6px">${_T`Story`}<textarea class="tin" data-nmx="bio" maxlength="600" placeholder="${_T`How this lanista came to own a ludus…`}">${esc(c.bio||'')}</textarea></label><div class="mbtns" style="margin-top:4px"><button class="btn tksm" type="button" data-nmxa="bio">${_T`🎲 Write a story`}</button></div>`;
    h=h.replace('<p class="rc-sub" style="margin:4px 0 0">🏠 <b>Your home city</b>',extra+'<p class="rc-sub" style="margin:4px 0 0">🏠 <b>Your home city</b>');
    h=h.replace('grid-template-columns:minmax(0,220px) minmax(0,1fr)','grid-template-columns:minmax(0,300px) minmax(0,1fr)')}}catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||typeof NEWMGR==='undefined'||!NEWMGR)return;
  if(t.dataset.nmpt){const f=t.dataset.nmpt;const P=NEWMGR.portrait=NEWMGR.portrait||{};let v=t.value;if(f==='fem'||f==='smile')v=v==='1';
    if(f==='bs'){P.beard=false}if(f==='hs'){P.long=false}if(f==='mark'){P.scar=false;P.paint=false}P[f]=v;nmLookRefresh();return}
  if(t.dataset.nmimport&&t.value){const ch=(CUSTOM.chars||[]).find(x=>x.id===t.value);if(ch){NEWMGR.portrait=JSON.parse(JSON.stringify(ch.portrait||{}));if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}});
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.nmx||typeof NEWMGR==='undefined'||!NEWMGR)return;NEWMGR[t.dataset.nmx]=t.value});
document.addEventListener('click',e=>{if(typeof NEWMGR==='undefined'||!NEWMGR)return;
  const lk=e.target.closest&&e.target.closest('[data-mg="nmlook"]');if(lk){e.stopPropagation();e.preventDefault();NEWMGR.portrait=randomPortrait(NEWMGR.portrait&&NEWMGR.portrait.fem);if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  const b=e.target.closest&&e.target.closest('[data-nmxa]');if(!b)return;
  if(b.dataset.nmxa==='nick'){NEWMGR.nick=genNickname();const i=document.querySelector('[data-nmx="nick"]');if(i)i.value=NEWMGR.nick}
  if(b.dataset.nmxa==='bio'){NEWMGR.bio=lanistaStory(NEWMGR.name||_T('This lanista'),NEWMGR.city);const i=document.querySelector('[data-nmx="bio"]');if(i)i.value=NEWMGR.bio}},true);
function lanistaStory(n,city){const P=pickOne;
  return _T`${n} of ${city||_T('Roma')} ${P([_T('once sold wine to the legions'),_T('was a gladiator who bought the rudis and then the ludus'),_T('inherited the ludus, and its debts, from an uncle'),_T('won the ludus in a game of knucklebones'),_T('kept the books for a senator until the senator fell'),_T('trained horses for the Circus before trading them for fighters')])}. ${P([_T('The house has a leaking roof and a proud gate.'),_T('The barracks are small, the ambitions are not.'),_T('Half the city owes them a favor; the other half owes them coin.'),_T('The old sign still hangs crooked over the door.')])} ${P([_T('They mean to see a fighter win freedom in the Colosseum.'),_T('They want the Superbus trophy on the mantel, whatever it costs.'),_T('They swear no fighter of theirs will die for a bad wager.'),_T('They want the league to learn the name of their house.')])}`}
{const _me=meHTML;meHTML=function(){let h=_me.apply(this,arguments);try{const m=me();if(m&&m.nick)h=h.replace('<p class="rc-sub" style="margin-bottom:0">',`<p class="rc-sub" style="margin-bottom:0"><b>“${esc(m.nick)}”</b> · `)}catch(e){}return h}}
