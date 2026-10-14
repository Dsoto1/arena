/* 154-v87icons — v0.87 icon sweep (Virgilante's rule, 2026-10-05): every coin or CF amount shown as a reward, cost, gain
   or balance wears his icons — his gold coin (assets/coin.webp, ICO.coin) and the wheat (ICO.wheat) — and log lines that
   name a weapon action or stat (absorb, throw, damage, range, ammo, uses) carry his weapon icons (WICO75, 106-v75).
   • coinAmt87(n) → coin icon + n (+ a visually hidden " coin" so copied / tag-stripped text still reads "5 coin")
     cfAmt87(n)   → wheat icon + n + " CF"
     wIco87(k)    → one weapon icon (k = dmg rng thr abs ammo use both soul cf)
     A leading sign stays in front of the icon: coinAmt87('+3') → "+🪙3".
   • The markup is compact and quote-free (class names only, the art lives in this module's CSS), so it is safe inside
     strings that are saved (letters, news, log lines) and harmless if it ever lands inside a double-quoted attribute.
   • They are FUNCTION DECLARATIONS on purpose: the build is one script, so they are hoisted and every older module may
     call them, even at load time. Plain-text places (title=, alt, canvas, textContent, <option>) keep the words.
   • Sized to the text (1.05em, vertical-align −0.15em) so lines never jump. */
function amtSplit87(n){const s=String(n==null?0:n);const m=/^([+−-])(.*)$/.exec(s);return m?[m[1],m[2]]:['',s]}
function coinAmt87(n){const [sg,v]=amtSplit87(n);return `<span class=amt87>${sg}<i class=ic87c></i>${v}<span class=sr87> ${_T('coin')}</span></span>`}
function cfAmt87(n){const [sg,v]=amtSplit87(n);return `<span class=amt87>${sg}<i class=ic87w></i>${v} CF</span>`} /* i18n:skip — CF is a game term */
function wIco87(k){return `<i class=wi87${k} aria-hidden=true></i>`}
(()=>{try{if(typeof document==='undefined')return;
  const coin=typeof assetURL==='function'?assetURL('coin.webp'):'assets/coin.webp';
  const wheatSVG=(typeof ICO!=='undefined'&&ICO.wheat?ICO.wheat:'').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '); /* i18n:skip */
  const wheat=wheatSVG?'data:image/svg+xml,'+encodeURIComponent(wheatSVG):'';
  const W=typeof WICO75!=='undefined'?WICO75:{};
  const st=document.createElement('style');st.id='icons87';
  st.textContent=`.amt87{white-space:nowrap}
.ic87c,.ic87w,[class^=wi87]{display:inline-block;width:1.05em;height:1.05em;vertical-align:-0.15em;background:center/contain no-repeat;font-style:normal}
.ic87c,.ic87w{margin-right:.12em}[class^=wi87]{margin-right:.15em}
.ic87c{background-image:url("${coin}")}${wheat?`.ic87w{background-image:url("${wheat}")}`:''}
.sr87{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
${Object.keys(W).map(k=>`.wi87${k}{background-image:url("${W[k]}")}`).join('\n')}`;
  document.head.appendChild(st)}catch(e){console.error(e)}})();
