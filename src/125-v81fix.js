/* =====================================================================
   125-v81fix · v0.81 fixes after the batch (his notes while testing)
   =====================================================================
   • The arena card shown when a card is drawn or played (#cardShow, 11-extra cardShow) scales down on phones and small
     windows: landscape phones (body.phoneL), portrait phones (body.phoneP2) and any window ≤600 px wide or ≤520 px tall.
   • The ratings in the fighter panel header always show (his note: the fold toggle felt slow) — no fold button any more.
   • Online on phones: the rail is one sideways-scrolling row of tabs (no wrapping); the account box moves under it.
   ===================================================================== */
{const st=document.createElement('style');st.textContent=`
body.phoneL .cardshow,body.phoneP2 .cardshow{transform:scale(.5);transform-origin:left bottom}
@media (max-width:600px),(max-height:520px){.cardshow{transform:scale(.5);transform-origin:left bottom}}
@media (min-width:601px) and (max-width:1100px) and (min-height:521px){.cardshow{transform:scale(.75);transform-origin:left bottom}}`;document.head.appendChild(st)}
{const st=document.createElement('style');st.textContent=`@media (max-width:600px){
.onl-rail{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:4px}
.onl-rail::-webkit-scrollbar{display:none}
.onl-rail button{white-space:nowrap;flex:0 0 auto;padding:8px 10px!important;font-size:14px!important}
.onl-rail>:not(button){flex:0 0 auto;white-space:nowrap}}`;document.head.appendChild(st)}
RAT_SHUT=false;
{const st=document.createElement('style');st.textContent=`.pb-head>.statrow .ratfold{display:none!important}`;document.head.appendChild(st)}
{const base=panelStatsUp;panelStatsUp=function(){RAT_SHUT=false;return base.apply(this,arguments)}}
