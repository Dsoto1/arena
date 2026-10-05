/* The Lambda behind the WebSocket API ($connect, $disconnect, $default).
   Messages in: {t, id, d}. Replies: {re:id, ok:true, d} | {re:id, ok:false, err}. Pushes: {push:t, d}.
   $connect needs ?token=<Cognito ID token>&ver=<protocol version>. DEV_NAMES=true (test stacks only) also allows
   ?dev=<any id> and the 'auth.signin' request, like the game's mock server.
   makeHandler({db, send, dev, verifyCfg, now, hereMs}) builds the same handler for local runs (server/test/localws.js).
   v0.80 presence: $connect (and a dev sign-in) marks the ACCT item GSI1PK 'ON'; $disconnect and a gone push clear it only when
   the closing socket is still the account's (store.clearConn), so a newer connection is never clobbered.
   v0.82 (protocol 5): ?guest=<client id>&ver=5 opens a read-only GUEST connection (no sign-in; GUEST#<gid> item, presence 'GON'),
   refused with 403 once 2 hours have passed since that guest id first connected (the item lives a day). Refusals carry `code` (+ extras). */
'use strict';
const {makeRoutes,reconnect,away,online}=require('./routes.js');const C=require('./onlcore.js');const {verify}=require('./jwt.js');const store=require('./store.js');
const catalog=require('./catalog.json');
/* v0.83 tester grants: TESTERS = comma-separated sign-in e-mails (deploy parameter → Lambda env). Only a yes/no rides on the connection;
   the e-mail itself is never stored or sent. Dev stacks/tests may pass ?email= with ?dev= (dev only). */
const testerSet=s=>new Set(String(s||'').split(',').map(x=>x.trim().toLowerCase()).filter(x=>x&&x!=='none'));
function makeHandler({db,send,dev,verifyCfg,verifyFn=verify,now=()=>Date.now(),hereMs=0,countdown,rnd,testers=''}){const TESTERS=testerSet(testers);
  /* a push to a known connection: true when the socket is gone (then the account's presence is cleared) */
  /* a push that finds the socket gone clears presence AND marks the lanista away in a live match (their $disconnect may come later and find
     nothing left to clear) — so the others can drop the seat after AWAY_MS */
  const pushConn=async(conn,t,d,acct)=>{const gone=await send(conn,{push:t,d});if(gone&&acct){if(/^guest-/.test(acct))await db.clearGuest(acct,conn);else if(await db.clearConn(acct,conn,now()))await away(db,acct,now())}return gone};
  const route=makeRoutes({store:db,catalog,dev,now,hereMs,countdown,...(rnd?{rnd}:{}),pushConn,push:async(acct,t,d)=>{const a=await db.get('ACCT#'+acct,'PROFILE');if(a&&a.conn)await pushConn(a.conn,t,d,acct)}});
  return async ev=>{const rc=ev.requestContext||{};const conn=rc.connectionId;
    if(rc.routeKey==='$connect'){const q=ev.queryStringParameters||{};if(String(q.ver)!==String(C.VER))return {statusCode:426,body:'Please reload: a new version is out.'};
      /* v0.82 a guest: looks only, 2 hours from the first connect of that guest id */
      if(q.guest&&!q.token&&!(dev&&q.dev)){const gid='guest-'+String(q.guest).replace(/[^a-z0-9_-]/gi,'').slice(0,40);if(gid.length<14)return {statusCode:401,body:'Sign in again.'};
        const G=await db.get('GUEST#'+gid,'GUEST');const t=now();const first=G&&G.first||t;if(t-first>C.GUEST_MS)return {statusCode:403,body:'Your two hours as a guest are up — sign in to keep watching.'};
        await db.put('GUEST#'+gid,'GUEST',{id:gid,first,conn,tz:(G&&G.tz)||'',GSI1PK:'GON',GSI1SK:t,ttl:Math.floor(first/1000)+86400});
        await db.put('CONN#'+conn,'CONN',{guest:gid,first,ttl:Math.floor(t/1000)+86400});return {statusCode:200}}
      let sub,name,tester=false;try{if(dev&&q.dev){sub='dev-'+String(q.dev).replace(/[^a-z0-9_-]/gi,'').slice(0,40);name=null;tester=!!q.email&&TESTERS.has(String(q.email).toLowerCase())}else{const b=await verifyFn(q.token,verifyCfg);sub=b.sub;name='Lanista'; /* v0.89 L: the sign-in (Google) name is never kept */tester=!!b.email&&TESTERS.size>0&&(b.identities||[]).some(i=>i&&i.providerName==='Google')&&TESTERS.has(String(b.email).toLowerCase())}}
      catch(e){return {statusCode:401,body:'Sign in again.'}}
      const a=(await db.get('ACCT#'+sub,'PROFILE'))||(name||!dev?{id:sub,name:C.cleanName(name||'Lanista')||'Lanista',since:now()}:null);
      if(a){a.conn=conn;a.GSI1PK='ON';a.GSI1SK=now();await db.put('ACCT#'+sub,'PROFILE',a);await reconnect(db,sub,conn)}
      await db.put('CONN#'+conn,'CONN',{acct:sub,...(tester?{tester:true}:{}),ttl:Math.floor(now()/1000)+86400});return {statusCode:200}}
    if(rc.routeKey==='$disconnect'){const c=await db.get('CONN#'+conn,'CONN');await db.del('CONN#'+conn,'CONN');if(c&&c.guest)await db.clearGuest(c.guest,conn);if(c&&c.acct&&await db.clearConn(c.acct,conn,now()))await away(db,c.acct,now());return {statusCode:200}}
    let m;try{m=JSON.parse(ev.body||'{}')}catch(e){return {statusCode:400}}
    const c=await db.get('CONN#'+conn,'CONN');const ctx={acct:c&&c.acct,conn,...(c&&c.tester?{tester:true}:{}),...(c&&c.guest?{guest:{id:c.guest,first:c.first}}:{})};
    try{const out=await route(m.t,m.d,ctx);if(m.t==='auth.signin'&&out&&out.id)await online(db,out.id,conn,now());
      await send(conn,{re:m.id,ok:true,d:out})}catch(e){await send(conn,{...(e.extra||{}),re:m.id,ok:false,err:String(e.message||e).slice(0,200),...(e.code?{code:e.code}:{})})}
    return {statusCode:200}}}
/* AWS: DynamoDB + the API Gateway management API */
let LIVE=null;
exports.handler=async ev=>{if(!LIVE){const {ApiGatewayManagementApiClient,PostToConnectionCommand}=require('@aws-sdk/client-apigatewaymanagementapi');
    const rc=ev.requestContext;const api=new ApiGatewayManagementApiClient({endpoint:`https://${rc.domainName}/${rc.stage}`});const db=store.dynamo(process.env.TABLE);
    const send=async(conn,msg)=>{try{await api.send(new PostToConnectionCommand({ConnectionId:conn,Data:Buffer.from(JSON.stringify(msg))}));return false}
      catch(e){if(e.name==='GoneException'||e.$metadata&&e.$metadata.httpStatusCode===410){await db.del('CONN#'+conn,'CONN');return true}throw e}};
    LIVE=makeHandler({db,send,hereMs:20000,dev:process.env.DEV_NAMES==='true',verifyCfg:{region:process.env.AWS_REGION,poolId:process.env.POOL_ID,clientId:process.env.CLIENT_ID},testers:process.env.TESTERS||''})}
  return LIVE(ev)};
exports.makeHandler=makeHandler;
