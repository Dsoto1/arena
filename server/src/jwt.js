/* Cognito ID tokens (RS256), checked against the user pool's published keys. */
'use strict';
const crypto=require('crypto');
let JWKS=null,JWKS_AT=0;
async function keys(iss){if(JWKS&&Date.now()-JWKS_AT<3600e3)return JWKS;const r=await fetch(iss+'/.well-known/jwks.json');JWKS=(await r.json()).keys||[];JWKS_AT=Date.now();return JWKS}
const b64=s=>Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64');
async function verify(token,{region,poolId,clientId},getKeys=keys){
  const parts=String(token||'').split('.');if(parts.length!==3)throw new Error('Bad token');
  const head=JSON.parse(b64(parts[0]).toString()),body=JSON.parse(b64(parts[1]).toString());
  const iss=`https://cognito-idp.${region}.amazonaws.com/${poolId}`;
  if(head.alg!=='RS256')throw new Error('Bad token');if(body.iss!==iss)throw new Error('Wrong issuer');if(body.token_use!=='id')throw new Error('Not an ID token');
  if(body.aud!==clientId)throw new Error('Wrong audience');if(!body.exp||body.exp*1000<Date.now())throw new Error('Expired');
  const jwk=(await getKeys(iss)).find(k=>k.kid===head.kid);if(!jwk)throw new Error('Unknown key');
  const ok=crypto.verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),crypto.createPublicKey({key:jwk,format:'jwk'}),b64(parts[2]));if(!ok)throw new Error('Bad signature');
  return body}
module.exports={verify};
