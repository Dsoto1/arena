/* 255-v98fix2 — v0.98 fixes, round 2. Display only.
   1 · THE LEAGUE BANNER PODIUM, COMPACT: the banner is back near the other Manager banners (140 px; was 198) — small steps (18/12/8 px), a 40 px cup over 1st,
       a one-line name + "pts · W-L" plate on each step; the title keeps the left, the podium sits bottom-centre. Phones: 168 px, podium under the title.
   2 · Ludus is OFF online again (his pick C): 111-onlcore EVENTS_CUSTOM98 = Golden Eagle only, a room asking for Ludus is refused ("not played online yet");
       252's host-drafts-for-remotes wrapper is gone. Backlog: a real per-lanista draft over the network.
   3 · Drafted gear never leaves the arena: checked (Manager: 225's draft tags → arm94Settle; online: gearAfter only touches brought gear) — test tv98f.
   4 · The "empty gold box" on the online Domus picture was the mToast of the drag-wear step caught mid-fade by the test's screenshot (tv98o now waits it out);
       the Domus itself has no such element. */
/* the scene art of the League banner draws its own podium blocks + laurel; the live podium replaces them (no double podium) */
{const base=banner73;banner73=function(k){const h=base.apply(this,arguments);if(k!=='league'||typeof h!=='string'||h.indexOf('lp98wrap')<0)return h;
  return h.replace(/<rect x="\d+" y="\d+" width="100" height="\d+" fill="#(?:c9a458|9aa3ab|b07a4a)"\/>/g,'').replace(/<g transform="translate\(300 34\)">.*?<\/g>/,'')}}
(function(){const st=document.createElement('style');st.textContent=`
.b73-league{height:140px}.b73-league .roomttl{top:10px}
.lp98wrap .lp96pod{gap:5px;width:min(400px,38%)}
.lp98wrap .lp96p{width:32%}
.lp98wrap .lp96cup{width:40px;height:40px;margin-bottom:-2px}.lp98wrap .lp96cup svg{width:40px;height:40px}
.lp98wrap .lp96ban{padding:3px 4px 7px;display:grid;justify-items:center;line-height:1.15}.lp98wrap .lp96ban b{font-size:12px}.lp98wrap .lp96ban small{font-size:10.5px}
.lp98wrap .lp96fl{display:none}
.lp98wrap .lp96step{margin-top:-5px;font-size:11px;padding-top:0}.lp98wrap .lp96p.p1 .lp96step{height:18px}.lp98wrap .lp96p.p2 .lp96step{height:12px}.lp98wrap .lp96p.p3 .lp96step{height:8px}
.lp98wrap .lp96step span{display:none}
@media (max-width:760px){.b73-league{height:168px}.lp98wrap .lp96pod{width:96%;gap:3px}.lp98wrap .lp96ban b{font-size:10.5px}.lp98wrap .lp96ban small{font-size:9px}.lp98wrap .lp96cup,.lp98wrap .lp96cup svg{width:34px;height:34px}}
`;document.head.appendChild(st)})();
