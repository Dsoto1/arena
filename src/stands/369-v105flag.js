/* v1.05 B40 (369-v105flag): the flag a fan holds (321 flag101Draw) hangs ON its pole. The vexillum bitmap carries its own centred pole and a wide
   margin, so drawn at the pole's x the cloth floated about a hand's width to the right. While flag101Draw runs, its one drawImage of the flag bitmap is
   replaced by a crop of the CLOTH only (vexillum viewbox 220x300: cloth x 40..180, bar to y 32, fringe to y 192) whose hoist (left) edge sits on the
   pole's x, just under the finial. Same scale and art as before; the pole is the one 321 draws. Same code for both facings and every zoom (the dest
   is in the ctx's own units) and for the flat and 3D-crowd fans (one draw call). FLAG105.last = [{px,hx}] (pole x, cloth hoist x) for the test.
   Kill switch: localStorage flavius_v105flagoff=1. */
const FLAG105={off:(()=>{try{return localStorage.getItem('flavius_v105flagoff')==='1'}catch(e){return false}})(),last:[]};
if(typeof flag101Draw==='function'&&!FLAG105.off){const base=flag101Draw;flag101Draw=function(){
  if(typeof ctx==='undefined'||!ctx)return base.apply(this,arguments);
  const da=ctx.drawImage,own=Object.prototype.hasOwnProperty.call(ctx,'drawImage');FLAG105.last=[];let px=null;
  const mt=ctx.moveTo,mown=Object.prototype.hasOwnProperty.call(ctx,'moveTo');
  ctx.moveTo=function(x,y){if(this.strokeStyle==='#4a321c')px=x;return mt.apply(this,arguments)};
  ctx.drawImage=function(im,x,y,w,h){
    if(arguments.length===5&&px!==null&&im&&im.width>8){const U=im.width/220,V=im.height/300;const dx=px-w/220;
      FLAG105.last.push({px:px,hx:dx+w/220});
      return CanvasRenderingContext2D.prototype.drawImage.call(this,im,39*U,34*V,142*U,158*V,dx,y+h*0.01,w*142/220,h*158/300)}
    return da.apply(this,arguments)};
  try{return base.apply(this,arguments)}finally{
    if(own)ctx.drawImage=da;else delete ctx.drawImage;if(mown)ctx.moveTo=mt;else delete ctx.moveTo}}}
