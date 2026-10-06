/* 208-v92zoom — v0.92 SMOOTHER WHEN ZOOMED + NO EMOJI EMOTES (his notes 2026-10-06).
   • The arena's baked stone layers (192: under / deco / top / light) were keyed on the board origin OX/OY. Zoomed in, the camera eases
     toward the active fighter every frame, so every frame repainted all four layers (stone, walls, banners, towers) — the stutter.
     Now a layer is painted once in a REFERENCE frame (the origin when it was painted) on a canvas with a margin round the screen, and
     each frame only slides it by (OX − ref): a repaint happens only after the camera has moved past the margin, the zoom or board
     changed, or the layer's own content changed. Not zoomed: no margin, same as before.
   • Spectator EMOJI emotes are gone (each one kept the whole arena redrawing for ~2.6 s): the crowd shows its mood on the faces and
     with raised arms (193). Shout bubbles (text) stay — rare, one at a time. */
const AR92={ref:null,n:0,pad:0.2};
function ar92Pad(){return ar91Zoomed()?AR92.pad:0}
/* the reference origin: kept while the camera stays inside the margin and the zoom/board is unchanged */
function ar92Ref(){const p=ar92Pad();const W=cv.width/(window.devicePixelRatio||1),H=cv.height/(window.devicePixelRatio||1);const R=AR92.ref;
  if(R&&R.tw===TW&&R.p===p&&R.w===cv.width&&R.h===cv.height&&Math.abs(OX-R.ox)<=W*p*0.9&&Math.abs(OY-R.oy)<=H*p*0.9)return R;
  return (AR92.ref={ox:OX,oy:OY,tw:TW,p,w:cv.width,h:cv.height,id:++AR92.n})}
ar91Key=function(){const dpr=window.devicePixelRatio||1;const R=ar92Ref();return [cv.width,cv.height,dpr,TW.toFixed(3),'r'+R.id,typeof ROT89!=='undefined'?ROT89.k:0,N,ar91Mat().n,ar91Tiers(),ar91Lud()?1:0,night91On()?1:0,AR91.ver,AR91TEX[ar91Mat().n]?1:0,typeof lite84On==='function'&&lite84On()?1:0].join('|')};
ar91Layer=function(name,key,paint){let L=AR91.L[name];const scr=name==='sky' /* the sky is screen-fixed */;const R=scr?{ox:null,oy:null,p:0}:(AR92.ref||ar92Ref());
  if(L&&L.key===key){if(L.raw&&(L.sx!==OX||L.sy!==OY)){const dx=OX-L.pox,dy=OY-L.poy;L.sx=OX;L.sy=OY;
      L.out={fires:L.raw.fires.map(f=>({...f,x:f.x+dx,y:f.y+dy})),walls:L.raw.walls.map(w=>({...w,a:{x:w.a.x+dx,y:w.a.y+dy},b:{x:w.b.x+dx,y:w.b.y+dy}}))}}return L}
  if(!L)L=AR91.L[name]={cv:document.createElement('canvas'),key:''};const dpr=window.devicePixelRatio||1;const p=R.p;
  const px=Math.round(cv.width*p),py=Math.round(cv.height*p),cw=cv.width+2*px,ch=cv.height+2*py;
  if(L.cv.width!==cw||L.cv.height!==ch){L.cv.width=cw;L.cv.height=ch}
  const g=L.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cw,ch);
  /* paint in the reference frame: what is now at OX lands where it sat when the reference was taken */
  g.setTransform(dpr,0,0,dpr,px+(scr?0:(R.ox-OX)*dpr),py+(scr?0:(R.oy-OY)*dpr));
  const tex=ar91Tex();AR91PAT=tex?g.createPattern(tex,'repeat'):null;const out={fires:[],walls:[]};
  try{paint(g,out)}catch(e){console.error(e)}finally{AR91PAT=null}
  L.key=key;L.tex=!!tex;L.px=px;L.py=py;L.ox=R.ox;L.oy=R.oy;L.raw=out;L.out=out;L.pox=L.sx=OX;L.poy=L.sy=OY;return L};
ar91Blit=function(L,op){if(AR91.noStatic&&!op)return;const dpr=window.devicePixelRatio||1;ctx.save();ctx.setTransform(1,0,0,1,0,0);if(op)ctx.globalCompositeOperation=op;
  const dx=-(L.px||0)+(L.ox==null?0:(OX-L.ox)*dpr),dy=-(L.py||0)+(L.oy==null?0:(OY-L.oy)*dpr);ctx.drawImage(L.cv,Math.round(dx),Math.round(dy));ctx.restore()};
/* the light layer's wash covered only the screen it was painted for: cover the margin too */
{const base=ar91LightPaint;ar91LightPaint=function(g,Wd,Hd){return base.call(this,g,Wd*3,Hd*3)}}
/* no emoji emotes: the mood stays on the face; a shout (text) still shows as a bubble */
{const base=emote;emote=function(sp,emo,text=''){if(sp)sp.lastEmo=emo;if(!text)return;return base.call(this,sp,'',text)}}
{const base=drawEmotes;drawEmotes=function(){if(S&&S.emotes)S.emotes=S.emotes.filter(e=>e.text);return base.apply(this,arguments)}}
