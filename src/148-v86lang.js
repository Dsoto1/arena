/* 148-v86lang — v0.86 languages, the parts around the dictionary (00-lang + assets/lang_<l>.js; v0.87: es, it, pt, fr, de):
   • <html lang> follows LANG; Settings → General → 🌐 Language lists English + Español (LANGS84 gets the entries of LANGS86).
     Picking one stores localStorage flavius_lang and reloads — during a live match it asks: reload now (the match is lost)
     or "next time" (applies the next time the game opens).
   • First run on a Spanish browser (navigator.languages es*, no flavius_lang yet): a small card on the main menu —
     "¿Jugar en español?" Sí / Keep English — asked once (localStorage flavius_langask86).
   • Text that never went through _T: the static markup of 01-head (one pass at load + after the menu builds),
     the online server's messages (NET.req errors → TXP, matched against LANG_SRVPAT), quick-chat phrases (ONLC.QC_TEXT,
     the client's copy — codes travel, each screen shows its own language).
   • Game terms and names stay English (they are simply kept by the dictionary). */
{
  try{document.documentElement.lang=LANG}catch(e){}
  /* Settings list + current value */
  try{for(const L of LANGS86)if(!LANGS84.some(x=>x.k===L.k))LANGS84.push(L)}catch(e){}
  try{SETTINGS.lang=LANG}catch(e){}
}
/* server texts: exact, then the patterns with {n} */
let TXP_RE86=null;
function TXP(msg){
  if(!LANG_DICT||typeof msg!=='string'||!msg)return msg;
  const ex=TX(msg);if(ex!==msg)return ex;
  if(!TXP_RE86){TXP_RE86=[];try{for(const k of LANG_SRVPAT){
    const parts=k.split(/\{\d+\}/);const idx=(k.match(/\{(\d+)\}/g)||[]).map(x=>+x.slice(1,-1));
    TXP_RE86.push({re:new RegExp('^'+parts.map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('([\\s\\S]+?)')+'$'),idx,k})}}catch(e){}}
  const t=msg.trim();
  for(const P of TXP_RE86){const m=P.re.exec(t);if(!m)continue;const vals=[];P.idx.forEach((n,i)=>{vals[n]=m[i+1]});
    const tr=LANG_DICT[P.k];if(tr==null)continue;return tr.replace(/\{(\d+)\}/g,(x,n)=>vals[+n]!=null?vals[+n]:x)}
  return msg}
{
  if(typeof NET==='object'&&NET&&typeof NET.req==='function'){const base=NET.req;NET.req=async function(...a){
    try{return await base.apply(this,a)}catch(e){if(e&&typeof e.message==='string'&&LANG_DICT){try{e.message=TXP(e.message)}catch(x){}}throw e}}}
  if(LANG_DICT){try{const Q=ONLC.QC_TEXT;for(const k of Object.keys(Q))Q[k]=TX(Q[k])}catch(e){}}
}
/* the static markup (01-head) — text nodes and a few attributes, exact matches only */
function langStatic86(root){
  if(!LANG_DICT||!root)return;
  const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','CANVAS','SVG']);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;if(!p||SKIP.has(p.nodeName)||p.closest&&p.closest('[translate="no"],svg'))return NodeFilter.FILTER_REJECT;return /[A-Za-z]{2}/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const list=[];while(w.nextNode())list.push(w.currentNode);
  for(const n of list){const v=n.nodeValue;const t=TX(v.trim());if(t!==v.trim())n.nodeValue=v.replace(v.trim(),t)}
  root.querySelectorAll&&root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(el=>{for(const a of ['title','placeholder','aria-label']){const v=el.getAttribute(a);if(v&&/[A-Za-z]{2}/.test(v)){const t=TX(v.trim());if(t!==v.trim())el.setAttribute(a,t)}}})}
{
  if(LANG_DICT){const go=()=>{try{langStatic86(document.body)}catch(e){}};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
    setTimeout(go,1200);setTimeout(go,4000)}
}
/* the few words the switch itself needs, each in its own language (shown before that language's dictionary is loaded) */
const LANG_UI87={
  en:{name:'English',live:'The language changes when the game reloads. The match in play is lost if you reload now.',now:'Reload now',later:'Next time'},
  es:{name:'Español',live:'El idioma cambia al recargar el juego. Tu combate en curso se perderá si recargas ahora.',now:'Recargar ahora',later:'La próxima vez',ask:'¿Jugar en español?',change:'Puedes cambiarlo en Ajustes.',yes:'Sí, en español'},
  it:{name:'Italiano',live:'La lingua cambia quando il gioco si ricarica. Se ricarichi ora, la partita in corso andrà persa.',now:'Ricarica ora',later:'La prossima volta',ask:'Giocare in italiano?',change:'Puoi cambiarla nelle Impostazioni.',yes:'Sì, in italiano'},
  pt:{name:'Português (Brasil)',live:'O idioma muda quando o jogo recarrega. A partida em andamento será perdida se você recarregar agora.',now:'Recarregar agora',later:'Da próxima vez',ask:'Jogar em português?',change:'Você pode mudar isso nas Configurações.',yes:'Sim, em português'},
  fr:{name:'Français',live:'La langue change au rechargement du jeu. Le combat en cours sera perdu si tu recharges maintenant.',now:'Recharger maintenant',later:'La prochaine fois',ask:'Jouer en français ?',change:'Tu peux le changer dans les Réglages.',yes:'Oui, en français'},
  de:{name:'Deutsch',live:'Die Sprache wechselt, wenn das Spiel neu lädt. Das laufende Match geht verloren, wenn du jetzt neu lädst.',now:'Jetzt neu laden',later:'Beim nächsten Mal',ask:'Auf Deutsch spielen?',change:'Du kannst das in den Einstellungen ändern.',yes:'Ja, auf Deutsch'}};
