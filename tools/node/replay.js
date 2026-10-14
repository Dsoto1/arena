/* tools/node/replay.js — REPLAYS a Phase-0 golden (tools/replay/golden/*.json.gz) IN NODE, no browser (v1.01 wave 2, Phase D1).
   The built page runs in tools/node/page.js's stub on a virtual clock; playback is the game's own: offline recordings go through 309's
   rp100Play (the opening snapshot, then every recorded input at the same settled points via command() and the recorded window answers),
   the online one through 113's pump in watcher mode (onlmLoad + onlmWatchOn: each input applied at a settled point, its pre-hash checked).
   Exactly what tools/replay/check.js does in Chromium, so the end hash / RNG.s / log must match what the browser recorded.
   TWO MODES (both by default):
     rules   HEADLESS on — no log, no windows, no panels: what Phase E's verifier runs. Compared: the end state hash (onlHash), RNG.s,
             turns/round/rotation, winners + reason, each seat, the beasts and the per-turn state hashes (online: every input's pre-hash).
     screen  HEADLESS off — the screen code runs against the stub too (panels, log). Compared: all of the above + every log line (the log hash).
   Usage: node tools/node/replay.js [page=flavius-arena.html] [--mode rules|screen|both] [--json] <golden name|file>…   (no name = all 15)
   Library: replayGolden(G, {page, mode}) → {name, ok, want, got, ms, diff, errors} */
