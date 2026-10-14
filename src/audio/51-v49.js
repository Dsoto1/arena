/* =====================================================================
   51-V49 · Music THAT HITS, A SEEK BAR, AND THE OTHER THEMES WHERE THEY BELONG
   =====================================================================
   • Every city theme keeps its melody, mode and chords and gains a beat: seven cities go trap (808 glides, clap
     on three, rolling hats), five go EDM (four on the floor, offbeat hats, a chip arpeggio). Midi-chip meets
     Rome meets the club. The bridge drops the kit and builds back in.
   • A track bar on every song in Settings → Audio: click anywhere on it to jump there.
   • The four other themes (Manager, Annals, Superbus, Special) join the playlist once heard where they belong —
     or all sixteen at once with the word of power.
   • Opening the Manager or the Annals takes over from a track you picked by hand, so their themes are heard.
   ===================================================================== */
const AUD_GROOVE={Roma:'trap',Pompeii:'trap',Arles:'trap',Thysdrus:'trap',Nemausus:'trap',Uthina:'trap',Pola:'trap',
  Capua:'edm',Syracusae:'edm',Verona:'edm','Leptis Magna':'edm',Puteoli:'edm'};
function audKick(t,v=0.42){const c=AUD.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+0.12);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);o.connect(g);g.connect(AUD.music);o.start(t);o.stop(t+0.3)}
function audGroove(th,t,step,inten){const kind=AUD_GROOVE[th.name];if(!kind)return;const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const chord=B?th.brProg[bar]:th.prog[bar];const d=AUD.music;
  const root=audMtof(th.deg(chord,-2));const lv=0.75+0.12*inten;
  if(B){ /* the build: hats thicken, a snare roll climbs, the drop lands on the next A */
    if(bar<4){if(st%2===0)audHat(t,0.07*lv)}else{audHat(t,0.09*lv);if(bar>=6)audNoise(d,t+spb/2,0.05,(0.05+0.025*(bar-6))*lv,{f:2200});if(bar===7&&st>=4)audNoise(d,t+spb/4,0.04,0.12*lv,{f:2400})}
    if(st===0&&bar%2===0)aud808(t,root,spb*6,0.16*lv);return}
  if(kind==='trap'){
    if(st===0)aud808(t,root,spb*3.2,0.3*lv,bar%4===3?root*0.89:null);if(st===3&&bar%2===1)aud808(t,root,spb*1.2,0.2*lv);if(st===6&&bar%4===1)aud808(t,root*1.12,spb*1.4,0.2*lv,root);
    if(st===4)audClap(t,0.2*lv);
    audHat(t,0.1*lv);if(st===5||st===7)audHat(t+spb/2,0.07*lv);if(bar%4===3&&st>=4)for(const k of [1,2])audHat(t+spb*k/3,0.06*lv);if(st===7&&bar%2===0)audHat(t,0.07*lv,true);
  }else{ /* EDM: four on the floor, claps on 2 and 4, open hats on the off-beats, a chip arpeggio in 16ths */
    if(st%2===0)audKick(t,0.36*lv);if(st===2||st===6)audClap(t,0.16*lv);if(st%2===1)audHat(t,0.09*lv,true);else audHat(t+spb/2,0.05*lv);
    if(st%2===0)audNote(d,t+spb*0.5,root*2,spb*0.45,'sawtooth',0.035*lv,{lp:900,lpTo:400,a:0.003,r:0.05});
    if(S9.kind==='A2'||inten>=1){const arp=[0,2,4,7];for(const k of [0,1])audNote(d,t+k*spb/2,audMtof(th.deg(chord+arp[(st*2+k)%4],2)),spb*0.4,'square',0.014*lv,{lp:3200,a:0.002,r:0.05})}}
  /* a little chip sparkle in the answer phrase, both styles */
  if(S9.kind==='A2'&&st===7&&bar%2===1)audNote(d,t,audMtof(th.deg(chord+4,2)),spb*0.6,'square',0.02,{lp:4000,a:0.002,r:0.08})}
{const _th=audTheme;audTheme=function(name){const th=_th(name);th.name=name;return th}}
{const _st=audStep;audStep=function(th,t,step,inten){_st(th,t,step,inten);if(th&&!th.fn&&!th.boss)try{audGroove(th,t,step,inten)}catch(e){}}}
/* the city themes pick up a touch of pace for the beat */
for(const [k,v] of Object.entries(AUD_GROOVE))if(AUD_THEMES[k]&&!AUD_THEMES[k].v49){AUD_THEMES[k].bpm=Math.round(AUD_THEMES[k].bpm*(v==='edm'?1.18:1.05));AUD_THEMES[k].v49=1}

