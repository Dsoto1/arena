/* mkau.js — v0.91 English (Australia) 🇦🇺: Commonwealth spelling of the English text, generated, never hand-edited.
   His pick (2026-10-06): running text spelled the Australian way (colour, armour, centre, travelled, realise…), but printed game
   terms stay exactly as on his cards — every entry of names.json, plus "Crowd Favor".
   Reads every key in tools/i18n/src/part-*.json, respells only the visible words (never inside HTML tags, {n} placeholders or
   ${…} pieces, never inside a protected term), and writes tools/i18n/au/part-01.json with ONLY the keys that change (any key it
   leaves out shows the English, which is the same). Re-run after newkeys each release:  node tools/i18n/mkau.js  then mkdict. */
const fs=require('fs'),path=require('path');
const D=__dirname;
const KEEP=[...JSON.parse(fs.readFileSync(path.join(D,'names.json'),'utf8')),'Crowd Favor','Crowd Favour'].sort((a,b)=>b.length-a.length);
/* word stems → Commonwealth spelling; each applies to the bare word + common endings, case kept */
const W={color:'colour',colors:'colours',colored:'coloured',coloring:'colouring',colorful:'colourful',
  armor:'armour',armors:'armours',armored:'armoured',armorer:'armourer',armory:'armoury',armories:'armouries',
  favor:'favour',favors:'favours',favored:'favoured',favoring:'favouring',favorite:'favourite',favorites:'favourites',favorable:'favourable',
  honor:'honour',honors:'honours',honored:'honoured',honorable:'honourable',labor:'labour',labors:'labours',neighbor:'neighbour',neighbors:'neighbours',
  rumor:'rumour',rumors:'rumours',humor:'humour',valor:'valour',vigor:'vigour',splendor:'splendour',odor:'odour',harbor:'harbour',harbors:'harbours',
  behavior:'behaviour',behaviors:'behaviours',endeavor:'endeavour',parlor:'parlour',savior:'saviour',clamor:'clamour',glamor:'glamour',
  center:'centre',centers:'centres',centered:'centred',theater:'theatre',theaters:'theatres',meter:'metre',meters:'metres',
  defense:'defence',defenses:'defences',offense:'offence',offenses:'offences',pretense:'pretence',
  gray:'grey',grayed:'greyed',graying:'greying',traveling:'travelling',traveled:'travelled',traveler:'traveller',travelers:'travellers',
  canceled:'cancelled',canceling:'cancelling',labeled:'labelled',labeling:'labelling',modeled:'modelled',fueled:'fuelled',dueling:'duelling',
  marvelous:'marvellous',jewelry:'jewellery',catalog:'catalogue',fulfill:'fulfil',enrollment:'enrolment',skeptical:'sceptical',mold:'mould',
  realize:'realise',realized:'realised',realizes:'realises',recognize:'recognise',recognized:'recognised',organize:'organise',organized:'organised',
  specialize:'specialise',specialized:'specialised',finalize:'finalise',apologize:'apologise',memorize:'memorise',criticize:'criticise',
  summarize:'summarise',customize:'customise',customized:'customised',prioritize:'prioritise',minimize:'minimise',minimized:'minimised',
  maximize:'maximise',emphasize:'emphasise',sympathize:'sympathise',agonize:'agonise',idolize:'idolise',terrorize:'terrorise',
  penalize:'penalise',penalized:'penalised',stabilize:'stabilise',neutralize:'neutralise',personalize:'personalise',randomize:'randomise',
  randomized:'randomised',honorific:'honorific'};
const keyRe=new RegExp('\\b('+Object.keys(W).join('|')+')\\b','gi');
function caseLike(src,dst){if(src===src.toUpperCase()&&src.length>1)return dst.toUpperCase();if(src[0]===src[0].toUpperCase())return dst[0].toUpperCase()+dst.slice(1);return dst}
function respellText(t){
  /* hide protected terms first, then respell, then restore */
  const hold=[];let s=t;for(const k of KEEP){if(!k||s.indexOf(k)<0)continue;s=s.split(k).join('\u0000'+(hold.push(k)-1)+'\u0001')}
  s=s.replace(keyRe,m=>caseLike(m,W[m.toLowerCase()]));
  return s.replace(/\u0000(\d+)\u0001/g,(m,i)=>hold[+i])}
function respell(k){/* only the visible text: skip tags, {n} placeholders, ${…} and entities */
  return k.split(/(<[^>]*>|\{[^}]*\}|\$\{[^}]*\}|&[a-z#0-9]+;)/i).map((part,i)=>i%2?part:respellText(part)).join('')}
const out={};let n=0,total=0;
for(const f of fs.readdirSync(path.join(D,'src')).filter(f=>/^part-\d+\.json$/.test(f)).sort()){
  for(const o of JSON.parse(fs.readFileSync(path.join(D,'src',f),'utf8'))){total++;const v=respell(o.k);if(v!==o.k&&!(o.k in out)){out[o.k]=v;n++}}}
fs.mkdirSync(path.join(D,'au'),{recursive:true});
fs.writeFileSync(path.join(D,'au','part-01.json'),JSON.stringify(out,null,1));
console.log(`en-AU: ${n} of ${total} keys respelled → tools/i18n/au/part-01.json`);
