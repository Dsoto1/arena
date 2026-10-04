/* Storage for the online arena. Two backends with one interface:
   memory — for local tests (node server/test/*.js)
   dynamo — one DynamoDB table (TABLE env), single-table design:
     PK                SK            what
     ACCT#<sub>        PROFILE       account {id,name,conn,since}
     CHAR#<id>         CHAR          gladiator (+ GSI1PK OWNER#<acct>, GSI1SK born)
     LOBBY#<id>        LOBBY         lobby (+ GSI1PK LOBBIES, GSI1SK created; ttl 2 days)
     MATCH#<id>        META          match {seed, n (next input seq), players, conns {acct:connId}, status, results} — kept small:
                                     every move updates it, and DynamoDB bills an update by the item's size
     MATCH#<id>        OPEN          the opening snapshot (~15 KB, written once)
     MATCH#<id>        IN#<seq 8>    one input (ttl 2 days)
     CONN#<connId>     CONN          {acct} (ttl 1 day)
     WORLD             HALL | NEWS   lists
   v0.80 (rooms, quick chat, the Praeco, presence):
     ACCT#<sub>        PROFILE       + GSI1PK 'ON', GSI1SK <connect ms> while a socket is open (presence: no extra table);
                                     + here {glad,rank,tz}, mutes [acct…], rate fields sayAt/fAt/ivAt/iv_<to>, ivH {h,n}
     LOBBY#<id>        CHAT#<ts13>#<acct>   one room phrase {by,name,q,at} (ttl 1 day) — never rewrites the room
     MATCH#<id>        ODD#<seat>#<voter> / ODDX#<acct>   out-of-step votes / the one strike they gave (ttl 2 days)
     FORUM             L#<ts13>#<acct4>     a Forum line {k:say|open|call|res,…} (ttl 1 day)
     WORLD             FMETER#<yyyy-mm-dd>  {n}: Forum pushes sent that UTC day
     WORLD             DAY#<yyyy-mm-dd>     Today in the arena {wins,fallen,upsets} (versioned, ttl 3 days)
   v0.82 (domus, guests, invites, the stands turn):
     ACCT#<sub>        PROFILE       + domus <id>, dname <house name>, domusOld [ids]
     DOMUS#<id>        DOMUS         a house {id,owner,name,founded,bouts,wins,survived,fallen,lifeCF,glads,archived} (versioned;
                                     GSI1PK DOMUS_OF#<acct>); CHAR items carry domus <id>
     DNAME#<lower name> DNAME        {domus,owner,name}: a house name, claimed once (putNew)
     GUEST#<gid>       GUEST         a guest {id,first,conn,tz} (+ GSI1PK 'GON', GSI1SK <connect ms> while its socket is open; ttl 1 day from first)
     INVITE#<to>       R#<room>#<by> one invitation {room,by,name,at} (ttl 1 day; dropped when the room dies or the invitee joins a room)
     MATCH#<id>        STW#<rot6> / STP#<rot6>#<acct>   a stands window {rot,open,at,holders} / one private pick {acct,seat,pick}
     WORLD             COUNTS        living gladiators by rank {tiro:n,…, seeded} — atomic counters; seeded once from a scan of CHAR items
     DOMUS#<id>        DOMUS         + fame (guest passes sat through), passDay <utc day>, patron {look ≤1 KB}
     DOMUS#<id>        PASS#<utc day> the house's guest pass that day {room,acct,at} (putNew = one a day; ttl 3 days)
     MATCH#<id>        META          + left {acct:ms}: ticket holders who left the stands before the end (match.unwatch)
   v0.83 (protocol 6, tools/plans/onl83-contract.md):
     DOMUS#<id>        DOMUS         + treasury, trophies [{k,n,at,glad,x}], recent [≤10], pcs {uid: piece state} (the shelf)
     CHAR#<id>         CHAR          + pcs {uid:{st,hist,rar,w}}, pcsN, offers, offerEq, cfb, gifts, giftsOpened
     ACCT#<sub>        PROFILE       + follows [{id,name}] (≤100)
     LOOT#<match>      S#<seat6>     a dead gladiator's brought gear waiting for the killer's pick (GSI1PK 'LOOT' → 'LOOT_DONE', GSI1SK until; ttl 3 days)
     MARKET            U#<ts13>#<r>  a used printed piece for sale {item,pc,price,from,sold} (ttl 14 days)
     CHEST             P#<uid>       a fallen's named piece back in the chest pool {item,pc,taken}
     WORLD             UNIQ#<k> / VDAY#<day>   a Legendary unique claimed once / Victor of the Day awarded once
     WORLD             COUNTS        + seeded6 (re-seeded once for the 8 ranks)
     BETS#<acct>       B#<ts13>#<room>#<r>     one bet and its outcome (ttl 30 days)
     WAGERWK#<week>    A#<acct>      the week's tally {staked, net, won, name, domus, dom}
*/
'use strict';
function memory(){
  const t=new Map();const key=(pk,sk)=>pk+'|'+sk;const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  return {kind:'memory',
    async get(pk,sk){return clone(t.get(key(pk,sk)))},
    async put(pk,sk,item){t.set(key(pk,sk),clone({...item,PK:pk,SK:sk}))},
    async del(pk,sk){t.delete(key(pk,sk))},
    async query(pk,prefix,o){o=o||{};let r=[...t.values()].filter(x=>x.PK===pk&&String(x.SK).startsWith(prefix||'')).sort((a,b)=>a.SK<b.SK?-1:1);if(o.desc)r.reverse();if(o.limit)r=r.slice(0,o.limit);return r.map(clone)},
    async byIndex(gpk){return [...t.values()].filter(x=>x.GSI1PK===gpk).sort((a,b)=>(b.GSI1SK||0)-(a.GSI1SK||0)).map(clone)},
    async counter(pk,sk,field,by){const k=key(pk,sk);const x=t.get(k)||{PK:pk,SK:sk};x[field]=(x[field]||0)+(by||1);t.set(k,x);return x[field]-(by||1)},
    /* v0.80: a put only when the item is new → true if written */
    async putNew(pk,sk,item){const k=key(pk,sk);if(t.has(k))return false;t.set(k,clone({...item,PK:pk,SK:sk}));return true},
    /* targeted SET of a few fields on an existing item (never a full put) */
    async set(pk,sk,fields){const x=t.get(key(pk,sk));if(!x)return false;Object.assign(x,clone(fields));return true},
    /* presence off: only when the socket going away is still the account's (a newer connection is never clobbered) */
    async clearConn(acct,conn,now){const x=t.get(key('ACCT#'+acct,'PROFILE'));if(!x||!conn||x.conn!==conn)return false;x.conn=null;x.offAt=now;delete x.GSI1PK;delete x.GSI1SK;return true},
    /* v0.82: a guest's presence off, on the same terms */
    async clearGuest(gid,conn){const x=t.get(key('GUEST#'+gid,'GUEST'));if(!x||!conn||x.conn!==conn)return false;x.conn=null;delete x.GSI1PK;delete x.GSI1SK;return true},
    /* a rate limit on one field: true (and field=now) when it is absent or at least gapMs old */
    async rate(pk,sk,field,gapMs,now){const x=t.get(key(pk,sk));if(!x)return false;if(x[field]!=null&&x[field]>now-gapMs)return false;x[field]=now;return true},
    /* a counted quota per bucket (e.g. the hour): true while fewer than max this bucket */
    async quota(pk,sk,field,bucket,max){const x=t.get(key(pk,sk));if(!x)return false;const q=x[field];if(q&&q.h===bucket){if(q.n>=max)return false;q.n++;return true}x[field]={h:bucket,n:1};return true},
    async bump(pk,sk,field){const k=key(pk,sk);const x=t.get(k);if(!x)return null;x[field]=(x[field]||0)+1;return {seq:x[field]-1,item:clone(x)}},
    async setIn(pk,sk,map,k2,v){const x=t.get(key(pk,sk));if(x){x[map]={...(x[map]||{}),[k2]:v}}},
    /* v0.80: a versioned put — only when the stored rev is still item.rev (none = a new item or one never versioned); → the new rev or false */
    async putRev(pk,sk,item){const k=key(pk,sk);const x=t.get(k);if(x&&(x.rev??null)!==(item.rev??null))return false;const rev=(item.rev||0)+1;t.set(k,clone({...item,PK:pk,SK:sk,rev}));return rev},
    /* a one-time switch: field from → to, true only for the caller that made it */
    async flip(pk,sk,field,from,to){const x=t.get(key(pk,sk));if(!x||x[field]!==from)return false;x[field]=to;return true},
    /* v0.82 every item whose PK starts with pkPrefix and whose SK is sk (a one-time seeding scan — never on a hot path) */
    async scan(pkPrefix,sk){return [...t.values()].filter(x=>String(x.PK).startsWith(pkPrefix)&&x.SK===sk).map(clone)},
    /* a put only while the stored item lacks `field` (absent item included) → true if written */
    async putUnless(pk,sk,item,field){const k=key(pk,sk);const x=t.get(k);if(x&&x[field]!=null)return false;t.set(k,clone({...item,PK:pk,SK:sk}));return true},
    dump(){return t}};
}
function dynamo(table){
  const {DynamoDBClient}=require('@aws-sdk/client-dynamodb');
  const {DynamoDBDocumentClient,GetCommand,PutCommand,DeleteCommand,QueryCommand,UpdateCommand,ScanCommand}=require('@aws-sdk/lib-dynamodb');
  const db=DynamoDBDocumentClient.from(new DynamoDBClient({}),{marshallOptions:{removeUndefinedValues:true}});
  const all=async q=>{let out=[],k;do{const r=await db.send(new QueryCommand({...q,ExclusiveStartKey:k}));out=out.concat(r.Items||[]);k=r.LastEvaluatedKey}while(k);return out};
  return {kind:'dynamo',
    /* strongly consistent: a request must see the write the previous request just made */
    async get(pk,sk){const r=await db.send(new GetCommand({TableName:table,Key:{PK:pk,SK:sk},ConsistentRead:true}));return r.Item||null},
    async put(pk,sk,item){await db.send(new PutCommand({TableName:table,Item:{...item,PK:pk,SK:sk}}))},
    async del(pk,sk){await db.send(new DeleteCommand({TableName:table,Key:{PK:pk,SK:sk}}))},
    async query(pk,prefix,o){o=o||{};const q={TableName:table,KeyConditionExpression:'PK = :p AND begins_with(SK, :s)',ExpressionAttributeValues:{':p':pk,':s':prefix||''},ScanIndexForward:!o.desc};
      if(o.limit){const r=await db.send(new QueryCommand({...q,Limit:o.limit}));return r.Items||[]}return all(q)},
    async byIndex(gpk){return all({TableName:table,IndexName:'GSI1',KeyConditionExpression:'GSI1PK = :p',ExpressionAttributeValues:{':p':gpk},ScanIndexForward:false})},
    /* one call per move: the seq this caller owns AND the match record (players, connections, status) */
    async bump(pk,sk,field){try{const r=await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'ADD #f :one',ConditionExpression:'attribute_exists(PK)',ExpressionAttributeNames:{'#f':field},ExpressionAttributeValues:{':one':1},ReturnValues:'ALL_NEW'}));return {seq:r.Attributes[field]-1,item:r.Attributes}}catch(e){if(e.name==='ConditionalCheckFailedException')return null;throw e}},
    async setIn(pk,sk,map,k2,v){try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET #m.#k = :v',ConditionExpression:'attribute_exists(#m)',ExpressionAttributeNames:{'#m':map,'#k':k2},ExpressionAttributeValues:{':v':v}}))}catch(e){if(e.name!=='ConditionalCheckFailedException')throw e}},
    /* atomic: returns the value BEFORE the increment */
    async counter(pk,sk,field,by){const n=by||1;const r=await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'ADD #f :one',ExpressionAttributeNames:{'#f':field},ExpressionAttributeValues:{':one':n},ReturnValues:'UPDATED_NEW'}));return r.Attributes[field]-n},
    async putRev(pk,sk,item){const r=item.rev;const rev=(r||0)+1;try{await db.send(new PutCommand({TableName:table,Item:{...item,PK:pk,SK:sk,rev},
      ConditionExpression:r==null?'attribute_not_exists(#r)':'#r = :r',ExpressionAttributeNames:{'#r':'rev'},...(r==null?{}:{ExpressionAttributeValues:{':r':r}})}));return rev}
      catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    async flip(pk,sk,field,from,to){try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET #f = :to',ConditionExpression:'#f = :from',
      ExpressionAttributeNames:{'#f':field},ExpressionAttributeValues:{':to':to,':from':from}}));return true}catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    async putNew(pk,sk,item){try{await db.send(new PutCommand({TableName:table,Item:{...item,PK:pk,SK:sk},ConditionExpression:'attribute_not_exists(PK)'}));return true}catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    /* v0.82 a one-time seeding scan (needs dynamodb:Scan in the template), paginated */
    async scan(pkPrefix,sk){let out=[],k;do{const r=await db.send(new ScanCommand({TableName:table,FilterExpression:'begins_with(PK, :p) AND SK = :s',ExpressionAttributeValues:{':p':pkPrefix,':s':sk},ExclusiveStartKey:k}));
      out=out.concat(r.Items||[]);k=r.LastEvaluatedKey}while(k);return out},
    async putUnless(pk,sk,item,field){try{await db.send(new PutCommand({TableName:table,Item:{...item,PK:pk,SK:sk},ConditionExpression:'attribute_not_exists(#f)',ExpressionAttributeNames:{'#f':field}}));return true}
      catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    async set(pk,sk,fields){const ks=Object.keys(fields);if(!ks.length)return true;const N={},V={};ks.forEach((k,i)=>{N['#a'+i]=k;V[':a'+i]=fields[k]});
      try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET '+ks.map((k,i)=>'#a'+i+' = :a'+i).join(', '),ConditionExpression:'attribute_exists(PK)',ExpressionAttributeNames:N,ExpressionAttributeValues:V}));return true}
      catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    /* presence off, conditional on the connection still being this one */
    async clearConn(acct,conn,now){if(!conn)return false;try{await db.send(new UpdateCommand({TableName:table,Key:{PK:'ACCT#'+acct,SK:'PROFILE'},UpdateExpression:'SET #c = :n, offAt = :t REMOVE GSI1PK, GSI1SK',ConditionExpression:'#c = :c',
        ExpressionAttributeNames:{'#c':'conn'},ExpressionAttributeValues:{':n':null,':t':now,':c':conn}}));return true}catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    async clearGuest(gid,conn){if(!conn)return false;try{await db.send(new UpdateCommand({TableName:table,Key:{PK:'GUEST#'+gid,SK:'GUEST'},UpdateExpression:'SET #c = :n REMOVE GSI1PK, GSI1SK',ConditionExpression:'#c = :c',
        ExpressionAttributeNames:{'#c':'conn'},ExpressionAttributeValues:{':n':null,':c':conn}}));return true}catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    /* one write: SET field=now only when absent or older than now-gap (per account, survives reconnects and Lambda containers) */
    async rate(pk,sk,field,gapMs,now){try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET #f = :now',ConditionExpression:'attribute_exists(PK) AND (attribute_not_exists(#f) OR #f <= :cut)',
        ExpressionAttributeNames:{'#f':field},ExpressionAttributeValues:{':now':now,':cut':now-gapMs}}));return true}catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}},
    /* quota: +1 in the same bucket while below max, else a fresh bucket; false when the bucket is full */
    async quota(pk,sk,field,bucket,max){const N={'#f':field,'#h':'h','#n':'n'};
      try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET #f.#n = #f.#n + :one',ConditionExpression:'#f.#h = :b AND #f.#n < :max',ExpressionAttributeNames:N,ExpressionAttributeValues:{':one':1,':b':bucket,':max':max}}));return true}
      catch(e){if(e.name!=='ConditionalCheckFailedException')throw e}
      try{await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'SET #f = :q',ConditionExpression:'attribute_exists(PK) AND (attribute_not_exists(#f) OR #f.#h <> :b)',ExpressionAttributeNames:{'#f':field,'#h':'h'},ExpressionAttributeValues:{':q':{h:bucket,n:1},':b':bucket}}));return true}
      catch(e){if(e.name==='ConditionalCheckFailedException')return false;throw e}}};
}
module.exports={memory,dynamo};