/* ---------- the other themes: heard where they belong, then yours ---------- */
const AUD_WHERE={Manager:_T('open Manager mode to hear it'),Annals:_T('open the Annals to hear it'),Superbus:_T('reach the Flavius Superbus to hear it'),Special:_T('play a special event or a Play Now tournament to hear it')};
const audHeard=()=>{try{return JSON.parse(localStorage.getItem('flavius_heard')||'[]')}catch(e){return []}};
function audMarkHeard(k){if(!AUD_WHERE[k])return;const h=audHeard();if(h.includes(k))return;h.push(k);try{localStorage.setItem('flavius_heard',JSON.stringify(h))}catch(e){}}
{const _mu=musicUnlocked;musicUnlocked=function(n){if(AUD_WHERE[n]){try{if(localStorage.getItem('flavius_musica')==='1')return true}catch(e){}return audHeard().includes(n)}return _mu(n)}}
{const _aw=audWant;audWant=function(){const ctx=audSuperbusOn()?_T('Superbus'):audSpecialOn()?_T('Special'):audVis('mgrBody')?_T('Manager'):audVis('hallBody')?_T('Annals'):null;
  if(ctx!==AUD.ctxLast){AUD.ctxLast=ctx;if(ctx&&AUD.manual&&AUD.manual!==ctx)AUD.manual=null}
  const w=_aw();if(w===ctx)audMarkHeard(ctx);return w}}
{const _lh=audListHTML;audListHTML=function(){let h=_lh();for(const k of Object.keys(AUD_WHERE)){if(musicUnlocked(k))continue;
    const re=new RegExp(`<div class="trackrow[^"]*"><span class="n">(\\d+)</span><span><b>${esc(AUD_THEMES[k].nm)}</b>[\\s\\S]*?data-city="${k}"[\\s\\S]*?</span></div>`);
    h=h.replace(re,(m0,n)=>`<div class="trackrow locked"><span class="n">${n}</span><span><b>🔒 ${esc(AUD_THEMES[k].nm)}</b><br><span class="rc-sub">${AUD_WHERE[k]}</span></span><span class="seg"><button type="button" disabled>🔒</button></span></div>`)}
  return h}}
/* the playing theme can be played and paused while Settings is open — during an event too */
{const _pt=audPlayTrack;audPlayTrack=function(name){if(!musicUnlocked(name)&&AUD_WHERE[name]){if(typeof mToast==='function')mToast(`🔒 ${AUD_WHERE[name][0].toUpperCase()+AUD_WHERE[name].slice(1)}.`);return}return _pt(name)}}

/* ---------- the track bar ---------- */
const audTrackSecs=th=>TRACK_STEPS*60/(th?th.bpm:90)/2;
const audClock=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function audBarsSync(){const el=document.getElementById('audTracks');if(!el)return;
  for(const row of el.querySelectorAll('.trackrow')){if(row.classList.contains('locked'))continue;const b=row.querySelector('[data-city]');if(!b)continue;const city=b.dataset.city;
    let bar=row.querySelector('.trkbar');if(!bar){bar=document.createElement('div');bar.className='trkbar';bar.dataset.seek=city;bar.title=_T('Click anywhere to jump there');bar.innerHTML='<i></i><span></span>';row.appendChild(bar)}
    const T=AUD_THEMES[city];const tot=audTrackSecs(T);const mine=AUD.loc===city&&AUD.theme;const pos=mine?Math.min(1,(AUD.step%TRACK_STEPS)/TRACK_STEPS):0;
    const i=bar.querySelector('i');const w=(pos*100).toFixed(1)+'%';if(i.style.width!==w)i.style.width=w;const lab=`${audClock(pos*tot)} / ${audClock(tot)}`;const sp=bar.querySelector('span');if(sp.textContent!==lab)sp.textContent=lab}}
{const _lr=audListRefresh;audListRefresh=function(){_lr();audBarsSync()}}
setInterval(()=>{if(!HEADLESS&&document.getElementById('audTracks'))audBarsSync()},250);
document.addEventListener('click',e=>{const bar=e.target.closest('.trkbar');if(!bar)return;e.stopPropagation();const city=bar.dataset.seek;const r=bar.getBoundingClientRect();const f=Math.max(0,Math.min(0.999,(e.clientX-r.left)/r.width));const st=Math.floor(f*TRACK_STEPS/8)*8;
  if(AUD.loc===city&&AUD.theme&&AUD.ctx){AUD.step=st;AUD.next=AUD.ctx.currentTime+0.05;if(!AUD.playing)audPlayTrack(city)}else{AUD.seek=st;audPlayTrack(city)}setTimeout(audBarsSync,60)},true);

