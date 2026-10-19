/* 00b-perf — v0.92 performance pass, part 1 (runs FIRST, before 00-lang; part 2 = 204-v92perf).
   • Over the versions ~30 small UI "sweeps" were added as their own setInterval (rail ovals, chips, badges, watchdogs, the wager
     bubbles, the match-save button…). Each one is cheap, but together they woke the page 50+ times a second for hours.
   • This file catches ONLY the sweeps listed in PERF92_SWEEPS (matched on a piece of their callback's source) when they are created
     and files them in PERF92.tasks instead of starting a real timer. 204-v92perf runs that table from ONE heartbeat:
     a sweep runs when something changed since its last run (input, render, a window, the turn…) or when its longest wait ran out,
     never more often than it asked for. Every other timer (animation, the music scheduler, online net/lockstep, CPU pacing,
     countdowns, self-clearing one-shots) is a real timer, untouched.
   • localStorage flavius_perf92off=1 turns the whole pass off (the soak test tv92p measures against it).
   • clearInterval / clearTimeout know the managed ids (a sweep may clear itself). */
/* v1.07 beta 4 (406-v107safari): A/B kill switches for ONE page load, without the console: the page address ending in
   #perf=v107perf2off,v107safarioff,light106:off reads localStorage flavius_<name> as '1' (or flavius_<key> as <value> for key:value)
   for this load only — nothing is written. The list is PERF_SW (the recorder's report shows it as "switches"). Names: tools/plans/v107/PERF.md. */
var PERF_SW=[];try{const m=/[#&]perf=([^&]*)/.exec(location.hash||'');if(m){const ov={};
  for(const it of decodeURIComponent(m[1]).split(',').map(s=>s.trim()).filter(Boolean)){const i=it.indexOf(':');if(!/^[\w.-]+(:[\w.-]*)?$/.test(it))continue;
    if(i<0)ov['flavius_'+it]='1';else ov['flavius_'+it.slice(0,i)]=it.slice(i+1);PERF_SW.push(it)}
  if(PERF_SW.length){const gi=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(this===window.localStorage&&Object.prototype.hasOwnProperty.call(ov,k))return ov[k];return gi.apply(this,arguments)}}}}catch(e){}
var PERF92={off:false,tasks:[],byId:new Map(),nextId:1e9,seq:1,lastAct:0,lastInput:0,idle:false,hidden:false,runs:0,hbAt:0,returns:0,
  real:{setInterval:window.setInterval.bind(window),clearInterval:window.clearInterval.bind(window),clearTimeout:window.clearTimeout.bind(window)}};
try{PERF92.off=localStorage.getItem('flavius_perf92off')==='1'}catch(e){}
PERF92.lastAct=PERF92.lastInput=performance.now();
/* [name, a piece of the callback source that only that sweep has]. Delay must be 250–1000 ms. When in doubt a timer is NOT listed. */
const PERF92_SWEEPS=[
  ['penOff76','penOffSync76()'],                       /* 108 beast pen: Call it off button */
  ['onlBar79','onlBarSync()'],                         /* 116 online top bar buttons */
  ['onlCry80',"getElementById('onlCry80')"],           /* 118 hides the call banner */
  ['onlSay80','onlSayBar80()'],                        /* 118 quick-chat bar */
  ['rb82Fit',"querySelector('#onl .rb82')"],          /* 126 Domus rank bar fit */
  ['faith85','fillBoxes85()'],                         /* 141 faith boxes */
  ['night85','c85n'],                                  /* 145 Match Week bouts-left oval */
  ['shelf87','V87.shelf'],                             /* 149 storeroom flash */
  ['tally88','wide88'],                                /* 160 phone wide tables */
  ['speed52','{try{fix()}catch(e){}}'],                  /* 56 speed tray highlight */
  ['rail73','ludusTodo73()'],                          /* 95 rail ovals */
  ['hrs65','hrchip'],                                  /* 85 old hours chips */
  ['srInfo73',"getElementById('srInfo')"],             /* 95 Summa Rudis seal hide */
  ['tabchk73','tabchk c73'],                           /* 95 per-tab ✓ */
  ['tip74','TIP_TOUCH88'],                             /* 95 card pop-up watchdog */
  ['night47','nightpend'],                             /* 47 Match Week to-do border */
  ['rail63','railPend()'],                             /* 81 rail to-do borders */
  ['srv91','srv91Chip'],                               /* 196 server version chip */
  ['tint50','turnTint(null)'],                         /* 52 turn tint off after an event */
  ['bubbles47','S.bubbles=[]'],                        /* 48 clears bubbles after an event */
  ['msave38','matchSaveUI()'],                         /* 38 match-save button */
  ['tutlock66',"toggle('tutlock'"],                    /* 86 tutorial bumper class */
  ['ofMeter67','ofMeter'],                             /* 87 offer meter first fill */
  ['chrome69','chromeoff'],                            /* 91 phone chrome under windows */
  ['wager71','wagerWatch()'],                          /* 93 wager bubbles + log pin */
  ['avhit73','AVHIT_MS'],                              /* 98 avatar hit flash redraw */
  ['pp73','function ppTick'],                          /* 99 phones portrait tabs */ /* i18n:skip */
  ['stalls89','cbar89Refresh']                         /* 181 city stalls coin watcher */
];
if(!PERF92.off){
  window.setInterval=function(f,d,...a){
    if(typeof f==='function'&&d>=250&&d<=1000){let src='';try{src=Function.prototype.toString.call(f)}catch(e){}
      const hit=PERF92_SWEEPS.find(s=>src.includes(s[1]));
      if(hit){const id=PERF92.nextId++;const t={id,name:hit[0],f,a,d,last:performance.now(),seq:0,runs:0};PERF92.tasks.push(t);PERF92.byId.set(id,t);return id}}
    return PERF92.real.setInterval(f,d,...a)};
  const unmanage=id=>{const t=PERF92.byId.get(id);if(!t)return false;PERF92.byId.delete(id);const i=PERF92.tasks.indexOf(t);if(i>=0)PERF92.tasks.splice(i,1);t.dead=true;return true};
  window.clearInterval=function(id){if(unmanage(id))return;return PERF92.real.clearInterval(id)};
  window.clearTimeout=function(id){if(unmanage(id))return;return PERF92.real.clearTimeout(id)};
}
