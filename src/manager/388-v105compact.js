/* =====================================================================
   388-V105COMPACT · v1.05 beta-3 B70 + B71 (his answers Y1a Y2a Y3 Y4a, 2026-10-17). Manager only, LAYOUT ONLY: the same functions,
   buttons, handlers and data attributes — the DOM 373 / 299 / 243 build is moved and restyled after it is built (mgrHTML wrapper, after
   387's project chip). Kill switch localStorage flavius_v105compactoff=1 (373's y1a layout + the tall Armory / Recruiting banners). Test tv105z.
   REPLACES the y1a mock-up's layout (373, approved 2026-10-17): the big banner hours plate, the stacked Doctore / time / intensity block,
   the full-width team drill card, Lock in at the page bottom; and the tall (118 px) Armory and Recruiting banners.
   =====================================================================
   Y1a  THE TRAINING YARD, compact: ONE top band of three blocks (.y105dtop) — the Doctore's face + name + level | Time with him
        (− N h + with the Lv ladder beside it, then the "from the training hours" line + the 📜 Study chip on one line) | the four Intensity
        buttons, shorter, + their note. Blocks top-aligned (no padding above / below the Doctore), the time block takes the free width (no
        gap before Intensity). Then ONE row (.y105dbot): the Team drill card sized to its content (‹ › kept) + the "Who drills" chips filling
        the rest. The squad / own sessions / Trial of the Yard simply move up.
   Y2a  LOCK IN sits in the page banner beside the hours chip: the SAME button (data-y105="lock", 373's one click handler — the banner is
        inside #mgrBody) is moved out of the Tabula; its one-line note becomes the button's title. ↻ Same as last week stays in the Tabula.
   Y3   Trial of the Yard: a disabled run button whose reason is already printed under it (.y105why, e.g. the Beast pen's "Needs 2 hours")
        loses its duplicate title tooltip.
   Y4a  The Armory, Recruiting and Training Yard banners = the slim Infirmary / Roster banner (298's .rm100ban look, 74 px at 1440 px):
        a round face at left (Yard: the Doctore, as before · Recruiting: the Recruiter, replacing 299's corner face .rc1banf · Armory: no
        advisor runs it, so a 🛡 medallion), title + ONE line, the counters as chips at the right: the Yard's .y105hrs plate becomes a
        compact chip (.y105big kept) with Lock in beside it, Recruiting's hours box and the Armory's shelf box are .roomstat chips in the
        Roster's rm100cnt style (still shown on phones). 387's building-project chip (.bp104c) stays in the banner, before the counters.
   Review round: the time block is two columns (− N h + over the Study chip | the Lv ladder over its two lines) and Intensity is 310 px,
        so the band has no empty strip under Intensity; once locked, the banner's 🔒 Locked in takes the Tabula's note as its title (no
        orphan note); the Armory title drops its own 🛡 (the medallion is it); phones: Armory / Recruiting keep ONE row (the counter's
        number only, its label as the chip's title; a project chip wraps under).
   Phones: the Yard banner wraps (face + title, then the chips + Lock in), so Lock in stays in the first screen. Static DOM, no animation.
   ===================================================================== */
function cp105On(){try{return localStorage.getItem('flavius_v105compactoff')!=='1'}catch(e){return true}}
/* Y1a + Y2a + Y3: the Yard */
function cp105Yard(R){const root=R.querySelector('#mgrPane .y105');if(!root)return false;root.classList.add('cp105');
  const tm=root.querySelector('.y105doc .y105time');
  if(tm&&!tm.querySelector('.cp105tr')){const row=tm.querySelector(':scope>.y105row'),lad=tm.querySelector(':scope>.y105lads');
    if(row&&lad){const tr=document.createElement('div');tr.className='cp105tr';row.before(tr);
      /* left: − N h + with the Study chip under it · right: the Lv ladder with its lines under it (no empty strip under Intensity) */
      const ts=document.createElement('div');ts.className='cp105ts';const tl=document.createElement('div');tl.className='cp105tl';tr.append(ts,tl);
      const rest=[...tm.children].filter(x=>x!==tr&&x!==row&&x!==lad&&!x.classList.contains('y105cap'));
      ts.append(row,...rest.filter(x=>x.classList.contains('y105mini')));tl.append(lad,...rest.filter(x=>!x.classList.contains('y105mini')))}}
  /* Y3: the reason is already printed under the button */
  for(const t of root.querySelectorAll('.y105trial'))if(t.querySelector('.y105why'))for(const b of t.querySelectorAll('.y105run[title]'))b.removeAttribute('title');
  return true}