/* ---------- weeks are shown as the week of the season (the career counts them from the founding) ---------- */
function wkOf(a){return ((Math.max(1,a|0)-1)%12)+1}
/* ---------- Match Week: Flavius's travelling games play a three-day card ---------- */
const BOUT_DAY={under:_T('Friday'),feature:_T('Saturday'),main:_T('Sunday')};
function boutDay(t){return BOUT_DAY[t]||_T('Sunday')}

/* ---------- Your ludus tells you when the week's work is done ---------- */
function ludusPending(){const w=W_(),m=me();if(!w||!m||w.dead)return [];const ros=rosterOf(m);const P=[];
  const left=typeof repCap==='function'?Math.max(0,repCap()-(w.repair||0)):0;
  const hurt=ros.filter(g=>g.inj&&!g.inj.war&&g.medWk!==w.week&&g.bathWk!==w.week);
  if(hurt.length&&((left>=5&&m.coin>=5)||(typeof hygeiaReady==='function'&&hygeiaReady(m))))P.push('infirm');
  if(!w.train||w.train==='off')P.push('practice');
  if((m.perkPts||0)>0)P.push('perk');
  if(ros.length<3&&w.hours>0&&freeAgents().some(g=>!g.inj&&askWage(g)*3<=m.coin))P.push('recruit');
  return P}
