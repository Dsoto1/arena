/* 374-v105mwban (v1.05 B45): the Match Week banner of 360-v105mw, made slim (about half the old height).
   • Row 1 = city name + "Match Week · week N of 12 · three days of games" + the chips inline (pill = text height, text vertically centred, one line,
     ellipsis + title when too long; on phones they wrap). Row 2 = map inset (smaller) + day tabs + Walk the city square + the temple / sand links.
   • The scenery stays as the background (bottom-aligned, cropped). "Your week at <city>" box compact at the right: the six tiles in one row, header on one
     line, [Set off] on its own slim row when due, Simulate the rest / End the week + the small reason line on one row. Phones (≤760px): stacks, tiles 3×2.
   • Only a re-arrangement + CSS (class .mw105slim on the banner): every handler / data attribute of 360 stays. Playoff chip (pick 8) untouched.
   Kill switch: localStorage flavius_v105mwbanoff=1 (the 360 banner as it was). */
function mw105banOff(){try{return localStorage.getItem('flavius_v105mwbanoff')==='1'}catch(e){return false}}
{const base=mw105Shape;mw105Shape=function(T,w){const r=base.apply(this,arguments);
  try{if(r&&!mw105banOff()){const hd=T.content.querySelector('.roomhd.mw105ban');const L=hd&&hd.querySelector('.mw105L');
    if(L&&!L.querySelector('.mw105r1')){const ttl=L.querySelector('.roomttl'),chips=L.querySelector('.mw105chips'),row=L.querySelector('.mw105row');
      const r1=document.createElement('div');r1.className='mw105r1';if(ttl)r1.appendChild(ttl);if(chips)r1.appendChild(chips);L.insertBefore(r1,L.firstChild);
      const mi=chips&&chips.querySelector('.mi100tr');if(mi&&row)row.insertBefore(mi,row.firstChild);
      for(const c of L.querySelectorAll('.mw105chip'))if(!c.title)c.title=c.textContent.replace(/\s+/g,' ').trim();
      for(const t of hd.querySelectorAll('.mw105ti > div'))t.title=t.textContent.replace(/\s+/g,' ').trim();
      const nt=hd.querySelector('.mw105nt');if(nt)nt.title=nt.textContent.replace(/\s+/g,' ').trim();
      hd.classList.add('mw105slim')}}}catch(e){console.error(e)}
  return r}}
{const st=document.createElement('style');st.textContent=`
#mgrBody .roomhd.mw105ban.mw105slim{padding:8px 12px;gap:8px 16px;align-items:center}

.mw105slim .mw105L{flex:1 1 400px;gap:6px}
.mw105slim .mw105r1{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;min-width:0;min-height:26px}
#mgrBody .mw105slim .roomttl{flex:1 1 130px;min-width:0;flex-wrap:nowrap;align-items:center;gap:2px 12px;white-space:nowrap}
#mgrBody .mw105slim .roomttl b{font-size:21px;line-height:26px}
#mgrBody .mw105slim .roomttl b{flex:none}
#mgrBody .mw105slim .roomttl span{font-size:12px;line-height:26px;min-width:0;overflow:hidden;text-overflow:ellipsis}
.mw105slim .mw105chips{flex:1 1 380px;min-width:0;overflow:hidden;flex-wrap:nowrap;align-items:center;gap:6px}
.mw105slim .mw105chip{box-sizing:border-box;display:block;flex:0 1 auto;min-width:0;max-width:100%;height:24px;line-height:22px;padding:0 10px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mw105slim .mw105chip{min-width:60px}.mw105slim .mw105chip:first-child{flex-shrink:0}
.mw105slim button.mw105chip{font-size:12px;line-height:22px;display:block}
.mw105slim .mw105chip .amt87{display:inline;vertical-align:baseline}
.mw105slim .mw105row{flex-wrap:wrap;gap:6px 10px;align-items:center}
#mgrBody .mw105slim .mi100tr{--mw:56px;--mh:36px;margin:0!important;flex:none}
#mgrBody .mw105slim .roomstat.bt85w{flex:0 0 auto;max-width:100%}
#mgrBody .mw105slim .roomstat.bt85w .bt85{display:flex!important;flex-direction:row;align-items:center;gap:6px;min-height:0;height:34px;padding:2px 7px}
#mgrBody .mw105slim .roomstat.bt85w .bt85 .bt85d{font-size:10px}
#mgrBody .mw105slim .roomstat.bt85w .bt85 b{font-size:13px}
#mgrBody .mw105slim .walk96{flex:1 1 160px;min-width:160px;gap:8px}
#mgrBody .mw105slim .walk96 .btn.walk96b{flex:none;width:160px;min-width:0;height:34px;font-size:13.5px;letter-spacing:0;padding:0 6px;white-space:nowrap;overflow:hidden}
#mgrBody .mw105slim .walk96 .city90n{font-size:11px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#mgrBody .mw105slim .mw105wk{flex:0 1 400px;align-self:center;padding:6px 8px;gap:4px 8px;display:grid;grid-template-columns:auto minmax(0,1fr)}
.mw105slim .mw105wk>*{min-width:0}
.mw105slim .mw105wh,.mw105slim .mw105ti,.mw105slim .mw105off{grid-column:1/-1}
.mw105slim .mw105wh{flex-wrap:nowrap;align-items:center}.mw105slim .mw105wh b{font-size:14px;white-space:nowrap}
.mw105slim .mw105wh span{font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mw105slim .mw105ti{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px}
.mw105slim .mw105ti div{padding:1px 5px}
.mw105slim .mw105ti i{font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mw105slim .mw105ti b{font-size:12.5px;line-height:1.3}
.mw105slim .mw105ba{gap:6px}
.mw105slim .mw105ba .btn,.mw105slim .mw105ba .mw105sb{flex:none;min-height:28px;height:28px;padding:0 12px;font-size:13px;white-space:nowrap}
.mw105slim .mw105off{min-height:28px;height:28px;padding:0 12px;font-size:13px;display:flex;align-items:center;justify-content:center}
.mw105slim .mw105off small{display:none}
.mw105slim .mw105nt{font-size:11px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:center}
@media (max-width:1500px){#mgrBody .mw105slim .roomstat.bt85w .bt85 .bt85m{display:none}}
@media (max-width:760px){
.mw105slim .mw105row{flex-wrap:wrap}
#mgrBody .mw105slim .roomstat.bt85w{flex:0 1 auto}
#mgrBody .roomhd.mw105ban.mw105slim{padding:8px 10px}
.mw105slim .mw105L{flex:1 1 100%}
.mw105slim .mw105r1{flex-wrap:wrap}
.mw105slim .mw105chips{flex:1 1 100%;flex-wrap:wrap}.mw105slim .mw105chip:first-child{flex-shrink:1}
.mw105slim .mw105chip{max-width:100%}
.mw105slim .mw105row{flex-direction:row;align-items:center}
#mgrBody .mw105slim .walk96{flex:1 1 100%;min-width:0}
#mgrBody .mw105slim .walk96 .btn.walk96b{width:100%}
#mgrBody .mw105slim .roomstat.bt85w{max-width:100%!important}
#mgrBody .mw105slim .walk96{flex-wrap:wrap}
#mgrBody .mw105slim .mw105wk{flex:1 1 100%;margin-left:0;grid-template-columns:minmax(0,1fr)}
.mw105slim .mw105ti{grid-template-columns:repeat(3,minmax(0,1fr))}
.mw105slim .mw105ba{grid-column:1/-1}.mw105slim .mw105ba .btn,.mw105slim .mw105ba .mw105sb{flex:1 1 0}
.mw105slim .mw105nt{grid-column:1/-1;white-space:normal}}`;document.head.appendChild(st)}
