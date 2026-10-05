/* v0.89 N · FLAVIUS'S VAULT: an auction week the chest leaves short is filled from the vault (seeded per week, gift roll tables on the vault
   curve, Legendary uniques claimed once), owner histories of the five old houses, their lanista + house names reserved, a won vault piece
   becomes the winner's, an unsold one goes back to the vault.
   node server/test/v89n.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const store=require('../src/store.js');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
const LANS=C.VAULT_HOUSES89.map(H=>H.lan),HOUSES=C.VAULT_HOUSES89.map(H=>H.house);
const TIERS=['rare','epic','legendary'];

/* a week whose vault lot rolls a Legendary with nothing claimed */
function legWeek(){for(let w=0;w<600;w++){const key=C.seasonKeyOf(w);for(let n=1;n<=C.AUC_LOTS;n++){const P=C.vaultLot89(key,n,catalog,[],[],{at:0});if(P.rar==='legendary')return {w,key,n,P}}}throw new Error('no legendary week')}

function rules(){C.setCatalog(catalog);
  assert.deepStrictEqual(LANS,['Virgilante','Zora350','SrgtSlaughta','Duckio','Sotonius']);
  /* deterministic per week + lot; another week, another piece */
  const a=C.vaultLot89('S1W3',1,catalog,[],[],{at:5}),b=C.vaultLot89('S1W3',1,catalog,[],[],{at:5}),c=C.vaultLot89('S1W4',1,catalog,[],[],{at:5});
  assert.deepStrictEqual(a,b,'the same week draws the same lot');assert.notStrictEqual(JSON.stringify(a.pc.w),JSON.stringify(c.pc.w));assert.notStrictEqual(a.item,C.vaultLot89('S1W3',2,catalog,[],[],{at:5}).item);
  /* the curve, the gift tables, the histories */
  const cnt={common:0,rare:0,epic:0,legendary:0};let kA=0;const N=3000;const seen=new Set();
  for(let i=0;i<N;i++){const P=C.vaultLot89('S'+(1+(i>>2))+'W'+(1+i%12),1+i%3,catalog,[],[],{at:1e12});cnt[P.rar]++;if(P.kind==='a')kA++;
    assert.ok(TIERS.includes(P.rar),'never Common');const I=C.pieceInfo(P,catalog);assert.ok(I&&I.named&&I.val===C.L4_PRICE*C.rarOf(P.rar).mult,'an ordinary named piece with its value');
    assert.ok(P.pc.vault89&&C.isVault89(P));assert.strictEqual(P.pc.w.key,(P.kind==='a'?'na_':'nw_')+C.itemUid(P.item));
    assert.ok(P.kind==='a'?C.cleanNamedA(P.pc.w):C.cleanNamed(P.pc.w),'clients can build it');
    const H=P.pc.hist;assert.ok(H.length>=1&&H.length<=3,'1–3 owners');assert.strictEqual(new Set(H.map(h=>h.house)).size,H.length,'each owner of another house');
    H.forEach((h,j)=>{assert.ok(LANS.includes(h.lan)&&HOUSES[LANS.indexOf(h.lan)]===h.house,'the old houses');assert.ok(/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(h.glad),h.glad);
      assert.strictEqual(h.how,j===H.length-1?'fell':'taken');assert.ok(h.vault89&&h.loc>=1&&h.loc<=12&&h.wk>=1&&h.wk<=12&&typeof h.ranked==='boolean');assert.ok(h.when<1e12,'before the week');if(j)assert.ok(h.when>H[j-1].when,'oldest first')});
    H.forEach(h=>seen.add(h.lan))}
  assert.strictEqual(seen.size,5,'every old house turns up');
  const pc=k=>cnt[k]/N;assert.ok(Math.abs(pc('rare')-0.60)<0.04&&Math.abs(pc('epic')-0.32)<0.04&&Math.abs(pc('legendary')-0.08)<0.025,JSON.stringify(cnt));
  assert.ok(Math.abs(kA/N-C.NAMED_ARMOR_SHARE)<0.04,'armor as often as in gifts');
  /* Legendary uniqueness: a claimed unique is never minted; all claimed → Epic; cap */
  const L=legWeek();const uq=L.P.pc.w.uq;assert.ok(uq);const A=L.P.kind==='a';
  const L2=C.vaultLot89(L.key,L.n,catalog,A?[]:[uq],A?[uq]:[],{at:0});assert.notStrictEqual(L2.pc.w.uq,uq,'a claimed unique is skipped');
  const all=C.vaultLot89(L.key,L.n,catalog,C.UNIQUES.map(u=>u.k),C.UNIQ_A_KEYS,{at:0});assert.strictEqual(all.rar,'epic');assert.ok(!all.pc.w.uq,'all claimed → Epic');
  assert.strictEqual(C.vaultLot89(L.key,L.n,catalog,[],[],{at:0,cap:'epic'}).rar,'epic','a lost claim re-rolls Epic');
  /* reserved names */
  for(const n of ['Virgilante','virgilante','Sotonius','House Sotonius','Domus Sotonius','Duckio','SrgtSlaughta','Anas Ferox','anas  ferox','Aquila Aurea','Leaena Rubra','Lanius','Zora 350','Zora350'])
    {assert.ok(C.vaultReserved89(n),n);assert.ok(C.domusWhy(n),n)}
  for(const n of ['Virgilante','Sotonius','House Lanius','Anas Ferox','Leaena Rubra'])assert.match(C.domusWhy(n),/old house/,n);
  for(const n of ['Virgilante','Duckio','SrgtSlaughta','Sotonius','Aquila Aurea'])assert.match(C.lnameWhy(n),/old house/,n);
  assert.ok(C.lnameWhy('Zora350'),'refused');assert.strictEqual(C.domusWhy('Vettii'),'');assert.strictEqual(C.lnameWhy('Gaius Varro'),'');assert.ok(!C.vaultReserved89('Sotonia')&&!C.vaultReserved89('Ducks'));
  console.log('v0.89 N rules (vault lots seeded per week, curve 60/32/8, gift tables, histories of the five old houses, Legendary uniqueness + cap, reserved names): all checks passed');return L}

