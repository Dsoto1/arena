/* 190-v91flags — v0.91 (his ask 2026-10-06): a country flag beside each language.
   • His pick, one flag each: English 🇺🇸 · Español 🇲🇽 (our Spanish is Latin-American) · Português 🇧🇷 · Italiano 🇮🇹 · Français 🇫🇷 ·
     Deutsch 🇩🇪 · 日本語 🇯🇵 · 简体中文 🇨🇳.
   • Drawn as small inline SVGs (flag91), not emoji — Windows shows flag emoji as two letters.
   • Settings → General → 🌐 Language: the <select> becomes a row of flag buttons (the select stays, hidden, so every handler that
     reads it still works); a click picks that language through 148's langSet86 (asks during a live match, then reloads).
   • The first-run language question (148 #lang86ask) wears the flag of the language it offers. */
const FLAG91={au:'au',en:'us',es:'mx',pt:'br',it:'it',fr:'fr',de:'de',ja:'jp',zh:'cn'};
function flag91(k,w){w=w||22;const h=Math.round(w*2/3);const c=FLAG91[k]||'';const S=(b)=>`<svg class="flag91" viewBox="0 0 30 20" width="${w}" height="${h}" aria-hidden="true" style="border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.35);flex:none">${b}</svg>`;
  const tri3=(a,b,c2,vert)=>vert?`<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c2}"/>`
    :`<rect width="30" height="6.67" fill="${a}"/><rect y="6.67" width="30" height="6.67" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c2}"/>`;
  switch(c){
    case 'us':{let s='<rect width="30" height="20" fill="#fff"/>';for(let i=0;i<7;i++)s+=`<rect y="${i*20/6.5}" width="30" height="${20/13}" fill="#b22234"/>`;
      s+='<rect width="13" height="10.77" fill="#3c3b6e"/>';for(let r=0;r<4;r++)for(let q=0;q<5;q++)s+=`<circle cx="${1.5+q*2.5}" cy="${1.4+r*2.6}" r=".55" fill="#fff"/>`;return S(s)}
    case 'mx':return S(tri3('#006847','#fff','#ce1126',1)+'<circle cx="15" cy="10" r="2.4" fill="#8c6a2f"/><circle cx="15" cy="10" r="1.3" fill="#3f6b2a"/>');
    case 'br':return S('<rect width="30" height="20" fill="#009c3b"/><path d="M15 2.2 L27.5 10 L15 17.8 L2.5 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.8 9.2 Q15 8 19.2 10.6" stroke="#fff" stroke-width=".7" fill="none"/>');
    case 'au':{const st=(x,y,r)=>{let p='';for(let i=0;i<14;i++){const a=-Math.PI/2+i*Math.PI/7,rr=i%2?r*.45:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(2)+' '+(y+rr*Math.sin(a)).toFixed(2)}return `<path d="${p}Z" fill="#fff"/>`};
      return S('<rect width="30" height="20" fill="#012169"/><path d="M0 0L15 10M15 0L0 10" stroke="#fff" stroke-width="2"/><path d="M0 0L15 10M15 0L0 10" stroke="#c8102e" stroke-width=".8"/><path d="M7.5 0V10M0 5H15" stroke="#fff" stroke-width="3"/><path d="M7.5 0V10M0 5H15" stroke="#c8102e" stroke-width="1.6"/>'+st(7.5,15,2.4)+st(22.5,4,1.2)+st(26.5,9,1.2)+st(22.5,16,1.2)+st(19,9.5,1.1))}
    case 'it':return S(tri3('#009246','#fff','#ce2b37',1));
    case 'fr':return S(tri3('#0055a4','#fff','#ef4135',1));
    case 'de':return S(tri3('#000','#dd0000','#ffce00',0));
    case 'jp':return S('<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>');
    case 'cn':{const st=(x,y,r)=>{let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.4:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(2)+' '+(y+rr*Math.sin(a)).toFixed(2)}return `<path d="${p}Z" fill="#ffde00"/>`};
      return S('<rect width="30" height="20" fill="#de2910"/>'+st(5,5,3)+st(10,2,1)+st(12,4,1)+st(12,7,1)+st(10,9,1))}
    default:return ''}}
