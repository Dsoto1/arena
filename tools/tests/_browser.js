/* _browser.js — WebKit hook (v1.16, his 2a): a test that does `const {chromium}=require('./_browser')` runs on Chromium exactly as before
   (the very same playwright chromium object, so tools/regcov.js's shared-browser + coverage patch still applies) unless the environment
   sets PW_BROWSER=webkit (or firefox): then `chromium.launch()` launches that engine instead. Used by the tests in tools/ci/webkit.txt
   (workflow .github/workflows/webkit.yml; docs/testing.md "Running on WebKit"). A "_" file is a helper, not a test. */
const pw=require('playwright');
const name=process.env.PW_BROWSER||'chromium';
if(!pw[name])throw new Error('_browser: unknown PW_BROWSER '+name);
module.exports={chromium:pw[name],engine:name};
