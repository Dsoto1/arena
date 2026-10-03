(()=>{const TZ=[['America/Los_Angeles',34.05,-118.24,3],['America/Chicago',41.88,-87.63,5],['America/New_York',40.71,-74.0,8],['America/Sao_Paulo',-23.55,-46.63,2],
 ['Europe/London',51.5,-0.12,6],['Europe/Rome',41.9,12.5,4],['Europe/Berlin',52.5,13.4,3],['Asia/Tokyo',35.7,139.7,2],['Australia/Sydney',-33.87,151.2,3],
 ['Asia/Manila',14.6,121.0,2],['Africa/Johannesburg',-26.2,28.0,1],['Asia/Kolkata',22.57,88.36,1],['America/Mexico_City',19.43,-99.13,2],['Europe/Madrid',40.42,-3.7,2]];
const h=[...document.querySelectorAll('#onl *')].find(e=>/^Playlists/.test(e.textContent.trim())&&e.children.length<=3);const grid=h.nextElementSibling;
const n=TZ.reduce((t,x)=>t+x[3],0);
const div=document.createElement('div');div.className='omap';div.setAttribute('aria-hidden','true');
const wrap=document.createElement('div');wrap.innerHTML=`<div class="omap-cap">Orbis Terrarum<small><b>${n}</b> lanistas online · 6 fighting · 3 waiting</small></div><div class="omap" aria-hidden="true"><div class="omap-in"></div><div class="omap-dots" style="position:absolute;inset:0">${TZ.map(([,la,lo,c])=>{const x=(lo+180)/360*100,y=(76-la)/128*100,s=10+Math.sqrt(c)*9;
  return `<i class="omap-dot" style="left:${(x+(Math.random()-.5)*.8).toFixed(2)}%;top:${(y+(Math.random()-.5)*1.5).toFixed(2)}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*4).toFixed(1)}s"></i>`}).join('')}</div>
</div>`;
grid.after(wrap)})();
