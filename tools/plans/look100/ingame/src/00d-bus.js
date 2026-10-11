/* 00d-bus — v0.93 THE EVENT BUS (his yes 2026-10-07). Runs right after 00c-errlog, before everything else, so any module may
   listen. The emitters (one wrapper per happening, outermost in the chain) live in 218-v93bus.
   API:  BUS.on(name, fn) → off()   ·   BUS.once(name, fn) → off()   ·   BUS.off(name, fn)   ·   BUS.emit(name, data)
         BUS.has(name) → true while someone listens (emitters check it first, so an event nobody hears costs one lookup and
         builds no payload — headless sims stay as fast as before).
   • emit is SYNCHRONOUS, in the order the handlers subscribed; '*' handlers hear every event as fn(data, name).
   • a handler that throws never breaks the caller or the other handlers: the error goes to the 00c error log
     (kind 'caught', message 'bus <name>: …') and the next handler runs.
   • handlers subscribed during an emit are not called for that emit; one removed during an emit is skipped.
   • BUS.stats = {emits, calls, errs} per name (counted only while someone listens).
   New features should LISTEN here instead of wrapping core functions; the existing wrappers stay where they are.
   The event list with payload shapes is in 218-v93bus's header. */
const BUS=(()=>{const H=Object.create(null);const stats=Object.create(null);
  function has(name){const a=H[name];return !!(a&&a.length)||!!(H['*']&&H['*'].length)}
  function off(name,fn){const a=H[name];if(!a)return;const i=a.findIndex(x=>x===fn||x._orig===fn);if(i>=0)a.splice(i,1)}
  function on(name,fn){if(typeof fn!=='function')return ()=>{};(H[name]||(H[name]=[])).push(fn);return ()=>off(name,fn)}
  function once(name,fn){const w=function(d,n){off(name,w);return fn.call(this,d,n)};w._orig=fn;return on(name,w)}
  function call(fn,data,name){try{fn(data,name)}catch(e){const st=stats[name];if(st)st.errs++;
    try{err92Add('caught','bus '+name+': '+(e&&e.message||e),typeof err92Stack==='function'?err92Stack(e):'')}catch(x){}}}
  function emit(name,data){const a=H[name],all=H['*'];if(!(a&&a.length)&&!(all&&all.length))return;
    const st=stats[name]||(stats[name]={emits:0,calls:0,errs:0});st.emits++;
    if(a&&a.length){const L=a.slice();for(const fn of L){if(!a.includes(fn))continue;st.calls++;call(fn,data,name)}}
    if(all&&all.length){const L=all.slice();for(const fn of L){if(!all.includes(fn))continue;st.calls++;call(fn,data,name)}}}
  return {on,once,off,emit,has,stats,_h:H}})();
