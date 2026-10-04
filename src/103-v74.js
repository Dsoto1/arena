/* =====================================================================
   103-V74 · v0.74 — the printed classes and armor to Virgilante's cards (decided with him)
   =====================================================================
   • His drawn armor is THE system set: Settings → Armor shows only it (the Sculpted set is hidden until it is reworked), and
     everyone is switched to it once (flavius_armscan74).
   • assets/armor2.webp grew to 5 rows: the belt split into Leather Gladiator Belt I (27) / II (28), Centurian Helm (29), Steel Helm
     (30), Leather Greaves (31 pair · 32 single), the real Flavius' Bracers (33 single · 34 pair; no more gold grade), the shoulder
     guard (35, the Manica) and pair thumbnails (36-42) — ARM[k].thumb is the card/thumbnail cell, ARM[k].img stays the avatar cut.
   • His armor names (tools/art: TTS list); new pieces Centurian Helm, Steel Helm, Leather Greaves, Belt I join the market.
   • Classes: Soldier — Centurian Helm (3 AP) + Belt II; Venatore — Steel Helm + Belt I; Hero & Slave — padded LOWER legs;
     Hero's shield = LVL 1 Thracian Shield; Provocator Manica (now "Manica") back on the UPPER arm wearing the fur-and-steel
     shoulder art from his Hero card (cell 35); "Trident"; ability text "while class abilities are on".
   ===================================================================== */
SHEETS.a.rows=5;ARM_SHEET.h=1650;
{const NC={27:[58, 1084, 214, 142],28:[387, 1080, 216, 150],29:[758, 1004, 133, 302],30:[1046, 1007, 217, 296],32:[1770, 1004, 90, 302],33:[2083, 1025, 123, 260],35:[2654, 1010, 302, 289]};for(const [i,c] of Object.entries(NC))ARM_CROP[+i]=c}
/* new pieces */
ARM.balteus1={...ARM.balteus,img:27};ARM.balteus.img=28;
ARM.centurion={n:'Centurian Helm',lv:2,slot:'head',pt:'helm',ap:3,img:29};
ARM.steelhelm={n:'Steel Helm',lv:1,slot:'head',pt:'helm',ap:2,img:30};
ARM.lgreaves={n:'Leather Greaves',lv:1,slot:'leg',pt:'lower',ap:3,pair:1,img:32,thumb:31};
ARM.bracers.img=33;ARM.bracers.thumb=34;ARM.provmanica.img=35; /* the Hero card: his Manica is the fur-and-steel shoulder guard */
{const T={"wraps": 36, "legwrapsU": 37, "legwraps": 38, "femoralia": 39, "ocrea": 40, "thighplate": 41, "cnemis": 42};for(const [k,i] of Object.entries(T))if(ARM[k])ARM[k].thumb=i}
Object.assign(ARM_FIT,{balteus1:{...ARM_FIT.balteus},centurion:{at:'head',dy:-12,w:42},steelhelm:{at:'head',dy:-6,w:40},lgreaves:{at:'shin',dy:-4,w:24,dx:-1},bracers:{at:'fore',dx:-1,dy:-1,w:22}});
/* Manica (the old Provocator Manica) back on the upper arm, worn like the shoulder guard it is on the Hero card */
ARM.provmanica.pt='upper';ARM_FIT.provmanica={...ARM_FIT.spaulder};
/* his names */
const ARM_NAMES74={galea:_T('Iron Helm'),cassis:_T('Horned Helm'),crista:_T('Hoplomachus Helm'),murmillo:_T('Steel Gated Helm'),helm5:_T('Steel Dome Helm'),flavhelm:_T('Helm of Flavius'),
  balteus:_T('Leather Gladiator Belt II'),balteus1:_T('Leather Gladiator Belt I'),pectorale:_T('Bronze Chest Armor'),lorica:_T('Scaled Chest Armor'),musculata:_T('Forged Chest Armor'),
  amazon:_T('Plated Chest Armor'),flavchest:_T("Flavius' Chest Armor"),thorax:_T('Reinforced Chest Armor'),wraps:_T('Padded Arm Armor'),manica:_T('Galerus'),provmanica:_T('Manica'),
  spaulder:_T('Iron Spaulder'),cestus:_T('Cestus'),galerus:_T('Lorica Segmentata'),bracers:_T("Flavius' Bracers"),legwrapsU:_T('Leather Tasset Armor'),legwraps:_T('Padded Leg Armor'),
  femoralia:_T('Iron Tasset Armor'),ocrea:_T('Greaves'),greaves:_T("Flavius' Greaves"),thighplate:_T('Tasset Armor'),cnemis:_T('Steel Greaves')};
