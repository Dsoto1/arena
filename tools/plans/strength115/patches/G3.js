/* G3 blood money for the small: half price for a house under fame 18 (extends 51-v49's newcomer price, today <=2 fighters and <120 coin) */
{const base=bloodPrice;bloodPrice=function(g,F){const p=base.apply(this,arguments);try{const m=g&&g.contract?mgrById(g.contract.mgr):null;if(m&&(m.fame||0)<18&&!newcomerHouse(m))return Math.max(5,Math.round(p*0.5))}catch(e){}return p}}
