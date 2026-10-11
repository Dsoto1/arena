const {chromium}=require('playwright');const path=require('path');
const page=path.resolve(process.argv[2]||'flavius-arena.html');
exports.boot=async(vp,ls)=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('PAGEERR',e.message));
  await pg.goto('file://'+page,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return {b,pg}};
exports.setup=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
  openManager();await W8(400);newWorld({type:'pre',key:MGR_PRE[4].key});const w=W_(),m=me();
  for(let k=0;k<3;k++){if(!w.night.bye){const mine=rosterOf(m)[0];for(const x of w.night.bouts){x.done=true;x.res=x.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}
      if(mine&&k===0){const b0=w.night.bouts[0];b0.ents[0]=mine.id;b0.res={att:1,winners:[mine.id],rows:[{gid:mine.id,place:1,won:true,f:5,fname:'',alive:true}],turns:3,lines:[],reason:'x'}}}
    w.pend=[];await endWeek()}
  const R=w.mgrs.find(x=>!x.isPlayer&&!x.sica);R.rivalry=40;return {week:w.week,rival:R.id}});
