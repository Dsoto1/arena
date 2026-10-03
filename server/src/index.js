/* The Lambda behind the WebSocket API ($connect, $disconnect, $default).
   Messages in: {t, id, d}. Replies: {re:id, ok:true, d} | {re:id, ok:false, err}. Pushes: {push:t, d}.
   $connect needs ?token=<Cognito ID token>&ver=<protocol version>. DEV_NAMES=true (test stacks only) also allows
   ?dev=<any id> and the 'auth.signin' request, like the game's mock server.
   makeHandler({db, send, dev, verifyCfg}) builds the same handler for local runs (server/test/localws.js). */
'use strict';
const {makeRoutes,reconnect,away}=require('./routes.js');const C=require('./onlcore.js');const {verify}=require('./jwt.js');const store=require('./store.js');
const catalog=require('./catalog.json');
function makeHandler({db,send,dev,verifyCfg,verifyFn=verify}){
  const route=makeRoutes({store:db,catalog,dev,pushConn:async(conn,t,d)=>{await send(conn,{push:t,d})},push:async(acct,t,d)=>{const a=await db.get('ACCT#'+acct,'PROFILE');if(a&&a.conn){const gone=await send(a.conn,{push:t,d});if(gone){a.conn=null;await db.put('ACCT#'+acct,'PROFILE',a)}}}});
  return async ev=>{const rc=ev.requestContext||{};const conn=rc.connectionId;
    if(rc.routeKey==='$connect'){const q=ev.queryStringParameters||{};if(String(q.ver)!==String(C.VER))return {statusCode:426,body:'Please reload: a new version is out.'};
      let sub,name;try{if(dev&&q.dev){sub='dev-'+String(q.dev).replace(/[^a-z0-9_-]/gi,'').slice(0,40);name=null}else{const b=await verifyFn(q.token,verifyCfg);sub=b.sub;name=b.name||b.given_name||String(b.email||'').split('@')[0]}}
      catch(e){return {statusCode:401,body:'Sign in again.'}}
      const a=(await db.get('ACCT#'+sub,'PROFILE'))||(name||!dev?{id:sub,name:C.cleanName(name||'Lanista')||'Lanista',since:Date.now()}:null);
      if(a){a.conn=conn;await db.put('ACCT#'+sub,'PROFILE',a);await reconnect(db,sub,conn)}
      await db.put('CONN#'+conn,'CONN',{acct:sub,ttl:Math.floor(Date.now()/1000)+86400});return {statusCode:200}}
    if(rc.routeKey==='$disconnect'){const c=await db.get('CONN#'+conn,'CONN');await db.del('CONN#'+conn,'CONN');if(c&&c.acct){const a=await db.get('ACCT#'+c.acct,'PROFILE');if(a&&a.conn===conn)await away(db,c.acct,Date.now())}return {statusCode:200}}
    let m;try{m=JSON.parse(ev.body||'{}')}catch(e){return {statusCode:400}}
    const c=await db.get('CONN#'+conn,'CONN');const ctx={acct:c&&c.acct,conn};
    try{const out=await route(m.t,m.d,ctx);if(m.t==='auth.signin'&&out&&out.id){const a=await db.get('ACCT#'+out.id,'PROFILE');a.conn=conn;await db.put('ACCT#'+out.id,'PROFILE',a);await reconnect(db,out.id,conn)}
      await send(conn,{re:m.id,ok:true,d:out})}catch(e){await send(conn,{re:m.id,ok:false,err:String(e.message||e).slice(0,200)})}
    return {statusCode:200}}}
/* AWS: DynamoDB + the API Gateway management API */
let LIVE=null;
exports.handler=async ev=>{if(!LIVE){const {ApiGatewayManagementApiClient,PostToConnectionCommand}=require('@aws-sdk/client-apigatewaymanagementapi');
    const rc=ev.requestContext;const api=new ApiGatewayManagementApiClient({endpoint:`https://${rc.domainName}/${rc.stage}`});const db=store.dynamo(process.env.TABLE);
    const send=async(conn,msg)=>{try{await api.send(new PostToConnectionCommand({ConnectionId:conn,Data:Buffer.from(JSON.stringify(msg))}));return false}
      catch(e){if(e.name==='GoneException'||e.$metadata&&e.$metadata.httpStatusCode===410){await db.del('CONN#'+conn,'CONN');return true}throw e}};
    LIVE=makeHandler({db,send,dev:process.env.DEV_NAMES==='true',verifyCfg:{region:process.env.AWS_REGION,poolId:process.env.POOL_ID,clientId:process.env.CLIENT_ID}})}
  return LIVE(ev)};
exports.makeHandler=makeHandler;
