/* v1.08c: the i18n wrap tool (tools/i18n/wrap.js, step 1 of prep.sh) must not wrap code-ish strings, and must still wrap UI text.
   Node only, no browser. (a) a fixture with false-wrap shapes (0 keys) + real prose (all wrap), (b) the repo: none of the known false
   wraps (Error text, shader, console concat, property-key concat, CSS/font/HTML fragments, SFX credits, home names, recorder) is listed,
   (c) the version badge is never wrapped (01-head.html is not scanned; GAME_VER parses its text). */
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..','..'),W=path.join(ROOT,'tools','i18n','wrap.js');
const list=args=>JSON.parse(cp.execFileSync('node',[W,'--list',...args],{cwd:ROOT,maxBuffer:1<<28}).toString());
const bad=[];const ck=(n,ok,x)=>{if(!ok)bad.push(n+(x?' '+JSON.stringify(x).slice(0,300):''))};
/* (a) fixture */
const fx=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'i18nwrap-')),'fixture.js');
fs.writeFileSync(fx,`
function a(k,t,h){
  if(!k)throw new Error('Set off first please');
  if(!t)throw new TypeError('shadowRow without light()');
  throw 'Something went wrong here';
  console.warn('404: the '+k+' frame does not match its idle frame');
  console.log('corpse drew at '+k+' times the living scale');
  const m=s[k+'Max'];
  sh.fragmentShader='uniform float uMMode, uMSpec;\\nuniform vec3 uMCool;';
  const q='precision highp float; void main(){ gl_FragColor=vec4(1.0); }';
  ctx.font='12px IBM Plex Mono, monospace';
  const f='IBM Plex Mono, monospace';
  const sel=\`\${t}[style^="color:\${h}"],\${t}[style^="color: \${h}"]\`;
  const o=' <span title="';
  const p=\`disabled title="\${k}"\`;
}
/* i18n:skip-begin */
const BLOCK={a:'Nemausus is a city name',b:'Syracusae is a city name'};
/* i18n:skip-end */
const SFX108_CREDITS=[["hit","Tyrael - Sword Hit Flesh - 02.wav","SoundFlakes","CC BY 4.0",1]];
const HOME_OVR105={Londinium:'Nemausus',Antiochia:'Syracusae'};
`);
let r=list(['--fixture',fx]);ck('fixture false wraps',r.total===0,r.keys);
fs.writeFileSync(fx,`
function b(n,el){
  el.textContent='Your fighter is wounded and cannot fight';
  el.innerHTML='<b>Victory!</b> The crowd roars for '+n+' ('+n+' wins)';
  el.title=\`Spend \${n} coin to heal this gladiator\`;
  mToast('Not enough coin');
  el.innerHTML=\`<div class="x">Pick a weapon for the next round \${n}</div>\`;
  el.setAttribute('title','Open the market');
}
`);
r=list(['--fixture',fx]);const ks=r.keys.map(x=>x.k).join('|');
ck('fixture real prose wraps',r.total>=5&&/wounded and cannot fight/.test(ks)&&/Not enough coin/.test(ks)&&/Spend \{0\} coin/.test(ks)&&/Pick a weapon/.test(ks)&&/Open the market/.test(ks)&&/Victory!/.test(ks),r.keys);
/* (b) the repo: the known false wraps are not listed. (411 = the v1.09 mock-up's real prose, not ours to judge) */
r=list([]);const K=r.keys.filter(x=>!/411-/.test(x.file));
const FP=[[/shadowRow without light|Set off first/,'Error text'],[/uniform |gl_|void main/,'shader'],[/^<span title="$|^disabled title=|\[style\^=/,'html/css fragment'],
 [/IBM Plex Mono|sans-serif|monospace/,'font family'],[/does not match its idle frame|corpse drew at|the lying still/,'console concat'],[/^Max$/,'property key concat'],
 [/CC BY 4|CC0|\.wav|Empiremonkey/,'SFX credits'],[/^Nemausus$|^Syracusae$/,'home names'],[/^readback\?$|canvas\(in memory\)|^areas = inclusive|ms\/s$/,'recorder']];
for(const x of K)for(const [re,w] of FP)if(re.test(x.k))ck('false wrap: '+w,false,x);
/* (c) the version badge is not scanned */
const head=fs.readFileSync(path.join(ROOT,'src','core','01-head.html'),'utf8');
ck('badge present, plain text',/<span class="ed">arena · v\d+\.\d+[a-z]?<\/span>/.test(head));
ck('badge never a key',!r.keys.some(x=>/^arena · v\d/.test(x.k)));
console.log(JSON.stringify({keysOutside411:K.length,total:r.total}));
console.log('MISS',bad);process.exit(bad.length?1:0);
