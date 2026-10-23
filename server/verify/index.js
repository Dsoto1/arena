/* server/verify/index.js — THE VERIFY LAMBDA (v1.01 wave 2 Phase E; docs/backend.md "v1.01 Ranked verification" + "v1.12 Ranked check").
   Invoked ASYNC (InvocationType Event) by the arena Lambda: event {id} after a Ranked match settles (VerifyMode log), or {id, gate:true}
   BEFORE it settles (VerifyMode enforce, v1.12: every human has reported, the arena waits). Replays the match with the rules of the deployed
   build and writes VERIFY#<id> (+ AUDIT#<id> …) — see verify.js. A gated call then async-invokes the arena (ARENA_FN) with the internal event
   {verify112:'done', id}: the arena settles with the verdict (routes.js "v1.12 RANKED CHECK"). It is sent whatever happened (a skip, a crash:
   the arena settles by agreement and flags the match), and again on a retry — the arena settles once.
   Package (template.yaml VerifyFn, Code ./verify): this folder = index.js + verify.js + rules.js/rules.json (tools/node/mkbundle.js, run by
   deploy.sh) + store.js/onlcore.js (copied from ../src by deploy.sh). In the repo the copies are not needed: ../src is used.
   env: TABLE, VERIFY_MODE (log · off · enforce), ARENA_FN (v1.12: the arena function to tell). */
'use strict';
const near=n=>{try{return require('../src/'+n)}catch(e){return require('./'+n)}};
const {verifyMatch}=require('./verify.js');
let RULES;function rules(){if(RULES===undefined){try{RULES=require('./rules.js')}catch(e){RULES=null;console.log('[verify101] no rules bundle deployed: every match is skipped (nobundle)')}}return RULES}
let DB=null,LC=null;
/* v1.12: tell the arena the verdict is written (async; a failure is logged — the arena's 60 s sweep settles the match anyway) */
async function tellArena(id,o={}){const fn=o.arena||process.env.ARENA_FN;if(!fn)return false;
  try{if(o.invoke)await o.invoke(fn,{verify112:'done',id});else{const {LambdaClient,InvokeCommand}=require('@aws-sdk/client-lambda');LC=LC||new LambdaClient({});
      await LC.send(new InvokeCommand({FunctionName:fn,InvocationType:'Event',Payload:Buffer.from(JSON.stringify({verify112:'done',id}))}))}return true}
  catch(e){console.log('[verify112] could not tell the arena',id,String(e&&e.message||e));return false}}
async function handle(ev,o={}){const id=String(ev&&ev.id||'').replace(/[^\w-]/g,'').slice(0,60);if(!id)return {skipped:'noid'};
  const mode=(process.env.VERIFY_MODE||'log').toLowerCase();if(mode==='off')return {off:true};
  const db=o.db||(DB=DB||near('store.js').dynamo(process.env.TABLE));const gate=!!(ev&&ev.gate);let r=null;
  try{r=await verifyMatch({store:db,id,rules:o.rules!==undefined?o.rules:rules(),C:near('onlcore.js'),mode,log:o.log||(x=>console.log(x)),...(o.now?{now:o.now}:{})})}
  catch(e){console.log('[verify112] the check failed',id,String(e&&e.stack||e).slice(0,400));
    /* a gated match must hear SOMETHING: a skipped verdict (the arena settles by agreement + flags it) */
    if(gate){try{const t=Date.now();await db.putNew('VERIFY#'+id,'V',{id,skipped:'error',gate:1,mode,at:t,GSI1PK:'VERIFY',GSI1SK:t,ttl:Math.floor(t/1000)+90*86400})}catch(x){}}
    r={skipped:'error'}}
  finally{if(gate)await tellArena(id,o)} /* the arena asked and waits: it hears back whatever the mode here says */
  return {id,ok:r.ok,skipped:r.skipped||null,forged:r.forged||undefined,ms:r.ms}}
exports.handler=async ev=>handle(ev);
exports.handle=handle;exports.tellArena=tellArena;
exports.rules=rules;