const nightOpen=()=>{const w=W_();return !!(w&&w.night&&w.night.bouts&&w.night.bouts.some(b=>!b.done))};
{const _lt=ludusTodos;ludusTodos=function(){const T=_lt();try{const w=W_();if(!ludusPending().length&&nightOpen())T.unshift(['✅',_T`<b>All set in Your ludus.</b> Match Week is waiting at <b>${esc(LOCATIONS[w.night.loc].n)}</b>.`,`<button class="btn primary" type="button" data-mg="tab" data-id="night" style="padding:2px 8px">${_T`Go to Match Week →`}</button>`])}catch(e){}return T}}
{const _mh=mgrHTML;mgrHTML=function(){let h=_mh();try{const w=W_();if(!w||w.dead)return h;const pend=ludusPending().length>0;
  h=h.replace(/(<button[^>]*data-mg="tab" data-id="ludus"[^>]*class=")([^"]*)("[^>]*>)([\s\S]*?)(<\/button>)/,(m0,a,cls,c,lab,e)=>`${a}${cls} ${pend?'ludpend':'luddone'}${c}${lab}${pend?'':'<span class="tabchk" title="Everything here is done for the week">✓</span>'}${e}`)}catch(e){}return h}}

/* ---------- committing fighters to a special event lifts them — if they are still here to fight it ---------- */
function invitesMorale(w,pm){if(!w||!pm||!w.invites)return;for(const iv of w.invites){
  if(iv.status==='accepted'&&iv.accWk==null){iv.accWk=w.week;for(const g of (iv.ents||[]).map(gById))if(g&&g.contract&&g.contract.mgr===pm.id){g.morale=clamp((g.morale||50)+4,0,100);ghist(g,_T`picked for ${iv.n}`)}
    tnews(_T`⭐ Picked for <b>${esc(iv.n)}</b>: ${(iv.ents||[]).map(gById).filter(Boolean).map(g=>esc(g.name)).join(' & ')} walk a little taller (+4 morale). Keep them until it's fought for more.`)}
  if(iv.status==='playing'&&!iv.boosted){iv.boosted=1;const stay=(iv.ents||[]).map(gById).filter(g=>g&&g.alive&&g.contract&&g.contract.mgr===pm.id&&(g.contract.since||0)<=(iv.accWk??w.week));
    if(stay.length){for(const g of stay){g.morale=clamp((g.morale||50)+8,0,100);g.loyB=clamp((g.loyB||0)+2,-25,25)}for(const g of rosterOf(pm))if(!stay.includes(g))g.morale=clamp((g.morale||50)+2,0,100);
      tnews(_T`⭐ ${stay.map(g=>esc(g.name)).join(' & ')} kept their word and travel to <b>${esc(iv.n)}</b>: +8 morale and +2 loyalty each, and the rest of the barracks gets +2 morale.`)}}}}
{const _mh=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&!w.dead)invitesMorale(w,me())}catch(e){}return _mh()}}
{const _ew=endWeek;endWeek=async function(){const r=await _ew();try{const w=W_();if(w&&!w.dead&&!w.tutorial)invitesMorale(w,me())}catch(e){console.error(e)}return r}}

/* ---------- no hand-holding for a house in high gear ----------
   A thriving house (350+ coin, or fame 55+ with 150+ coin) gets no loan offers when its barracks empty, no visit
   from Vulso's cart, no other house paying its road, and no Senate stipend in the Quaestor's Ledger. */
function thriving(m){return !!m&&((m.coin||0)>=350||((m.fame||0)>=55&&(m.coin||0)>=150))}
{const _eb=emptyBarracksWeek;emptyBarracksWeek=function(w,pm){if(thriving(pm)){w.cartSpell=1;return}return _eb(w,pm)}}
{const _ts=travelState;travelState=function(w){const t=_ts(w);try{if(t&&t.offer&&thriving(me()))t.offer=null}catch(e){}return t}}
{const _qc=qsClose;qsClose=function(w,pm){const r=_qc(w,pm);try{if(w.qsDue&&w.qsDue.rich==null)w.qsDue.rich=thriving(pm)}catch(e){}return r}}
{const _nw=newWorld;newWorld=function(choice){const w=_nw(choice);try{if(w&&w.founded==null)w.founded=w.week}catch(e){}return w}}
/* ---------- a newcomer's chance (a 30-career test showed brand-new houses dying by week 8) ----------
   • the founding ledger adds the Senate's newcomer grant (60) to a house built from nothing
   • the editor's newcomer price: a small, struggling house (≤2 fighters, under 120 coin, not thriving) buys a
     condemned fighter back at half the blood money */
{const _nw=newWorld;newWorld=function(choice){const w=_nw(choice);try{if(choice&&choice.type==='custom'&&w&&!w.tutorial){const pm=w.mgrs.find(m=>m.isPlayer);if(pm&&!w.grantGiven){w.grantGiven=1;pm.coin+=60;
  if(w.qsLast&&w.qsLast.founding){w.qsLast.lines.splice(1,0,[_T('🌱 The Senate’s newcomer grant — for a house built from nothing'),60]);w.qsLast.total+=60}}}}catch(e){console.error(e)}return w}}
function newcomerHouse(m){return !!m&&!thriving(m)&&rosterOf(m).length<=2&&(m.coin||0)<120}
{const _bp=bloodPrice;bloodPrice=function(g,F){const p=_bp(g,F);try{const m=g&&g.contract?mgrById(g.contract.mgr):null;if(newcomerHouse(m))return Math.max(5,Math.round(p*0.5))}catch(e){}return p}}
/* the creditors count what the Quaestor already owes you: a house a few coins short at the season's close, with
   its ledger still to be paid after the Superbus, is not closed for it */
function qsPreview(w,pm){const Q=w&&w.qsDue;if(!Q||Q.paid)return 0;const v=[Q.rich?0:30,Math.round((Q.wages||0)*0.10),Math.round((Q.lost||0)*0.12),(Q.signed||0)*12,(Q.fameD||0)*3,(Q.fansD||0)*2,Q.pos?Math.max(0,(Q.n-Q.pos))*4:0].filter(x=>x>0).reduce((a,x)=>a+x,0);return Math.min(v,120+(Q.fameAt||0)*3)}

/* ---------- uploading saves: every download can come back ----------
   One button reads any Flavius save file and files it where it belongs, overwriting nothing:
   a Play now match → the first empty slot · a Manager career → your careers (a copy if you already have it) ·
   a whole-game backup is turned away here — it replaces everything, so only Settings → Saves restores it. */
const upSaveBtn=kind=>`<label class="btn upsave" style="cursor:pointer">${_T`⬆ Upload a save<small>${kind==='career'?_T('a career .json you downloaded'):_T('a match .json you downloaded')}</small>`}<input type="file" data-upsave="${kind}" accept=".json,application/json" hidden></label>`;
async function saveUpload(file){let d=null;try{d=JSON.parse(await file.text())}catch(e){mToastSafe(_T('That file is not a Flavius Rule save.'));return false}
  if(d&&d.game==='flavius-rule'&&d.cols){mToastSafe(_T('That is a whole-game backup — it replaces every save, so it is restored only from Settings → Saves (⬆ Open a save file), which asks before replacing anything.'));return false}
  if(d&&d.game==='flavius-match'&&d.S){const k=['1','2','3'].find(k=>!matchSlotGet(k));if(!k){mToastSafe(_T('All three match slots are full — delete one, then upload again.'));return false}
    matchSlotPut(k,{...d,name:d.name||'Uploaded match'});mToastSafe(_T`⬆ “${d.name||_T('Uploaded match')}” is in slot ${k}.`);const box=document.getElementById('msWin');if(box)box.innerHTML=matchSavesHTML(box.dataset.mode||'manage');return true}
  if(d&&typeof d.world==='string'&&d.ludus){let w;try{w=JSON.parse(d.world)}catch(e){mToastSafe(_T('That career file is damaged.'));return false}
    const have=await Store.list('mgrCareers').catch(()=>[]);if(have.some(c=>c.id===w.id||(c.world&&JSON.parse(c.world).id===w.id))){w.id='w'+Date.now().toString(36);d.ludus=d.ludus+' (copy)'}
    const doc={...d,id:w.id,world:JSON.stringify(w),updated:new Date().toISOString().slice(0,16).replace('T',' ')};await Store.put('mgrCareers',w.id,doc);
    mToastSafe(_T`⬆ ${d.ludus} is in your careers.`);if(typeof MGR!=='undefined'){MGR.careers=(await Store.list('mgrCareers')).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));if(typeof MGR_REDRAW==='function')try{MGR_REDRAW()}catch(e){}}return true}
  mToastSafe(_T('That file is not a Flavius Rule save.'));return false}
