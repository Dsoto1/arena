/* =====================================================================
   114-ONLNET · THE REAL SERVER (phase 4): WebSocket + Google sign-in
   =====================================================================
   • Config: play/online.json beside the page ({"ws":"wss://…/live","auth":"https://<prefix>.auth.<region>.amazoncognito.com",
     "client":"<UserPoolClientId>"}), or the "Online server" box on the sign-in screen (localStorage flavius_onlserver).
     With a config, NET.mode = 'aws'; without, the mock server.
   • Sign-in: Cognito's hosted page straight to Google (identity_provider=Google), authorization code + PKCE (no secret in
     the page). The page comes back with ?code=…; we trade it for tokens (localStorage flavius_onltok) and refresh them.
   • The socket: wss://…?ver=<ONLC.VER>&token=<id token> (dev stacks: &dev=<name>). Requests {t,id,d} → replies {re,ok,d|err};
     pushes {push,d} → NET.emit. Reconnects with back-off; a live match catches up on missed inputs.
     A 426 (other protocol version) shows the update notice instead of reconnecting.
   ===================================================================== */
const NETWS={ws:null,cfg:null,wait:{},seq:0,open:null,tries:0,closedFor:null,
  async config(){if(this.cfg)return this.cfg;let c=null;try{const t=localStorage.getItem('flavius_onlserver');if(t)c=JSON.parse(t)}catch(e){}
    if(!c&&/^https?:/.test(location.protocol)){try{const r=await fetch('online.json',{cache:'no-store'});if(r.ok)c=await r.json()}catch(e){}}
    this.cfg=c&&c.ws?c:null;return this.cfg},
  async connect(){if(this.ws&&this.ws.readyState<=1)return this.open;const c=await this.config();if(!c)throw new Error('No online server is set.');
    let q=`ver=${ONLC.VER}`;if(c.dev){q+=`&dev=${encodeURIComponent(netDevId())}`}else{const tok=await netToken();if(!tok)throw new Error('Sign in first.');q+=`&token=${encodeURIComponent(tok)}`}
    this.open=new Promise((res,rej)=>{const ws=new WebSocket(c.ws+(c.ws.includes('?')?'&':'?')+q);this.ws=ws;let opened=false;
      ws.onopen=()=>{opened=true;this.tries=0;res(ws)};
      ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(err){return}if(m.re!=null&&this.wait[m.re]){const w=this.wait[m.re];delete this.wait[m.re];clearTimeout(w.t);m.ok?w.res(m.d):w.rej(new Error(m.err||'The server said no.'))}else if(m.push)NET.emit(m.push,m.d)};
      ws.onclose=e=>{if(!opened)rej(new Error(e.code===1006?'The online arena is closed for now — offline modes are open. (It reopens on the 1st if the month’s budget ran out.)':'The server closed the door.'));for(const k of Object.keys(this.wait)){this.wait[k].rej(new Error('Connection lost.'));delete this.wait[k]}
        if(opened&&!this.closedFor){const d=Math.min(15000,800*2**this.tries++);setTimeout(()=>{this.connect().then(()=>{NET.emit('net.back',{});if(typeof onlmOn==='function'&&onlmOn())onlmCatchUp()}).catch(()=>{})},d)}};
      ws.onerror=()=>{}});
    return this.open},
  async req(t,d){await this.connect();const id=++this.seq;const body=JSON.stringify({t,id,d:d||{}});if(body.length>120000)throw new Error('That is too large to send.');
    return new Promise((res,rej)=>{this.wait[id]={res,rej,t:setTimeout(()=>{delete this.wait[id];rej(new Error('The server did not answer.'))},15000)};this.ws.send(body)})},
  close(){this.closedFor='signout';try{this.ws&&this.ws.close()}catch(e){}this.ws=null;this.open=null;setTimeout(()=>{this.closedFor=null},100)}};
function netDevId(){let v=null;try{v=sessionStorage.getItem('flavius_onldev')}catch(e){}if(!v){v='p'+Math.random().toString(36).slice(2,9);try{sessionStorage.setItem('flavius_onldev',v)}catch(e){}}return v}
/* ---------------- Google via Cognito (code + PKCE) ---------------- */
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function netRedirect(){return location.origin+location.pathname}
async function netSignIn(){const c=await NETWS.config();if(!c||!c.auth){if(typeof mToast==='function')mToast('No online server is set yet.');return}
  const ver=b64u(crypto.getRandomValues(new Uint8Array(32)));const ch=b64u(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ver)));const st=b64u(crypto.getRandomValues(new Uint8Array(12)));
  try{sessionStorage.setItem('flavius_onlpkce',JSON.stringify({ver,st}))}catch(e){}
  location.href=`${c.auth}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${encodeURIComponent(c.client)}&redirect_uri=${encodeURIComponent(netRedirect())}&scope=openid+email+profile&code_challenge=${ch}&code_challenge_method=S256&state=${st}`}
async function netTokenCall(params){const c=await NETWS.config();const r=await fetch(`${c.auth}/oauth2/token`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.client,...params})});
  if(!r.ok)throw new Error('Sign-in failed.');const j=await r.json();const old=netTokGet()||{};const tok={id:j.id_token,refresh:j.refresh_token||old.refresh,exp:Date.now()+(j.expires_in||3600)*1000-60000};try{localStorage.setItem('flavius_onltok',JSON.stringify(tok))}catch(e){}return tok}
