/* v0.92 one live Online per account: a second tab's $connect pushes session.replaced to the first tab's socket; the same tab reconnecting
   does not; guests and first connections never get it. */
const assert=require('assert');const {makeHandler}=require('../src/index.js');const store=require('../src/store.js');
(async()=>{const db=store.memory();const sent=[];const gone=new Set();
  const send=async(conn,msg)=>{if(gone.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{}});
  const connect=(conn,tab)=>h({requestContext:{routeKey:'$connect',connectionId:conn},queryStringParameters:{ver:String(require('../src/onlcore.js').VER),dev:'ann',...(tab?{tab}:{})}});
  const rep=c=>sent.filter(x=>x.conn===c&&x.msg&&x.msg.push==='session.replaced').length;
  /* the account needs a profile: a dev sign-in creates it on the first request */
  let r=await connect('c1','tabA');assert.equal(r.statusCode,200);
  await h({requestContext:{routeKey:'$default',connectionId:'c1'},body:JSON.stringify({t:'auth.signin',id:1,d:{name:'Ann'}})});
  r=await connect('c1b','tabA');assert.equal(rep('c1'),0,'same tab reconnecting: no takeover');
  r=await connect('c2','tabB');assert.equal(rep('c1b'),1,'another tab: the older socket hears session.replaced');assert.equal(rep('c2'),0);
  r=await connect('c3','tabA');assert.equal(rep('c2'),1,'Use here in the first tab: the second one is covered now');
  gone.add('c3');r=await connect('c4','tabC');assert.equal(rep('c3'),0,'a gone socket hears nothing (and does not throw)');
  const A=await db.get('ACCT#dev-ann','PROFILE');assert.equal(A.conn,'c4');assert.equal(A.tab,'tabC');
  r=await connect('c5');assert.equal(rep('c4'),0,'an old client without a tab id never covers anyone');
  console.log('v0.92 tabs (one live Online per account: takeover pushes, same-tab reconnects, gone sockets, old clients): all checks passed')})().catch(e=>{console.error(e);process.exit(1)});