async function routes(L){
  const {makeHandler}=require('../src/index.js');
  async function world(T0){let T=T0;const db=store.memory();const sent=[];const live=new Set();
    const send=async(conn,msg)=>{if(!live.has(conn))return true;sent.push({conn,msg});return false};
    const h=makeHandler({db,send,dev:true,verifyCfg:{},now:()=>T,hereMs:0,countdown:0});let nc=0,rid=0;
    const ask=async(conn,t,d)=>{T+=10;const id=++rid;await h({requestContext:{routeKey:'$default',connectionId:conn},body:JSON.stringify({t,id,d})});const m=sent.find(x=>x.conn===conn&&x.msg.re===id);if(!m)throw new Error('no reply to '+t);
      if(!m.msg.ok){const e=new Error(m.msg.err);e.code=m.msg.code;throw e}return m.msg.d};
    async function client(name,o={}){const cl={name,acct:'dev-'+name};cl.conn='w'+(++nc);live.add(cl.conn);
      const r=await h({requestContext:{routeKey:'$connect',connectionId:cl.conn},queryStringParameters:{dev:name,ver:String(C.VER)}});assert.strictEqual(r.statusCode,200);cl.req=(t,d)=>ask(cl.conn,t,d);
      await cl.req('auth.signin',{name:'Real '+name,google:1});if(o.house!==false){cl.domus=(await cl.req('domus.create',{name:'Domus '+name})).domus;cl.ch=await cl.req('char.create',{name:name[0].toUpperCase()+name.slice(1)+' Gladius',cls:'hero'})}return cl}
    return {db,client,setT:x=>{T=x},T:()=>T}}
  const rejects=async(p,code,re)=>{let e=null;try{await p}catch(x){e=x}assert.ok(e,'expected a refusal: '+(code||re));if(code)assert.strictEqual(e.code,code,e.message);if(re)assert.match(e.message,re);return e};
  const T0=C.SEASON_EPOCH+5*C.WEEK_MS+3600e3;const key=C.seasonAt(T0).key;
  /* an empty world: three vault lots */
  const W1=await world(T0);const ann=await W1.client('ann');let al=await ann.req('auction.list',{});
  assert.strictEqual(al.lots.length,C.AUC_LOTS,'three lots on a fresh world');
  for(const l of al.lots){assert.ok(l.hist.length>=1&&l.hist.length<=3&&l.hist.every(h=>h.vault89&&LANS.includes(h.lan)),'histories of the old houses');assert.ok(TIERS.includes(l.rar));assert.strictEqual(l.min,Math.ceil(l.val/2));
    const n=+l.id.split('#')[1];const P=C.vaultLot89(key,n,catalog,[],[],{at:C.seasonAt(T0).start});assert.strictEqual(l.item,P.item);assert.strictEqual(l.n,P.pc.w.n)}
  /* deterministic: another server, the same week → the same lots */
  const W2=await world(T0+7777);const zed=await W2.client('zed');const al2=await zed.req('auction.list',{});
  assert.deepStrictEqual(al2.lots.map(l=>[l.id,l.item,l.n,l.rar,JSON.stringify(l.w),JSON.stringify(l.hist)]),al.lots.map(l=>[l.id,l.item,l.n,l.rar,JSON.stringify(l.w),JSON.stringify(l.hist)]),'the same lots on every instance');
  assert.ok((await W1.db.get('AUCTION#'+key,'VAULT89')).n===3,'one fill a week');await ann.req('auction.list',{});assert.strictEqual((await W1.db.query('AUCTION#'+key,'L#')).length,3,'never twice');
  /* reserved names refused for real players (house + lanista) */
  const bob=await W1.client('bob',{house:false});await rejects(bob.req('domus.create',{name:'House Sotonius'}),'domus_name',/old house/);await rejects(bob.req('domus.create',{name:'Anas Ferox'}),'domus_name');
  await rejects(bob.req('lanista.name',{name:'Duckio'}),'lname',/old house/);await rejects(bob.req('lanista.name',{name:'virgilante'}),'lname');await bob.req('lanista.name',{name:'Bobius Maximus'});
  await rejects(ann.req('domus.rename',{name:'Lanius'}).catch(e=>{throw e}),null,/old house|keeps its name/);
  /* a won vault piece moves to the winner (history appended); the unsold ones go back to the vault, not the chest */
  const ch=await W1.db.get('CHAR#'+ann.ch.id,'CHAR');await W1.db.put('CHAR#'+ann.ch.id,'CHAR',{...ch,glory:600,wallet:20000});
  const L1=al.lots[0];const b=await ann.req('auction.bid',{lot:L1.id,amt:L1.min});assert.ok(b.lot.mine);assert.strictEqual(b.char.wallet,20000-L1.min,'escrow as usual');
  await rejects(ann.req('auction.bid',{lot:al.lots[1].id,amt:al.lots[1].min}),'auc_lead');
  W1.setT(L1.ends+1000);al=await ann.req('auction.list',{});
  const G=await W1.db.get('CHAR#'+ann.ch.id,'CHAR');const it=G.gear.find(g=>g===L1.item);assert.ok(it,'the piece is his');const pc=C.pcOf(G,it);
  assert.strictEqual(pc.hist.slice(-1)[0].how,'auction');assert.strictEqual(pc.hist.length,L1.hist.length+1,'history appended');assert.ok(C.pieceInfo({item:it,pc},catalog).named);
  assert.strictEqual(G.wallet,20000-L1.min,'the coin left the game');
  const chest=await W1.db.query('CHEST','P#');assert.ok(!chest.some(x=>/^v89-/.test(C.itemUid(x.item))),'unsold vault lots never enter the chest');
  /* the next week: the chest pieces first, the vault fills the rest */
  const P=C.namedPiece(C.rollNamed(()=>0.3,catalog,'rare',[]),{id:'fallenX'});P.pc.hist=[{house:'Domus Old',glad:'Old X',when:W1.T(),how:'fell'}];await W1.db.put('CHEST','P#'+C.itemUid(P.item),{item:P.item,pc:P.pc,at:W1.T(),taken:0});
  W1.setT(C.seasonAt(W1.T()).end+1000);al=await ann.req('auction.list',{});const cur=al.lots.filter(l=>l.id.startsWith(C.seasonAt(W1.T()).key+'#'));
  assert.strictEqual(cur.length,3);assert.strictEqual(cur.filter(l=>l.item===P.item).length,1,'the real fallen piece is drawn');assert.strictEqual(cur.filter(l=>l.hist.some(h=>h.vault89)).length,2,'two from the vault');
  /* Legendary: the vault claims the unique; one already claimed in the world is never minted again */
  const TL=C.SEASON_EPOCH+L.w*C.WEEK_MS+3600e3;const W3=await world(TL);const cy=await W3.client('cy');al=await cy.req('auction.list',{});const lg=al.lots.find(l=>l.id===L.key+'#'+L.n);
  assert.strictEqual(lg.rar,'legendary');const U=(L.P.kind==='a'?'UNIQA#':'UNIQ#')+L.P.pc.w.uq;assert.ok(await W3.db.get('WORLD',U),'the unique is claimed');
  const W4=await world(TL);await W4.db.putNew('WORLD',U,{k:L.P.pc.w.uq,at:1});const dy=await W4.client('dy');al=await dy.req('auction.list',{});const lg4=al.lots.find(l=>l.id===L.key+'#'+L.n);
  assert.notStrictEqual(lg4.w.uq,L.P.pc.w.uq,'a claimed unique is never minted');
  /* unsold: the vault takes the Legendary back and frees its unique */
  W3.setT(lg.ends+1000);await cy.req('auction.list',{});assert.ok(!(await W3.db.get('WORLD',U)),'the unique is free again');
  console.log('server v0.89 N (empty week → 3 vault lots, same lots on every instance, one fill, reserved house + lanista names, a won vault piece moves to the winner, unsold → back to the vault, chest first then the vault, Legendary claim + never twice): all checks passed')}

(async()=>{const L=rules();await routes(L)})().catch(e=>{console.error(e);process.exit(1)});
