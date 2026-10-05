/* =====================================================================
   104-CARDS74 · v0.74 — the class cards (Virgilante)
   =====================================================================
   • The 8 printed classes show his new cards (assets/cls_<key>.webp, from tools/art/classcards) wherever a class card shows
     (cardHTML / cardStyle 'k:<class>').
   • Custom classes get a live card in his layout (classCard74): frame, header plate with city badge, title in the class colour and
     the champion, the text column filled from the class (armor lines with *For each and bonus AP, ability "while class abilities are
     on", weapons, starting items, unique items, weakness), the class wearing its armor on the right and the character's token below.
     NEXT (his blank template + figures): the printed classes move to this live template too, so any rule change updates their card.
   ===================================================================== */
const CLS_CARD74={soldier:'assets/cls_soldier.webp',royalty:'assets/cls_royalty.webp',hero:'assets/cls_hero.webp',slave:'assets/cls_slave.webp',
  veteranus:'assets/cls_veteranus.webp',amazonia:'assets/cls_amazonia.webp',venatore:'assets/cls_venatore.webp',damnatio:'assets/cls_damnatio.webp'};
const CLS_AR74='554/800';
const clsCardURL74=k=>CLS_CARD74[k]?(typeof assetURL==='function'?assetURL(CLS_CARD74[k].slice(7)):CLS_CARD74[k]):null;
{const base=cardStyle;cardStyle=function(ref){if(typeof ref==='string'&&ref[0]==='k'&&ref[1]===':'&&CLS_CARD74[ref.slice(2)])return `background-image:url('${clsCardURL74(ref.slice(2))}');background-size:100% 100%;background-position:center;aspect-ratio:${CLS_AR74}`;return base.apply(this,arguments)}}
{const base=cardHTML;cardHTML=function(ref,size='md',extra=''){if(typeof ref==='string'&&ref[0]==='k'&&ref[1]===':'&&CLS_CARD74[ref.slice(2)]){const k=ref.slice(2);
  return `<span class="cimg ${size} clscard74" style="${cardStyle(ref)}" role="img" aria-label="${_T`${esc(CLASSES[k]?CLASSES[k].name:k)} class card`}" data-card="${ref}" ${extra}></span>`}return base.apply(this,arguments)}}
