/* _browser.js — WebKit hook (v1.16, his 2a): a test that does `const {chromium}=require('./_browser')` runs on Chromium exactly as before
   (the very same playwright chromium object, so tools/regcov.js's shared-browser + coverage patch still applies) unless the environment
   sets PW_BROWSER=webkit (or firefox): then `chromium.launch()` launches that engine instead. Used by the tests in tools/ci/webkit.txt
   (workflow .github/workflows/webkit.yml; docs/testing.md "Running on WebKit"). A "_" file is a helper, not a test. */
const pw=require('playwright');
const name=process.env.PW_BROWSER||'chromium';
if(!pw[name])throw new Error('_browser: unknown PW_BROWSER '+name);
/* PW_HTTP (opt-in, WebKit job input http=yes): a base URL such as http://127.0.0.1:8099 serving the repo root. Every page.goto('file://<repo root>/X')
   becomes goto('<PW_HTTP>/X') (the assets load relatively either way). The rewrite wraps launch() -> newPage / newContext -> newPage and the
   context 'page' event, so no test changes; unset = the plain playwright object, untouched (tools/regcov.js patches that same object). */
const root=require('path').resolve(__dirname,'..','..'),base=(process.env.PW_HTTP||'').replace(/\/+$/,'');
const fix=u=>{if(!base||typeof u!=='string'||u.indexOf('file://')!==0)return u;let f=u.slice(7);if(f.indexOf(root)!==0)return u;return base+f.slice(root.length)};
if(process.env.PW_HTTP){
  const wp=p=>{if(p.__pwHttp)return p;p.__pwHttp=1;const g=p.goto.bind(p);p.goto=(u,...a)=>g(fix(u),...a);return p};
  const wc=cx=>{if(cx.__pwHttp)return cx;cx.__pwHttp=1;cx.pages().forEach(wp);cx.on('page',wp);const np=cx.newPage.bind(cx);cx.newPage=async(...a)=>wp(await np(...a));return cx};
  const L=pw[name].launch.bind(pw[name]);
  pw[name].launch=async(...a)=>{const b=await L(...a);const nc=b.newContext.bind(b),np=b.newPage.bind(b);
    b.newContext=async(...x)=>wc(await nc(...x));b.newPage=async(...x)=>wp(await np(...x));return b}}
/* url(u): the same rewrite for a page that is opened another way (launchPersistentContext is not wrapped above); identity unless PW_HTTP is set */
module.exports={chromium:pw[name],engine:name,url:fix};
