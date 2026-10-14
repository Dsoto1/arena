/* =====================================================================
   131-V83COUNCIL · v0.83 — the Manager council: six advisors with faces (Virgilante)
   =====================================================================
   1. THE SIX — COUNCIL83 = the roles in order: Consilium (strategy), Recruiter (the ★ pick on the recruiting board),
      Doctore (Training Yard), Medicus (the ward), Clerk (money and contracts), Barracks master (the fighters' asks).
      council83Make(id) rolls a council from a hash of the career id (hashStr — never the dice RNG): Roman names from
      NAMEBANK (14-names; six different praenomina and cognomina, a woman now and then with a feminine cognomen), a
      face look for specFaceSVG (16-crowd; the spectator / patron face maker 127-v82onl reuses) in the role's colours.
      Stored on the world: w.council83 = [{k,name,role,spec,face}]. Fixed for life: no re-roll, never poached (the
      hired house medicus w.medicus76 stays a separate hire).
   2. OLD CAREERS — council83Ensure(w) fills a missing council (idempotent; same career → same council). Called by
      newWorld and mgrMigrate wrappers and lazily by the renders; it never writes the Store itself — the next saveWorld
      carries it. SAVE_MIGRATIONS '0.83' does the same.
   3. LETTERS — advisor83(letter) maps a letter's sender (L.adv, else ADV_FROM83 on L.from: 'the Consilium',
      'your doctores', 'your clerk', 'your barracks'). An OPENED letter shows the advisor's face, name and title at the
      top of its body (mailPanelHTML wrapper, .adv83); closed envelopes are untouched. Rival houses, free agents,
      Sica, the capital, rumours, crowds keep their own voices.
   4. THE COUNCIL CARD — council83HTML(): Your ludus, after the week's guide + checklist row (.landing), else after the
      mail: six faces with name, title and a one-line specialty (#council83, .c83p). Phone width: two columns.
   ===================================================================== */
const COUNCIL83=[
  {k:'consilium',role:_T('Consilium'),spec:_T('Strategy: when to fight, when to hold back'),robe:'#7a2230',hats:['wreath','','wreath'],old:true},
  {k:'recruiter',role:_T('Recruiter'),spec:_T('Scouts free agents; the ★ pick on the board'),robe:'#a86a2a',hats:['straw','','pileus']},
  {k:'doctore',role:_T('Doctore'),spec:_T('Drills, growth and the Training Yard'),robe:'#8a3b1c',hats:['helm','','helm']},
  {k:'medicus',role:_T('Medicus'),spec:_T('Wounds, rest and the ward'),robe:'#35606a',hats:['','hood',''],fem:true},
  {k:'clerk',role:_T('Clerk'),spec:_T('Purse, wages and contracts'),robe:'#c9b27a',hats:['pileus','','turban'],fem:true},
  {k:'barracks',role:_T('Barracks master'),spec:_T("The fighters' moods and requests"),robe:'#5a4636',hats:['','hood','']}];
/* who signs which letter (lower-case sender) */
const ADV_FROM83={'the consilium':'consilium','your doctores':'doctore','your doctore':'doctore','your clerk':'clerk','your barracks':'barracks','your medicus':'medicus','your recruiter':'recruiter'};
const femCog83=c=>/us$/.test(c)?c.slice(0,-2)+'a':/o$/.test(c)?c+'nia':c;
function council83Make(id){let h=hashStr('council83:'+(id||'x'));const nx=n=>{h=Math.imul(h^(h>>>15),2246822519)>>>0;h=(h+0x9e3779b9)>>>0;return h%n};
  const usedP=new Set(),usedC=new Set();const pick=(arr,used)=>{for(let i=0;i<40;i++){const x=arr[nx(arr.length)];if(!used.has(x)){used.add(x);return x}}return arr[nx(arr.length)]};
  return COUNCIL83.map(R=>{const fem=!!R.fem&&nx(3)===0;const prae=pick(fem?NAMEBANK.praeF:NAMEBANK.prae,usedP);let cog=pick(NAMEBANK.cog,usedC);if(fem)cog=femCog83(cog);
    const hairI=R.old&&nx(3)?8+nx(2):nx(8);const face={skin:SKINS[nx(SKINS.length)],hair:HAIRS[hairI],beard:!fem&&nx(5)<3,long:fem||nx(6)===0,fem,hat:R.hats[nx(R.hats.length)],tunic:'#e8dcc0',robe:R.robe};
    return {k:R.k,name:`${prae} ${cog}`,role:R.role,spec:R.spec,face}})}