/* a whole <svg> placed as a <g> (nested svgs get stretched by page CSS) */
function svgToG74(svg,x,y,w,h){const m=String(svg).match(/viewBox="([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)"/);if(!m)return '';const [vx,vy,vw,vh]=m.slice(1).map(Number);const sc=Math.min(w/vw,h/vh);
  const inner=String(svg).replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');return `<g transform="translate(${(x+(w-vw*sc)/2).toFixed(1)} ${(y+(h-vh*sc)/2).toFixed(1)}) scale(${sc.toFixed(4)}) translate(${-vx} ${-vy})">${inner}</g>`}
/* the live card for a custom class */
function classCard74(k,ch){k=k||{};const x=esc;const col=k.color||'#b0271c';const A=charArmor({arm:k.arm||{}});const groups={};
  for(const [key,loc] of A){const a=ARM[key];if(!a)continue;(groups[key]||(groups[key]={key,a,locs:[]})).locs.push(loc)}
  const armorLines=Object.values(groups).map(g=>{const pair=g.locs.length>1;const where=pair?LOCS_SHORT[g.locs[0]]:LOCN[g.locs[0]];
    const part=g.a.pt==='upper'?_T('Upper '):g.a.pt==='lower'&&g.a.slot!=='chest'?_T('Lower '):g.a.pt==='hand'?'':'';const bo=g.a.bonus?Object.entries(g.a.bonus).map(([l,v])=>_T` ([${v} AP] ${LOCN[l]||l} Bonus)`).join(''):'';
    return `[${g.a.ap} AP] ${part}${where}${pair?_T(' *For each'):''}${bo}`});
  const abil=(k.abilText?k.abilText+': ':'')+(k.abil&&k.abil!=='none'?abilDesc(k.abil,k.abilVal||1)+_T(' (while class abilities are on)'):_T('None.'));
  const weap=[k.R,k.L].filter(Boolean).map(w=>W[w]?_T`1x LVL ${W[w].lv} “${W[w].n}”`:'').filter(Boolean);
  const start=[];if(+k.coin)start.push(`[${k.coin}x Coin]`);if(k.keys)start.push(_T`1x Arena Key Token (${k.keys}x Keys)`);if(+k.cf)start.push(`[${k.cf} CF]`);start.push(_T('2x Player Trackers'));
  const uniq=(k.items||[]).filter(Boolean).map(i=>{const o=CLS_ITEM_OPTS.find(z=>z[0]===i);return '1x '+(o?o[1].replace(/ \((card)\)$/,' card'):i)});
  const weakT=k.weak&&k.weak!=='none'&&WEAKNESSES[k.weak]?WEAKNESSES[k.weak][1].replace(/\s*\([^)]*\)\.?$/,'.'):'';
  const wrap=(t,n)=>typeof clsWrap==='function'?clsWrap(t,n):[t];
  const sec=[[_T('Armors:'),armorLines.length?armorLines.flatMap(t=>wrap(t,30)):['none']],[_T('Ability:'),wrap(abil,30)],[_T('Weapon')+(weap.length>1?'s':'')+':',weap.length?weap:['fists']],
    [_T('Standard Starting Items:'),start.flatMap(t=>wrap(t,30))],...(uniq.length?[[_T('Unique Starting Items:'),uniq.flatMap(t=>wrap(t,30))]]:[]),...(weakT?[[_T('Weakness:'),wrap(weakT,30)]]:[])];
  const n=sec.reduce((s,[,l])=>s+1.25+l.length,0);const fs=Math.max(13,Math.min(21,560/(n*1.3)));const lh=fs*1.3;
  let y=196,body='';for(const [h,ls] of sec){body+=`<text x="42" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" font-weight="700" fill="#2a1d12" text-decoration="underline">${x(h)}</text>`;y+=lh;
    for(const l of ls){body+=`<text x="42" y="${y.toFixed(1)}" font-family="Georgia,serif" font-size="${fs.toFixed(1)}" fill="#2a1d12">${x(l)}</text>`;y+=lh}y+=lh*0.3}
  const nm=String(k.name||_T('Class')).toUpperCase();const ns=nm.length>10?Math.max(20,34-(nm.length-10)*1.6):34;
  const av=typeof avatarFor73==='function'?avatarSVG(avatarFor73(A,'cc74'+String(k.id||k.name||'x').replace(/\W/g,''))).replace(/<text[^>]*>[^<]*<\/text>/g,'').replace(/ data-av(tip|loc)="[^"]*"/g,'').replace(/ class="avzone"/g,''):'';
  const snap=av?svgToG74(av,326,166,210,440):'';
  const tok=ch&&typeof figureSVG==='function'&&typeof tokenOfChar==='function'?svgToG74(lit89(figureSVG(tokenOfChar(ch))),432,612,100,160):'';
  const city=String(k.city||'').toUpperCase().slice(0,14);
  return `<svg viewBox="0 0 554 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${_T`${x(k.name||_T('Class'))} class card`}">
   <defs><linearGradient id="cc74p${x(String(k.id||'x'))}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ece1c8"/><stop offset=".62" stop-color="#e6d9bd"/><stop offset=".8" stop-color="#d9cbb0"/><stop offset="1" stop-color="#e3d6bc"/></linearGradient></defs>
   <rect width="554" height="800" rx="8" fill="#6b4a2a"/><rect x="5" y="5" width="544" height="790" rx="6" fill="none" stroke="#c9a458" stroke-width="3" stroke-dasharray="2 3"/>
   <rect x="14" y="14" width="526" height="772" fill="${shade(col,-0.45)}"/><rect x="20" y="20" width="514" height="760" fill="url(#cc74p${x(String(k.id||'x'))})" stroke="${col}" stroke-width="3"/>
   <g opacity=".22" fill="#b8a888"><rect x="430" y="150" width="70" height="620"/><rect x="420" y="140" width="90" height="16"/><path d="M440 160v600M458 160v600M476 160v600M494 160v600" stroke="#9a8a6c" stroke-width="2"/></g>
   <rect x="26" y="24" width="502" height="122" fill="#efe3c6" stroke="#2a1d12" stroke-width="3"/><path d="M34 36h30v-6M520 36h-30v-6M34 134h30v6M520 134h-30v6" stroke="#2a1d12" stroke-width="3" fill="none"/>
   <circle cx="70" cy="80" r="17" fill="#8a2a20" stroke="#2a1d12" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="${col}" stroke="#2a1d12"/>
   <text x="94" y="86" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#2a1d12" letter-spacing="1">${x(city)}</text>
   <text x="312" y="78" text-anchor="middle" font-family="Georgia,serif" font-size="${ns.toFixed(1)}" font-weight="700" fill="${col}" stroke="#2a1d12" stroke-width="1.2" letter-spacing="2">${x(nm)}</text>
   <text x="300" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-style="italic" fill="#2a1d12">${x(k.hero||(ch&&ch.name)||'')}</text>
   <text x="500" y="92" text-anchor="end" font-family="Georgia,serif" font-size="18" fill="#2a1d12">✦</text>
   ${snap}${tok}${body}${k.sandbox?_T('<text x="277" y="770" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#8a2a20">sandbox build</text>'):''}</svg>`}
{const base=classCardSVG;classCardSVG=function(k,ch){try{if(!k||k.sysKey)return base.apply(this,arguments);return classCard74(k,ch)}catch(e){console.error(e);return base.apply(this,arguments)}}}
(()=>{const st=document.createElement('style');st.textContent=`.cimg.clscard74{background-color:transparent}.clscard svg{width:100%;height:auto;display:block}`;document.head.appendChild(st)})();
