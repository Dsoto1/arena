/* G5 no fame for a fallen nobody: a death costs the house no fame while it is under fame 18 (17 killFighter: -2 today) */
{const base=killFighter;killFighter=function(glad,mgr){const f=mgr?mgr.fame:null;const r=base.apply(this,arguments);try{if(mgr&&f!=null&&f<18)mgr.fame=f}catch(e){}return r}}
