/* v1.0 TITULI (routes.js "v1.0 TITULI"): domus.get returns the house's own season Tituli (tit100, last 6, the shape house.card uses).
   node server/test/v100ti.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');
(async()=>{
  const {makeHandler}=require('../src/index.js');
  let T=Date.UTC(2026,9,12,12);const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,rnd:Math.random,log:()=>{}});let mid=0;
  const ask=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);if(!m.msg.ok)throw new Error(m.msg.err);return m.msg.d};
  const conn='w1';live.add(conn);await h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{dev:'ann',ver:String(C.VER)}});
  await ask(conn,'auth.signin',{name:'Ann Account'});await ask(conn,'domus.create',{name:'Domus Ann'});await ask(conn,'char.create',{name:'Ann Gladius',cls:'hero'});
  let r=await ask(conn,'domus.get',{});assert.strictEqual(r.tit100,undefined,'no Tituli yet: no field');
  const A=await db.get('ACCT#dev-ann','PROFILE');const D=await db.get('DOMUS#'+A.domus,'DOMUS');
  const list=[];for(let i=0;i<8;i++)list.push({s:'S'+(i+1),k:i?'s100p':'s100v',n:i?'Podium of the Season':'Victor of the Season',place:i?3:1,c:'c'+i,glad:'Ann Gladius',at:T+i});
  D.tit100=list;await db.put('DOMUS#'+A.domus,'DOMUS',D);
  r=await ask(conn,'domus.get',{});assert.ok(Array.isArray(r.tit100)&&r.tit100.length===6,'the last six: '+JSON.stringify(r.tit100));
  assert.deepStrictEqual(r.tit100,list.slice(-6),'same slice the house card uses');
  const hc=await ask(conn,'house.card',{id:A.domus});assert.deepStrictEqual(hc.tit100,r.tit100,'house.card and domus.get agree');
  console.log('v1.0 titulus on the Domus: all checks passed')})().catch(e=>{console.error(e);process.exit(1)});
