/* =====================================================================
   37-CRLIST · ONE SET OF BUTTONS FOR EVERY CREATION (v0.44)
   =====================================================================
   Every list in the Creator Studio now offers the same actions, in the same order, as Characters:
     [📜 Add to the rolls / Remove]  [🔒 lock]  [Edit]  [Copy]  [Delete]      (Play is for characters only)
   "The rolls" means where that kind of creation enters the game:
     weapons & armor → the market deck and character loadouts · banners → the banner rack (lanista picker)
     trophies → offered to events · editors → offered to the cities
   Lock guards against edits and deletion, exactly as it does for characters.
   ===================================================================== */
/* CR_KINDS — per kind of creation (w weapons, a armor, f flags, t trophies, sp sponsors): list/set (the CUSTOM array), store (Store collection), nm (name-suggestion pool), rolls (where "the rolls" put it), on (is it in the rolls?), toggle (add/remove), edit (open it on the designer bench), after (rebuild hook, gear only). */
const CR_KINDS={
  w:{list:()=>CUSTOM.weapons||[],set:v=>{CUSTOM.weapons=v},store:'customWeapons',nm:'weapons',rolls:_T('the market & loadouts'),
     on:x=>!!(x.rolls&&(x.rolls.market||x.rolls.loadout)),toggle:x=>{const on=CR_KINDS.w.on(x);x.rolls={...(x.rolls||{}),market:!on,loadout:!on}},
     edit:x=>{ST.gearSub='w';ST.cw=JSON.parse(JSON.stringify(x))},after:()=>{if(typeof gearRebuild==='function')gearRebuild()}},
  a:{list:()=>CUSTOM.armor||[],set:v=>{CUSTOM.armor=v},store:'customArmor',nm:'armor',rolls:_T('the market & loadouts'),
     on:x=>!!(x.rolls&&(x.rolls.market||x.rolls.loadout)),toggle:x=>{const on=CR_KINDS.a.on(x);x.rolls={...(x.rolls||{}),market:!on,loadout:!on}},
     edit:x=>{ST.gearSub='a';ST.ca=JSON.parse(JSON.stringify(x))},after:()=>{if(typeof gearRebuild==='function')gearRebuild()}},
  f:{list:()=>CUSTOM.flags||[],set:v=>{CUSTOM.flags=v},store:'customFlags',nm:'flags',rolls:_T('the banner rack'),
     on:x=>x.rack!==false,toggle:x=>{x.rack=x.rack===false?true:false},edit:x=>{ST.fd=JSON.parse(JSON.stringify(x))}},
  t:{list:()=>CUSTOM.trophies||[],set:v=>{CUSTOM.trophies=v},store:'customTrophies',nm:'trophies',rolls:_T('the events’ prizes'),
     on:x=>x.offered!==false,toggle:x=>{x.offered=x.offered===false?true:false},edit:x=>{ST.trd=JSON.parse(JSON.stringify(x))}},
  sp:{list:()=>CUSTOM.sponsors||[],set:v=>{CUSTOM.sponsors=v},store:'customSponsors',nm:'sponsors',rolls:_T('the cities'),
     on:x=>x.offered!==false,toggle:x=>{x.offered=x.offered===false?true:false},edit:x=>{ST.spd2=JSON.parse(JSON.stringify(x))}}};
