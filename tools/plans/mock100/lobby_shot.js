/* node tools/plans/mock100/lobby_shot.js — screenshots lobby.html in every state (1440x900 full page + phone 390x844) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const go=async(hash,out,W,H,full)=>{const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});
 await pg.goto('file://'+path.resolve(__dirname,'lobby.html')+'#'+hash);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
 await pg.screenshot({path:path.resolve(__dirname,out),fullPage:!!full});await pg.close()};
await go('host','lobby_host_1440.png',1440,900);await go('guest','lobby_guest_1440.png',1440,900);await go('full','lobby_full_1440.png',1440,900);await go('full','lobby_full_1440_page.png',1440,900,true);
await go('phone','lobby_phone_390.png',390,844);await go('phone','lobby_phone_390_full.png',390,844,true);await b.close()})();
