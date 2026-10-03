/* =====================================================================
   125-v81fix · v0.81 fixes after the batch (his notes while testing)
   =====================================================================
   • The arena card shown when a card is drawn or played (#cardShow, 11-extra cardShow) scales down on phones and small
     windows: landscape phones (body.phoneL), portrait phones (body.phoneP2) and any window ≤600 px wide or ≤520 px tall.
   ===================================================================== */
{const st=document.createElement('style');st.textContent=`
body.phoneL .cardshow,body.phoneP2 .cardshow{transform:scale(.5);transform-origin:left bottom}
@media (max-width:600px),(max-height:520px){.cardshow{transform:scale(.5);transform-origin:left bottom}}
@media (min-width:601px) and (max-width:1100px) and (min-height:521px){.cardshow{transform:scale(.75);transform-origin:left bottom}}`;document.head.appendChild(st)}