/* crActs — the action row for one creation of kind: 📜 rolls toggle · 🔒 lock · Edit · Copy · Delete (Edit/Delete disabled while locked). */
function crActs(kind,item){const K=CR_KINDS[kind];const on=K.on(item);const L=item.locked;
  return `<div class="acts cracts">${customTag()}<button class="btn tksm ${on?'':'primary'}" type="button" data-cr="rolls" data-k="${kind}" data-id="${item.id}" title="${on?_T('Remove from'):_T('Add to')} ${K.rolls}">${on?_T('Remove from the rolls'):_T('📜 Add to the rolls')}</button>${lockBtn(item).replace('data-st="lock"',`data-cr="lock" data-k="${kind}"`).replace('class="btn"',_T('class="btn tksm"'))}<button class="btn tksm" type="button" data-cr="edit" data-k="${kind}" data-id="${item.id}" ${L?_T('disabled title="Locked: unlock first"'):''}>${_T`Edit`}</button><button class="btn tksm" type="button" data-cr="copy" data-k="${kind}" data-id="${item.id}">${_T`Copy`}</button><button class="btn tksm" type="button" data-cr="del" data-k="${kind}" data-id="${item.id}" ${L?_T('disabled title="Locked: unlock first"'):''}>${_T`Delete`}</button></div>`}
/* crClick — handles a [data-cr] button (rolls/lock/edit/copy/del) for its kind and id, saves to the Store, then redraws. Returns false when the kind is unknown (not ours), true otherwise. Delete of a sponsor also clears its city assignments. */
async function crClick(btn,redraw){const k=btn.dataset.k,K=CR_KINDS[k];if(!K)return false;const a=btn.dataset.cr,id=btn.dataset.id;const x=K.list().find(y=>y.id===id);if(!x)return true;const now=new Date().toISOString().slice(0,10);
  /* save — writes one creation to its Store collection (errors ignored). */
  const save=async y=>{await Store.put(K.store,y.id,y).catch(()=>{})};
  if(a==='rolls'){K.toggle(x);await save(x);if(K.after)K.after();if(typeof mToast==='function')mToast(`${K.on(x)?_T('📜 Added to'):_T('Removed from')} ${K.rolls}: <b>${esc(x.name||'')}</b>`)}
  else if(a==='lock'){x.locked=!x.locked;(x.lockLog=x.lockLog||[]).push({a:x.locked?'locked':'unlocked',at:now});await save(x)}
  else if(a==='edit'){if(x.locked)return true;K.edit(x)}
  else if(a==='copy'){const y=JSON.parse(JSON.stringify(x));y.id=(k==='sp'?'sp':k)+Date.now().toString(36);y.locked=false;y.lockLog=[];y.created=now;
    y.name=typeof nameSuggest==='function'?nameSuggest(K.nm,x.name||_T('Copy')):(x.name||_T('Copy'))+' II';K.set([...K.list(),y]);await save(y);if(K.after)K.after();K.edit(y);if(typeof mToast==='function')mToast(_T`Copied as <b>${esc(y.name)}</b> — now on the bench.`)}
  else if(a==='del'){if(x.locked)return true;K.set(K.list().filter(y=>y.id!==id));await Store.del(K.store,id).catch(()=>{});if(K.after)K.after();
    if(k==='sp'&&typeof SPON!=='undefined'){for(const kk of Object.keys(SPON.map))if(SPON.map[kk]===id)delete SPON.map[kk];if(typeof sponSave==='function')sponSave()}}
  redraw();return true}

/* v0.46: SYSTEM SETS ARE LOCKED. The printed pieces, the class and beast figures, the stock beasts, the
   system special events… show the same action row as your creations, but only Copy works: the copy is
   yours to edit, and the default is always there to come back to. */
/* sysActs — the locked action row for a system set: 🔒 System badge, "In the rolls" (unless options.rolls===false), a disabled Edit and ⧉ Copy & edit (carrying copyAttrs). */
function sysActs(copyAttrs,options={}){return `<div class="acts cracts sysacts"><span class="cbadge sys" title="${_T`System sets are locked so the defaults are always there — copy one to make it yours`}">${_T`🔒 System`}</span>${options.rolls===false?'':`<span class="cbadge rolls" title="${_T`Part of the classic game`}">${_T`📜 In the rolls`}</span>`}<button class="btn tksm" type="button" disabled title="${_T`System sets are locked — copy it to edit`}">${_T`Edit`}</button><button class="btn tksm primary" type="button" ${copyAttrs}>${_T`⧉ Copy &amp; edit`}</button></div>`}
