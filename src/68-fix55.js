/* =====================================================================
   68-FIX55 · v0.55 SOUND ON EVERY DESK
   =====================================================================
   A downloaded copy opened on Safari, an iPhone or an iPad could stay silent: Apple mutes Web Audio with the
   ring/silent switch unless the page asks for 'playback', and older iOS only opens the audio session for a real
   <audio> element started inside a tap. So: ask for playback, start a silent looping <audio> on the first
   gesture, and if the browser still holds the sound back after a tap, a small 🔇 chip says so (tap to retry).
   ===================================================================== */
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
const AUD_EL={el:null,url:null};
/* silentWavURL — a tenth of a second of silence, built in memory (no file to ship) */
function silentWavURL(){if(AUD_EL.url)return AUD_EL.url;const n=2205,buf=new ArrayBuffer(44+n*2),v=new DataView(buf);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,22050,true);v.setUint32(28,44100,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  return (AUD_EL.url=URL.createObjectURL(new Blob([buf],{type:'audio/wav'})))}
function audElUnlock(){if(HEADLESS||AUD_EL.el||!audSet().on)return;try{const a=new Audio();a.src=silentWavURL();a.loop=true;a.setAttribute('playsinline','');const p=a.play();if(p&&p.catch)p.catch(()=>{AUD_EL.el=null});AUD_EL.el=a}catch(e){}}
function audChip(){let c=document.getElementById('audChip');const blocked=audSet().on&&AUD.ctx&&AUD.ctx.state!=='running';
  if(!blocked){if(c)c.hidden=true;return}
  if(!c){c=document.createElement('button');c.id='audChip';c.type='button';c.textContent='🔇 Sound is held back — tap to turn it on';c.addEventListener('click',()=>{AUD_EL.el=null;audElUnlock();audUnlock();setTimeout(audChip,500)});document.body.appendChild(c)}
  c.hidden=false}
for(const ev of ['touchend','click','keydown'])document.addEventListener(ev,()=>{audElUnlock();setTimeout(audChip,700)},{passive:true,capture:true});
