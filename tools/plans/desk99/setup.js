/* desk99 shared career setup (shots + dumps): a pre-made house, two weeks ended, a hurt fighter, 2 perk points, a swap offer,
   an invitation, the Recruiter's and Medicus' letters, a rival's taunt, bouts without your fighters. Used by shot.js. */
module.exports.setup=async function(pg){return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';
 for(let i=0;i<2;i++){try{W_().night&&W_().night.bouts.forEach(x=>x.done=true);await endWeek();await W8(300)}catch(e){}}
 const W2=W_(),ros=rosterOf(me());const A=ros[0];A.inj={until:W2.week+2,label:'a gashed thigh',pen:3};me().perkPts=2;
 const riv=W2.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length);const th=rosterOf(riv)[0];
 W2.offers=[{id:'oMock',kind:'swap',mid:riv.id,gid:ros[1].id,give:[th.id],coin:25,until:W2.week+1}];
 try{recruiter84(W2)}catch(e){}try{medicus84(W2)}catch(e){}
 try{if(typeof rivalLetter76==='function')rivalLetter76(W2)}catch(e){}
 try{const sp=(typeof SPECIALS!=='undefined'?SPECIALS:null);if(typeof inviteOffer==='function')inviteOffer(W2)}catch(e){}
 if(W2.night){W2.night.bye=false;W2.night.bouts.forEach(x=>{x.done=false;x.ents=x.ents.filter(id=>!ros.some(g=>g.id===id))})}
 for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}menuHide();openManager('ludus');await W8(1200);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(800);
 return {wk:W2.week}})};
