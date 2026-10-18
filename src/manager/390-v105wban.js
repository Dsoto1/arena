/* =====================================================================
   390-V105WBAN · v1.05 B73 (his answers L1a L2a, 2026-10-17). Manager only, LAYOUT ONLY: the Lanista tab (MGR.tab 'me') and the five World tabs
   (290-v100world: news, league, imp, trophy, sched) get the SAME slim banner the Training Yard / Armory / Recruiting got in 388-v105compact
   (.cp105ban: 74 px at 1440 px, round face at left, title + ONE line, the numbers as chips at the right). 388's CSS is reused (the banner
   carries .cp105ban); this module only re-homes the painted banners' parts after 290 built them. Kill switch localStorage flavius_v105wbanoff=1
   (today's painted banners). Test tv105ab.
   REPLACES the v1.0 World painted banners (his W picks 2026-10-11; 118 px tall, title top-left, counters floating at the right): the League
   podium (231 lp96Podium) and the Tituli trophy plinths (wd100TroBest) lived in them.
   - every tab: the banner keeps .roomhd.b73.b73-<tab> + .roomttl (95's banner tests) and its data-* / handlers (the League's Season / Superbus /
     Bracket buttons stay in .kick); the round icon (.wd100ico) is the face (the Lanista: your own portrait); the title stays the h2, the old
     one-line subtitle (.sub) is the ONE line; the painted picture stays behind; the old "World · X" eyebrow text goes (the rail names the group).
   - L1a League: the podium becomes three chips 🥇🥈🥉 = the house parma (290 parma100) + short house name + league points (title = the prize
     line, as the podium had). The Superbus cup was the podium's decoration: it goes with it.
   - L2a Tituli: the earned-trophy plinths become up to 4 small trophy icons (trophySVG, 22 px; cups first, as wd100TroBest) + an "N of M
     earned" chip; nothing earned = "Your first honour awaits" is the one line. The laurel ring "ALL n" is a gold "N of N" chip.
   - News / Imperium / Season: their counters (.wd100bc) become the chips of 388's style. Lanista: face + title + line; 317's perk-points counter, when there are points, is a chip.
   Phones: the chips wrap under the title, no sideways scroll. Static DOM, no animation.
   ===================================================================== */
