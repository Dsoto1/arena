/* 201-v91zora — v0.91 TAKE THE CHEST FROM ZORA (his note 2026-10-06): when your own Zora (Venatore's eagle, or one you released) carries the
   Arena Chest and you stand on a tile next to him on your turn, the action bar offers "🦅 Take the chest from Zora": the chest passes to you
   (carried, −1 movement while held, like Pick up chest) and Open Arena Chest works from your hands if you hold a key. Free action. */
function zoraChest91(p){if(!p||!S||!S.chest||S.onl||p.cpu||!p.alive||p.carrying)return null; /* offline + hot seat; online inputs go through the lockstep stream (not wired for this yet) */
  return (S.npcs||[]).find(n=>n.t==='zora'&&n.alive&&n.tamedBy===p.id&&n.carry&&n.carry.kind==='chest'&&cheb(n,p)<=1)||null}
{const base=render;render=function(){const r=base.apply(this,arguments);try{const p=typeof cur==='function'&&cur();const z=zoraChest91(p);const box=document.querySelector('#actions .acts');
  if(z&&box&&!box.querySelector('[data-act91="zorachest"]')&&S.phase==='action'&&!S.over)box.insertAdjacentHTML('beforeend',`<button class="btn" type="button" data-act91="zorachest" ${S.busy?'disabled':''}>${_T`🦅 Take the chest from Zora`}<small>${_T`−1 movement while held`}</small></button>`)}catch(e){console.error(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act91="zorachest"]');if(!b||b.disabled)return;e.preventDefault();
  const p=cur();const z=zoraChest91(p);if(!z)return;
  act(async()=>{z.carry=null;p.carrying=true;S.chest.held='p'+p.id;S.chest.r=p.r;S.chest.c=p.c;p.mv=Math.max(0,p.mv-1);
    log(_T`${nm(z)} hands the Arena Chest to ${nm(p)}.`)})});
