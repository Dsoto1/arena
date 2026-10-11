/* v1.0 SERVER BATCH B (routes.js "v1.0 SERVER BATCH B", the "v1.0 SERVER BATCH B" section of onlcore): the hidden rating (Elo after a Ranked
   settlement, never in a reply, Find me a fight prefers close ratings), the queue estimate, Ranked seats dealt at random, Ranked watchers one turn
   behind (no moves before the next turn's clock, no snapshots), the leaver list (abandon / drop / two timeouts) → house-card mark + Ranked cooldown,
   connection dots, the season leaderboard by Glory gained + Tituli for the season before, reports (once a match, a reason, a day cap), the owner's
   own turn start and reveal credits on the turn clock. node server/test/v100b.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

function units(){
  const e=C.eloPairs100([{id:'a',r:1000,n:0,place:1},{id:'b',r:1000,n:0,place:2},{id:'c',r:1000,n:30,place:3}]);
  assert.ok(e.a>1000&&e.c<1000&&e.a-1000===1000-e.b+ (e.a-1000)-(1000-e.b),'winner up, last down: '+JSON.stringify(e));
  assert.strictEqual(e.a,1020,'K 40 shared by the two others');assert.strictEqual(e.c,988,'K 24 once rated');
  const t=C.eloPairs100([{id:'a',r:1200,n:20,place:1},{id:'b',r:1200,n:20,place:1}]);assert.deepStrictEqual(t,{a:1200,b:1200},'a tie between equals');
  assert.deepStrictEqual(C.eloPairs100([{id:'a',r:1000,n:0,place:1}]),{a:1000},'one human: no change');
  assert.deepStrictEqual(C.eta100(null,0,4,3),{s:0,slow:false},'full: no wait');
  assert.deepStrictEqual(C.eta100(null,3,4,2),{s:90,slow:false},'no history: 90 s for a whole table');
  assert.deepStrictEqual(C.eta100({a:60,n:4},1,4,0),{s:40,slow:true},'one seat, nobody free: ×2');
  const h=C.etaFold100(C.etaFold100(null,60000),120000);assert.ok(h.n===2&&h.a===78,'EMA: '+JSON.stringify(h));
  let lv=[];for(let i=0;i<3;i++)lv=C.leaveAdd100(lv,'abandon',1000+i*1000,'m'+i);
  assert.deepStrictEqual(C.leaveMark100(lv,5000),{n:3,mark:true});assert.strictEqual(C.leaveCooldown100(lv,5000),3000+C.LEAVE100.CD_MS,'cooldown from the last');
  assert.strictEqual(C.leaveCooldown100(lv,3000+C.LEAVE100.CD_MS+1),0,'over');assert.strictEqual(C.leaveMark100(lv,1000+C.LEAVE100.WIN_MS+5000).n,0,'a week later: clean');
  assert.strictEqual(C.leaveCooldown100(lv.slice(1),5000),0,'two: no cooldown');
  const M={players:['a','b','c','d'],seats:{a:0,b:1,c:2,d:3},away:{b:9000,c:1000},dropped:{d:true}};
  assert.deepStrictEqual(C.connOf100(M,10000+C.AWAY_MS-5000,{0:2}),{0:{st:'on',slow:2},1:{st:'away'},2:{st:'gone'},3:{st:'cpu'}});
  let top=[];for(const [c,g] of [['x',5],['y',9],['z',7],['x',11]])top=C.seasonTop100(top,{c,g});assert.deepStrictEqual(top.map(r=>r.c+r.g),['x11','y9','z7'],'one row a gladiator');
  assert.strictEqual(C.seasonTitulus100(1).k,'s100v');assert.strictEqual(C.seasonTitulus100(3).k,'s100p');assert.strictEqual(C.seasonTitulus100(10).k,'s100x');assert.strictEqual(C.seasonTitulus100(11),null);
  assert.strictEqual(C.reportWhy100({reason:'afk',seat:1}),'');assert.ok(C.reportWhy100({reason:'meh',seat:1}));assert.ok(C.reportWhy100({reason:'afk'}));
  assert.strictEqual(C.fxMs100('chest'),900);assert.strictEqual(C.fxMs100('nope'),0);
  /* the seats at the horns: Ranked, not a team event → shuffled; Custom untouched */
  C.seatRnd100=()=>0;const L=C.newLobby({ev:'democritus',ranked:true},{id:'a',name:'A',rank:'tiro'},'L1',1);L.players=[{id:'a'},{id:'b'},{id:'c'}];C.startRoom(L);
  assert.deepStrictEqual(L.players.map(p=>p.id),['b','c','a'],'Fisher-Yates with the server rnd');assert.strictEqual(L.shuf100,1);
  const L2=C.newLobby({ev:'democritus'},{id:'a',name:'A'},'L2',1);L2.players=[{id:'a'},{id:'b'}];C.startRoom(L2);assert.deepStrictEqual(L2.players.map(p=>p.id),['a','b'],'Custom keeps its seats');
  C.seatRnd100=null;
  console.log('v1.0 batch B units: all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();let rs=7;
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,rnd:()=>{rs=(rs*16807)%2147483647;return rs/2147483647},log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
    cl.got=(type,from)=>sent.slice(from||0).filter(x=>x.conn===cl.conn&&x.msg.push===type).map(x=>x.msg.d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});
    await cl.req('hello',{all:1});return cl}
  const ann=await client('ann'),bob=await client('bob','slave'),cat=await client('cat'),dan=await client('dan');

  /* ── a Ranked match: seats dealt at random, watchers one turn behind ── */
  const R0=await ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await bob.req('lobby.join',{id:R0.id});await cat.req('lobby.join',{id:R0.id});
  const L=await ann.req('lobby.start',{id:R0.id});const id=L.id;assert.strictEqual(L.shuf100,1,'Ranked seats dealt at random');
  const M0=await db.get('MATCH#'+id,'META');assert.deepStrictEqual(Object.values(M0.seats).sort(),[0,1,2],'three seats');L.players.forEach((p,i)=>{if(M0.seats[p.id]!=null)assert.strictEqual(M0.seats[p.id],i,'the META follows the dealt order')});
  const seat=cl=>M0.seats[cl.acct];const sa=seat(ann),sb=seat(bob),sc=seat(cat);
  const w=await dan.req('match.watch',{id});assert.strictEqual(w.delay100,1,'a Ranked watcher is told');
  const M1=await db.get('MATCH#'+id,'META');assert.ok(M1.watch[dan.acct]===null&&M1.wd100[dan.acct]===dan.conn,'kept out of the live pushes');
  await rejects(dan.req('match.snapreq',{id,to:ann.acct,seq:0}),'ranked_delay');
  await rejects(ann.req('match.snap',{id,to:dan.acct,snap:{},seq:0}),'ranked_delay');
  const p0=sent.length;await ann.req('match.input',{id,in:{k:'act',a:'x',seat:sa}});await bob.req('match.input',{id,in:{k:'act',a:'y',seat:sb}});
  assert.strictEqual(dan.got('match.input',p0).length,0,'nothing reaches the watcher during the turn');assert.ok(cat.got('match.input',p0).length===2,'the fighters get them at once');
  assert.strictEqual((await dan.req('match.get',{id,from:0})).inputs.length,0,'match.get: nothing released yet');
  assert.strictEqual((await ann.req('match.get',{id,from:0})).inputs.length,2,'a fighter reads everything');
  const p1=sent.length;await cat.req('match.clock',{id,kind:'turn',t:1,seat:sb});
  assert.deepStrictEqual(dan.got('match.input',p1).map(x=>x.in.a),['x','y'],'the next turn begins → the watcher gets the turn before');
  assert.strictEqual((await dan.req('match.get',{id,from:0})).inputs.length,2,'released');
  await cat.req('match.input',{id,in:{k:'act',a:'z',seat:sc}});assert.strictEqual((await dan.req('match.get',{id,from:0})).inputs.length,2,'one turn behind again');

  /* ── the owner's own start + a reveal's credit ── */
  T+=4000;let s=await bob.req('match.clock',{id,kind:'own',t:1,seat:sb});assert.ok(s.tc&&s.tc.left===60000,'the clock starts at the owner\'s own report: '+JSON.stringify(s.tc));
  T+=4000;s=await bob.req('match.clock',{id,kind:'own',t:1,seat:sb});assert.ok(s.tc.left<=56000,'once a turn');
  await ann.req('match.clock',{id,kind:'fx',t:1,k:'chest',i:0});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.x||0,0,'only the owner earns reveal time');
  s=await bob.req('match.clock',{id,kind:'fx',t:1,k:'chest',i:0});const x1=(await db.get('MATCH#'+id,'META')).tc100.x;assert.strictEqual(x1,C.FX100.ms.chest,'+ the reveal');
  await bob.req('match.clock',{id,kind:'fx',t:1,k:'chest',i:0});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.x,x1,'each reveal once');
  for(let i=1;i<9;i++)await bob.req('match.clock',{id,kind:'fx',t:1,k:'spawn',i});assert.strictEqual((await db.get('MATCH#'+id,'META')).tc100.x,C.FX100.TURN_MAX,'capped a turn');

  /* ── connection dots ── */
  let cn=await dan.req('match.conn100',{id});assert.deepStrictEqual(cn.seats[sa],{st:'on'});
  await db.setIn('MATCH#'+id,'META','away',bob.acct,T-1000);cn=await ann.req('match.conn100',{id});assert.strictEqual(cn.seats[sb].st,'away');
  await db.setIn('MATCH#'+id,'META','away',bob.acct,T-C.AWAY_MS-1);cn=await ann.req('match.conn100',{id});assert.strictEqual(cn.seats[sb].st,'gone');
  await db.setIn('MATCH#'+id,'META','away',bob.acct,0);
  await rejects((await client('eve')).req('match.conn100',{id}),null,/Not your match/);

  /* ── reports ── */
  assert.deepStrictEqual(await dan.req('match.report100',{id,seat:sb,reason:'afk',note:'<b>slow</b>'}),{done:1});
  await rejects(dan.req('match.report100',{id,seat:sb,reason:'afk'}),'report_once');await rejects(ann.req('match.report100',{id,seat:sa,reason:'afk'}),'report_bad');
  await rejects(ann.req('match.report100',{id,seat:sb,reason:'rude'}),'report_bad');
  const rep=await db.get('REPORT#'+id,'R#'+dan.acct);assert.ok(rep&&rep.who===bob.acct&&rep.note==='bslow/b'&&rep.GSI1PK==='REPORTS','logged for review: '+JSON.stringify(rep));
  assert.strictEqual(((await db.get('ACCT#'+bob.acct,'PROFILE')).strikes|0),0,'no automatic penalty');

  /* ── the result: Elo + the season's Glory ── */
  const table=[{seat:sa,won:true,place:1,f:12,survives:true},{seat:sb,won:false,place:2,f:6,survives:true},{seat:sc,won:false,place:3,f:3,survives:true}];
  for(const cl of [ann,bob,cat])await cl.req('match.result',{id,table,hash:'h'});
  const ea=await db.get('ELO#'+ann.ch.id,'E'),ec=await db.get('ELO#'+cat.ch.id,'E');assert.ok(ea.r>1000&&ec.r<1000&&ea.n===1,'rated: '+JSON.stringify([ea,ec]));
  const all=JSON.stringify(sent.filter(x=>x.msg.re||x.msg.push).map(x=>x.msg.d));assert.ok(!/"elo|ELO#/.test(all),'the rating never leaves the server');
  assert.ok(dan.got('match.input').some(x=>x.in.a==='z'),'the end releases the rest to the watcher');
  const sb1=await ann.req('season.board',{});assert.ok(sb1.key==='S1'&&sb1.top.length===3&&sb1.top[0].c===ann.ch.id&&sb1.top[0].g>sb1.top[2].g,'the season board: '+JSON.stringify(sb1.top.map(r=>[r.n,r.g])));
  assert.ok(sb1.mine.length===1&&sb1.mine[0].place===1,'my own line');

  /* ── Find me a fight prefers a close rating; the queue estimate ── */
  await db.put('ELO#'+bob.ch.id,'E',{r:1500,n:20,at:T});const fay=await client('fay');
  const RB=await bob.req('lobby.create',{ev:'egidious',ranked:true,cry:false});T+=1000;const RF=await fay.req('lobby.create',{ev:'egidious',ranked:true,cry:false});
  const q=await cat.req('lobby.quick',{ev:'egidious',ranked:true});assert.strictEqual(q.lobby.id,RF.id,'a close rating beats the older room');assert.ok(q.eta100&&q.eta100.need===2&&q.eta100.s>0,'the estimate: '+JSON.stringify(q.eta100));
  const qe=await fay.req('queue.eta',{id:RF.id});assert.strictEqual(qe.need,2);await rejects(ann.req('queue.eta',{id:RF.id}),null,/Join the room/);
  await cat.req('lobby.leave',{id:RF.id});await fay.req('lobby.leave',{id:RF.id});await bob.req('lobby.leave',{id:RB.id});
  /* a quick room's fill time goes into the playlist's history */
  const Q1=await ann.req('lobby.quick',{ev:'cassian',ranked:true});T+=30000;await bob.req('lobby.quick',{ev:'cassian',ranked:true});await ann.req('lobby.start',{id:Q1.lobby.id});
  const hq=await db.get('WORLD','QETA#cassian#tiro');assert.ok(hq&&hq.n===1&&hq.a>=30,'history: '+JSON.stringify(hq));
  await ann.req('match.abandon',{id:Q1.lobby.id});await bob.req('match.result',{id:Q1.lobby.id,table:[{seat:0,won:true,place:1,f:4,survives:true},{seat:1,won:false,place:2,f:1,survives:true}],hash:'q'});

  /* ── leaving: counted, marked, a cooldown ── */
  let A=await db.get('ACCT#'+ann.acct,'PROFILE');assert.ok((A.lv100||[]).length===1&&A.lv100[0].k==='abandon','a Ranked abandon counts');
  await ann.req('char.create',{name:'Ann Secunda',cls:'hero'});
  await db.set('ACCT#'+ann.acct,'PROFILE',{lv100:C.leaveAdd100(C.leaveAdd100(A.lv100,'drop',T-1000),'timeout',T-500)});
  await rejects(ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false}),'ranked_cd');await rejects(ann.req('lobby.quick',{ev:'democritus',ranked:true}),'ranked_cd');
  const cu=await ann.req('lobby.create',{ev:'democritus',cry:false});assert.ok(cu&&!cu.ranked,'Custom stays open');await ann.req('lobby.leave',{id:cu.id});
  const card=await bob.req('house.card',{acct:ann.acct});assert.deepStrictEqual(card.leaver,{n:3},'the house card shows the mark');
  assert.strictEqual((await ann.req('house.card',{acct:bob.acct})).leaver,undefined,'a clean house carries none');
  T+=C.LEAVE100.CD_MS+1000;const ok=await ann.req('lobby.create',{ev:'democritus',ranked:true,cry:false});assert.ok(ok.ranked,'the cooldown ends');await ann.req('lobby.leave',{id:ok.id});
  /* a seat that timed out twice counts once */
  {const X=await bob.req('lobby.create',{ev:'democritus',ranked:true,cry:false});await cat.req('lobby.join',{id:X.id});const XL=await bob.req('lobby.start',{id:X.id});const XM=await db.get('MATCH#'+XL.id,'META');const cs=XM.seats[cat.acct];
    for(const tn of [1,2]){await bob.req('match.clock',{id:XL.id,kind:'turn',t:tn,seat:cs});T+=61000+C.TT100.GRACE;await bob.req('match.tick',{id:XL.id})}
    await bob.req('match.tick',{id:XL.id});const cA=await db.get('ACCT#'+cat.acct,'PROFILE');assert.strictEqual((cA.lv100||[]).filter(x=>x.k==='timeout').length,1,'two timeouts → one entry: '+JSON.stringify(cA.lv100))}

  /* ── the next season: Tituli for the top places ── */
  T+=12*604800000;const sb2=await dan.req('season.board',{});assert.strictEqual(sb2.key,'S2');assert.strictEqual(sb2.top.length,0,'a fresh board');
  const old=await dan.req('season.board',{season:1});assert.strictEqual(old.top.length,3,'last season still readable');
  await new Promise(r=>setTimeout(r,20));
  for(const row of old.top){const want=C.seasonTitulus100(row.place).k;const hc=await dan.req('house.card',{id:row.dom});assert.ok((hc.tit100||[]).some(x=>x.k===want&&x.s==='S1'&&x.c===row.c),'place '+row.place+' → '+want+': '+JSON.stringify(hc.tit100))}
  await dan.req('season.board',{});assert.strictEqual((await dan.req('house.card',{id:old.top[0].dom})).tit100.filter(x=>x.s==='S1'&&x.c===old.top[0].c).length,1,'given once');
  assert.ok(C.GUEST_OK.includes('season.board'),'guests read the board');
  console.log('v1.0 batch B routes: all checks passed')}

units();routes().catch(e=>{console.error(e);process.exit(1)});
