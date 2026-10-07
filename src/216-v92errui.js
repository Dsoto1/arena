/* 216-v92errui — v0.92 the error log's viewer (00c-errlog keeps it): Settings → General → 🐞 Error log (N) opens a small window over
   Settings with the entries, newest first, 📋 Copy for a bug report (plain text with the version and browser) and 🗑 Clear. */
function err92Text(){const L=ERR92.list.slice().reverse();return [`Flavius Rule ${typeof GAME_VER!=='undefined'?'v'+GAME_VER:''} · ${navigator.userAgent}`,...L.map(e=>`${e.t} [${e.kind}] ${e.where?e.where+' · ':''}${e.msg}${e.at?' — '+e.at:''}`)].join('\n')}
function err92Open(){let p=document.getElementById('err92pop');if(p)p.remove();p=document.createElement('div');p.id='err92pop';const L=ERR92.list.slice().reverse();
  p.innerHTML=`<div class="err92b" role="dialog" aria-label="${esc(_T('Error log'))}"><div class="err92h"><b>${_T('🐞 Error log')}</b><small>${_T`${L.length} kept · stays on this device`}</small><button type="button" class="btn tksm" data-err92x aria-label="${esc(_T('Close'))}">✕</button></div>
    <div class="err92l">${L.length?L.map(e=>`<div class="err92e"><span class="err92k ${e.kind}">${esc(e.kind)}</span><span class="err92t">${esc(e.t)}${e.where?' · '+esc(e.where):''}</span><div>${esc(e.msg)}</div>${e.at?`<small>${esc(e.at)}</small>`:''}</div>`).join(''):`<p class="rc-sub">${_T('No errors logged. Good.')}</p>`}</div>
    <div class="acts"><button type="button" class="btn primary" data-err92c ${L.length?'':'disabled'}>${_T('📋 Copy for a bug report')}</button><button type="button" class="btn" data-err92clr ${L.length?'':'disabled'}>${_T('🗑 Clear')}</button></div></div>`;
  document.body.appendChild(p)}
{const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);try{if(tab&&tab!=='general')return h;
  const row=`<div class="setrow err92row"><span><b>${_T('🐞 Error log')}</b><br><span class="hint" style="margin:0">${_T('If something misbehaves, copy this into your bug report.')}</span></span><button type="button" class="btn tksm" data-err92o>${_T`Open (${ERR92.list.length})`}</button></div>`;
  const i=h.lastIndexOf('</div>');return i>0?h.slice(0,i)+row+h.slice(i):h+row}catch(e){return h}}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-err92o],[data-err92x],[data-err92c],[data-err92clr]');if(!t)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.err92o!=null){err92Open();return}
  const p=document.getElementById('err92pop');
  if(t.dataset.err92x!=null){if(p)p.remove();return}
  if(t.dataset.err92c!=null){const txt=err92Text();const done=()=>{try{mToast(_T('📋 Copied — paste it into your report.'))}catch(x){}};
    try{navigator.clipboard.writeText(txt).then(done,()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(x){}ta.remove();done()})}catch(x){}return}
  if(t.dataset.err92clr!=null){ERR92.list=[];ERR92.seen={};try{localStorage.removeItem('flavius_errlog92')}catch(x){}err92Open();
    document.querySelectorAll('[data-err92o]').forEach(b=>b.textContent=_T`Open (${0})`)}},true);
{const st=document.createElement('style');st.textContent=`
#err92pop{position:fixed;inset:0;z-index:100001;background:rgba(10,6,3,.6);display:grid;place-items:center}
#err92pop .err92b{width:min(620px,calc(100vw - 32px));max-height:80vh;display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--gold,#c9a24e);border-radius:10px;background:#21170f;color:#e8dcc0}
#err92pop .err92h{display:flex;gap:10px;align-items:baseline}#err92pop .err92h small{flex:1;opacity:.7}
#err92pop .err92l{overflow:auto;display:grid;gap:6px;font-size:12.5px}
#err92pop .err92e{padding:6px 8px;border-left:3px solid #8a3a2a;background:rgba(255,255,255,.03);border-radius:0 6px 6px 0;word-break:break-word}
#err92pop .err92e small{opacity:.65;font-family:var(--mono,monospace)}#err92pop .err92t{opacity:.7;margin-left:6px;font-size:11px}
#err92pop .err92k{font:700 10px var(--mono,monospace);text-transform:uppercase;padding:1px 6px;border-radius:8px;background:#5a2a1a}
#err92pop .err92k.caught{background:#4a3a1a}#err92pop .acts{display:flex;gap:8px;flex-wrap:wrap}
/* v0.92 (his pick): the Training Yard's Lock in buttons are gold */
.btn.y92go,.btn[data-y92all]{background:linear-gradient(#ecc96c,#b8862e);color:#2a1a08;border-color:#f3d98a;text-shadow:none}
.btn.y92go:not([disabled]):hover,.btn[data-y92all]:not([disabled]):hover{background:linear-gradient(#f4d67e,#c6953a)}
.btn.y92go[disabled],.btn[data-y92all][disabled]{background:#3a2c18;color:#9a8a6a;border-color:#5a4a2a}`;document.head.appendChild(st)}