function council83Ensure(w){if(!w||typeof w!=='object')return w;if(!Array.isArray(w.council83)||w.council83.length!==COUNCIL83.length)w.council83=council83Make(w.id);return w}
const council83=w=>(council83Ensure(w),w&&w.council83||[]);
SAVE_MIGRATIONS.push(['0.83',w=>{council83Ensure(w)}]);
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{council83Ensure(W_())}catch(e){console.error(e)}return r}}
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads)council83Ensure(o)}catch(e){console.error(e)}return o}}
/* the face at any size (specFaceSVG draws 20 px) */
const face83=(a,sz)=>{try{if(!FACE99.off)return face99Spect(a.face,{px:sz})}catch(e){}return specFaceSVG(a.face).replace('width="20" height="20"',`width="${sz}" height="${sz}"`)}; /* v0.99: 263 one face (the bust cropped) */
function advisor83(L){const w=W_();if(!w||!L)return null;const k=L.adv||ADV_FROM83[String(L.from||'').trim().toLowerCase()];return k?council83(w).find(a=>a.k===k)||null:null}
const adv83Head=a=>`<div class="adv83"><span class="adv83f">${face83(a,46)}</span><span class="adv83n"><b>${esc(a.name)}</b><small>${esc(a.role)}</small></span></div>`;
/* opened letters: the advisor's face beside their name, inside the body only (the envelope's summary stays as it was) */
{const base=mailPanelHTML;mailPanelHTML=function(live){try{if(live&&Array.isArray(live.items)){const items=live.items.map(it=>{const a=it.letter?advisor83(it.letter):null;return a?{...it,html:adv83Head(a)+it.html}:it});live={...live,items}}}catch(e){console.error(e)}
  return base.call(this,live)}}
/* the council card */
function council83HTML(){const w=W_();if(!w)return '';const C=council83(w);if(!C.length)return '';
  return `<div class="card2 council83" id="council83"><div class="c83hd">${_T`<b>🏛 The Council</b>`}<span class="rc-sub">${_T`your advisors, for life`}</span></div><div class="c83row">${C.map(a=>`<div class="c83p" data-c83="${a.k}"><span class="c83f">${face83(a,58)}</span><b>${esc(a.name)}</b><span class="c83r">${esc(a.role)}</span><small>${esc(a.spec)}</small></div>`).join('')}</div></div>`}
{const base=ludusTabHTML;ludusTabHTML=function(){const h=base.apply(this,arguments);try{const c=council83HTML();if(!c)return h;const t=document.createElement('template');t.innerHTML=h;
  const kids=[...t.content.children];const after=kids.find(e=>e.classList.contains('landing'))||kids.find(e=>e.id==='mailBox');const t2=document.createElement('template');t2.innerHTML=c;
  if(after)after.after(t2.content);else t.content.appendChild(t2.content);return t.innerHTML}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.mail .mbody .adv83{display:flex;align-items:center;gap:10px;margin:2px 0 8px;padding:0 0 7px;border-bottom:1px solid #8a6a3a55}
.adv83f{flex:none;width:50px;height:50px;border-radius:50%;border:2px solid #b8913f;background:radial-gradient(circle at 50% 35%,#f4ead6,#d9c49a);box-shadow:0 1px 3px #0005;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.adv83f svg{display:block}.adv83n{display:flex;flex-direction:column;min-width:0;line-height:1.25}
.mail .mbody .adv83n b{font:600 15px Georgia,serif;color:#2a1d12}.mail .mbody .adv83n small{font-size:12px;color:#6a4a22;font-style:italic}
.council83{border-color:#6a5130;margin:10px 0}.c83hd{display:flex;gap:10px;align-items:baseline;margin-bottom:8px}.c83hd b{font:400 19px var(--display);color:var(--gold2)}
.c83row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.c83p{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:8px 6px 9px;border:1px solid #6a513088;border-radius:8px;background:linear-gradient(#c9a45812,transparent 60%),var(--panel2,#2a2119);min-width:0}
.c83f{width:62px;height:62px;border-radius:50%;border:2px solid #c9a458;background:radial-gradient(circle at 50% 35%,#5a4636,#2a2119);box-shadow:0 0 0 3px #c9a45822,0 2px 5px #0007;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;margin-bottom:4px}
.c83f svg{display:block}.c83p b{font:600 13px Georgia,serif;color:var(--bone,#eadfc8);overflow-wrap:anywhere}
.c83r{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold2,#d6ab4c)}.c83p small{font-size:11.5px;line-height:1.3;color:var(--muted,#b3a58a)}
@media (max-width:1000px){.c83row{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:600px){.c83row{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.c83f{width:50px;height:50px}.c83f svg{width:46px;height:46px}.c83p{padding:6px 4px 7px}}
`;document.head.appendChild(st)}