function netTokGet(){try{return JSON.parse(localStorage.getItem('flavius_onltok')||'null')}catch(e){return null}}
async function netToken(){const t=netTokGet();if(!t)return null;if(t.exp>Date.now())return t.id;if(!t.refresh)return null;try{return (await netTokenCall({grant_type:'refresh_token',refresh_token:t.refresh})).id}catch(e){return null}}
async function netSignOut(){try{localStorage.removeItem('flavius_onltok')}catch(e){}NETWS.close();const c=await NETWS.config();if(c&&c.auth)location.href=`${c.auth}/logout?client_id=${encodeURIComponent(c.client)}&logout_uri=${encodeURIComponent(netRedirect())}`}
/* back from Google: trade the code, tidy the address, open Online */
(async()=>{const u=new URL(location.href);const code=u.searchParams.get('code');if(!code)return;let p=null;try{p=JSON.parse(sessionStorage.getItem('flavius_onlpkce')||'null')}catch(e){}
  if(!p||u.searchParams.get('state')!==p.st)return;try{await netTokenCall({grant_type:'authorization_code',code,redirect_uri:netRedirect(),code_verifier:p.ver});sessionStorage.removeItem('flavius_onlpkce')}catch(e){if(typeof mToast==='function')mToast('⚠ '+e.message)}
  history.replaceState(null,'',netRedirect());try{localStorage.setItem('flavius_online77','1')}catch(e){}setTimeout(()=>{try{if(typeof menuHide==='function')menuHide();onlineOpen('play')}catch(e){}},1500)})();
/* ---------------- choose the transport ---------------- */
async function netPick(){const c=await NETWS.config();NET.mode=c?'aws':'mock';return NET.mode}
/* idle sockets cost connection-minutes: close when the Online window shuts and no match is live (requests reopen it) */
function netIdleClose(){if(NET.mode==='aws'&&!document.getElementById('onl')&&!(S&&S.onl&&!S.over))NETWS.close()}
{const base=onlineOpen;onlineOpen=async function(){await netPick();try{return await base.apply(this,arguments)}finally{setTimeout(netIdleClose,1500)}}}
{const base=gameOver;gameOver=async function(){const r=await base.apply(this,arguments);if(S&&S.onl)setTimeout(netIdleClose,8000);return r}}
/* hello in aws mode: not signed in → no token → the sign-in screen */
{const base=onlRefresh;onlRefresh=async function(){if(NET.mode==='aws'){const c=await NETWS.config();if(!c.dev&&!(await netToken())){ONL.acct=null;ONL.mode='aws';return}}try{return await base.apply(this,arguments)}catch(e){ONL.err=e.message}}}
/* sign out / dev sign-in on the real server */
document.addEventListener('click',e=>{const b=e.target.closest('#onl [data-onl="signout"],#onl [data-onl="mocksign"],#onl [data-onl="srvset"],#onl [data-onl="srvclear"]');if(!b)return;const a=b.dataset.onl;
  if(a==='srvset'){e.stopImmediatePropagation();const t=($('#onlSrv')||{}).value||'';try{const c=JSON.parse(t);if(!c.ws)throw 0;localStorage.setItem('flavius_onlserver',JSON.stringify(c));NETWS.cfg=null;NETWS.close();if(typeof mToast==='function')mToast('🌐 Server set.');onlRefresh().then(onlRedraw)}catch(err){if(typeof mToast==='function')mToast('⚠ Paste the JSON from the deploy (ws, auth, client).')}return}
  if(a==='srvclear'){e.stopImmediatePropagation();try{localStorage.removeItem('flavius_onlserver')}catch(err){}NETWS.cfg=null;NETWS.close();netPick().then(onlRefresh).then(onlRedraw);return}
  if(NET.mode!=='aws')return;
  if(a==='signout'){e.stopImmediatePropagation();ONL.acct=null;ONL.char=null;netSignOut();onlRedraw();return}
  if(a==='mocksign'&&NETWS.cfg&&NETWS.cfg.dev){e.stopImmediatePropagation();onlDo(async()=>{ONL.acct=await NET.req('auth.signin',{name:($('#onlName')||{}).value});await onlRefresh()})}},true);
/* the sign-in card: which server, and a way to set one */
{const base=onlSignInHTML;onlSignInHTML=function(){const h=base.apply(this,arguments);const c=NETWS.cfg;const dev=c&&c.dev;
  const box=`<details class="onl-srv"><summary>Online server: ${c?esc2(c.ws.replace(/^wss:\/\//,'').split('/')[0]):'mock (preview)'}</summary><p class="rc-sub">Paste the JSON printed by the deploy (or leave empty for the mock server).</p>
    <textarea class="tin" id="onlSrv" rows="3" placeholder='{"ws":"wss://…/live","auth":"https://….amazoncognito.com","client":"…"}'>${c?esc2(JSON.stringify(c)):''}</textarea>
    <div class="acts"><button type="button" class="btn tksm" data-onl="srvset">Use this server</button>${c?'<button type="button" class="btn tksm" data-onl="srvclear">Back to the mock</button>':''}</div></details>`;
  const devBox=dev?`<div class="onl-mocknote"><b>Test server.</b> Sign in with a name.<div style="display:flex;gap:6px;margin-top:6px"><input class="tin" id="onlName" maxlength="24" placeholder="Your lanista name"><button type="button" class="btn" data-onl="mocksign">Enter</button></div></div>`:'';
  return h.replace('</div></div>',devBox+box+'</div></div>')}}
NET.on('net.back',()=>{if(document.getElementById('onl'))onlRefresh().then(onlRedraw)});
{const st=document.createElement('style');st.textContent='.onl-srv{text-align:left;font-size:13px}.onl-srv summary{cursor:pointer;color:var(--muted)}.onl-srv textarea{width:100%;font:12px var(--mono)}';document.head.appendChild(st)}
