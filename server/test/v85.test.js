/* v0.85 (no protocol change): THE ONLINE DAY turns at 20:00 New York time (DST-aware) — Today's WORLD DAY# key, the Forum reset (30-min
   grace), yesterday's fallback; the day record's showcase fields (wins: coin; fallen: gear value + purse + the killer).
   node server/test/v85.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
const U=s=>Date.parse(s),iso=t=>new Date(t).toISOString();

/* ── 1. the shared rules ── */
function rules(){
  C.setCatalog(catalog);
  const ds=s=>iso(C.dayStart(U(s)));
  /* a summer day: the boundary is 00:00 UTC (20:00 EDT) */
  assert.strictEqual(ds('2026-07-15T12:00:00Z'),'2026-07-15T00:00:00.000Z');assert.strictEqual(ds('2026-07-15T23:59:59Z'),'2026-07-15T00:00:00.000Z');
  assert.strictEqual(ds('2026-07-16T00:00:00Z'),'2026-07-16T00:00:00.000Z','the turn itself starts the new day');
  /* a winter day: 01:00 UTC (20:00 EST) */
  assert.strictEqual(ds('2026-01-15T12:00:00Z'),'2026-01-15T01:00:00.000Z');assert.strictEqual(ds('2026-01-15T00:59:59Z'),'2026-01-14T01:00:00.000Z');assert.strictEqual(ds('2026-01-15T01:00:00Z'),'2026-01-15T01:00:00.000Z');
  /* 2026-03-08 (EDT starts 07:00 UTC): the day began 01:00 UTC on EST, the next one at 00:00 UTC on EDT — a 23-hour day */
  assert.strictEqual(ds('2026-03-08T06:59:00Z'),'2026-03-08T01:00:00.000Z');assert.strictEqual(ds('2026-03-08T12:00:00Z'),'2026-03-08T01:00:00.000Z');
  assert.strictEqual(ds('2026-03-08T23:59:00Z'),'2026-03-08T01:00:00.000Z');assert.strictEqual(ds('2026-03-09T00:00:00Z'),'2026-03-09T00:00:00.000Z');
  /* 2026-11-01 (EST starts 06:00 UTC): began 00:00 UTC on EDT, the next at 01:00 UTC on EST — a 25-hour day */
  assert.strictEqual(ds('2026-11-01T12:00:00Z'),'2026-11-01T00:00:00.000Z');assert.strictEqual(ds('2026-11-02T00:30:00Z'),'2026-11-01T00:00:00.000Z');assert.strictEqual(ds('2026-11-02T01:00:00Z'),'2026-11-02T01:00:00.000Z');
  assert.strictEqual(C.nyBehind(U('2026-03-08T06:59:59Z')),5);assert.strictEqual(C.nyBehind(U('2026-03-08T07:00:00Z')),4);assert.strictEqual(C.nyBehind(U('2026-11-01T05:59:59Z')),4);assert.strictEqual(C.nyBehind(U('2026-11-01T06:00:00Z')),5);
  /* against the platform's own time zone data, every 20 minutes over two years (when the runtime has it) */
  let tzOK=false;try{tzOK=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York'}).resolvedOptions().timeZone==='America/New_York'}catch(e){}
  if(tzOK){const f=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hourCycle:'h23',hour:'2-digit',minute:'2-digit'});
    for(let t=U('2025-12-28T00:00:00Z');t<U('2028-01-03T00:00:00Z');t+=20*60e3){const s=C.dayStart(t);const p=Object.fromEntries(f.formatToParts(s).map(x=>[x.type,x.value]));
      assert.ok(p.hour==='20'&&p.minute==='00'&&s<=t&&t-s<25*36e5,'20:00 New York at '+iso(t)+' → '+iso(s))}}
  /* keys: the UTC date of the start (summer = the old UTC-day key, so old DAY# items still read); the day before */
  assert.strictEqual(C.dayKey(U('2026-07-15T12:00:00Z')),'2026-07-15');assert.strictEqual(C.dayKey(U('2026-07-15T23:59:00Z')),'2026-07-15');assert.strictEqual(C.dayKey(U('2026-07-16T00:00:01Z')),'2026-07-16');
  assert.strictEqual(C.dayKey(U('2026-01-15T00:30:00Z')),'2026-01-14','winter: before 01:00 UTC is still the last day');assert.strictEqual(C.dayKey(U('2026-01-15T01:30:00Z')),'2026-01-15');
  assert.strictEqual(C.dayPrevKey(U('2026-03-08T12:00:00Z')),'2026-03-07');assert.strictEqual(C.dayPrevKey(U('2026-03-09T00:30:00Z')),'2026-03-08','after the 23-hour day');
  assert.strictEqual(C.dayPrevKey(U('2026-11-02T00:30:00Z')),'2026-10-31','inside the 25-hour day');assert.strictEqual(C.dayPrevKey(U('2026-11-02T01:30:00Z')),'2026-11-01');
  /* the Forum: since the turn, 30 minutes of grace */
  assert.strictEqual(C.forumSince(U('2026-07-16T00:10:00Z')),U('2026-07-15T23:40:00Z'));assert.strictEqual(C.forumSince(U('2026-07-16T03:00:00Z')),U('2026-07-16T00:00:00Z'));
  assert.strictEqual(C.forumSince(U('2026-01-15T01:20:00Z')),U('2026-01-15T00:50:00Z'));
  /* the showcase fields: coin earned for the win, gear value + purse + the killer for the fall; dayBest picks the same two everywhere */
  const ch=(name,rank,x)=>({id:'c_'+name,name,cls:'hero',rank,bouts:3,wins:1,survived:2,lifeCF:90,wallet:0,gear:[],look:{},...x});
  const carried=[{item:'gladius',pc:null},{item:'galea',pc:null}];const val=carried.reduce((s,P)=>s+C.valueOf(C.pieceInfo(P,catalog)),0);assert.ok(val>0);
  let D=C.dayFromMatch({},{id:'m1',ev:'democritus',loc:6,at:1,ranked:true,seats:[
    {acct:'a',seat:0,ch:ch('Ann','veteranus'),before:'veteranus',row:{won:true,f:30,seat:0},out:{award:27,pay:22}},
    {acct:'b',seat:2,ch:ch('Bob','primus',{wallet:140}),before:'primus',row:{won:false,f:7,seat:2,kb:'g',ks:0,survives:false},out:{died:true},gx:{carried,left:[]}}]});
  D=C.dayFromMatch(D,{id:'m2',ev:'cassian',loc:2,at:2,ranked:false,seats:[{acct:'c',seat:0,ch:ch('Cal','tiro'),before:'tiro',row:{won:true,f:12,seat:0},out:{award:0}}]});
  D=C.dayFell(D,{id:'m3',acct:'d',ev:'egidious',loc:3,at:3,ch:ch('Dio','gregarius',{wallet:9,gear:['gladius'],equip:['gladius']}),before:'gregarius',hall:false});
  const B=C.dayBest(C.dayOut(D,'today'));assert.strictEqual(B.winner.name,'Ann');assert.strictEqual(B.winner.coin,27,'the award (house cut included)');assert.strictEqual(B.winner.cf,30);
  assert.strictEqual(B.loser.name,'Bob','the best rank fell');assert.deepStrictEqual([B.loser.gear,B.loser.purse,B.loser.kb,B.loser.kn,B.loser.rank],[val,140,'g','Ann','primus']);
  const dio=D.fallen.find(e=>e.name==='Dio');assert.strictEqual(dio.how,'damnatio');assert.strictEqual(dio.purse,9);assert.strictEqual(dio.gear,C.valueOf(C.pieceInfo({item:'gladius',pc:null},catalog)),'no kit: what he would have brought');
  assert.deepStrictEqual(C.dayBest(null),{winner:null,loser:null});
  /* old entries (no coin/gear/purse) still sort and show */
  assert.strictEqual(C.dayBest({wins:[{name:'Old',cf:5}],fallen:[]}).winner.name,'Old');
  /* the record stays under DAY_MAX with the new fields (faces leave first) */
  let Z={};for(let i=0;i<12;i++)Z=C.dayFromMatch(Z,{id:'z'+i,ev:'democritus',loc:6,at:i,ranked:true,seats:[{acct:'w'+i,seat:0,ch:ch('W'+i,'veteranus',{look:{portrait:{skin:'#'+'a'.repeat(6),x:'y'.repeat(400)}}}),before:'veteranus',row:{won:true,f:10+i,seat:0},out:{award:9}},
    {acct:'l'+i,seat:1,ch:ch('L'+i,'primus',{wallet:50,look:{portrait:{x:'y'.repeat(400)}}}),before:'primus',row:{won:false,f:1,seat:1,kb:'b',survives:false},out:{died:true},gx:{carried,left:[]}}]});
  assert.ok(JSON.stringify(Z).length<=C.DAY_MAX,'≤ DAY_MAX: '+JSON.stringify(Z).length);
}