document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-upsave]');if(!t||!t.files||!t.files[0])return;const f=t.files[0];t.value='';saveUpload(f)});
{const _ms=matchSavesHTML;matchSavesHTML=function(mode){return _ms(mode)+`<div class="acts" style="margin:-6px 0 12px">${upSaveBtn('match')}</div>`}}
{const _sh=startHTML;startHTML=function(){return _sh().replace(/(<h4>(?:🗂 Manage your Manager saves|📂 Load a Manager career|Saved careers)<\/h4>)/,`$1<div class="acts" style="margin:0 0 8px">${upSaveBtn('career')}</div>`)}}

/* =====================================================================
   MULTIPLAYER · HOT SEAT (open table) — up to 8 on one device, humans and CPUs mixed, every event
   =====================================================================
   • Main menu → 👥 Multiplayer opens two attached choices: 🪑 Hot seat (live) and 🌐 Online lobbies (v0.76: LAN removed)
     (placeholders until those modes exist).
   • Hot seat opens the usual setup on Roma · Classic with four player seats; each human seat takes a player name.
     A name is a PROFILE, kept on this device: its own record, wallet, honors and Road of Flavius.
   • Open table: no curtain between turns — a banner in the player's colours says whose turn it is.
   • During a hot-seat event, wagers, tickets and cheers come from the wallet of the player whose turn it is
     (or the last human who moved).
   • At the end every player's profile is updated: events, wins, CF, coin into the wallet, honors, the Road.
     The device owner's own achievements and Road are not touched by a hot-seat game.
   ===================================================================== */
let HS_PROFILES=[];
const HS_HONORS=[['first',_T('First blood'),'win a hot-seat event'],['ludus',_T('Into the Ludus'),_T('finish with 20+ CF and survive')],['fifty',_T('Freedom'),_T('reach 50 CF')],['tholo',_T('Tholo slayer'),_T('kill Tholo')],['commodus',_T('Kingslayer'),_T('kill Commodus')],
  ['eightwins',_T('Master of arms'),_T('win with all eight base classes')],['twelve',_T('Grand tour'),_T('win at all twelve arenas')],['veteran',_T('Veteran'),_T('play 25 events')],['road',_T('Walker of the Road'),_T('win the twelve arenas in the Hall’s order')],['rich',_T('Deep purse'),_T('hold 300 coin')]];
/* profiles live in THIS browser (localStorage), never in the page's shared store: a hot-seat table is one device */
async function hsLoad(){try{HS_PROFILES=JSON.parse(localStorage.getItem('flavius_hs')||'[]')||[]}catch(e){HS_PROFILES=HS_PROFILES||[]}return HS_PROFILES}
function hsPersist(){try{localStorage.setItem('flavius_hs',JSON.stringify(HS_PROFILES))}catch(e){}}
const hsSave=p=>{const i=HS_PROFILES.findIndex(q=>q.id===p.id);if(i<0)HS_PROFILES.push(p);else HS_PROFILES[i]=p;hsPersist();return Promise.resolve()};
function hsFind(name){const n=String(name||'').trim().toLowerCase();return HS_PROFILES.find(p=>p.name.toLowerCase()===n)||null}
function hsEnsure(name,color){let p=hsFind(name);if(p)return p;p={id:'hp'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),name:String(name).trim().slice(0,20),color:color||PALETTE[HS_PROFILES.length%PALETTE.length],created:new Date().toISOString().slice(0,10),
  events:0,wins:0,cfTotal:0,cfBest:0,ludus:0,freed:0,deaths:0,coin:50,won:0,lost:0,bets:0,history:[],honors:{},classWins:[],locs:[],road:0};HS_PROFILES.push(p);hsSave(p);return p}
