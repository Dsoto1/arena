/* =====================================================================
   257-V98DRAFT · v0.98 — custom class gear in drafts
   =====================================================================
   BEFORE: in a draft event (Ludus, Juggernaut, Naumachia, custom events with a draft) the loadout is never given (05-flow: ev.draft -> p.drafted),
   so a seat on a custom character / custom class skipped nothing, but its custom weapons and armor never appeared unless they sat on the market
   rolls. Chariot Racing (fixed pools) did the same.
   NOW: draftExtra98(players, pool) lists the CUSTOM pieces (W/ARM entries with .custom) that the seats' classes carry (R, L, armor) and that are
   not already in the pool; 122 runDraft and 76 chariotDraft add them. Everyone drafts in order and may take them (fit rules and CPU valuation
   as for printed pieces). Offline only (online uses printed gear). No random numbers. Custom refs get card styles so the draft board's
   "Also offered" strip shows the custom card / drawn armor instead of a blank tile.
   ===================================================================== */
function draftExtra98(players,pool){
  const out=[];try{
    if(S&&S.onl)return out;
    const have=new Set((pool||[]).map(x=>x.kind+':'+x.k));
    const add=(kind,k)=>{if(!k||have.has(kind+':'+k))return;const d=kind==='w'?W[k]:ARM[k];if(!d||!d.custom)return;have.add(kind+':'+k);
      out.push({kind,k,lv:Math.max(1,Math.min(3,+d.lv||1))})};
    for(const p of players||[]){const C=CLASSES[p.cls];if(!C)continue;
      add('w',C.R);add('w',C.L);for(const [k] of C.armor||[])add('a',k)}
  }catch(e){console.error(e)}
  return out}
{const base=cardStyle;cardStyle=function(ref){const s=base.apply(this,arguments);
  try{if(s||typeof ref!=='string')return s;const k=ref.slice(2);
    if(ref[0]==='w'&&k.startsWith('cw_')&&typeof cwCardURL==='function'){const u=cwCardURL(k);if(u)return `background-image:url('${u}');background-size:100% 100%;background-repeat:no-repeat;aspect-ratio:600/416`}
    if(ref[0]==='a'&&k.startsWith('ca_')&&ARM[k]){const A=ARM[k];const cu=A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null;
      if(cu&&typeof caArtOn==='function'&&caArtOn(cu)&&cu.art)return cardStyle('a:'+cu.art);
      if(typeof armArtURL==='function'){const u=armArtURL(k);if(u)return `background-image:url('${u}');background-size:contain;background-repeat:no-repeat;background-position:center;aspect-ratio:1/1`}}
  }catch(e){}
  return s}}
