/* =====================================================================
   73-CREDITS · v0.59
   =====================================================================
   THE CREDITS — 'D.Soto' in the main menu now opens a Credits window with two tabs: Credits (the rulebook's Contact &
   Credits page, adapted: motto banner, Virgilante's dedication, the editions this game comes from, contact links, QR,
   Mifune Media) and Prototype (the v0.58 photo gallery). The Play Now guide's "See the prototype" opens the second tab.
   Art: assets/cr_*.* (from Virgilante's credits PDF; sources in tools/art/credits/).
   ===================================================================== */
const CR_LINKS=[['🌐','Website','https://www.flaviusrule.com','www.FlaviusRule.com'],['✉️','Email','mailto:FlaviusRule@gmail.com','FlaviusRule@gmail.com'],
  ['🎲','Tabletop Simulator','https://steamcommunity.com/sharedfiles/filedetails/?id=809267424','Magnus Edition on the Steam Workshop'],
  ['📣','X','https://twitter.com/FlaviusRule','@FlaviusRule'],['▶️','YouTube','https://youtube.com/@FlaviusRule','@FlaviusRule'],
  ['📚','BoardGameGeek','https://boardgamegeek.com/boardgame/362610/flavius-rule','Flavius Rule on BGG'],['💬','Discord','https://discord.gg/KfKvmTA','discord.gg/KfKvmTA'],
  ['🎮','Steam',null,'Virgilante']];
function creditsHTML(){
  const link=([i,n,u,t])=>`<div class="crl"><span class="cri" aria-hidden="true">${i}</span><b>${esc(n)}</b>${u?`<a href="${esc(u)}" ${u.startsWith('mailto:')?'':'target="_blank" rel="noopener noreferrer"'}>${esc(t)}</a>`:`<span>${esc(t)}</span>`}</div>`;
  return `<div class="crban" style="background-image:url('${assetURL('cr_banner.jpg')}')"><span>Aut viam inveniam aut faciam</span></div>
  <p class="cred">This is a <b>digital standalone edition</b> of D.Soto's board game <i>Flavius Rule</i> — built from the original
    <b>Magnus Edition</b> on Tabletop Simulator and the <b>Print &amp; Play Edition</b> sold through Barnes &amp; Noble.</p>
  <div class="crtxt"><img class="crpor" src="${assetURL('cr_portrait.jpg')}" alt="Mosaic portrait">
  <p><i>Behold!</i> I implore you all to embark on any daring quests of creativity one can devise, embracing even the most obscure ideas, for the wisdom gained on these paths shall surpass any mere creation.
  In the year 2016, I set forth on a momentous journey that has forged the very essence of <i>Flavius Rule</i> as you now behold it. From humble beginnings, tiny sparks of inspiration ignited, propelling me into uncharted territories where new, exhilarating challenges awaited. As I now reach the culmination of this odyssey, should this game kindle even a flicker of entertainment, joy, or inspiration within a select few, I shall consider my mission triumphantly fulfilled, surpassing all initial aspirations.</p>
  <p>I extend profound gratitude to my esteemed <i>Flavius</i> community, the valiant fr-qa-team, the venerable Indie Game Lab, and the illustrious board game design communities for their invaluable contributions, their sagacious counsel, and the endless wellspring of provided inspiration.
  Furthermore, I humbly express boundless love and reverence to my father, who lent his guiding hand in designing and constructing the very first prototype of <i>Flavius Rule</i>, forever etching his legacy into this immersive realm.</p>
  <p>Finally, I pour my heartfelt appreciation to each and every one of you, noble players, for it is through your participation that the spirit of <i>Flavius Rule</i> is brought to life. May your ventures within this ancient realm resonate with valor, cunning, and a glimmer of the divine. God bless &amp; <i>Bonam fortunam!</i></p></div>
  <div class="crfoot"><div class="crlinks">${CR_LINKS.map(link).join('')}</div>
    <div class="crart"><img src="${assetURL('cr_ncflag.webp')}" alt="North Carolina flag" class="crflag"><img src="${assetURL('cr_mifune.webp')}" alt="Mifune Media" class="crmif"><img src="${assetURL('cr_qr.png')}" alt="QR code" class="crqr"></div></div>
  <div class="crlegal"><i>© 2016-2026. Mifune Media. All rights reserved.</i><br>WARNING! Small parts. Choking hazard. Not suitable for children under 3 years. Recommended for ages 13+. This product is not a toy. Actual components may vary from those shown.<br>Reprinting or publishing of the rulebook, game components, or illustrations is prohibited without prior permission.</div>`}
