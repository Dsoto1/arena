/* Storage for the online arena. Two backends with one interface:
   memory — for local tests (node server/test/*.js)
   dynamo — one DynamoDB table (TABLE env), single-table design:
     PK                SK            what
     ACCT#<sub>        PROFILE       account {id,name,conn,since}
     CHAR#<id>         CHAR          gladiator (+ GSI1PK OWNER#<acct>, GSI1SK born)
     LOBBY#<id>        LOBBY         lobby (+ GSI1PK LOBBIES, GSI1SK created; ttl 2 days)
     MATCH#<id>        META          match {seed, open (snapshot), n (next input seq), results}
     MATCH#<id>        IN#<seq 8>    one input (ttl 2 days)
     CONN#<connId>     CONN          {acct} (ttl 1 day)
     WORLD             HALL | NEWS   lists
*/
'use strict';
function memory(){
  const t=new Map();const key=(pk,sk)=>pk+'|'+sk;const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  return {kind:'memory',
    async get(pk,sk){return clone(t.get(key(pk,sk)))},
    async put(pk,sk,item){t.set(key(pk,sk),clone({...item,PK:pk,SK:sk}))},
    async del(pk,sk){t.delete(key(pk,sk))},
    async query(pk,prefix){return [...t.values()].filter(x=>x.PK===pk&&String(x.SK).startsWith(prefix||'')).sort((a,b)=>a.SK<b.SK?-1:1).map(clone)},
    async byIndex(gpk){return [...t.values()].filter(x=>x.GSI1PK===gpk).sort((a,b)=>(b.GSI1SK||0)-(a.GSI1SK||0)).map(clone)},
    async counter(pk,sk,field){const k=key(pk,sk);const x=t.get(k)||{PK:pk,SK:sk};x[field]=(x[field]||0)+1;t.set(k,x);return x[field]-1},
    dump(){return t}};
}
function dynamo(table){
  const {DynamoDBClient}=require('@aws-sdk/client-dynamodb');
  const {DynamoDBDocumentClient,GetCommand,PutCommand,DeleteCommand,QueryCommand,UpdateCommand}=require('@aws-sdk/lib-dynamodb');
  const db=DynamoDBDocumentClient.from(new DynamoDBClient({}),{marshallOptions:{removeUndefinedValues:true}});
  const all=async q=>{let out=[],k;do{const r=await db.send(new QueryCommand({...q,ExclusiveStartKey:k}));out=out.concat(r.Items||[]);k=r.LastEvaluatedKey}while(k);return out};
  return {kind:'dynamo',
    async get(pk,sk){const r=await db.send(new GetCommand({TableName:table,Key:{PK:pk,SK:sk}}));return r.Item||null},
    async put(pk,sk,item){await db.send(new PutCommand({TableName:table,Item:{...item,PK:pk,SK:sk}}))},
    async del(pk,sk){await db.send(new DeleteCommand({TableName:table,Key:{PK:pk,SK:sk}}))},
    async query(pk,prefix){return all({TableName:table,KeyConditionExpression:'PK = :p AND begins_with(SK, :s)',ExpressionAttributeValues:{':p':pk,':s':prefix||''}})},
    async byIndex(gpk){return all({TableName:table,IndexName:'GSI1',KeyConditionExpression:'GSI1PK = :p',ExpressionAttributeValues:{':p':gpk},ScanIndexForward:false})},
    /* atomic: returns the value BEFORE the increment (the seq this caller owns) */
    async counter(pk,sk,field){const r=await db.send(new UpdateCommand({TableName:table,Key:{PK:pk,SK:sk},UpdateExpression:'ADD #f :one',ExpressionAttributeNames:{'#f':field},ExpressionAttributeValues:{':one':1},ReturnValues:'UPDATED_NEW'}));return r.Attributes[field]-1}};
}
module.exports={memory,dynamo};
