/* v1.0 ONLINE PRE-MATCH BRIEFING FOR JOINERS (305-v100briefonl; his B1b: every fighter sees the briefing, not only the host).
   The host's window opens it in startEvent (05-flow) and its first turn waits for the click. A joiner loads the host's snapshot (onlJoinMatch)
   and began the match at once. Now, right after the snapshot loads and before the first beginTurn (S.turnNo 0, nothing queued, fighters only —
   ONLM.me in [0, fighters); watchers, ticket holders, late rejoins (onlAttach) and mid-match joins never get it) the joiner's screen opens the
   SAME briefing window (301's look). It is purely local and never an input: the modal() call is made with ONLM.info raised for that one
   synchronous call (113 then does not record it) and nothing about it is in S or onlHash. It NEVER holds the match up: it closes itself when
   · my own turn begins (BUS turn.begin, seat === ONLM.me) — so it cannot eat my turn clock,
   · any other window is asked for (a decision window of mine, a remote-owned decision) — except pure info windows (ONLM.info>0: rule pop-ups),
     which queue behind it exactly as they do behind the host's briefing,
   · a board input / hash check from another seat is waiting in the queue (onlmReady) — the pump would otherwise wait for !CUR_MODAL,
   · the room is left / the match ends.
   "Enter the arena" / Esc / backdrop close it as on the host. Kill switches: flavius_brief100off=1 (301) or flavius_briefonl305off=1. Test tonl100bf. */
const BFO305={open:false,mine:false};
function bfo305Off(){try{return localStorage.getItem('flavius_briefonl305off')==='1'}catch(e){return false}}
function bfo305Is(){try{const m=document.getElementById('modal');return !!(BFO305.open&&CUR_MODAL&&m&&!m.hidden&&m.classList.contains('bf100'))}catch(e){return false}}
function bfo305Close(){if(!BFO305.open)return;BFO305.open=false;try{if(CUR_MODAL&&document.getElementById('modal').classList.contains('bf100'))CUR_MODAL.done(1)}catch(e){}}
function bfo305Show(L){
  if(bfo305Off()||typeof brief100On!=='function'||!brief100On())return;
  if(typeof ONLM==='undefined'||!ONLM.on||!S||S.over||S.sim||S.tutorial||S.turnNo!==0||!S.onl||S.onl.lobby!==L.id)return;
  if(ONLM.me<0||ONLM.me>=onlmFighters()||ONLM.q.length||ONLM.pend)return;
  if(typeof SETTINGS!=='undefined'&&!(SETTINGS.briefing===true||SETTINGS.briefing!==false&&!navigator.webdriver))return;
  if(typeof modalBusy==='function'&&modalBusy())return;
  const G=S,prev=BF100.cur;BF100.cur=1;BFO305.open=true;ONLM.info++;let p;
  try{p=modal(_T('📋 The briefing'),briefingHTML(),[{label:_T('⚔ To the sand'),value:1,primary:1}],{wide:true,close:1})}catch(e){BFO305.open=false;p=null}
  finally{ONLM.info--;BF100.cur=prev}
  if(p&&p.then)p.then(()=>{if(G===S)BFO305.open=false}).catch(()=>{BFO305.open=false});else BFO305.open=false;
  try{if(typeof sfx==='function')sfx('cheer')}catch(e){}}
{const base=onlJoinMatch;onlJoinMatch=async function(L){const r=await base.apply(this,arguments);try{bfo305Show(L)}catch(e){console.error(e)}return r}}
/* any other window: a rule pop-up (info) waits its turn behind the briefing; every decision / remote window closes it first */
{const base=modal;modal=function(){if(BFO305.open&&bfo305Is()&&!(typeof ONLM!=='undefined'&&ONLM.info>0)&&!(BF100.cur&&typeof arguments[1]==='string'&&arguments[1].indexOf('bf100w')>=0))bfo305Close();return base.apply(this,arguments)}}
BUS.on('turn.begin',d=>{if(BFO305.open&&d&&(d.seat===ONLM.me||!ONLM.on))bfo305Close()});
/* an input from another seat is waiting: the pump needs the window shut */
{const base=onlmReady;onlmReady=function(inp){if(BFO305.open&&bfo305Is()&&inp&&inp.k!=='void')bfo305Close();return base.apply(this,arguments)}}
{const base=onlExit;onlExit=function(){bfo305Close();return base.apply(this,arguments)}}
{const base=gameOver;gameOver=async function(){bfo305Close();return base.apply(this,arguments)}}