/* ── 2. the routes: the Forum and Today follow the online day ── */
async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=U('2026-07-15T23:00:00Z');const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});
  let nc=0,rid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
    if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
  const connect=async name=>{const conn='v'+(++nc);live.add(conn);const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);return conn};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn=await connect(name);cl.req=(t,d)=>ask(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});return cl}
  const ann=await client('ann'),bob=await client('bob','soldier');
  async function bout(a,b,o){const L0=await a.req('lobby.create',{ev:o.ev,loc:o.loc,ranked:!!o.ranked,cry:false});await b.req('lobby.join',{id:L0.id});const L=await a.req('lobby.start',{id:L0.id});
    const sa=C.seatOf(L,a.acct),sb=C.seatOf(L,b.acct);const tb=[0,1,2,3].map(i=>({seat:i,f:3,...(i===sa?o.a||{}:i===sb?(typeof o.b==='function'?o.b(sa):o.b)||{}:{})}));
    for(const x of [a,b])await x.req('match.result',{id:L.id,table:tb,hash:'x'+L.id});return {L,sa,sb,M:await db.get('MATCH#'+L.id,'META')}}
  /* ── the Forum: lines since the turn (00:00 UTC in July = 20:00 EDT), the last 30 minutes linger ── */
  const says=async()=>(await bob.req('forum.get',{})).filter(l=>l.k==='say').length;
  await ann.req('forum.say',{q:'ave'});T=U('2026-07-15T23:45:00Z');await ann.req('forum.say',{q:'vale'});assert.strictEqual(await says(),2,'the same online day');
  T=U('2026-07-16T00:10:00Z');assert.strictEqual(await says(),1,'after the turn: only the last 30 minutes');
  T=U('2026-07-16T00:20:00Z');assert.strictEqual(await says(),0,'and then a fresh Forum');
  assert.strictEqual(((await bob.req('hello',{all:1})).forum||[]).filter(l=>l.k==='say').length,0,'hello carries the same');
  /* ── Today: a Ranked bout at 19:30 EDT; Bob falls to Ann carrying a gladius, a galea and a purse ── */
  T=U('2026-07-16T23:30:00Z');const bc=await db.get('CHAR#'+bob.ch.id,'CHAR');bc.wallet=77;bc.gear=['gladius','galea'];delete bc.equip;await db.put('CHAR#'+bob.ch.id,'CHAR',bc);
  const kitVal=C.kitOf(bc).items.reduce((s,it)=>s+C.valueOf(C.pieceOf(bc,it,catalog)),0);
  const r=await bout(ann,bob,{ev:'democritus',loc:6,ranked:true,a:{won:true,survives:true,f:25},b:sa=>({won:false,survives:false,f:4,kb:'g',ks:sa})});
  assert.ok(r.M.outs[bob.acct].died,'Bob died');const award=r.M.outs[ann.acct].award;assert.ok(award>0);
  assert.ok(await db.get('WORLD','DAY#2026-07-16'),'kept under the online day (= the July UTC date)');
  let td=(await ann.req('hello',{all:1})).today;assert.strictEqual(td.day,'today');
  const B=C.dayBest(td);assert.strictEqual(B.winner.name,'Ann Gladius');assert.strictEqual(B.winner.coin,award,'coin earned');assert.strictEqual(B.winner.cf,25);
  assert.strictEqual(B.loser.name,'Bob Gladius');assert.deepStrictEqual([B.loser.purse,B.loser.gear,B.loser.kb,B.loser.kn],[77,kitVal,'g','Ann Gladius'],'what he lost, who killed him');assert.ok(kitVal>0,'the brought gear has a value');
  /* the turn at 20:00 EDT: today is empty → yesterday's record (dayPrevKey), and the Victor of the Day is crowned once */
  T=U('2026-07-17T00:30:00Z');td=(await ann.req('hello',{all:1})).today;assert.strictEqual(td.day,'yesterday');assert.strictEqual(C.dayBest(td).winner.name,'Ann Gladius');
  assert.ok(await db.get('WORLD','VDAY#2026-07-16'),'the Victor of the Day of the day that just ended');
  assert.ok(((await db.get('DOMUS#'+ann.domus.id,'DOMUS')).trophies||[]).some(x=>x.k==='vday'),'his house holds the trophy');
  /* winter: 00:30 UTC is still the day that began at 01:00 UTC the evening before */
  T=U('2027-01-15T00:30:00Z');const cal=await client('cal'),dan=await client('dan');await bout(cal,dan,{ev:'cassian',loc:2,a:{won:true,f:11}});
  assert.ok(await db.get('WORLD','DAY#2027-01-14'),'winter: the record of the day that began 2027-01-14 01:00 UTC');
  T=U('2027-01-15T01:05:00Z');td=(await cal.req('hello',{all:1})).today;assert.strictEqual(td.day,'yesterday','01:00 UTC = 20:00 EST: a new day');assert.strictEqual(C.dayBest(td).winner.name,'Cal Gladius');
  console.log('server v0.85 routes (Forum reset at 20:00 New York with 30-min grace, Today keyed by the online day, showcase fields, yesterday fallback, Victor of the Day, winter keys): all checks passed')}

(async()=>{rules();console.log('server v0.85 rules (the online day at 20:00 New York, DST, keys, Forum grace, showcase fields): all checks passed');await routes()})().catch(e=>{console.error(e);process.exit(1)});