/* Y4a: the slim banner (+ Y2a Lock in for the Yard) */
function cp105Ban(R,tab){if(typeof rm100On!=='function'||!rm100On())return false;
  const hd=R.querySelector('#mgrPane .roomhd, .railmain>.roomhd');if(!hd)return false;
  hd.classList.add('rm100ban','cp105ban');
  for(const x of hd.querySelectorAll('.rc1banf'))x.remove();
  if(!hd.querySelector('.rm100rd')){let f='';
    if(tab==='recruit'){const A=typeof rm100Adv==='function'?rm100Adv('recruiter',52):null;if(A)f=`<span class="rm100rd rm100adv" title="${esc(A.a.name+' · '+A.a.role)}">${A.f}</span>`}
    else if(tab==='armory')f='<span class="rm100rd rm100adv cp105md" aria-hidden="true">🛡</span>';
    if(f)hd.insertAdjacentHTML('afterbegin',f)}
  /* the Armory's medallion is its 🛡: the title does not repeat it */
  if(tab==='armory'){const tb=hd.querySelector('.roomttl b'),tx=tb&&tb.firstChild;if(tx&&tx.nodeType===3)tx.nodeValue=tx.nodeValue.replace(/^\s*\u{1F6E1}\uFE0F?\s*/u,'')}
  if(tab!=='practice')hd.classList.add('cp105one');
  for(const st of hd.querySelectorAll(':scope>.roomstat')){st.classList.add('rm100cnt','cp105c');
    /* phones show the number only: its label stays readable on a long press / hover */
    const lb=st.querySelector(':scope>span');if(lb&&!st.title&&tab!=='practice')st.title=lb.textContent.trim()}
  const cnt=hd.querySelector(':scope>.y105hrs, :scope>.roomstat');
  if(tab==='practice'){const lk=R.querySelector('#mgrPane .y105tab [data-y105="lock"]');const hrs=hd.querySelector(':scope>.y105hrs');
    if(lk&&hrs){const acts=lk.closest('.y105acts');hd.appendChild(lk);
      const s=acts&&acts.querySelector(':scope>.y105sub');lk.title=s?s.textContent.trim():_T('Locks sessions, the Doctore\'s time, intensity and the drill.');if(s)s.remove()}}
  const bp=hd.querySelector(':scope>.bp104c');if(bp&&cnt)cnt.before(bp);
  return true}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!cp105On()||typeof h!=='string'||MGR.view)return h;const tab=MGR.tab;if(tab!=='practice'&&tab!=='armory'&&tab!=='recruit')return h;
  if(h.indexOf('roomhd')<0&&h.indexOf('y105')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;let ch=false;
  if(tab==='practice'&&typeof y105Live==='function'&&y105Live())ch=cp105Yard(R)||ch;
  ch=cp105Ban(R,tab)||ch;
  if(!ch)return h;const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- the look ---------- */
(()=>{if(typeof document==='undefined'||document.getElementById('cp105css'))return;const st=document.createElement('style');st.id='cp105css';st.textContent=`
#mgrBody .roomhd.cp105ban{position:relative;min-height:74px;height:auto;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:8px 14px 8px 12px;overflow:hidden;border:1px solid #6b5236;border-radius:8px;box-shadow:inset 0 0 0 2px #e2c88e33,inset 0 0 0 3px #8a2a1a66,0 3px 10px #0008;margin-bottom:8px;box-sizing:border-box}
#mgrBody .roomhd.cp105ban .rm100bimg{position:absolute;inset:0;z-index:0}
#mgrBody .roomhd.cp105ban .rm100bimg img,#mgrBody .roomhd.cp105ban>img.lu2ban{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 60%}
#mgrBody .roomhd.cp105ban::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,#140c07d0 0,#140c0790 34%,#140c0700 60%,#140c0780 100%)}
#mgrBody .roomhd.cp105ban>svg{position:absolute;inset:0;width:100%;height:100%;z-index:0}
#mgrBody .roomhd.cp105ban>.lu2bsh{display:none}
#mgrBody .roomhd.cp105ban>*:not(.rm100bimg):not(img):not(svg){position:relative;z-index:2}
#mgrBody .roomhd.cp105ban .rm100adv{flex:none;width:54px;height:54px}
#mgrBody .roomhd.cp105ban .cp105md{background:radial-gradient(circle at 50% 35%,#7a5a34,#2a1d12);font-size:28px;line-height:1}
#mgrBody .roomhd.cp105ban .roomttl{position:relative;inset:auto;transform:none;flex:1 1 220px;min-width:0;max-width:none;padding:0;margin:0;background:none;text-align:left}
#mgrBody .roomhd.cp105ban .roomttl b{display:block;font:400 23px var(--display);letter-spacing:.05em;color:#fff3d6;text-shadow:0 2px 4px #000,0 0 12px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mgrBody .roomhd.cp105ban .roomttl span{display:block;font-size:13px;color:#f3e3bd;text-shadow:0 1px 3px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mgrBody .roomhd.cp105ban .bp104c{flex:0 1 auto;margin:0;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#mgrBody .roomhd.cp105ban .roomstat.rm100cnt{position:relative;inset:auto;top:auto;right:auto;left:auto;transform:none;flex:none;display:grid;justify-items:end;align-content:center;gap:0;width:auto;height:auto;min-height:0;max-height:52px;box-sizing:border-box;background:#1a120de0;border:1px solid #c9a458;border-radius:6px;padding:4px 12px;margin:0 0 0 auto;text-align:right;min-width:92px;max-width:100%;box-shadow:none;cursor:default}
#mgrBody .roomhd.cp105ban .roomstat.rm100cnt .ptbox,#mgrBody .roomhd.cp105ban .roomstat.rm100cnt .ptbox.on{all:unset;font:400 21px var(--display);color:#b9e39a!important;line-height:1.1;background:none!important;box-shadow:none!important;min-width:0;height:auto;padding:0}
#mgrBody .roomhd.cp105ban .roomstat.rm100cnt .ptbox small{font-size:13px;color:#c9a44a}
#mgrBody .roomhd.cp105ban .roomstat.rm100cnt>span{font:11px var(--mono);color:#cbb593;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#mgrBody .roomhd.cp105ban .roomstat.rm100cnt .hpips{display:none}
#mgrBody .roomhd.cp105ban .y105hrs{position:relative;z-index:2;flex:none;margin-left:auto;display:grid;justify-items:end;gap:0;padding:4px 12px;min-width:92px;box-sizing:border-box;border:1px solid #c9a458;border-radius:6px;background:#1a120de0}
#mgrBody .roomhd.cp105ban .y105hrs>.y105cap{order:2;font:11px var(--mono,monospace);letter-spacing:0;text-transform:none;color:#cbb593;white-space:nowrap}
#mgrBody .roomhd.cp105ban .y105hrs .y105big{font:400 21px/1.1 var(--display,serif);color:#b9e39a}
#mgrBody .roomhd.cp105ban .y105hrs .y105of{font:400 13px var(--display,serif);color:#c9a44a}
#mgrBody .roomhd.cp105ban>.y105lock{position:relative;z-index:2;flex:none;min-height:44px;max-height:52px;padding:0 18px;border-radius:8px;font-size:18px;white-space:nowrap}
.y105.cp105{gap:10px}
.y105.cp105 .y105doc{gap:10px;padding:10px 14px}
.y105.cp105 .y105dtop{gap:10px 16px;align-items:flex-start}
.y105.cp105 .y105who{flex:0 1 250px;align-items:flex-start;gap:10px}
.y105.cp105 .y105face{width:52px;height:52px;font-size:28px;border-width:2px}
.y105.cp105 .y105who .y105nm{font-size:20px}
.y105.cp105 .y105time{flex:2 1 400px;gap:5px}
.y105.cp105 .cp105tr{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px 14px}
.y105.cp105 .cp105ts{flex:none;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.y105.cp105 .cp105tr .y105row{flex:none;gap:8px}
.y105.cp105 .cp105tr .y105lads{min-width:0;gap:4px}.y105.cp105 .y105lad{font-size:11px;padding:1px 7px}
.y105.cp105 .y105step{width:36px;height:36px;font-size:20px}
.y105.cp105 .y105dh{min-width:58px;font-size:18px}.y105.cp105 .y105dh .y105big{font-size:34px}
.y105.cp105 .cp105tl{flex:1 1 200px;display:flex;flex-direction:column;gap:3px;min-width:0}
.y105.cp105 .cp105ts .y105mini{min-height:28px;padding:2px 8px;font-size:12px;max-width:100%;white-space:normal}.y105.cp105 .cp105tl .y105sub{font-size:12.5px;line-height:1.3}
.y105.cp105 .y105int{flex:0 1 310px;gap:5px}
.y105.cp105 .y105segs{gap:5px}.y105.cp105 .y105seg{min-height:38px;padding:2px 3px}.y105.cp105 .y105seg small{font-size:10.5px;line-height:1.15;white-space:normal;overflow:visible;text-overflow:clip;text-align:center;overflow-wrap:anywhere}
.y105.cp105 .y105dbot{gap:10px 20px;padding-top:10px;align-items:flex-start}
.y105.cp105 .y105drill{flex:0 1 auto;gap:8px}
.y105.cp105 .y105dt{flex:0 1 auto;width:430px;max-width:100%;box-sizing:border-box;padding:6px 8px}
.y105.cp105 .y105dt .y105art{width:96px}.y105.cp105 .y105dt .y105art>.rm100fr{height:66px}.y105.cp105 .y105dt .y105ic{width:66px;height:66px;font-size:32px}
.y105.cp105 .y105dt .y105nm{font-size:20px}
.y105.cp105 .y105arr{width:40px;height:40px}
.y105.cp105 .y105whod{flex:1 1 260px;gap:6px}
@container y105 (max-width:620px){.y105.cp105 .y105who,.y105.cp105 .y105int{flex:1 1 100%}.y105.cp105 .y105drill{flex:1 1 100%}.y105.cp105 .y105dt{flex:1 1 auto;width:auto}}
@media (max-width:760px){#mgrBody .roomhd.cp105ban{gap:6px 10px;padding:8px 10px}#mgrBody .roomhd.cp105ban .roomttl{flex:1 1 calc(100% - 70px)}
  #mgrBody .roomhd.cp105ban .y105hrs{order:0;flex:0 0 auto;margin-left:0;display:grid;justify-items:start;align-items:start;gap:0;padding:3px 10px}
  #mgrBody .roomhd.cp105ban .y105hrs .y105big{font-size:20px}
  #mgrBody .roomhd.cp105ban .roomstat.rm100cnt{display:grid;margin-left:0;justify-items:start;text-align:left}
  #mgrBody .roomhd.cp105ban>.y105lock{flex:1 1 120px;min-height:42px;font-size:17px}}
@media (max-width:600px){#mgrBody .roomhd.cp105ban.cp105one .roomttl{flex:1 1 0;min-width:110px}
  #mgrBody .roomhd.cp105ban.cp105one .roomstat.rm100cnt{order:1;flex:none;min-width:0;padding:3px 10px;margin-left:auto;justify-items:end;text-align:right}
  #mgrBody .roomhd.cp105ban.cp105one .roomstat.rm100cnt .ptbox{font-size:18px}#mgrBody .roomhd.cp105ban.cp105one .roomstat.rm100cnt>span{display:none}
  #mgrBody .roomhd.cp105ban.cp105one .bp104c{order:2;flex:1 1 100%}
  #mgrBody .roomhd.cp105ban{min-height:62px}#mgrBody .roomhd.cp105ban .roomttl b{font-size:19px}#mgrBody .roomhd.cp105ban .rm100adv{width:44px;height:44px}#mgrBody .roomhd.cp105ban .cp105md{font-size:22px}}
`;document.head.appendChild(st)})();
