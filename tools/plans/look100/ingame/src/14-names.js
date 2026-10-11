
/* =====================================================================
   14-NAMES · THE NAME GENERATOR
   =====================================================================
   NAMEBANK holds praenomina (male/female), cognomina, stage names, epithets and cities;
   NAME_PATTERNS weights the shapes ("Prae Cog", "Prae 'Stage' Cog", "The Epithet of Place"...).
   genName() guarantees uniqueness against everything currently alive, saved or remembered
   (takenNames + NAME_SESSION). Every dice button (diceBtn) routes here.
   ===================================================================== */
/* ================= GLADIATOR NAME GENERATOR =================
   Thousands of thematic combinations: praenomen + cognomen, stage names, epithets and "the X of Y" titles.
   Every name it hands out is checked against the heroes, beasts, the Ludus, custom characters and managers. */
const NAMEBANK={
  prae:['Aulus','Appius','Caeso','Decimus','Gaius','Gnaeus','Lucius','Mamercus','Manius','Marcus','Numerius','Postumus','Publius','Quintus','Servius','Sextus','Spurius','Tiberius','Titus','Vibius','Faustus','Hostus','Opiter','Proculus','Statius','Tertius','Volero','Agrippa','Lars','Nonus','Octavius','Septimus','Cossus','Kaeso','Durmius','Fulvius','Galerius','Herminius','Iulus','Lartius'],
  praeF:['Aelia','Aurelia','Camilla','Claudia','Cornelia','Drusilla','Fabia','Flavia','Hostilia','Junia','Livia','Lucretia','Octavia','Petronia','Sabina','Servilia','Valeria','Vipsania','Galla','Marcia','Rufina','Tertia','Domitia','Antonia','Caecilia','Horatia','Licinia','Pompeia','Sulpicia','Volumnia'],
  cog:['Varro','Ferox','Lupercus','Scaurus','Nerva','Corvus','Pertinax','Rufus','Calvus','Draco','Leontius','Vindex','Galba','Balbus','Crassus','Strabo','Naso','Pavo','Ahenobarbus','Magnus','Severus','Verus','Durus','Asper','Acer','Glabrio','Mucro','Priscus','Sabinus','Taurus','Ursinus','Victor','Vitalis','Aquila','Bestia','Catulus','Dentatus','Flamma','Lentulus','Murena','Niger','Pollio','Regulus','Silanus','Turbo','Vulso','Caepio','Messala','Saxo','Ferreus','Invictus','Tenax','Audax','Celer','Fortis','Vulnus','Barbatus','Cicatrix','Malleus','Rapax'],
  stage:['Ignis','Tempestas','Umbra','Fulmen','Vulpes','Mors','Ferrum','Saxum','Tonitrus','Nox','Aurora','Carnifex','Sagitta','Venator','Lupa','Serpens','Corvina','Aper','Hydra','Cerberus','Pardus','Scorpio','Vespa','Grando','Procella','Glacies','Cinis','Fatum','Rabies','Sanguis','Silex','Tigris','Ruina','Furia','Nebula','Pugnax'],
  epi:['the Unbroken','Iron-Jaw','of the Red Sand','Lion-Eater','the Twice-Freed','Bloodhand','the Quiet Blade','the Unbowed','Bone-Breaker','the Grinning','Stone-Skin','the Oathless','Wolf-Tooth','the Pale','Half-Ear','the Tall','the Last','Sand-Walker','Ash-Born','the Merciless','Thrice-Scarred','the Gilded','Crow-Feeder','the Jackal','Eagle-Eye','the Butcher','the Bear','Salt-Tongue','the Lucky','Chain-Breaker','Oak-Arm','Horn-Helm','the Widowmaker','Skull-Drummer','the Mute','Dust-Eater','the Serpent','Hammerfist','Ox-Heart','the Unkillable','Nine-Lives','the Smiling Death','Red-Beard','the Hound','Grave-Digger'],
  title:['Butcher','Hammer','Lion','Wolf','Pride','Terror','Shield','Scourge','Bull','Ghost','Viper','Storm','Anvil','Ox','Fox','Jackal','Hawk','Bear','Blade','Widow'],
  place:['Capua','Pompeii','Roma','Verona','Arles','Nemausus','Pola','Puteoli','Syracusae','Uthina','Thysdrus','Leptis Magna','Carthago','Alexandria','Corinth','Gades','Massilia','Ostia','Tarentum','Neapolis','Brundisium','Numidia','Thracia','Gallia','Dacia','Britannia','Hispania','Germania','Illyria','Aegyptus','Parthia','Sardinia','Creta','Cyrene','Antiochia'],
};
/* NAME_PATTERNS — [weight, maker(_, female)] for each name shape: Roman, Roman + stage name, stage + epithet, cognomen + epithet, "The Title of Place", "Stage of Place". TWEAK: the weights (30/12/14/12/10/10). */
const NAME_PATTERNS=[
  [30,(g,f)=>`${pickOne(f?NAMEBANK.praeF:NAMEBANK.prae)} ${pickOne(NAMEBANK.cog)}`],
  [12,(g,f)=>`${pickOne(f?NAMEBANK.praeF:NAMEBANK.prae)} "${pickOne(NAMEBANK.stage)}" ${pickOne(NAMEBANK.cog)}`],
  [14,()=>`${pickOne(NAMEBANK.stage)} ${pickOne(NAMEBANK.epi)}`],
  [12,()=>`${pickOne(NAMEBANK.cog)} ${pickOne(NAMEBANK.epi)}`],
  [10,()=>`The ${pickOne(NAMEBANK.title)} of ${pickOne(NAMEBANK.place)}`],
  [10,()=>`${pickOne(NAMEBANK.stage)} of ${pickOne(NAMEBANK.place)}`],
];
/* takenNames — every name already in use (lower case): class heroes, beasts, city beasts, the Ludus, custom characters and beasts, Manager gladiators and lanistae, the live seats and this session's names. */
function takenNames(){
  const s=new Set();const add=n=>n&&s.add(String(n).toLowerCase());
  for(const k in CLASSES)add(CLASSES[k].hero);
  for(const b of BASE_NPCS)add(b.name);['Leo','Leaena','Tholo','Commodus','Zora','Flavius'].forEach(add);
  for(const T of Object.values(CITY_BEASTS))for(const [k,v] of Object.entries(T))if(k!=='champ')add(v);
  if(typeof LUDUS_CACHE!=='undefined')LUDUS_CACHE.forEach(g=>add(g.name));
  if(typeof CUSTOM!=='undefined'){CUSTOM.chars.forEach(c=>add(c.name));CUSTOM.npcs.forEach(c=>add(c.name))}
  if(typeof MGR!=='undefined'&&MGR.world){for(const g of MGR.world.glads||[])add(g.name);for(const m of MGR.world.mgrs||[])add(m.name)}
  if(S&&S.players)S.players.forEach(p=>add(p.name));
  for(const n of NAME_SESSION)add(n);
  return s;
}
/* NAME_SESSION — names handed out this session (never repeated). */
const NAME_SESSION=new Set();
/* genName — a unique gladiator name (28% female by default; optional pattern index); after 60 clashes falls back to "Prae Cog II–V". The shape is picked with Math.random but the parts with pickOne/rnd (the seeded dice). TWEAK: the .28 female share, the 26-character limit. */
function genName({female=null,pattern=null,taken=null}={}){
  const T=taken||takenNames();
  const f=female==null?Math.random()<.28:female;
  const tot=NAME_PATTERNS.reduce((s,[w])=>s+w,0);
  for(let i=0;i<60;i++){
    let fn;if(pattern!=null)fn=NAME_PATTERNS[pattern][1];else{let r=Math.random()*tot;for(const [w,g] of NAME_PATTERNS){if((r-=w)<0){fn=g;break}}}
    const n=fn(null,f);if(n.length<=26&&!T.has(n.toLowerCase())){T.add(n.toLowerCase());NAME_SESSION.add(n);return n}
  }
  return `${pickOne(NAMEBANK.prae)} ${pickOne(NAMEBANK.cog)} ${['II','III','IV','V'][rnd(4)]}`;
}
/* nameCombos — how many distinct names the patterns can produce (shown in the Studio name generator). */
const nameCombos=()=>NAMEBANK.prae.length*NAMEBANK.cog.length+NAMEBANK.praeF.length*NAMEBANK.cog.length+(NAMEBANK.prae.length+NAMEBANK.praeF.length)*NAMEBANK.stage.length*NAMEBANK.cog.length+NAMEBANK.stage.length*NAMEBANK.epi.length+NAMEBANK.cog.length*NAMEBANK.epi.length+NAMEBANK.title.length*NAMEBANK.place.length+NAMEBANK.stage.length*NAMEBANK.place.length;
/* ---- BEAST NAMES (v0.20): what the keepers call them — rivers, mountains, old gods, bad omens ---- */
const BEASTBANK={
  place:['Adige','Aetna','Atlas','Avernus','Bagrada','Benaco','Byrsa','Camargue','Crau','Cyane','Garrigue','Gebel','Histria','Kvarner','Liternum','Lozère','Misenum','Nilus','Padus','Rhodanus','Sahel','Sarnus','Solfatara','Syrtis','Tifata','Tiber','Ventoux','Vesuvia','Volturnus','Zaghouan'],
  virtue:['Ferox','Rabidus','Saevus','Atrox','Immanis','Torvus','Truculentus','Vorax','Rapax','Furens','Cruentus','Tenax','Impiger','Vigil','Mordax','Edax','Horridus','Dirus','Trux','Ferus'],
  myth:['Cerberus','Chimaera','Scylla','Charybdis','Hydra','Nemea','Erymanthos','Calydon','Ladon','Orthrus','Python','Typhon','Echidna','Sphinx','Gorgo','Talos','Harpyia','Stymphalos','Geryon','Cacus'],
  pet:['Mordicus','Ursulus','Lupulus','Dentatus','Ossifragus','Vastator','Carnifex','Sanguineus','Nocturnus','Tenebra','Fulgor','Tonitrus','Umbra','Bruma','Aestas','Grando','Procella','Turbo','Nix','Cinis'],
  suffix:['the Hungry','of the Pits','the Old One','the Ungentle','Twice-Sold','the Quiet','the Keeper\u2019s Regret','of the Dark Cage','the Gate-Breaker','Ever-Chained'],
};
/* BEAST_PATTERNS — [weight, maker] for beast names: places, tempers, myths, keepers' names, keeper's name + epithet. TWEAK: the weights. */
const BEAST_PATTERNS=[[30,()=>pickOne(BEASTBANK.place)],[22,()=>pickOne(BEASTBANK.virtue)],[18,()=>pickOne(BEASTBANK.myth)],[20,()=>pickOne(BEASTBANK.pet)],[10,()=>`${pickOne(BEASTBANK.pet)} ${pickOne(BEASTBANK.suffix)}`]];
/* genBeastName — a unique beast name (optional pattern index). */
function genBeastName({pattern=null}={}){const taken=takenNames();
  for(let i=0;i<40;i++){let f;if(pattern!=null&&BEAST_PATTERNS[pattern])f=BEAST_PATTERNS[pattern][1];else{const t=BEAST_PATTERNS.reduce((a,[w])=>a+w,0);let x=Math.random()*t;f=BEAST_PATTERNS[0][1];for(const [w,fn] of BEAST_PATTERNS){if((x-=w)<0){f=fn;break}}}
    const n=f();if(!taken.has(n)&&!NAME_SESSION.has(n)){NAME_SESSION.add(n);return n}}
  return pickOne(BEASTBANK.pet)+' '+RN(1+Math.floor(Math.random()*30));}
