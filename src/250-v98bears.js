/* v0.98 (248-v98bears): the Ursa / Brutum arena cards name the bears of THIS arena (CITY_BEASTS via beastName). Display only:
   CARDS.ursa / CARDS.brutum get live getters for n and d, so every reader (card show, hover, pick windows, Bestiary, tooltips,
   log) sees the arena's name; nothing goes into S or the online hash. Outside an event beastName answers with Roma's names. */
{
  const bearCard=key=>{
    const C=CARDS[key];if(!C)return;const role=C.bear;
    const nm=()=>{try{return beastName(role)||role}catch(e){return role}};
    Object.defineProperty(C,'n',{enumerable:true,configurable:true,get(){const b=nm();return _T`${b} Aggros You!`}});
    Object.defineProperty(C,'d',{enumerable:true,configurable:true,get(){const b=nm();return _T`${b}'s aggro token moves to you. If ${b} is already eliminated or tamed, gain 2 CF.`}});
  };
  bearCard('ursa');bearCard('brutum');
}
