/* server/verify/index.js — THE VERIFY LAMBDA (v1.01 wave 2 Phase E; docs/backend.md "v1.01 Ranked verification").
   Invoked ASYNC (InvocationType Event) by the arena Lambda right after a Ranked match settles: event {id}. Replays the match with the rules of
   the deployed build and writes VERIFY#<id> (+ AUDIT#<id> VERIFY on a mismatch) — see verify.js. Log only: it never changes a settlement.
   Package (template.yaml VerifyFn, Code ./verify): this folder = index.js + verify.js + rules.js/rules.json (tools/node/mkbundle.js, run by
   deploy.sh) + store.js/onlcore.js (copied from ../src by deploy.sh). In the repo the copies are not needed: ../src is used.
   env: TABLE, VERIFY_MODE (log · off · enforce = TODO, logs only). */
'use strict';
const near=n=>{try{return require('../src/'+n)}catch(e){return require('./'+n)}};
const {verifyMatch}=require('./verify.js');
let RULES;function rules(){if(RULES===undefined){try{RULES=require('./rules.js')}catch(e){RULES=null;console.log('[verify101] no rules bundle deployed: every match is skipped (nobundle)')}}return RULES}
let DB=null;
exports.handler=async ev=>{const id=String(ev&&ev.id||'').replace(/[^\w-]/g,'').slice(0,60);if(!id)return {skipped:'noid'};
  const mode=(process.env.VERIFY_MODE||'log').toLowerCase();if(mode==='off')return {off:true};
  if(!DB)DB=near('store.js').dynamo(process.env.TABLE);
  const r=await verifyMatch({store:DB,id,rules:rules(),C:near('onlcore.js'),mode,log:x=>console.log(x)});
  return {id,ok:r.ok,skipped:r.skipped||null,ms:r.ms}};
exports.rules=rules;
