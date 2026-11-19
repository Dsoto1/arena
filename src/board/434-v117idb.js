/* v1.17 FIGURE CACHE STORES ARRAYBUFFERS (434-v117idb, his 2a, 2026-11-19; found by the WebKit CI probe tools/ci/idbprobe.js): WebKit refuses to
   store a Blob in IndexedDB in an ephemeral session (Safari Private Browsing: "UnknownError: Error preparing Blob/File data to be stored in
   object store"), and 311's an100DBPut ends tx.onerror with ok, so the device-rendered figure cache never saved there, silently. This module
   WRAPS 311's an100DBGet / an100DBPut (same DB 'flavius_anim100' v1, store 'sheets', AN100.dbMax pruning; no schema change):
   • WRITE: every Blob inside a cache record (move / act sheets, their shadow sheets) is stored as {ab:ArrayBuffer,type}; the record is copied,
     the caller's Blobs are untouched. an100DBPut is re-implemented here (the wrapped one swallows the failure and cannot be asked): the same put
     + the same oldest-first prune, but a failed write is logged ONCE per page (console.warn + the 00c error log, kind 'idb') instead of resolving
     as if saved. No IndexedDB at all = the same single warning, never a throw.
   • READ: {ab,type} becomes new Blob([ab],{type}) before 311 sees the record; OLD records that still hold Blobs read as they are. Reading is
     always converted (also with the kill switch on), so a record written by this module never reaches 311 in the wrong shape.
   Kill switch: localStorage flavius_v117idboff=1 = 311 writes Blobs exactly as before (read each call). Nothing visual changes, no Off path needed. */
{const off=()=>{try{return localStorage.getItem('flavius_v117idboff')==='1'}catch(e){return false}};
const isBlob=v=>typeof Blob!=='undefined'&&v instanceof Blob;
const plain=v=>v&&typeof v==='object'&&(Array.isArray(v)||Object.getPrototypeOf(v)===Object.prototype);
/* a copy of rec with every Blob swapped for {ab,type} */
const toAB=async(v,d)=>{if(isBlob(v))return {ab:await v.arrayBuffer(),type:v.type||''};
  if(d>5||!plain(v))return v;if(Array.isArray(v)){const a=[];for(const x of v)a.push(await toAB(x,d+1));return a}
  const o={};for(const k of Object.keys(v))o[k]=await toAB(v[k],d+1);return o};
/* {ab,type} back to a Blob, in place (the record was just read, nobody else holds it) */
const fromAB=(v,d)=>{if(!v||typeof v!=='object'||d>5)return v;
  if(!isBlob(v)&&v.ab instanceof ArrayBuffer&&typeof v.type==='string')return new Blob([v.ab],{type:v.type});
  if(plain(v))for(const k of Object.keys(v))v[k]=fromAB(v[k],d+1);return v};
let warned=false;
const warn=(e,where)=>{if(warned)return;warned=true;const m=String(e&&(e.name?e.name+': ':'')+(e.message||e)||e);
  try{console.warn('[figure cache] '+where+' failed, figures are rebuilt each visit: '+m)}catch(x){}
  try{if(typeof err92Add==='function')err92Add('idb',where+': '+m,'')}catch(x){}};
const getBase=an100DBGet,putBase=an100DBPut;
an100DBGet=async function(key){const r=await getBase.call(this,key);try{return fromAB(r,0)}catch(e){return r}};
an100DBPut=async function(rec){if(off())return putBase.call(this,rec);
  try{const db=await an100DB();const r=await toAB(rec,0);
    const err=await new Promise(ok=>{try{const tx=db.transaction('sheets','readwrite');tx.objectStore('sheets').put(r);
      tx.oncomplete=()=>ok(null);tx.onerror=ev=>ok((ev&&ev.target&&ev.target.error)||tx.error||new Error('transaction error'));tx.onabort=()=>ok(tx.error||new Error('transaction aborted'))}catch(e){ok(e)}});
    if(err){warn(err,'an100DBPut');return}
    const all=await new Promise(ok=>{const q=db.transaction('sheets').objectStore('sheets').getAll();q.onsuccess=()=>ok(q.result||[]);q.onerror=()=>ok([])});
    if(all.length>AN100.dbMax){const old=all.sort((a,b)=>a.at-b.at).slice(0,all.length-AN100.dbMax);const tx=db.transaction('sheets','readwrite');for(const o of old)tx.objectStore('sheets').delete(o.key)}}
  catch(e){warn(e,'an100DBPut')}};
}