const hsLive=()=>!!(typeof S!=='undefined'&&S&&S.hotseat&&!S.over&&!S.mgrCtx);
const hsActive=()=>{if(typeof hsPidNow==='function'){const o=hsPidNow();if(o!==undefined)return o?HS_PROFILES.find(p=>p.id===o)||null:null}if(!hsLive())return null;const id=S.hsActive||(S.hotseat.players[0]||{}).pid;return HS_PROFILES.find(p=>p.id===id)||null};

/* ---------- the main menu: Multiplayer and its three modes ---------- */
function mmMultiInstall(){const box=document.querySelector('#mainMenu .mmbtns');if(!box||box.querySelector('[data-mm="multi"]'))return;const play=box.querySelector('[data-mm="play"]');if(!play)return;
  const b=document.createElement('button');b.className='btn';b.type='button';b.dataset.mm='multi';b.setAttribute('aria-expanded','false');b.innerHTML=_T('👥 Multiplayer<small>hot seat · online</small>');
  const g=document.createElement('div');g.className='mmmulti';g.id='mmMulti';g.hidden=true;
  g.innerHTML=`<button class="btn" type="button" data-mm="hotseat">${_T`🪑 Hot seat<small>2–8 players on this device, CPUs fill the rest</small>`}</button><button class="btn" type="button" data-mm="online" disabled title="${_T`Coming in a later version`}">${_T`🌐 Online lobbies<small>coming soon</small>`}</button>`;
  play.after(b);b.after(g)}
if(!HEADLESS||true)setTimeout(mmMultiInstall,0);
document.addEventListener('click',e=>{const b=e.target.closest('#mainMenu [data-mm="multi"],#mainMenu [data-mm="hotseat"]');if(!b)return;e.stopPropagation();
  if(b.dataset.mm==='multi'){const g=document.getElementById('mmMulti');if(!g)return;g.hidden=!g.hidden;b.setAttribute('aria-expanded',String(!g.hidden));b.classList.toggle('on',!g.hidden);return}
  if(typeof modalBusy==='function'&&modalBusy())return;mmLaunch(()=>hotSeatOpen(),_T('Hot seat'))},true);

/* ---------- the setup ---------- */
async function hotSeatOpen(){await hsLoad();CFG.hotseat=true;CFG.mode='event';CFG.loc=6;CFG.ev='democritus';CFG.n=4;
  const names=[...HS_PROFILES].sort((a,b)=>(b.events||0)-(a.events||0)).map(p=>p.name);
  CFG.seats.forEach((s,i)=>{s.cpu=i>=4;s.hsName=i<4?(names[i]||''):'';s.saved=null;if(s.cpu&&s.name&&!s.saved)s.name=undefined});
  return openSetup(false)}
