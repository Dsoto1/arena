/* =====================================================================
   371-V105POT · v1.05 B42 · THE POT HOLDS, ON THE BOARD. DISPLAY ONLY: nothing here writes S, rolls a die or changes a promise.
   Hitting a pillar's Blessings pot too weakly (or missing) used to leave only a log line ("— the pot holds (needs 2)"). Now:
   - doAttack's pot branch emits BUS 'pot.hold' {r,c,dmg,need} (04-rules; a one-line emit after the log, no rule touched);
   - this module listens and floats ONE readout ABOVE the pot's pillar through 277's h100Add (the hit-readout family):
       damage short of the need -> "Holds · 1 of 2" (dealt of needed);  no damage at all -> "Miss" (replaces 04-rules' small "Missed"
       float on that tile, so it is one word, not two);
   - the pot shakes a little (a ~360 ms side-to-side jiggle painted by a drawPillar / drawPot wrapper, outermost).
   Reduce motion / Animations Off (SETTINGS.anim88 'off', SETTINGS.calm) -> the text only, no shake. Effects off / Fast / Snap / headless:
   nothing new (277's own rules; without 277 the text goes through fx()). A pot that breaks is untouched.
   KILL SWITCH localStorage flavius_v105potoff=1. Test tv105j. Small edit in 277: readouts take an optional R.up (tile heights).
   ===================================================================== */
const POT105={off:false,sh:null,dx:0};
try{POT105.off=localStorage.getItem('flavius_v105potoff')==='1'}catch(e){}
const POT105_SHAKE=360; /* TWEAK: ms of the jiggle */
const pot105Anim=()=>{try{if(typeof reduceMotion==='function'&&reduceMotion())return false;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return false;if(typeof h100Anim==='function')return h100Anim();return true}catch(e){return true}};
function pot105Show(e){
  if(POT105.off||HEADLESS||!S||S.sim||!e||e.r==null)return;
  const dmg=Math.max(0,e.dmg|0),need=e.need||2;
  const word=dmg>0?_T`Holds · ${dmg} of ${need}`:_T('Miss');
  const col=dmg>0?'#f3e6cf':'#b8b0a4';
  const pl=(S.pillars||[]).find(p=>p.r===e.r&&p.c===e.c);const up=0.45+0.44*Math.max(0,((pl&&pl.pots&&pl.pots.length)||1)-1);
  if(typeof h100Add==='function'&&typeof h100Live==='function'&&h100Live()){
    const key='tile:'+e.r+','+e.c;
    if(!dmg){const old=_T('Missed'),now=performance.now();H100.list=H100.list.filter(x=>!(x.key===key&&x.word===old&&now-x.made<900))} /* before the add: the queue starts after what is still shown */
    h100Add(key,{word,text:word,color:col,r:e.r,c:e.c,up})}
  else if(typeof fx==='function')fx(e.r,e.c,word,col);
  if(pl&&pot105Anim()&&!(typeof h100Fast==='function'&&h100Fast())){POT105.sh={pl,t0:performance.now()};pot105Loop()}}
function pot105Loop(){requestAnimationFrame(()=>{try{draw()}catch(e){}const s=POT105.sh;if(s&&performance.now()-s.t0<POT105_SHAKE)pot105Loop();else POT105.sh=null})}
function pot105Dx(pl){const s=POT105.sh;if(!s||s.pl!==pl)return 0;const k=(performance.now()-s.t0)/POT105_SHAKE;if(k>=1||k<0)return 0;return Math.sin(k*Math.PI*6)*(1-k)*TW*0.05}
{const base=drawPillar;drawPillar=function(pl){const dx=POT105.off?0:pot105Dx(pl);if(!dx)return base.apply(this,arguments);
  POT105.dx=dx;try{return base.apply(this,arguments)}finally{POT105.dx=0}}}
{const base=drawPot;drawPot=function(x,y,s,eagle){if(POT105.dx)x+=POT105.dx;return base.apply(this,arguments)}}
if(!POT105.off&&typeof BUS!=='undefined')BUS.on('pot.hold',e=>{try{pot105Show(e)}catch(err){console.error(err)}});