'use strict';
const path=require('path'),fs=require('fs'),zlib=require('zlib');
const {openGame}=require('./page.js');
const ROOT=path.resolve(__dirname,'..','..');const GOLD=path.join(ROOT,'tools','replay','golden');
const loadG=f=>JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString());
/* FNV-1a over the log lines (one per line, "turn|cls|text" as the probe keeps them) */
function logHash(lines){if(!lines)return '';let h=0x811c9dc5;const s=lines.join('\n');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')+'/'+lines.length}
/* lib.js's field-by-field diff (kept in step with tools/replay/lib.js) */
const {diff}=require(path.join(ROOT,'tools','replay','lib.js'));

/* a page as the harness's openPage leaves it: probe on, menus away, crowd memory empty, rule pop-ups seen, no Fast frame pacing */
async function openPlay(o){const P=await openGame({page:o.page,ls:{flavius_firstrun:'shown',flavius_replay0:'1',flavius_first100off:'1',...(o.ls||{})},t0:o.t0,verbose:o.verbose,webdriver:o.webdriver});
  await P.until(()=>P.G.FLAVIUS_READY,60000);
  await P.until(()=>P.ev('CROWD_CACHE.length>0'),6000);
  P.ev(`CROWD_CACHE=[];menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;window.__m=ERR92.n`);
  return P}

const RULES=o=>o.mode==='rules';
async function replayOffline(G,o){const P=await openPlay(o);const t0=Date.now();try{
    if(RULES(o))P.ev('HEADLESS=true');P.G.__R=G.R;P.ev('rp100Play(__R.id,{R:__R,force:true}).then(()=>rp100Speed(4))');
    const done=await P.until(()=>P.ev('!!(RPP.end&&typeof RP0!=="undefined"&&RP0.last)'),3600000);
    const o2=P.ev('({end:RP0.last,rp:RPP.end,div:RPP.div,i:RPP.i,n:RPP.ins.length,turn:S&&S.turnNo,phase:S&&S.phase,errs:errNew92(window.__m).map(e=>e.msg)})');
    const got=done&&o2.end?JSON.parse(JSON.stringify(o2.end)):null;const want=RULES(o)?{...G.end,log:[]}:G.end;const d=got?diff(want,got):{field:'end',want:'an end',got:'none (turn '+o2.turn+', '+o2.phase+', input '+o2.i+'/'+o2.n+')'};
    return {name:G.name,kind:'off',mode:o.mode,ok:!d,diff:d,want:{h:G.end.h,rng:G.end.rng,log:logHash(G.end.log),turns:G.end.turns},got:got?{h:got.h,rng:got.rng,log:RULES(o)?'—':logHash(got.log),turns:got.turns,win:got.win}:null,
      inputs:`${o2.i}/${o2.n}`,div:o2.div,ms:Date.now()-t0,virtMs:P.now(),errors:[...o2.errs,...P.errors.map(e=>String(e&&e.message||e))].slice(0,8)}}
  finally{P.close()}}

/* the online mock golden: a fresh page replays the server's stream through 113's watcher path; every input must meet the pre-hash both
   windows had, the end state the same (tools/replay/online.js check()) */
const endState='({h:onlHash(),rng:RNG?RNG.s:null,turns:S.turnNo,ri:S.ri,res:S.players.map(rp0Seat),npcs:(S.npcs||[]).map(n=>[n.t,n.r,n.c,n.hp,n.alive?1:0])})';
async function replayOnline(G,o){const P=await openPlay(o);const t0=Date.now();try{const top=G.inputs.length?G.inputs[G.inputs.length-1].seq:-1;
    if(RULES(o))P.ev('HEADLESS=true');P.G.__G=G;P.ev(`rp100Play('onlgold',{force:true,R:{f:'flavius-replay',fv:1,id:'onlgold',kind:'onl',v:GAME_VER,at:Date.now(),mode:'onl',title:'golden',sub:'',open:__G.open,inputs:__G.inputs,end:{}}}).then(()=>rp100Speed(4))`);
    const done=await P.until(()=>P.ev(`typeof ONLM!=='undefined'&&ONLM.next>${top}&&!ONLM.q.length&&!ONLM.pend&&S&&!S.busy&&(S.over||['choice','action','command'].includes(S.phase))`),3600000);
    const r=P.ev(`({next:ONLM.next,hlog:ONLM.hlog,end:${endState},log:(S.logLines||[]).map(l=>l.turn+'|'+(l.cls||'')+'|'+String(l.text||'').replace(/\\s+/g,' ').trim()),errs:errNew92(window.__m).map(e=>e.msg)})`);
    const got=JSON.parse(JSON.stringify(r.end));let d=null;
    for(const inp of G.inputs){const want=G.A.hlog['s'+inp.seq]||G.B.hlog['s'+inp.seq];const h=r.hlog['s'+inp.seq];
      if(want&&want!=='g89'&&h!==want){d={field:'input pre-hash',seq:inp.seq,want,got:h||'(not applied)'};break}}
    if(!d)d=diff(G.A.end,got);if(!done&&!d)d={field:'end',want:'settled after seq '+top,got:'not settled (next '+r.next+')'};
    return {name:G.name,kind:'onl',mode:o.mode,ok:!d,diff:d,want:{h:G.A.end.h,rng:G.A.end.rng,log:'—',turns:G.A.end.turns},got:{h:got.h,rng:got.rng,log:RULES(o)?'—':logHash(r.log),turns:got.turns},
      inputs:`${G.inputs.length} lockstep`,ms:Date.now()-t0,virtMs:P.now(),errors:[...r.errs,...P.errors.map(e=>String(e&&e.message||e))].slice(0,8)}}
  finally{P.close()}}

/* the page clock starts at the recording's own time (a fixed epoch otherwise), so two runs print the same log */
async function replayGolden(G,o={}){o={page:path.join(ROOT,'flavius-arena.html'),t0:Date.parse(G.at)||1760000000000,mode:'screen',...o};return G.inputs&&G.open?replayOnline(G,o):replayOffline(G,o)}
function goldens(names){const all=fs.readdirSync(GOLD).filter(f=>/\.json\.gz$/.test(f)).sort();
  return (names&&names.length?names.map(n=>fs.existsSync(n)?path.resolve(n):path.join(GOLD,n.replace(/\.json\.gz$/,'')+'.json.gz')):all.map(f=>path.join(GOLD,f)))}
module.exports={replayGolden,goldens,loadG,logHash,openPlay,GOLD};

if(require.main===module){const args=process.argv.slice(2);const json=args.includes('--json');const mi=args.indexOf('--mode');const mode=mi>=0?args[mi+1]:'both';
  const rest=args.filter((a,i)=>a!=='--json'&&a!=='--mode'&&!(mi>=0&&i===mi+1));
  const page=rest.find(a=>/\.html$/.test(a))||path.join(ROOT,'flavius-arena.html');const names=rest.filter(a=>!/\.html$/.test(a));
  const modes=mode==='both'?['rules','screen']:[mode];
  (async()=>{let bad=0;const T0=Date.now();
    for(const f of goldens(names)){const G=loadG(f);for(const md of modes){let r;try{r=await replayGolden(G,{page,mode:md,verbose:!!process.env.NODE_VERBOSE})}catch(e){r={name:G.name,mode:md,ok:false,diff:{field:'crash',got:String(e&&e.stack||e).slice(0,400)},errors:[]}}
      if(!r.ok)bad++;
      if(json){console.log(JSON.stringify(r));continue}
      const w=r.want||{},g=r.got||{};
      console.log((r.ok?'ok    ':'FAIL  ')+r.name.padEnd(18)+md.padEnd(7)+` browser ${w.h} rng ${w.rng} log ${w.log} · node ${g.h} rng ${g.rng} log ${g.log} · ${r.inputs||''} · ${r.ms} ms (page ${Math.round((r.virtMs||0)/1000)} s)`);
      if(!r.ok)console.log('        first divergence:',JSON.stringify(r.diff).slice(0,600));
      if(r.errors&&r.errors.length)console.log('        page errors:',JSON.stringify(r.errors).slice(0,400))}}
    console.log('time',Math.round((Date.now()-T0)/1000)+'s',bad?`NODE REPLAY: ${bad} mismatch(es)`:'NODE REPLAY: every golden replays to the browser\'s game');process.exitCode=bad?1:0;process.exit()})()}