function hsBoardHTML(){const L=[...HS_PROFILES].sort((a,b)=>(b.wins-a.wins)||(b.events-a.events));
  return `<div class="card2 hsbanner"><div class="sect" style="margin-top:0">${_T`🪑 Hot seat`} <span class="rc-sub">${_T`open table · pass the device on each turn · up to 8 seats, humans and CPUs`}</span></div>
   <p class="rc-sub" style="margin:2px 0 6px">${_T`Set a seat to <b>Player</b> and type a name. A name is a profile on this device: record, wallet, honors and its own Road of Flavius.`}</p>
   ${L.length?`<div style="overflow-x:auto"><table class="tally compact hstable"><tr><th>${_T`Player`}</th><th>${_T`Events`}</th><th>${_T`Wins`}</th><th>${_T`Best CF`}</th><th>${_T`Wallet`}</th><th>${_T`Honors`}</th><th>${_T`Road`}</th><th></th></tr>${L.map(p=>`<tr><td><span class="hsdot" style="background:${p.color}"></span><b>${esc(p.name)}</b></td><td class="n">${p.events}</td><td class="n">${p.wins}</td><td class="n">${p.cfBest}</td><td class="n">💰 ${p.coin}</td><td>${HS_HONORS.filter(([k])=>p.honors[k]).map(([k,n,d])=>`<span class="hshon" title="${esc(n)}: ${esc(d)}">🏅</span>`).join('')||'<span class="rc-sub">—</span>'}</td><td class="n">${p.road}/12</td><td><button type="button" class="btn tksm" data-hsdel="${p.id}" title="${_T`Delete this profile`}">🗑</button></td></tr>`).join('')}</table></div>`:`<p class="rc-sub">${_T`No players yet — names you type become profiles when the horns sound.`}</p>`}
   <datalist id="hsNames">${HS_PROFILES.map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist></div>`}
{const _sb=setupBody;setupBody=function(){if(!CFG.hotseat)return _sb();CFG.mode='event';window.HS_IN_SETUP=1;let h;try{h=_sb()}finally{window.HS_IN_SETUP=0}
  return h.replace(/^<div class="seg" role="tablist"[\s\S]*?<\/div>/,hsBoardHTML()).replace('>'+TX('Sound the horns')+'<',_T('>Sound the horns · Hot seat<'))}}
{const _sr=seatRows;seatRows=function(ev,n,cls){let h=_sr(ev,n,cls);if(!CFG.hotseat||!window.HS_IN_SETUP)return h;const parts=h.split('<div class="seat"');
  h=parts[0]+parts.slice(1).map((seg,i)=>{const s=CFG.seats[i];seg=seg.replace(/>You<\/option>/,_T('>Player</option>'));if(!s||s.cpu)return _T('<div class="seat"')+seg;
    return _T('<div class="seat"')+seg.replace(/(<span class="cn">)/,`<label class="hsname">🎮 <input class="tin" type="text" list="hsNames" data-hsn="${i}" value="${esc(s.hsName||'')}" placeholder="${_T`Player ${i+1}`}" maxlength="20" autocomplete="off" aria-label="${_T`Player name for seat ${i+1}`}"><span class="rc-sub">player</span></label>$1`)}).join('');return h}}
document.addEventListener('input',e=>{const t=e.target.closest&&e.target.closest('[data-hsn]');if(!t)return;const s=CFG.seats[+t.dataset.hsn];if(s)s.hsName=t.value});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-hsdel]');if(!b)return;e.stopPropagation();if(!b.dataset.armed){b.dataset.armed=1;b.textContent=_T('Delete?');b.classList.add('primary');return}
  const id=b.dataset.hsdel;HS_PROFILES=HS_PROFILES.filter(p=>p.id!==id);hsPersist();const box=document.querySelector('.hsbanner');if(box)box.outerHTML=hsBoardHTML()},true);
/* leaving for a normal Play now puts the seats back: you, then CPUs */
{const _pm=playNowMenu;playNowMenu=function(){if(CFG.hotseat){CFG.hotseat=false;CFG.seats.forEach((s,i)=>{s.cpu=i>0;s.hsName=''})}return _pm()}}

