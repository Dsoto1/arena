/* v0.97 (244-v96walk): Match Week — "Walk the city square" sits in the city banner (forum image background, no icon, text only),
   the click still opens the City Square; the Road box + "Asking for a fight" line are ONE strip (.travelcard.strip96) with the road
   text; no road85 side column / mailline ask line left; bye week hides the button; phones keep it reachable; no page errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(600)});
for(const k of ['road','paid','home','bye']){
 const r=await pg.evaluate(async(k)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),n=w.night,m=me();n.bye=false;delete n.selfBye;delete n.travel;n.scouted=null;
  const home=travelHome(m);if(k==='home')n.loc=home;else if(n.loc===home)n.loc=home===6?5:6;
  if(k!=='home'&&k!=='bye'){const t=travelState(w);if(k==='paid')t.paid=true}
  {const g0=rosterOf(m)[0];for(const b2 of (n.bouts||[]))b2.ents=b2.ents.filter(x=>x!==g0.id);g0.wantFight={week:w.week}} /* v1.05 B59: an ask clears once he is on the card, so he is taken off it first */if(k==='bye')n.bye=true;
  MGR_REDRAW();await W8(900);
  const q=s=>document.querySelector('#mgrBody '+s);const R=e=>e.getBoundingClientRect();const o={};
  const btn=q('.roomhd .walk96 [data-mg="city"]');o.btn=!!btn;o.anyCity=!!q('[data-mg="city"]');
  if(btn){o.text=btn.textContent.trim();o.noIcon=!btn.querySelector('img,svg,small')&&!/\p{Extended_Pictographic}/u.test(btn.textContent);o.bg=/url\(/.test(btn.style.backgroundImage||'');
    const hr=R(q('.roomhd')),br=R(btn);o.inBanner=br.left>=hr.left-1&&br.right<=hr.right+1&&br.top>=hr.top-1&&br.bottom<=hr.bottom+1;
    const tr=q('.roomstat.bt85w');if(tr){const a=R(tr);o.clear=!(br.left<a.right&&a.left<br.right&&br.top<a.bottom&&a.top<br.bottom)}else o.clear=true;
    o.note=!!q('.roomhd .walk96 .city90n');o.sw=document.documentElement.scrollWidth<=innerWidth+1}
  const st=q('.travelcard.strip96');o.strip=!!st;o.stripText=(st?st.textContent:'')+' '+[...document.querySelectorAll('.mw105ban .mw105chip')].map(x=>x.textContent).join(' ');o.ask=st?/🗣/.test(st.textContent):false;o.stripH=st?R(st).height:0;
  o.oldSide=!!q('.road85side')||!!q('.travelcard.road85')||!!q('.fightreq');o.oldAsk=[...document.querySelectorAll('#mgrBody .mailline')].some(x=>/🗣/.test(x.textContent));
  o.cityOutside=!!q('.road85t [data-mg="city"]');
  if(btn&&k==='road'){btn.click();await W8(900);o.opened=!!CITY.open;try{closeCity()}catch(e){}await W8(500)}
  return o},k);
 const t=k+' W'+W;
 if(k==='bye'){ok(!r.btn,t+' no walk button in a banner');continue}
 ok(r.btn&&r.text==='Walk the city square'&&r.noIcon,t+' button text only '+JSON.stringify([r.text,r.noIcon]));ok(r.bg,t+' forum image background');ok(r.inBanner&&r.clear,t+' inside banner, clear of tracker');ok(r.note,t+' note beside it');ok(r.sw,t+' no horizontal scroll');
 ok(r.strip&&r.ask,t+' strip with the asking line');ok(!r.oldSide&&!r.oldAsk&&!r.cityOutside,t+' old boxes gone');
 if(k==='road'||k==='paid')ok(/(On the road to|Road to|On the road from|Booked for)/.test(r.stripText) /* v1.05: the road line is a banner chip (360) */,t+' road text: '+r.stripText.slice(0,80));
 if(k==='road'||k==='paid')ok(r.stripH<(W>600?80:170),t+' slim '+r.stripH);
 if(k==='road')ok(r.opened,t+' click opens the City Square');
}
await pg.close()}
console.log(miss.length?'FAIL\n'+miss.join('\n'):'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