for(const [k,n] of Object.entries(ARM_NAMES74))if(ARM[k])ARM[k].n=n;
if(ARM.galerus)ARM.galerus.bonus={head:1}; /* Lorica Segmentata: +1 head (his list) */
/* the market carries the new pieces */
MARKET_A[1].push('steelhelm','balteus1','lgreaves');MARKET_A[2].push('centurion');
/* classes */
{const C=CLASSES;const set=(k,arm)=>{if(C[k])C[k].armor=arm};
  set('soldier',[['centurion','head'],['balteus','chest'],['wraps','rarm'],['wraps','larm'],['legwrapsU','rleg'],['legwrapsU','lleg']]);
  set('venatore',[['steelhelm','head'],['balteus1','chest'],['wraps','rarm'],['wraps','larm'],['legwraps','rleg'],['legwraps','lleg']]);
  set('hero',[['murmillo','head'],['provmanica','larm'],['wraps','rarm'],['wraps','larm'],['legwraps','rleg'],['legwraps','lleg']]);
  set('slave',[['galea','head'],['manica','larm'],['wraps','rarm'],['wraps','larm'],['legwraps','rleg'],['legwraps','lleg']]);
  if(C.hero&&W.thracian)C.hero.L='thracian';if(W.trident)W.trident.n=_T('Trident');
  if(C.soldier)C.soldier.ab=_T('Ability: +1 damage to every successful attack while class abilities are on.');
  for(const k of Object.keys(C))if(C[k].ab&&/round 1/.test(C[k].ab))C[k].ab=C[k].ab.replace(/in round 1/,_T('while class abilities are on'))}
/* cards and thumbnails use the pair cell; the avatar keeps the single cut */
{const base=cardRef;cardRef=function(ref){const r=base.apply(this,arguments);try{if(r&&ref&&ref[0]==='a'){const A=ARM[ref.slice(2)];if(A&&A.thumb!=null)return {...r,i:A.thumb}}}catch(e){}return r}}
/* the real Flavius' Bracers: no more gold grading */
{const base=cardStyle;cardStyle=function(ref){const s=base.apply(this,arguments);return ref==='a:bracers'&&s?s.replace(/;filter:[^;]*$/,''):s}}
{const base=armBox;armBox=function(){const B=base.apply(this,arguments);if(B)B.gold=false;return B}}
/* his drawn set is the system set: switch everyone once, hide the Sculpted choice */
try{if(typeof SETTINGS!=='undefined'&&localStorage.getItem('flavius_armscan74')!=='1'){SETTINGS.armorStyle='scan';localStorage.setItem('flavius_armscan74','1');if(typeof applySettings==='function')applySettings()}}catch(e){}
if(typeof SETTINGS!=='undefined'&&!SETTINGS.armorStyle)SETTINGS.armorStyle='scan';
{const base=settingsHTML;settingsHTML=function(tab){let h=base.apply(this,arguments);try{if(tab==='tokens'&&typeof h==='string')h=h.replace(/<button type="button" class="tokrow[^"]*" data-sarmor="drawn">[\s\S]*?<\/button>/,'')}catch(e){}return h}}
/* the Iron Spaulder was the same fur-and-iron shoulder guard as the Hero's Manica (Virgilante): one piece now. The market sells the
   Manica in its place; old saves, classes and characters that name 'spaulder' still resolve (a hidden alias, left out of every list). */
{const i=MARKET_A[2].indexOf('spaulder');if(i>=0)MARKET_A[2][i]='provmanica';
  if(ARM.spaulder&&ARM.provmanica){delete ARM.spaulder;Object.defineProperty(ARM,'spaulder',{value:ARM.provmanica,enumerable:false,configurable:true,writable:true})}}