function wb105On(){try{return localStorage.getItem('flavius_v105wbanoff')!=='1'}catch(e){return true}}
const WB105_TABS=['news','league','imp','trophy','sched','me'];
function wb105Chip(num,lab,cls){return `<div class="roomstat rm100cnt cp105c${cls?' '+cls:''}"><div class="ptbox on">${num}</div><span>${lab}</span></div>`}
/* "Ludus Severianus" -> "Severianus" */
function wb105Short(m){return String(m&&m.ludus||'').replace(/^\s*Ludus\s+/i,'').trim()||String(m&&m.ludus||'')}
function wb105Ban(R,k){const hd=R.querySelector('.roomhd.b73-'+k);if(!hd)return false;if(k!=='me'&&!hd.classList.contains('wd100ban'))return false;
  hd.classList.add('cp105ban','wb105','wb105-'+k);
  const tt=hd.querySelector(':scope>.roomttl');
  if(k==='me'){
    /* the painted picture was the title's inline background: it goes behind the banner */
    const bg=tt&&tt.style.backgroundImage;
    if(tt&&bg){tt.style.backgroundImage='';tt.removeAttribute('style');const p=document.createElement('span');p.className='rm100bimg wb105pic';p.setAttribute('aria-hidden','true');p.style.backgroundImage=bg;hd.insertBefore(p,hd.firstChild)}
    {const tb=tt&&tt.querySelector('b'),tx=tb&&tb.firstChild;if(tx&&tx.nodeType===3)tx.nodeValue=tx.nodeValue.replace(/^\s*\u{1F464}\uFE0F?\s*/u,'')}
    /* 317's unspent-perk-points counter (the .roomstat) is a chip like the others */
    for(const st of hd.querySelectorAll(':scope>.roomstat'))st.classList.add('rm100cnt','cp105c');
    let pm=null;try{pm=me()}catch(e){}
    if(pm&&tt&&typeof mgrPortrait==='function'){const f=document.createElement('span');f.className='rm100rd rm100adv wb105f';f.innerHTML=mgrPortrait(pm,'sm');tt.before(f)}
    return true}
  const pic=hd.querySelector(':scope>.pic');if(pic)pic.classList.add('rm100bimg');
  const ico=hd.querySelector('.wd100ico');if(ico&&tt)tt.before(ico);
  const rt=hd.querySelector(':scope>.wd100rt');const w=W_(),sub=hd.querySelector('.wd100tt .sub');
  /* the counters (News, Imperium, Season, Tituli) become 388's chips */
  if(rt)for(const bc of rt.querySelectorAll('.wd100bc')){const b=bc.querySelector('b'),s=bc.querySelector('small');
    const c=document.createElement('div');c.className='roomstat rm100cnt cp105c';const pb=document.createElement('div');pb.className='ptbox on';pb.textContent=b?b.textContent:'';const sp=document.createElement('span');sp.textContent=s?s.textContent:'';c.append(pb,sp);bc.replaceWith(c)}
  if(k==='league'&&rt){const Ls=leagueSort(w.mgrs),n=Ls.length;const MD=['\u{1F947}','\u{1F948}','\u{1F949}'];let h='';
    for(let i=0;i<3;i++){const m=Ls[i];if(!m)continue;const sp=msp(m);
      h+=`<div class="roomstat rm100cnt cp105c wb105med${m.isPlayer?' me':''}" title="${esc(lp96Tip(i+1,n))}" tabindex="0"><span class="wb105m" aria-hidden="true">${MD[i]}</span>${parma100(m,24)}<span class="wb105n">${esc(wb105Short(m))}</span><b class="wb105p">${sp.pts}<small> ${_T('pts')}</small></b></div>`}
    rt.innerHTML=h;if(sub)sub.title=sub.textContent}
  if(k==='trophy'&&rt){const old=hd.querySelector(':scope>.wd100tro');if(old)old.remove();
    const T2=tit100Mgr(),nw=T2.filter(x=>x.won).length;const show=wd100TroBest(w).slice(0,4);let h='';
    if(show.length)h+=`<span class="wb105tro">${show.map(id=>{const d=trophyDef(id);return d?`<span class="wd100pl" title="${esc(d.name)}"><span class="tr">${trophySVG(d,22)}</span></span>`:''}).join('')}</span>`;
    h+=`<div class="roomstat rm100cnt cp105c wb105of${nw===T2.length&&nw>0?' all':''}"${nw===T2.length&&nw>0?` title="${esc(_T`Every trophy earned`)}"`:''}><div class="ptbox on">${nw}<small> ${_T('of')} ${T2.length}</small></div><span>${_T('earned')}</span></div>`;
    rt.innerHTML=h;if(!nw&&sub)sub.textContent=_T('Your first honour awaits')}
  return true}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  const k=MGR.tab;if(!wb105On()||typeof h!=='string'||!WB105_TABS.includes(k)||h.indexOf('b73-'+k)<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;if(!wb105Ban(R,k))return h;
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- the look: 388's slim banner (.cp105ban) does the frame; these are the World banners' own parts ---------- */
(()=>{if(typeof document==='undefined'||document.getElementById('wb105css'))return;const st=document.createElement('style');st.id='wb105css';
const P='#mgrBody .roomhd.cp105ban.wb105 ';
st.textContent=`
${P.trim()}{margin:0;border-radius:9px 9px 0 0;border-bottom:2px solid #b0843a}
${P}.pic{position:absolute;inset:0;z-index:0}
${P}.wd100shade{display:none}
${P}.roomttl b span{display:inline;font:inherit;color:inherit;text-shadow:inherit;white-space:inherit;overflow:visible}
${P}.wb105pic{background:#2a1d12 center 40%/cover no-repeat;filter:sepia(.18) saturate(.95)}
${P}.wd100ico,${P}.wb105f{position:relative;flex:none;width:54px;height:54px;border-radius:50%;display:grid;place-items:center}
${P}.wd100ico svg{position:static;width:30px;height:30px}
${P}.wb105f{overflow:hidden}
${P}.roomttl.wd100tt{display:block;left:auto;top:auto}
${P}.wd100tt>div{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:12px;align-items:center;min-width:0}
${P}.wd100tt h2{grid-column:1;grid-row:1;font:400 23px/1.2 var(--display);letter-spacing:.05em;color:#fff3d6;text-shadow:0 2px 4px #000,0 0 12px #000;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
${P}.wd100tt .kick{grid-column:2;grid-row:1;font-size:0;margin:0;display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-width:0}
${P}.wd100tt .kick>*{font-size:13px;margin:0}
${P}.wd100tt .sub{grid-column:1/-1;grid-row:2;display:block;margin:0;font:13px var(--sans,inherit);font-style:normal;color:#f3e3bd;text-shadow:0 1px 3px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${P}.wd100rt{position:relative;inset:auto;transform:none;flex:none;margin:0 0 0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;max-width:100%;z-index:2}
${P}.wd100rt .roomstat.rm100cnt{margin:0;max-width:260px}
${P}.roomstat.wb105med{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:flex-start;gap:6px;max-height:none;padding:4px 10px;min-width:0;max-width:210px;text-align:left}
${P}.roomstat.wb105med.me{border-color:#ffe08a;box-shadow:0 0 0 1px #ffe08a88}
${P}.roomstat.wb105med .wb105m{font-size:18px;line-height:1}
${P}.roomstat.wb105med .wd100par{flex:none}
${P}.roomstat.wb105med .wb105n{font:400 14px var(--display);color:#fff3d6;max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${P}.roomstat.wb105med .wb105p{font:400 18px var(--display);color:#b9e39a!important;white-space:nowrap;background:none!important;border:0;box-shadow:none;border-radius:0;padding:0;min-width:0;height:auto;display:inline}
${P}.roomstat.wb105med .wb105p small{font:11px var(--mono);color:#c9a44a!important;background:none!important}
${P}.wb105tro{display:inline-flex;align-items:center;gap:4px}
${P}.wb105tro .wd100pl{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#1a120de0;border:1px solid #c9a458}
${P}.wb105tro .tr{display:block;line-height:0}
${P}.wb105tro svg{width:22px;height:22px;display:block;filter:none}
${P}.roomstat.wb105of.all{border-color:#ffe08a;box-shadow:0 0 0 1px #ffe08a88}
@media (max-width:760px){${P}.wd100tt h2{font-size:20px}${P}.roomttl.wd100tt{flex:1 1 calc(100% - 70px)}${P}.wd100rt{flex:1 1 100%;justify-content:flex-start;margin:0}${P}.wd100rt .roomstat.rm100cnt{display:grid;margin:0;justify-items:start;text-align:left;min-width:0;padding:3px 10px}${P}.wd100rt .roomstat.wb105med{display:flex;flex-direction:row;justify-items:unset}${P}.wd100ico{display:grid}}
@media (max-width:600px){${P}.wd100ico,${P}.wb105f{width:44px;height:44px}${P}.wd100ico svg{width:24px;height:24px}${P}.roomstat.wb105med .wb105n{display:none}${P}.roomstat.wb105med .wb105p small{display:none}${P}.roomstat.wb105med{padding:3px 8px;gap:4px}${P}.roomstat.wb105med .wb105m{font-size:15px}${P}.wd100rt .roomstat.rm100cnt .ptbox{font-size:18px}${P}.wd100rt .roomstat.rm100cnt:not(.wb105med)>span{display:inline}}
`;document.head.appendChild(st)})();
