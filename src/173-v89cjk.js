/* 173-v89cjk — v0.89 Japanese (ja) + the CJK rendering shared with Chinese (zh, v0.90).
   • 'ja' is registered in 00-lang LANGS86 (→ Settings 🌐 Language via 148) and the 01-head loader (assets/lang_ja.js);
     the switch/ask words are added to LANG_UI87 here, so a Japanese browser gets the first-run ask in Japanese.
   • CJK_LANGS89 = the languages drawn with the CJK font stack (ja now, zh when it ships). When LANG is one of them:
     – <html> gets class "cjk" + "cjk-<l>"; the CSS font variables (--display/--body/--mono) keep the game's Latin fonts first
       (names and game terms stay English) and fall back to the system CJK fonts (Mincho for display, Gothic for body);
     – no small caps, letter-spacing, uppercase or synthetic (slanted) CJK italics anywhere (CJK has no case; tracking breaks kana);
       buttons may wrap (Japanese labels can't be squeezed like Latin ones) and line breaking follows strict kinsoku;
     – canvas text: every ctx.font set on a 2D context gets the CJK Gothic stack inserted before its generic family (the setter of
       CanvasRenderingContext2D/OffscreenCanvasRenderingContext2D.prototype.font is wrapped; cached per string);
     – clsWrap (57-classes: the class card's ability lines, used by 61/104) breaks CJK text by character (a CJK character
       counts as two Latin ones; no line starts with closing punctuation) instead of on spaces.
   • English (and the European languages) are untouched: nothing here runs unless LANG is in CJK_LANGS89.
   Helpers: cjkHas89(s) (any CJK character), cjkFont89(fontString), cjkWrap89(s,n). */
const CJK_RE89=/[　-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯]/;
const CJK_STACK89={ /* i18n:skip */
  ja:{sans:'"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Yu Gothic","YuGothic","Meiryo","Noto Sans JP","Noto Sans CJK JP","Source Han Sans JP","Microsoft YaHei","PingFang SC","WenQuanYi Zen Hei"',
      serif:'"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif JP","Noto Serif CJK JP","Source Han Serif JP","Hiragino Sans","Yu Gothic","Meiryo","Noto Sans JP","Noto Sans CJK JP"'},
  zh:{sans:'"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Micro Hei","WenQuanYi Zen Hei","Hiragino Sans","Yu Gothic"',
      serif:'"Songti SC","STSong","SimSun","Noto Serif SC","Noto Serif CJK SC","Source Han Serif SC","PingFang SC","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC"'}};
const CJK_LANGS89=Object.keys(CJK_STACK89);
const CJK_ON89=typeof LANG!=='undefined'&&CJK_LANGS89.includes(LANG);
function cjkHas89(s){return CJK_RE89.test(String(s==null?'':s))}
/* the switch/ask words, in Japanese (shown before the dictionary loads) */
try{LANG_UI87.ja={name:'日本語',live:'言語はゲームの再読み込み後に切り替わります。今すぐ再読み込みすると、進行中の試合は失われます。',now:'今すぐ再読み込み',later:'次回から',ask:'日本語でプレイしますか？',change:'設定でいつでも変更できます。',yes:'はい、日本語で'}}catch(e){} /* i18n:skip */

/* ── canvas: the CJK stack before the generic family ── */
const CJK_FONTC89=new Map();
function cjkFont89(v){
  if(typeof v!=='string'||!v)return v;const hit=CJK_FONTC89.get(v);if(hit)return hit;
  const S=CJK_STACK89[CJK_ON89?LANG:'ja'];let out=v;
  if(!/Hiragino|PingFang|YaHei|Yu Gothic|Meiryo|Noto Sans (?:JP|SC|CJK)/.test(v)){
    const m=/,?\s*(serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-sans-serif|ui-serif)\s*$/i.exec(v);
    const stack=S.sans; /* the Gothic stack on canvas even for serif text: Mincho is too thin at board sizes */
    out=m?v.slice(0,m.index)+','+stack+','+m[1]:v+','+stack}
  if(CJK_FONTC89.size>400)CJK_FONTC89.clear();CJK_FONTC89.set(v,out);return out}
if(CJK_ON89){
  for(const C of [typeof CanvasRenderingContext2D!=='undefined'&&CanvasRenderingContext2D,typeof OffscreenCanvasRenderingContext2D!=='undefined'&&OffscreenCanvasRenderingContext2D]){
    if(!C)continue;try{const P=C.prototype;const d=Object.getOwnPropertyDescriptor(P,'font');if(!d||!d.set||d.set._cjk89)continue;
      const set=function(v){d.set.call(this,cjkFont89(v))};set._cjk89=true;
      Object.defineProperty(P,'font',{configurable:true,enumerable:d.enumerable,get:d.get,set})}catch(e){}}
}

/* ── word wrap: CJK breaks by character ── */
const CJK_NOSTART89='、。，．・：；？！ー）」』】〕〉》’”ゝゞヽヾぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々…‥〜～!),.:;?]}';
function cjkWrap89(s,n){
  /* tokens: a Latin run (word + its trailing spaces) or one CJK character; width 2 for CJK, 1 otherwise */
  const toks=String(s).match(/[　-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯]|[^\s　-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯]+\s*|\s+/g)||[];
  const wd=t=>{let w=0;for(const ch of t)w+=CJK_RE89.test(ch)?2:1;return w};
  const out=[];let line='',lw=0;
  for(const t of toks){const tw=wd(t.trimEnd());
    if(line&&lw+tw>n&&!CJK_NOSTART89.includes(t[0])){out.push(line.trimEnd());line='';lw=0;if(!t.trim())continue}
    line+=t;lw+=wd(t)}
  if(line.trim())out.push(line.trimEnd());return out}
if(CJK_ON89&&typeof clsWrap==='function'){const base=clsWrap;clsWrap=function(s,n){return cjkHas89(s)?cjkWrap89(s,n):base.apply(this,arguments)}}

/* ── CSS ── */
if(CJK_ON89){
  try{document.documentElement.classList.add('cjk','cjk-'+LANG)}catch(e){}
  const S=CJK_STACK89[LANG];
  const css=document.createElement('style');css.id='cjk89';css.textContent=` /* i18n:skip */
html.cjk{--display:"Marcellus SC",${S.serif},"Trajan Pro",Georgia,serif;--body:"Alegreya Sans",${S.sans},"Segoe UI",system-ui,sans-serif;
  --mono:"IBM Plex Mono",${S.sans},ui-monospace,monospace;--cjk-sans:${S.sans};--cjk-serif:${S.serif}}
html.cjk body{line-break:strict;overflow-wrap:anywhere}
html.cjk body *,html.cjk body *::before,html.cjk body *::after{letter-spacing:0!important;font-variant-caps:normal!important;text-transform:none!important;font-synthesis-style:none}
html.cjk button,html.cjk .btn,html.cjk .chip,html.cjk .tabs button,html.cjk .mtabs button{white-space:normal;word-break:normal;overflow-wrap:anywhere;line-height:1.25}`;
  document.head.appendChild(css);
}