/* genNickname — a random epithet / title / stage name for a portrait. */
function genNickname(){return pickOne([()=>pickOne(NAMEBANK.epi).replace(/^the /,'The '),()=>`The ${pickOne(NAMEBANK.title)} of ${pickOne(NAMEBANK.place)}`,()=>pickOne(NAMEBANK.stage)])()}
/* LANISTA_CITIES — a house's home city must be one of the 12 arena cities (events, city square, home games) */
const LANISTA_CITIES=()=>LOCATIONS.slice(1).map(L=>L.n);
/* HOME_CITIES — birthplaces for gladiators: the 12 arena cities plus other cities of the empire. */
const HOME_CITIES=()=>[...LOCATIONS.slice(1).map(L=>L.n),'Carthago','Alexandria','Corinth','Gades','Massilia','Ostia','Tarentum','Neapolis','Brundisium','Antiochia','Cyrene','Londinium','Lugdunum','Emerita'];
/* genBackstory — a one-paragraph backstory (origin, past, motive, quirk) for a name and home city. */
function genBackstory(name,city){
  const B={
    origin:['born to a fishmonger on the docks of {c}','the last son of a disgraced senator from {c}','sold into bondage in {c} before they could walk','a deserter from the legions stationed near {c}','raised by the priests of Mars outside {c}','a former chariot groom from the stables of {c}','an orphan of the plague years in {c}','a shepherd from the hills above {c}'],
    past:['They broke a magistrate\'s jaw over a debt and chose the sand over the cross','A lanista won them in a dice game and has regretted it since','They once killed a wolf bare-handed, or so the tavern stories say','Three owners have tried to break them; all three are now poorer','They survived the sinking of a grain ship by clinging to a broken oar','They fought as a Damnatio for a season and somehow lived','They were a baker until the tax collectors took the oven','They trained under a retired champion who died owing them money'],
    motive:['they fight to buy back a sister\'s freedom','they want the Rudis and a quiet farm','they want their name carved on the Infamis','they fight because it is the only thing they have ever been good at','they owe Flavius more coin than one life can repay','they want the crowd to chant their name just once','they are hunting the gladiator who killed their mentor','they believe Fortuna owes them a win'],
    quirk:['They kiss the sand before every bout.','They never fight without a strip of red cloth on the left wrist.','They hum old harvest songs while killing.','They name every weapon they own.','They refuse to face the Emperor\'s box.','They count their scars out loud when nervous.','They feed the arena cats with their own rations.','They have never once lost a game of knucklebones.'],
  };
  const c=city||pickOne(HOME_CITIES());
  const t=s=>s.replace('{c}',c);
  return `${name}, ${t(pickOne(B.origin))}. ${t(pickOne(B.past))}. Now ${t(pickOne(B.motive))}. ${pickOne(B.quirk)}`;
}
// a small "🎲" button beside any name field: <button data-genname="#inputId">
document.addEventListener('click',e=>{const b=e.target.closest('[data-genname]');if(!b)return;e.preventDefault();const inp=document.querySelector(b.dataset.genname);if(!inp)return;inp.value=genName();inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))});
/* diceBtn — the 🎲 button that fills the input matching sel with a generated name. */
const diceBtn=sel=>`<button type="button" class="btn" data-genname="${sel}" title="Generate a unique gladiator name" aria-label="Generate a name" style="padding:4px 8px">🎲</button>`;
/* nameGenHTML — the Creator Studio name generator body: pattern buttons and a list of generated names. */
function nameGenHTML(list){
  return `<p>${nameCombos().toLocaleString()} possible combinations across six patterns: praenomen and cognomen, stage names, epithets and titles. Each name below is unique against the class heroes, the beasts, your Ludus, your custom characters and every manager and gladiator in Manager mode.</p>
   <div class="seg" role="group" style="margin-bottom:8px"><span class="lbl">Style</span>${[['','Any'],['0','Roman'],['1','Roman + stage'],['2','Stage + epithet'],['3','Cognomen + epithet'],['4','Title of place'],['5','Stage of place']].map(([v,l])=>`<button type="button" data-ngpat="${v}">${l}</button>`).join('')}</div>
   <div class="seg" role="group" style="margin-bottom:8px"><span class="lbl">🐾 Beasts</span>${[['b','Any beast'],['b0','Places'],['b1','Tempers'],['b2','Myths'],['b3','Keepers\u2019 names'],['b4','With epithet']].map(([v,l])=>`<button type="button" data-ngpat="${v}">${l}</button>`).join('')}</div>
   <div class="list2" id="ngList">${list.map(n=>`<div class="lrow"><div class="t"><b>${esc(n)}</b><small>${esc(genNickname())} · ${esc(pickOne(HOME_CITIES()))}</small></div></div>`).join('')}</div>`;
}
