/* A local stand-in for API Gateway: the same Lambda handler (src/index.js makeHandler) on a plain WebSocket server,
   with the in-memory store and dev sign-in. node server/test/localws.js [port] — then point the game at
   {"ws":"ws://127.0.0.1:<port>","dev":true} (Online → sign-in → Online server). */
'use strict';
const {WebSocketServer}=require('ws');const {makeHandler}=require('../src/index.js');const store=require('../src/store.js');
function start(port=0){const socks=new Map();let n=0;const db=store.memory();
  const send=async(conn,msg)=>{const s=socks.get(conn);if(!s||s.readyState!==1)return true;s.send(JSON.stringify(msg));return false};
  const h=makeHandler({db,send,dev:true,verifyCfg:{}});const wss=new WebSocketServer({port,host:'127.0.0.1'});
  wss.on('connection',async(s,req)=>{const conn='c'+(++n);const q=Object.fromEntries(new URL(req.url,'http://x').searchParams);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:q});if(r.statusCode!==200){s.close(r.statusCode===426?4426:4401,r.body);return}
    socks.set(conn,s);s.on('message',b=>h({requestContext:{routeKey:'$default',connectionId:conn},body:String(b)}).catch(e=>console.error(e)));
    s.on('close',()=>{socks.delete(conn);h({requestContext:{routeKey:'$disconnect',connectionId:conn}})})});
  return new Promise(r=>wss.on('listening',()=>r({port:wss.address().port,close:()=>wss.close(),db})))}
if(require.main===module)start(+process.argv[2]||8787).then(s=>console.log('local arena server on ws://127.0.0.1:'+s.port));
module.exports={start};
