/* v0.94 ONLINE 3D TOKENS AS SERVER PICTURES: char.tok (an upload in parts ≤ 24000 base64 characters, the last part checks the whole
   WebP: magic, RIFF size, exact sheet size, ≤ 64 KB, meta + pose; owner only; refused while the lanista is in a room or a match; a daily
   cap; replays by rid answered once; the general rate limit), tok.get (owner's picture by gladiator id + hash, guests too), the kit
   carrying look.t94, and Classic (off). node server/test/v94.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const C=require('../src/onlcore.js');

/* a WebP header the size checks can read (VP8L: 0x2f + 14-bit width-1 / height-1), padded to n bytes */
function webp(w,h,n){n=Math.max(30,n||200);if(n%2)n++;const a=Buffer.alloc(n);a.write('RIFF',0);a.writeUInt32LE(n-8,4);a.write('WEBP',8);a.write('VP8L',12);a.writeUInt32LE(n-20,16);
  a[20]=0x2f;const b=((w-1)&0x3fff)|(((h-1)&0x3fff)<<14);a.writeUInt32LE(b>>>0,21);for(let i=25;i<n;i++)a[i]=(i*31)&255;return a}
const META=[120,180,60,160];
const POSE=JSON.stringify({v:1,j:{hip:[0,0.9,0]}});
const parts=(buf,size)=>{const s=buf.toString('base64');const out=[];for(let i=0;i<s.length;i+=size||C.TOK94.PART)out.push(s.slice(i,i+(size||C.TOK94.PART)));return out};

function units(){
  const a=webp(960,180,4000);assert.deepStrictEqual(C.webpDims94(new Uint8Array(a)),{w:960,h:180},'VP8L dims');
  const x=Buffer.from(a);x.write('RIFX',0);assert.strictEqual(C.webpDims94(new Uint8Array(x)),null,'bad magic');
  const y=Buffer.from(a);y.writeUInt32LE(9,4);assert.strictEqual(C.webpDims94(new Uint8Array(y)),null,'RIFF size must match');
  assert.ok(!C.tokMetaWhy94(META)&&C.tokMetaWhy94([120,180,60])&&C.tokMetaWhy94([10,180,5,9])&&C.tokMetaWhy94([120.5,180,60,160]),'meta bounds');
  assert.ok(!C.tokPoseWhy94(POSE,'guard')&&C.tokPoseWhy94('x'.repeat(601))&&C.tokPoseWhy94('{nope')&&C.tokPoseWhy94('{}','BAD!'),'pose');
  const ok=C.tokCheck94(a.toString('base64'),META);assert.ok(!ok.why&&/^t[0-9a-z]+$/.test(ok.h)&&ok.bytes.length===4000,'a good sheet');
  assert.match(C.tokCheck94(webp(959,180,400).toString('base64'),META).why,/wrong size/);assert.match(C.tokCheck94(webp(960,180,70000).toString('base64'),META).why,/too big/);
  assert.strictEqual(C.tokHash94(new Uint8Array(a)),C.tokHash94(new Uint8Array(Buffer.from(a))),'hash is stable');assert.notStrictEqual(C.tokHash94(new Uint8Array(a)),C.tokHash94(new Uint8Array(webp(960,180,4002))));
  /* the frame budget: the largest part in its request stays under API Gateway's 32 KB WebSocket frame */
  const req=JSON.stringify({t:'char.tok',id:99999,d:{char:'g'.repeat(40),up:'u'.repeat(40),i:3,n:4,b:'A'.repeat(C.TOK94.PART),meta:[240,240,240,240],pose:'x'.repeat(600),pk:'victory',rid:'r'.repeat(40)}});
  assert.ok(req.length<32*1024,'a part request fits one 32 KB frame: '+req.length);
  assert.ok(C.TOK94.PART*C.TOK94.PARTS>=Math.ceil(C.TOK94.MAX/3)*4,'the parts hold the largest picture');
  assert.ok(C.GUEST_OK.includes('tok.get')&&C.IDEM93.includes('char.tok'),'guests may fetch, uploads carry a rid');
  console.log('v0.94 units (WebP header, meta/pose bounds, size, hash, frame budget): all checks passed')}