/* Settings → Language: flag buttons in front of the (hidden) select */
{const base=settingsHTML;settingsHTML=function(tab){let h=base.apply(this,arguments);if(typeof h!=='string'||h.indexOf('data-lang84="1"')<0)return h;try{
  const cur=(typeof LANG!=='undefined'&&LANG)||'en';
  const btns=(typeof LANGS84!=='undefined'?LANGS84:[{k:'en',n:'English'}]).map(L=>`<button type="button" class="btn lang91${L.k===cur?' on':''}" data-lang91="${L.k}" aria-pressed="${L.k===cur}">${flag91(L.k)}<span>${esc(L.n)}</span></button>`).join('');
  h=h.replace(/(<select data-lang84="1")/,`<span class="lang91row" translate="no">${btns}</span>$1 hidden`)}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lang91]');if(!b)return;e.preventDefault();e.stopPropagation();
  const k=b.dataset.lang91;if(k===((typeof LANG!=='undefined'&&LANG)||'en'))return;if(typeof langSet86==='function')langSet86(k)},true);
/* the first-run question wears the offered language's flag */
{const tick=()=>{const c=document.getElementById('lang86ask');if(!c||c.dataset.f91)return;const y=c.querySelector('[data-lang86yes]');if(!y)return;c.dataset.f91='1';
  const f=flag91(y.dataset.lang86yes,26);if(!f)return;const b=c.querySelector('b');if(b)b.insertAdjacentHTML('afterbegin',f+' ');y.insertAdjacentHTML('afterbegin',flag91(y.dataset.lang86yes,18)+' ');
  const n=c.querySelector('[data-lang86no]');if(n)n.insertAdjacentHTML('afterbegin',flag91('en',18)+' ')};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true})}
{const st=document.createElement('style');st.textContent=`
#setBody .lang91row{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;max-width:640px}
#setBody .lang91{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;font-size:13px}
#setBody .lang91.on{border-color:var(--gold);background:#3a2a18;color:var(--gold2)}
#lang86ask .flag91{vertical-align:-3px}
@media(max-width:520px){#setBody .lang91row{justify-content:flex-start}}`;document.head.appendChild(st)}
/* English (Australia) 🇦🇺 (his pick 2026-10-06): Commonwealth spelling of the English (tools/i18n/mkau.js → assets/lang_au.js), printed
   game terms unchanged. <html lang> = en-AU; the first-run question is offered to browsers set to en-AU. */
try{LANG_UI87.au={name:'English (Australia)',live:'The spelling switches after the game reloads. Reloading now loses a match in progress.',now:'Reload now',later:'Next time',ask:'Use Australian spelling?',change:'Colour, armour, centre… You can change this any time in Settings.',yes:'Yes, Australian'}}catch(e){} /* i18n:skip */
try{if(typeof LANG!=='undefined'&&LANG==='au')document.documentElement.lang='en-AU'}catch(e){}
{const base=langAsk86;langAsk86=function(){try{const l0=String((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();
  if(l0==='en-au'&&!localStorage.getItem('flavius_lang')&&!localStorage.getItem('flavius_langask86')&&!document.getElementById('lang86ask')){
    const mm=document.getElementById('mainMenu');if(!mm||mm.hidden||getComputedStyle(mm).display==='none')return;const U=LANG_UI87.au;
    const c=document.createElement('div');c.id='lang86ask';c.innerHTML=`<b>🌐 ${U.ask}</b><span>${U.change}</span><div><button class="btn primary" data-lang86yes="au">${U.yes}</button><button class="btn" data-lang86no="1">${_T`Keep US spelling`}</button></div>`;
    document.body.appendChild(c);c.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;try{localStorage.setItem('flavius_langask86','1')}catch(e){}c.remove();if(b.dataset.lang86yes)langSet86('au')});return}}catch(e){}
  return base.apply(this,arguments)}}
