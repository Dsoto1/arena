(()=>{const TZ=[['America/Los_Angeles',34.05,-118.24,3],['America/Chicago',41.88,-87.63,5],['America/New_York',40.71,-74.0,8],['America/Sao_Paulo',-23.55,-46.63,2],
 ['Europe/London',51.5,-0.12,6],['Europe/Rome',41.9,12.5,4],['Europe/Berlin',52.5,13.4,3],['Asia/Tokyo',35.7,139.7,2],['Australia/Sydney',-33.87,151.2,3],
 ['Asia/Manila',14.6,121.0,2],['Africa/Johannesburg',-26.2,28.0,1],['Asia/Kolkata',22.57,88.36,1],['America/Mexico_City',19.43,-99.13,2],['Europe/Madrid',40.42,-3.7,2]];
const n=TZ.reduce((t,x)=>t+x[3],0);const cap=`<b>${n}</b> lanistas online · 6 fighting · 3 waiting`;
const dots=k=>TZ.map(([,la,lo,c])=>{const x=(lo+180)/360*100,y=(76-la)/128*100,s=(10+Math.sqrt(c)*9)*k;
  return `<i class="omap-dot" style="left:${(x+(Math.random()-.5)*.6).toFixed(2)}%;top:${(y+(Math.random()-.5)*1.2).toFixed(2)}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*4).toFixed(1)}s"></i>`}).join('');
const h=[...document.querySelectorAll('#onl *')].find(e=>/^Playlists/.test(e.textContent.trim())&&e.children.length<=3);const grid=h.nextElementSibling;
const row=document.createElement('div');row.className='ow-row';
row.innerHTML=`<div><div class="ow-h">Orbis Terrarum<small>${cap}</small></div>
 <div class="omap" title="Open the map"><div class="omap-in"></div><div class="omap-dots">${dots(1)}</div></div></div>
 <div class="ow-col"><div class="ow-h">📯 The Forum<small>quick calls</small></div>
 <div class="ofor"><div class="ofor-feed">
  <div class="pr">📯 <b>Marcus</b> calls for 2 more · Familia · Custom · Capua<button class="take">⚔ Take a seat</button></div>
  <div><span class="who">Iulia the Swift:</span> Ave!</div>
  <div class="res">🏆 Crixus won Classic · Cassian at Roma — 38 CF</div>
  <div><span class="who">Nerva:</span> Anyone for Familia?</div>
  <div class="pr">📯 <b>Nerva</b> opened Familia · Custom · Pompeii — 3 seats free<button class="take">⚔ Take a seat</button></div>
  <div><span class="who">Flamma:</span> Ranked, anyone?</div>
 </div><div class="ofor-chips"><button>Ave!</button><button>⚔ Anyone for Classic?</button><button>👥 Anyone for Familia?</button><button>🏅 Ranked, anyone?</button><button>Well fought</button><button>Vale</button></div></div></div>`;
grid.after(row);{const c=row.querySelector('.ofor-chips');row.querySelector('.ofor').style.setProperty('--chipsH',c.offsetHeight+'px')}
row.querySelector('.omap').addEventListener('click',()=>{const o=document.createElement('div');o.className='omapbig';
  o.innerHTML=`<button class="x">✕ Close</button><div class="cap">Orbis Terrarum<small>${cap}</small></div><div class="frame"><div class="omap-in"></div><div class="omap-dots">${dots(1.8)}</div></div>`;
  o.addEventListener('click',()=>o.remove());document.body.appendChild(o)});
window.__omap=()=>row.querySelector('.omap').click();})();