async function routes(){
  const {makeHandler}=require('../src/index.js');
  let T=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const db=store.memory();const sent=[];const live=new Set();
  const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
  const h=makeHandler({limits:false,db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0,log:()=>{}});let nc=0,mid=0;
  const raw=async(conn,t,d)=>{T+=10;const id=++mid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);return m.msg};
  const ask=async(conn,t,d)=>{const m=await raw(conn,t,d);if(!m.ok){const e=new Error(m.err);e.code=m.code;e.reply=m;throw e}return m.d};
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  async function client(name,cls){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
    const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);cl.raw=(t,d)=>raw(cl.conn,t,d);
    await cl.req('auth.signin',{name:name.toUpperCase()+' Account'});await cl.req('domus.create',{name:'Domus '+name});cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:cls||'hero'});return cl}
  let ridN=0;const rid=()=>'r94test'+(++ridN).toString(36).padStart(4,'0');let upN=0;
  const upload=async(cl,buf,o)=>{o=o||{};const ps=parts(buf,o.size);const up='up'+(++upN);let last=null;
    for(let i=0;i<ps.length;i++){const d={char:o.char||cl.ch.id,up,i,n:ps.length,b:ps[i],rid:rid()};if(i===0){d.meta=o.meta||META;d.pose=POSE;d.pk='guard'}last=await cl.req('char.tok',d)}return last};
  const ann=await client('ann'),bob=await client('bob','slave');

  /* store + get: three parts, the reference on the gladiator, the kit, a cached hash */
  const pic=webp(960,180,60000);const r=await upload(ann,pic);assert.ok(r.done&&/^t/.test(r.h)&&r.char.tok94.h===r.h&&r.bytes===60000,'stored: '+JSON.stringify({done:r.done,h:r.h}));
  const item=await db.get('TOK#'+ann.ch.id,'PIC');assert.ok(item&&item.b.length===pic.toString('base64').length&&item.owner===ann.acct&&item.pose===POSE&&item.pk==='guard','its own item');
  const ch=await db.get('CHAR#'+ann.ch.id,'CHAR');assert.ok(!ch.b&&JSON.stringify(ch).length<4000,'the gladiator keeps only the reference');
  assert.strictEqual((await db.query('TOKUP#'+ann.ch.id,'U#')).length,0,'the upload item is gone');
  const k=C.kitOf(ch);assert.deepStrictEqual(k.look.t94,{c:ann.ch.id,h:r.h},'the kit tells the seats which picture');
  const g=await bob.req('tok.get',{c:ann.ch.id});assert.ok(g.b===item.b&&g.h===r.h&&g.meta.join()===META.join(),'another lanista downloads it');
  assert.ok((await bob.req('tok.get',{c:ann.ch.id,h:r.h})).same,'a cached hash gets no bytes');assert.ok((await bob.req('tok.get',{c:bob.ch.id})).none,'none yet');
  const reply=JSON.stringify(await bob.raw('tok.get',{c:ann.ch.id}));assert.ok(reply.length<120*1024,'one reply under the 128 KB message limit: '+reply.length);

  /* owner only */
  await rejects(upload(bob,pic,{char:ann.ch.id}),null,/Not yours/);
  await rejects(bob.req('char.tok',{char:ann.ch.id,off:1}),null,/Not yours/);
  /* bad pictures: magic, size for the sheet, too big, meta, parts out of order, a part too long */
  const bad=Buffer.from(webp(960,180,3000));bad.write('PNG!',8);await rejects(upload(ann,bad),'tok_bad',/not a WebP/);
  await rejects(upload(ann,webp(800,180,3000)),'tok_bad',/wrong size/);
  await rejects(upload(ann,webp(960,180,66000)),'tok_bad',/too big/);await rejects(upload(ann,webp(960,180,80000)),'tok_part');
  await rejects(upload(ann,webp(960,180,3000),{meta:[120,180,60]}),'tok_bad',/not a token sheet/);
  await rejects(ann.req('char.tok',{char:ann.ch.id,up:'upx',i:1,n:2,b:'AAAA'}),'tok_part',/out of order/);
  await rejects(ann.req('char.tok',{char:ann.ch.id,up:'upy',i:0,n:1,b:'A'.repeat(C.TOK94.PART+4),meta:META}),'tok_part',/24000/);
  await rejects(ann.req('char.tok',{char:ann.ch.id,up:'upz',i:0,n:9,b:'AAAA',meta:META}),'tok_part');
  const m=await ann.raw('char.tok',{char:ann.ch.id,up:'upq',i:0,n:1,b:webp(800,180,3000).toString('base64'),meta:META});assert.ok(m.mcode&&m.err,'a coded refusal');
  assert.strictEqual((await db.get('TOK#'+ann.ch.id,'PIC')).h,r.h,'the stored picture is untouched by refusals');

  /* replay: the same part with the same rid is answered once (no second count against the day) */
  const one=webp(960,180,5000).toString('base64');const d0={char:ann.ch.id,up:'uprep',i:0,n:1,b:one,meta:META,pose:POSE,rid:'r94replay01'};
  const q0=(await db.get('ACCT#'+ann.acct,'PROFILE')).tq94.n;const a1=await ann.req('char.tok',d0),a2=await ann.req('char.tok',d0);
  assert.ok(a1.done&&a2.done&&a1.h===a2.h,'replay gets the stored reply');assert.strictEqual((await db.get('ACCT#'+ann.acct,'PROFILE')).tq94.n,q0+1,'counted once');

  /* busy: in a room → refused (upload and Classic), the picture stays; out → allowed */
  const L=await ann.req('lobby.create',{ev:'democritus',loc:6,cry:false});
  await rejects(upload(ann,webp(960,180,3000)),'in_match',/Finish or leave/);await rejects(ann.req('char.tok',{char:ann.ch.id,off:1}),'in_match');
  await ann.req('lobby.leave',{id:L.id});const r2=await upload(ann,webp(960,180,3000));assert.ok(r2.done,'after leaving the room');

  /* the daily cap */
  let capped=null;for(let i=0;i<C.TOK94.DAY_MAX+2&&!capped;i++){try{await upload(bob,webp(960,180,2000+i*2))}catch(e){capped=e}}
  assert.ok(capped&&capped.code==='tok_day','a daily cap: '+(capped&&capped.message));T+=86400e3;assert.ok((await upload(bob,webp(960,180,2100))).done,'the next day');

  /* Classic: the picture goes, the kit stops naming it */
  const off=await ann.req('char.tok',{char:ann.ch.id,off:1});assert.ok(off.off&&!off.char.tok94,'off');assert.ok((await bob.req('tok.get',{c:ann.ch.id})).none,'gone');
  assert.ok(!(C.kitOf(await db.get('CHAR#'+ann.ch.id,'CHAR')).look||{}).t94,'kit without a picture');

  /* guests may fetch, never upload */
  {const gc='w'+(++nc);live.add(gc);const rr=await h({requestContext:{routeKey:'$connect',connectionId:gc},queryStringParameters:{guest:'guest94abcdefgh',ver:String(C.VER)}});
    assert.strictEqual(rr.statusCode,200,"guest connect");{const bobPic=await raw(gc,'tok.get',{c:bob.ch.id});assert.ok(bobPic.ok&&bobPic.d.b,'a guest fetches');const gu=await raw(gc,'char.tok',{char:bob.ch.id,up:'g1',i:0,n:1,b:'AAAA',meta:META});assert.ok(!gu.ok&&gu.code==='guest','a guest never uploads')}}

  /* the general rate limit covers the parts */
  {const db2=store.memory();const s2=[];let T2=1e12;const h2=makeHandler({limits:{burst:4,per:1,mburst:8,mper:4},db:db2,send:async(c,m)=>{s2.push({c,m});return false},dev:true,verifyCfg:{},now:()=>T2,hereMs:0,countdown:0});
    await h2({requestContext:{routeKey:'$connect',connectionId:'z1'},queryStringParameters:{dev:'zed',ver:String(C.VER)}});let n=0;
    const q=async(t,d)=>{const id=++n;await h2({requestContext:{routeKey:'$default',connectionId:'z1'},body:JSON.stringify({t,id,d})});return s2.find(x=>x.m.re===id).m};
    const rs=[];for(let i=0;i<8;i++)rs.push(await q('tok.get',{c:'nobody'}));const lim=rs.filter(x=>!x.ok&&x.code==='rate_limit');assert.ok(lim.length>=3&&lim[0].wait>0,'rate limited: '+rs.map(x=>x.ok?1:x.code).join())}
  console.log('server v0.94 (char.tok in parts → TOK#<char> + ch.tok94, tok.get + cached hash + guests, owner only, WebP magic / RIFF size / sheet size / 64 KB / meta / part order, coded refusals, rid replay counted once, busy in a room, a daily cap, Classic, the rate limit, kit look.t94): all checks passed')}

(async()=>{units();await routes()})().catch(e=>{console.error(e);process.exit(1)});