function protoHTML(){return `<p class="rc-sub">The hand-built board game that Flavius Rule Arena was distilled from — by D.Soto.</p>
  <div class="protogrid">${PROTO.map(([f,c],i)=>`<figure><img src="${assetURL(f)}" alt="${esc(c)}" loading="lazy" data-protoz="${i}"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>`}
function creditsOpen(tab='credits'){let o=document.getElementById('protoBox');
  if(!o){o=document.createElement('div');o.id='protoBox';o.setAttribute('role','dialog');o.setAttribute('aria-label','Credits');document.body.appendChild(o)}
  o.innerHTML=`<div class="protoin"><button type="button" class="mclose" data-protox aria-label="Close">×</button><h2>${tab==='proto'?'The prototype':'Credits'}</h2>
    <div class="seg crtabs" role="tablist"><button type="button" role="tab" data-crtab="credits" class="${tab==='credits'?'on':''}" aria-selected="${tab==='credits'}">Credits</button><button type="button" role="tab" data-crtab="proto" class="${tab==='proto'?'on':''}" aria-selected="${tab==='proto'}">Prototype</button></div>
    <div class="crbody">${tab==='proto'?protoHTML():creditsHTML()}</div></div>`;o.hidden=false}
/* the D.Soto link opens Credits; the guide's "See the prototype" opens the Prototype tab */
protoOpen=function(){const t=window.event&&window.event.target;creditsOpen(t&&t.closest&&t.closest('#mainMenu')?'credits':'proto')};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-crtab]');if(b)creditsOpen(b.dataset.crtab)});
{const f=()=>{for(const b of document.querySelectorAll('#mainMenu [data-proto]'))b.title='Credits'};f();setTimeout(f,1500)}
{const st=document.createElement('style');st.textContent=`
.crtabs{margin:6px 0 10px}.crtabs button.on{border-color:var(--gold);color:var(--gold2)}
.crban{height:clamp(70px,13vw,150px);background-size:cover;background-position:center;border:1px solid var(--gold);border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 10px}
.crban span{font:400 clamp(20px,4.4vw,46px)/1.05 var(--display);letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 0 6px #000,0 0 14px #000,0 2px 2px #000}
.cred{text-align:center;margin:12px auto 4px;max-width:760px;color:var(--bone)}
.crtxt{max-width:860px;margin:6px auto;text-align:center;font:400 15px/1.55 var(--serif,Georgia,serif);color:var(--bone)}.crtxt p{margin:8px 0}
.crpor{float:right;width:min(150px,30vw);margin:4px 0 8px 14px;border:3px solid #7a1e18;border-radius:4px}
.crfoot{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;border-top:2px solid #7a1e18;border-bottom:2px solid #7a1e18;padding:10px 4px;margin:12px 0 8px;clear:both}
.crlinks{display:grid;gap:5px;min-width:260px;flex:1}.crl{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14px}.crl b{min-width:9.5em;color:var(--gold2);font-weight:600}.cri{width:1.4em;text-align:center}
.crl a{color:var(--bone);word-break:break-all}.crl a:hover{color:#fff3c8}
.crart{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center}.crflag{width:150px}.crmif{width:96px;border-radius:6px}.crqr{width:110px;border-radius:4px}
.crlegal{text-align:center;font-size:12px;color:var(--muted);line-height:1.5}
@media (max-width:600px){.crpor{float:none;display:block;margin:6px auto}.crl b{min-width:0}}`;document.head.appendChild(st)}