/* switching: store, then reload (asks during a live match) */
function langLive86(){try{return typeof eventLive==='function'&&eventLive()&&!HEADLESS}catch(e){return false}}
function langSet86(k){
  if(!LANGS86.some(L=>L.k===k))return;
  try{localStorage.setItem('flavius_lang',k);localStorage.setItem('flavius_langask86','1')}catch(e){}
  try{SETTINGS.lang=k;if(typeof applySettings==='function')applySettings()}catch(e){}
  if(k===LANG)return;
  const reload=()=>{try{location.reload()}catch(e){}};
  if(!langLive86()){reload();return}
  const U=LANG_UI87[k]||LANG_UI87.en;
  const box=document.createElement('div');box.className='lang86pop';
  box.innerHTML=`<div class="lang86card"><b>🌐 ${U.name}</b>
    <p>${U.live}</p>
    <div class="lang86btns"><button class="btn primary" data-lang86go="1">${U.now}</button>
    <button class="btn" data-lang86later="1">${U.later}</button></div></div>`;
  document.body.appendChild(box);
  box.addEventListener('click',ev=>{const t=ev.target.closest('button');if(!t)return;if(t.dataset.lang86go)reload();box.remove()})}
document.addEventListener('change',ev=>{const t=ev.target;if(!t||!t.dataset||!t.dataset.lang84)return;ev.stopImmediatePropagation();langSet86(t.value)},true);
/* first run on a browser in one of the game's languages: asked once, in that language (v0.87: es, it, pt, fr, de) */
function langAsk86(){
  try{if(localStorage.getItem('flavius_lang')||localStorage.getItem('flavius_langask86'))return}catch(e){return}
  const langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).map(x=>String(x).toLowerCase().slice(0,2));
  if(!langs.length||langs[0]==='en')return;const k=langs.find(x=>x!=='en'&&LANG_UI87[x]);if(!k||langs.indexOf('en')>=0&&langs.indexOf('en')<langs.indexOf(k))return;
  if(document.getElementById('lang86ask'))return;
  const mm=document.getElementById('mainMenu');if(!mm||mm.hidden||getComputedStyle(mm).display==='none')return;
  const U=LANG_UI87[k];const c=document.createElement('div');c.id='lang86ask';
  c.innerHTML=`<b>🌐 ${U.ask}</b><span>${U.change}</span><div><button class="btn primary" data-lang86yes="${k}">${U.yes}</button><button class="btn" data-lang86no="1">Keep English</button></div>`;
  document.body.appendChild(c);
  c.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
    try{localStorage.setItem('flavius_langask86','1')}catch(e){}
    c.remove();if(b.dataset.lang86yes)langSet86(b.dataset.lang86yes)})}
{
  let n=0;const iv=setInterval(()=>{n++;try{langAsk86()}catch(e){}if(n>40||document.getElementById('lang86ask'))clearInterval(iv)},700);
  const css=document.createElement('style');css.textContent=`
.lang86pop{position:fixed;inset:0;z-index:4000;background:rgba(8,5,3,.6);display:grid;place-items:center;padding:16px}
.lang86card{max-width:420px;background:var(--panel);border:1px solid var(--gold);border-radius:10px;padding:16px 18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.lang86card b{font:400 20px var(--display);color:var(--gold2)}.lang86card p{color:var(--bone);margin:8px 0 12px}
.lang86btns{display:flex;gap:8px;flex-wrap:wrap}.lang86btns .btn{flex:1 1 140px;text-align:center}
#lang86ask{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:3500;display:grid;gap:6px;justify-items:center;text-align:center;
  background:linear-gradient(#2a1f17,#1c140f);border:1px solid var(--gold);border-radius:10px;padding:12px 16px;box-shadow:0 12px 40px rgba(0,0,0,.6);max-width:min(380px,92vw)}
#lang86ask b{font:400 19px var(--display);color:var(--gold2)}#lang86ask span{font-size:13px;color:var(--muted)}
#lang86ask div{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}`;
  document.head.appendChild(css);
}
