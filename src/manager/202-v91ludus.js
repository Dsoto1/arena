/* 202-v91ludus — v0.91 Your ludus layout (his marked screenshot 2026-10-06):
   • the week's checklist moves up beside the mail: one row, two even columns (.lrow91);
   • 📜 Read the Acta Diurna sits at the top right of the mail header;
   • "Week N in review" becomes a letter at the top of the mail (Report · from your clerk), its results + losses inside;
     the first week's welcome becomes a letter too (open);
   • the review's numbers (treasury, fame, wins/bouts, fallen) move into the banner as one thin row (.lst91).
   A final mgrHTML wrapper reshapes the finished HTML (all earlier wrappers have run); nothing else changes. */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view||MGR.tab!=='ludus')return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  const mail=R.querySelector('#mailBox'),land=R.querySelector('.landing');if(!mail||!land)return h;
  const rev=land.querySelector('.revbox'),todo=land.querySelector('.wkcheck,.todobox');
  /* the Acta button → the mail header */
  const acta=rev&&rev.querySelector('[data-mg="paper"]');const hd=mail.querySelector('.mailhd');
  if(acta&&hd){acta.classList.add('tksm','acta91');acta.style.marginTop='';const sm=acta.querySelector('small');if(sm)sm.remove();hd.appendChild(acta)}
  /* the numbers → the banner */
  const nums=rev&&rev.querySelector('.chron.mini');const ban=R.querySelector('.roomhd.b73-ludus .roomttl');
  if(nums&&ban){const row=document.createElement('div');row.className='lst91';row.innerHTML=[...nums.querySelectorAll('.stat')].map(s=>`<span>${s.innerHTML}</span>`).join('');ban.appendChild(row);nums.remove()}
  /* the review (or the welcome) → a letter at the top of the mail */
  if(rev){const sect=rev.querySelector(':scope > .sect');if(sect)sect.remove();
    const welcome=!w.review;const Rv=w.review;const title=welcome?_T`Welcome to ${esc(me().ludus)}`:_T`Week ${RN(((Rv.wk-1)%12)+1)} in review · season ${RN(Rv.season)}`;const d=document.createElement('details');d.className='mail report rev91';if(welcome)d.open=true;
    d.innerHTML=`<summary><span class="lseal">${welcome?'👋':'📅'}</span><b>${title}</b><span class="rc-sub">${welcome?_T('Letter · from your council'):_T('Report · from your clerk')}</span></summary><div class="mbody">${rev.innerHTML}</div>`;
    let ml=mail.querySelector('.mlist');if(!ml){ml=document.createElement('div');ml.className='mlist';mail.appendChild(ml);const sub=hd&&hd.querySelector('.rc-sub');if(sub&&!w.review)sub.textContent=''}
    ml.prepend(d);rev.remove()}
  /* mail + checklist share one row */
  const row=document.createElement('div');row.className='lrow91';mail.replaceWith(row);row.appendChild(mail);if(todo)row.appendChild(todo);
  if(!land.querySelector('*'))land.remove();
  return t.innerHTML}catch(e){console.error(e)}return h}}
{const st=document.createElement('style');st.textContent=`
#mgrBody .lrow91{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start;margin-bottom:10px}
#mgrBody .lrow91>#mailBox{width:auto;min-width:0;margin:0}
#mgrBody .lrow91>.todobox{margin:0;width:auto;min-width:0}
#mgrBody .mailhd .acta91{margin-left:auto;white-space:nowrap}
#mgrBody .mailhd:has(.acta91){display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#mgrBody .mail.rev91 .mbody .revres{margin-top:4px}
#mgrBody .roomhd .lst91{position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:5px;font-size:12px;line-height:1.3;color:#e8dcc0}
#mgrBody .roomhd .lst91>span{display:inline-flex;align-items:baseline;gap:5px;white-space:nowrap;opacity:.92}
#mgrBody .roomhd .lst91 b{font-size:13px;color:#f3e3b8}
#mgrBody .roomhd .lst91 img,#mgrBody .roomhd .lst91 svg{width:14px!important;height:14px!important;vertical-align:-2px;position:static!important}
#mgrBody .roomhd .roomttl .lst91,#mgrBody .roomhd .roomttl .lst91 span{font-style:normal;font-family:inherit;letter-spacing:0}
#mgrBody .roomhd .roomttl .lst91>span{font-size:12px;color:#d9ccb0;background:rgba(20,12,6,.45);border:1px solid rgba(201,162,78,.35);border-radius:10px;padding:1px 8px}
@media(max-width:900px){#mgrBody .lrow91{grid-template-columns:1fr}}`;document.head.appendChild(st)}
