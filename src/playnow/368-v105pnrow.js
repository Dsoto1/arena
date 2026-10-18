/* v1.05 beta fix B39 (368-v105pnrow) · kill switch localStorage flavius_v105poff2=1 · test tv104k
   B39  Play Now's action row (🎲 Random event · Begin Event · 🏛 Home) is ONE row. Causes of the beta-2 screenshot:
        (a) 247's .pn98 .pn-top is sticky with top:-18px and margin-top:-6px, so the row sat 2 px above the scroll box (mBody) at rest and
            18 px above it once the panel scrolled: the tops of 🎲 and Begin Event were clipped;
        (b) 🏛 is the modal's own #mClose, a child of .mbox (sticky/float), so it never moved with the row.
        Fix (> 600 px): the row sticks at the scroll box's top edge (top:0, margin-top:0, even padding), and the real #mClose button (same
        node: id, handler, data) is moved into the row's .pn98go group after Begin Event (static, 46 px, align-items:center, 10 px gaps).
        It goes back to .mbox (first child) when the setup closes or re-renders, on phones (<= 600 px, where 🏛 stays in the header)
        and before modal() writes a new body. */
{const P105={off:(()=>{try{return localStorage.getItem('flavius_v105poff2')==='1'}catch(e){return false}})()};window.P105=P105;
if(!P105.off){
let HOME=null;
const rowOf=()=>document.querySelector('#mBody .pn100 .pn98go');
const homeBack=()=>{const mb=document.getElementById('mboxEl');if(!HOME||!mb)return;if(HOME.classList.contains('sq105'))return; /* v1.05 391: Save & quit lives in the Manager rail (391 puts it home itself) */ if(HOME.parentNode!==mb)mb.insertBefore(HOME,mb.firstChild);HOME.classList.remove('pn105home')};
function sync(){try{const mb=document.getElementById('mboxEl');if(!mb)return;
  const btn=HOME&&HOME.isConnected?HOME:(document.getElementById('mClose')||HOME);if(!btn)return;if(!btn.isConnected){mb.insertBefore(btn,mb.firstChild)}HOME=btn;
  const row=rowOf(),wide=window.innerWidth>600;
  if(row&&wide){if(btn.parentNode!==row){row.appendChild(btn)}btn.classList.add('pn105home')}
  else homeBack()}catch(e){console.error(e)}}
{const base=modal;modal=function(){homeBack();const r=base.apply(this,arguments);sync();return r}}
{const mb=document.getElementById('mBody');if(mb){new MutationObserver(sync).observe(mb,{childList:true,subtree:true});
  /* the modal queue rewrites #mBody later than modal() returns: put 🏛 back BEFORE any innerHTML write on the body so the node is never destroyed */
  const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(ih&&ih.set)Object.defineProperty(mb,'innerHTML',{configurable:true,get(){return ih.get.call(this)},set(v){homeBack();ih.set.call(this,v)}})}}
window.addEventListener('resize',sync);
const st=document.createElement('style');st.textContent=`
@media (min-width:601px){
.pn98 .pn-top{top:0!important;margin-top:0!important;padding:8px 0 8px!important;align-items:center}
.pn100 .pn98go{align-items:center}
.pn98go #mClose.pn105home{position:static!important;float:none!important;flex:none;align-self:center;margin:0!important;width:46px;height:46px;top:auto;right:auto;z-index:auto;font-size:22px}
}`;document.head.appendChild(st)}}
