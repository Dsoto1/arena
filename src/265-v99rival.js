/* v0.99 — Which fighter will you command? (his pick 6a)
   When you play a Manager bout live and TWO OR MORE of your fighters are seated (Rivalry Week's Familia 2v2, any card), a small picker
   asks which one is human-controlled; the others stay CPU on your team. Default = the starter of that bout, else the first. Nothing is
   remembered past the bout. Wraps watchBout (async: picker first) and boutCfg (swaps the fightGid). Settlement is untouched: every seat
   still carries its mgrId, so applyBout / arm94Settle / records treat all of them as yours. Offline Manager only (no sims, no online). */
const RIV99={gid:null};
function mine99(w,b){const meId=me().id;return b.ents.map(gById).filter(g=>g&&g.contract&&g.contract.mgr===meId)}
function pick99(list,def){return new Promise(res=>{for(const o of document.querySelectorAll('.pick99bg'))o.remove();
  const row=g=>{const st=gStats(g)||{};const cl=CLASSES[g.cls];
    return `<button type="button" class="btn${g.id===def?' primary':''}" data-pick99="${esc(String(g.id))}" style="display:flex;align-items:center;gap:8px;text-align:left;width:100%;margin:4px 0"><span style="flex:none">${gArt(g,'sm')}</span><span><b>${esc(g.name)}</b> <span class="rc-sub">${esc(cl?cl.name:g.cls)}</span><br>${STATS.map(s=>`<span class="badge" title="${s[1]}">${s[2]} ${Math.round(st[s[0]]||0)}</span>`).join(' ')}</span></button>`};
  const bg=document.createElement('div');bg.className='veraskbg pick99bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b>${_T('Which fighter will you command?')}</b><div style="margin:6px 0 10px">${list.map(row).join('')}</div><div class="acts"><button type="button" class="btn" data-pick99="">${_T('Cancel')}</button></div></div>`;
  document.body.appendChild(bg);const done=v=>{bg.remove();document.removeEventListener('keydown',key,true);res(v)};
  const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done(null)}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-pick99]');if(b)done(b.dataset.pick99===''?null:b.dataset.pick99);else if(e.target===bg)done(null)});
  setTimeout(()=>{const y=bg.querySelector('.btn.primary')||bg.querySelector('[data-pick99]');if(y)y.focus()},30)})}
{const base=watchBout;watchBout=async function(boutIdx,fight=false){
  let picked=null;
  try{if(fight){const w=W_(),b=w&&w.night&&w.night.bouts[boutIdx];
    const gambit=w&&w.underdog&&w.underdog.fighting&&b&&b.ents.includes(w.underdog.gid);
    if(b&&!b.done&&!gambit&&!(w.tutorial)){const list=mine99(w,b);
      if(list.length>=2){const def=(list.find(g=>g.slot95===boutIdx+1)||list[0]).id;
        const v=await pick99(list,def);if(v==null)return;picked=list.find(g=>String(g.id)===String(v));picked=picked?picked.id:def}}}}catch(e){console.error(e)}
  RIV99.gid=picked;try{return base.call(this,boutIdx,fight)}finally{RIV99.gid=null}}}
{const base=boutCfg;boutCfg=function(bout,watch,fightGid){
  if(RIV99.gid!=null&&watch&&fightGid&&bout.ents.includes(RIV99.gid))arguments[2]=RIV99.gid;
  return base.apply(this,arguments)}}