/* ---------- the event ---------- */
{const _se=startEvent;startEvent=function(cfg){try{if(CFG.hotseat&&cfg&&cfg.seats&&!cfg.hotseat&&!cfg.mgr&&!cfg.tourn){const used=new Set();const players=[];
  cfg.seats.forEach((s,i)=>{if(s.cpu)return;let nm=(s.hsName||'').trim()||_T`Player ${i+1}`;while(used.has(nm.toLowerCase()))nm+='′';used.add(nm.toLowerCase());const P=hsEnsure(nm);if(s.hsOwn)s.name=P.name; /* v0.88: the gladiator keeps its own name unless the player fights under theirs */players.push({seat:i,pid:P.id,name:P.name})});
  if(players.length)cfg.hotseat={players}}}catch(e){console.error(e)}return _se(cfg)}}
{const _ns=newState;newState=function(cfg){const r=_ns(cfg);try{if(cfg&&cfg.hotseat){S.hotseat=cfg.hotseat;for(const h of cfg.hotseat.players){const p=S.players.find(x=>x.id===h.seat);if(p)p.pid=h.pid}S.hsActive=cfg.hotseat.players[0]&&cfg.hotseat.players[0].pid}}catch(e){console.error(e)}return r}}
function hsTurnBanner(p){if(HEADLESS||!p)return;const P=HS_PROFILES.find(x=>x.id===p.pid);let el=document.getElementById('hsTurn');if(!el){el=document.createElement('div');el.id='hsTurn';el.className='hsturn';document.body.appendChild(el)}
  el.style.setProperty('--pc',p.color||'#f0cf7d');el.innerHTML=_T`🎮 <b>${esc(P?P.name:p.name)}</b>’s turn <span>${esc(p.name!==(P&&P.name)?p.name+' · ':'')}${esc(CLASSES[p.cls]?CLASSES[p.cls].name:'')}</span>`;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}
{const _bt=beginTurn;beginTurn=async function(){try{if(S&&S.hotseat&&!S.over){const p=cur();if(p&&!p.cpu&&p.pid){S.hsActive=p.pid;if(S.hotseat.players.length>=2&&typeof HS88==='undefined')hsTurnBanner(p)}}}catch(e){}return _bt.apply(this,arguments)}}
/* the wallet of the player at the table */
{const _gp=getPurse;getPurse=async function(){const P=hsActive();if(P)return {coin:P.coin,won:P.won||0,lost:P.lost||0,bets:P.bets||0,history:P.history||[],name:P.name,ludus:_T('Hot seat')};return _gp()}}
{const _spp=setPurse;setPurse=async function(v){const P=hsActive();if(P){P.coin=v.coin;P.won=v.won||0;P.lost=v.lost||0;P.bets=v.bets||0;P.history=(v.history||[]).slice(-40);hsSave(P);return}return _spp(v)}}
{const _am=activeMgr;activeMgr=async function(){const P=hsActive();if(P)return {coin:P.coin,name:P.name,ludus:_T('Hot seat'),hotseat:1};return _am()}}
/* the results: every player's profile moves on; the host's own achievements and Road stay out of it */
{const _ae=achievementsAfterEvent;achievementsAfterEvent=async function(rows,hall){if(S&&S.hotseat)return;return _ae(rows,hall)}}
{const _re=recordEvent;recordEvent=async function(rows){const r=await _re(rows);try{if(S&&S.hotseat&&!S.sim)await hsAfterEvent(rows)}catch(e){console.error(e)}return r}}
async function hsAfterEvent(rows){await hsLoad();const lines=[];
  for(const x of rows){const p=x.p;if(!p||p.cpu||!p.pid)continue;const P=HS_PROFILES.find(q=>q.id===p.pid);if(!P)continue;const got=[];
    P.events++;if(x.won)P.wins++;const f=Math.round(x.f||0);P.cfTotal+=f;P.cfBest=Math.max(P.cfBest,f);if(!p.alive)P.deaths++;if(f>=20&&p.alive)P.ludus++;if(f>=50)P.freed++;
    const coin=Math.max(0,Math.round(p.coin||0))+(x.won?25:0);P.coin+=coin;
    if(x.won){if(BASE_CLS.includes(p.cls)&&!P.classWins.includes(p.cls))P.classWins.push(p.cls);if(!P.locs.includes(S.locIdx))P.locs.push(S.locIdx);if(HALL_ORDER[P.road]===S.locIdx)P.road++}
    const give=k=>{if(!P.honors[k]){P.honors[k]=new Date().toISOString().slice(0,10);got.push(HS_HONORS.find(h=>h[0]===k)[1])}};
    if(x.won)give('first');if(f>=20&&p.alive)give('ludus');if(f>=50)give('fifty');
    const killed=t=>S.npcs.some(n=>n.t===t&&!n.alive&&n.killedBy===p.name);if(killed('tholo'))give('tholo');if(killed('commodus'))give('commodus');
    if(BASE_CLS.every(c=>P.classWins.includes(c)))give('eightwins');if(P.locs.length>=12)give('twelve');if(P.events>=25)give('veteran');if(P.road>=12)give('road');if(P.coin>=300)give('rich');
    await hsSave(P);lines.push(_T`<b>${esc(P.name)}</b>: ${x.won?'🏆 win · ':''}${f} CF · ${coinAmt87('+'+(coin))} (wallet ${coinAmt87(P.coin)}) · Road ${P.road}/12${got.length?` · 🏅 ${got.map(esc).join(', ')}`:''}`)}
  if(lines.length){log(`<div class="tiphint">${_T`<b>🪑 Hot seat — the players' books</b><br>${lines.join('<br>')}`}</div>`,'big');if(typeof mToast==='function')mToast(_T('🪑 Every player’s profile is updated — see the log.'))}}
setTimeout(()=>{if(!HEADLESS)hsLoad()},1200);
/* v0.54: clicking anywhere outside the Multiplayer tray closes it */
document.addEventListener('click',e=>{const g=document.getElementById('mmMulti');if(!g||g.hidden)return;
  if(e.target.closest('#mainMenu [data-mm="multi"]')||e.target.closest('#mmMulti'))return;
  g.hidden=true;const b=document.querySelector('#mainMenu [data-mm="multi"]');if(b){b.setAttribute('aria-expanded','false');b.classList.remove('on')}});
