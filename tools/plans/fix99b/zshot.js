const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage();
await pg.goto(`http://localhost:8123/r3d/render3.html?m=Zora_2024_Copy&rot=${process.argv[3]}&el=30&M=18&w=640&h=640`);await pg.waitForFunction(()=>window.DONE,null,{timeout:60000});
const d=await pg.evaluate(()=>window.DONE);fs.writeFileSync(process.argv[2],Buffer.from(d.split(',')[1],'base64'));await b.close()})();
