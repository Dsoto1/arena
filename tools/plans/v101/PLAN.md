# v1.01 — his notes (2026-10-13 PDF, text in notes-his.txt) + online kits + security pass + Foundations

His answers 2026-10-14: 1a 2a 3a 4a 5a 6a 7a 8a 9a 10a; pulled in M24 M21 M39 M43 G6 G10 G12 G13 G14 G22; ONE release (b), go.

## Answers (letters)
1a Stable tab removed (Roster covers it) · 2a Season = a button on the League banner, Season tab gone · 3a the six advisors are
"The Council", the Consilium sits in the centre as its head, his counsel lives in his popover · 4a Promote = small popup; Ledger in the
Clerk's popover · 5a INFIRMARY: Medicus hours back (4 + 3/Valetudinarium level + 2/house medicus level a week), treatments cost hours +
half today's coin; banner = hurt · beds · hours left · coin, medicus hire + Hygeia folded in; rub-down / care routine / rest move to the
Training Yard as recovery; "Cleared for the sand" goes; a suggested treatment order per patient; Take Out in the list; care tiles distinct
art, one row; fit list open by default · 6a recruiting hours scale with roster size (~24 h at ≤3 fighters, 16 at 4–6, 10 at 7–9, 6 at 10+,
+ Recruiter level) · 7a one desk row per advisor, unfolding into lines each with its own button · 8a Tituli: drop CF in Manager (coin +
fame stay) · 9a full special on the day: bump a free-agent FILLER (never a rival house) for the entry fee · 10a measure + fix the zoom
hitch, keep zoom online.

## Workstreams (wave 1 = parallel agents, each its own module + test; wave 2 = Foundations on the merged tree)
- A  Manager UI (317-v101mgrui, tv101a): M1 M2 M3 M4 M5 M6 M7 M8 M9 M10 M11 M12 M16 M20 M22 M25 M33 M34 M36 M38 M43 M44 M45
- B1 Infirmary loop (318-v101ward, tv101b): M14 M15 M18 M26 M30 M31 (+ the yard's new Recovery block)
- B2 Manager rules (319-v101rules, tv101c): M13 M17 M19 M23 M24 M27 M28 M29 M32 M35 M37 M40 M41 M42
- C  Windows + city (320-v101win, tv101d): M21 (gladiator / rival-team correspondence windows + Keeping him, rooms look) M39 (3D lanista +
     townsfolk in the city, door-sized)
- D  Board + general (321-v101board, tv101e): G1 G2 G3 G4 G5 G8 G9 G14 G15 G16 G17 G18 G19 G20 G21 G22
- E  3D renders (anim100 tools + 311/312, tv100an/tv101f): G6 G10 G12 G13
- F  Online (322-v101onl + 111-onlcore "v1.01" + routes.js, server tests): online kits follow the v1.0 Damnatio/Amazonia loadouts; security
     pass report (tools/plans/v101/SECURITY.md) + fix the high-severity findings
- Wave 2 FOUNDATIONS (tools/plans/layers100/PLAN.md): replay tests → regroup src by topic → clean layers A–C → card/beast effects as data →
     rules in Node → server Ranked check (mismatches logged only the first month) → Manager morph rendering.
