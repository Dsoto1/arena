/* v0.97 (242-v96bt) · Match Week bout tracker layout: the crossed-sword mark (145 bt85X) sat on top of the day + bout labels.
   Each chip is now a two-column grid: mark (26 px) at the left, then FRI / Undercard / result lines at the right. Chips not yet
   fought have no mark and keep one column. Phones (<=600 px): compact, mark 18 px, day + result only (the bout name stays in the tooltip). */
{const st=document.createElement('style');st.textContent=`
.roomstat.bt85w .bt85{display:grid!important;grid-template-columns:1fr;column-gap:6px;align-items:center;justify-items:start;text-align:left;min-width:92px;padding:4px 10px 4px 8px;overflow:visible}
.roomstat.bt85w .bt85.done{grid-template-columns:26px auto}
.roomstat.bt85w .bt85>span,.roomstat.bt85w .bt85>b{grid-column:1;position:static;white-space:nowrap}
.roomstat.bt85w .bt85.done>span,.roomstat.bt85w .bt85.done>b{grid-column:2}
.roomstat.bt85w .bt85 svg.bt85x{position:static!important;grid-column:1;grid-row:1/span 3;left:auto!important;top:auto!important;width:26px!important;height:26px!important;transform:none!important;align-self:center}
.roomstat.bt85w .bt85 .bt85m{min-height:0}
.roomstat.bt85w .bt85 .bt85m:empty{display:none}
@media (max-width:600px){
.roomstat.bt85w .bt85{min-width:0;padding:3px 6px}
.roomstat.bt85w .bt85.done{grid-template-columns:18px auto}
.roomstat.bt85w .bt85 svg.bt85x{width:18px!important;height:18px!important}
.roomstat.bt85w .bt85>b{display:none}
}`;document.head.appendChild(st)}
