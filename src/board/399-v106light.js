/* =====================================================================
   399-v106light — v1.06a LIGHT + SHADOWS (his lighting brief 2026-10-17, answers v1a–v6a, his ok on the mock-up 2026-10-18;
   tools/plans/v106/NOTES.md, MOCKUP.md, BASELINE.md). DISPLAY ONLY: never S, rand(), the log, a save or the online hash; nothing here
   animates by itself (every shadow follows the pieces' own draw state). Kill switch localStorage flavius_light106off=1 = Off.
   • ONE SUN (v1a) — LIGHT106_SUN (az° = the shadows' ground direction from screen-right toward the viewer, el = elevation): upper left
     of the board, shadows fall lower right. The figure + beast sheets are BAKED with it (V2a): tools/art/anim100/make.js l106 (the 8
     printed classes, move + act + the 32 severed sets → assets/anim100_* re-lit in place) and tools/art/anim100b/make.js l106 (311's /
     312's beasts → assets/beast100_* re-lit): key = the sun, a cool fill, a thin warm rim, the base kept out of the key (LIGHT106_BAKE
     baseK: its top stays at today's tone, so 321's bases-off flood still finds it). Studio / Online tokens rendered on the device
     (311 ANIM100_LIB) get the same light + shadow at render time (VER 5; a device without a second WebGL context: today's render).
   • SETTINGS → Board & pieces → Lighting: Full / Light / Off (SETTINGS.light106). Default Full on desktop, Light on phones (≤ 700 px or a
     coarse pointer). Light = contact shadows only; Off = the old flat discs (no pass at all). Full drops to Light by itself when real
     frames run over 16 ms for a sustained period (rAF frame intervals — 288's frame meter when it is shown, else the same measure
     taken after board draws; never JS draw time): one small toast, remembered (flavius_light106drop) until he picks Full again.
     Reduce motion / Animations Off do not change static shadows (the poses already hold still there). localStorage flavius_light106
     = full|light|off overrides the setting (bench, tests); flavius_light106auto=0 = never auto-drop (headless browsers: never, unless =1).
   • THE PASS rides at the end of the 'decals' layer (219's list; under the move/attack highlights, the hover ring, the rings and every
     figure — a shadow never covers a tactical mark, and UI is never inside it):
       1 STATIC LAYER (cached canvas): pillars (+ their Blessing jugs) and the chest cast a solid-of-revolution shadow (height profile
         LIGHT106.pillar/.chest, blurred once per 3% size step) and rubble stones small soft ones — merged at full strength, then laid
         down once at LIGHT106.<day|night>.cast (no double darkening where they overlap) — plus their contact shadows. Rebuilt ONLY when
         its key changes: mode, night, the board's 3% size step (zoom), its orientation, pillars / jugs / chest / rubble (a topple, a
         break, a push). Kept in tile units against tile A-1, so a panning camera just moves it. A pillar being shoved is left out and
         drawn live at its shove offset (its shadow moves with it).
       2 FIGURES + BEASTS (Full): each one's BAKED shadow cell for the pose it is drawn in THIS frame (an100Pose / bst100Pose, the same
         facing, glide and shove offsets) straight onto the board at .cast (half-resolution sheets anim106_*_sh.webp; phones the half of
         that, anim106p_*). No runtime silhouette: a figure with no baked/device shadow yet (a device render pending, the standalone
         file) gets the contact shadow only.
       3 CONTACT (Full + Light): a compact dark band at the base edge fading out + a softer layer leaning down-sun (one cached sprite),
         replacing the flat discs (fl104Sh records the base's size; the position is fresh every frame).
     Readability: cast shadows are lifted LIGHT106.hlLift (85 %) off highlighted tiles (a clip, no extra buffer), so a move tile in a
     pillar's shadow keeps today's contrast (within 0.01).
   • NIGHT: the same direction, about half as strong (moonlight); torch light / shadows are v1.06b.
   STATS: L106.st = {ms, n, tStatic, tFig, tCont, builds, figs, contacts}; L106.last = the last pass (tests, bench tools/bench/board.js).
   Test tv106l.
   ===================================================================== */
/* LIGHT106_SUN */const LIGHT106_SUN={"az":30,"el":55};
/* LIGHT106_BAKE */const LIGHT106_BAKE={"key":0.78,"fill":0.32,"rim":0.42,"amb":0.30,"fillDir":[0.45,0.25,1],"rimDir":[0.75,0.55,-0.8],"baseK":0.7};
const LIGHT106={sun:LIGHT106_SUN,
  day:{cast:0.34,contact:0.5,soft:0.16},night:{cast:0.16,contact:0.46,soft:0.12}, /* TWEAK: shadow strengths (0–1) */
  blur:0.035,          /* TWEAK: cast-shadow penumbra, tiles */
  contactR:1.08,       /* TWEAK: the contact band's outer radius against the old disc's radius */
  pillar:[[0,0.1,0.26],[0.1,0.95,0.17],[0.95,1.05,0.24],[1.05,1.14,0.1],[1.14,1.36,0.17],[1.36,1.5,0.08]], /* [h0,h1,radius] tiles */
  chest:[[0,0.2,0.24],[0.2,0.31,0.18]],
  hlLift:0.85,         /* TWEAK: how much of a cast shadow is lifted off a highlighted tile (0 = none, 1 = all; the mock-up's 0.75 left a move tile in a pillar's shadow 0.011 under today's contrast) */
  auto:{slowMs:17.5,share:0.6,min:60,winMs:5000,warm:240}}; /* TWEAK: Full → Light when ≥ share of the frames in the last winMs (≥ min frames) run over slowMs */
/* L106_META:BEGIN (generated by tools/art/anim100/make.js l106) */
const L106_META={
"amazonia":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,22,8,5.1]],"walk":[[24,46,22,8,6.1],[48,44,20,7,5.1],[70,44,20,6,5.1],[92,44,20,6,5.1],[114,44,22,8,6.1],[138,44,20,7,5.1],[160,44,20,6,5.1],[182,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,46,20,10,6.1],[22,46,20,10,6.1],[44,52,24,12,7.1],[70,62,34,13,11.1],[106,46,20,8,5.1]],"slash":[[128,52,24,9,6.1],[154,48,22,9,6.1],[178,58,28,12,8.1],[208,50,24,12,8.1]],"sweep":[[234,48,22,9,6.1],[258,46,22,10,7.1],[282,48,24,10,7.1],[308,46,22,10,7.1]],"thrust":[[332,44,22,10,7.1],[356,56,26,12,7.1],[384,62,34,13,11.1],[420,50,24,11,7.1]],"throw":[[446,56,26,11,7.1],[474,56,26,12,8.1],[502,60,28,12,8.1],[532,52,24,13,8.1]],"block":[[558,46,20,8,5.1],[580,44,20,10,6.1],[602,48,22,12,7.1]],"hit":[[626,46,20,7,5.1],[648,42,18,7,5.1],[668,42,20,8,5.1]],"push":[[690,46,20,9,6.1],[712,50,24,10,7.1],[738,52,24,11,7.1],[764,64,30,13,8.1]],"topple":[[796,46,20,10,6.1],[818,50,22,12,7.1],[842,62,28,11,7.1],[872,56,28,14,9.1]],"knock":[[902,42,20,9,6.1],[924,52,24,10,7.1],[950,48,24,10,7.1]],"fall":[[976,48,22,7,5.1],[1000,42,20,12,8.1],[1022,46,22,12,8.1],[1046,62,34,23,14.1],[1082,56,30,24,13.1]],"sever":[[1114,46,20,7,5.1],[1136,42,18,7,5.1],[1156,46,20,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,42,20,8,6.1],[42,40,18,6,5.1],[62,42,20,8,6.1],[84,40,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,20,12,7.1]],"hit":[[22,46,20,7,5.1]],"fall":[[44,46,22,12,8.1],[68,54,30,23,13.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,22,8,5.1]],"walk":[[24,46,22,8,6.1],[48,44,20,6,5.1],[70,44,22,8,6.1],[94,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,24,12,7.1]],"hit":[[26,46,20,7,5.1]],"fall":[[48,46,22,12,8.1],[72,56,30,24,13.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,20,5,4.1]],"walk":[[22,44,20,5,4.1],[44,44,20,5,4.1],[66,44,20,4,4.1],[88,44,20,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,7,5.1]],"hit":[[24,44,20,5,4.1]],"fall":[[46,42,22,8,7.1],[70,56,30,24,13.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,20,5,4.1]],"walk":[[22,42,18,5,4.1],[42,40,18,5,4.1],[62,40,18,4,4.1],[82,40,18,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,44,20,4,4.1]],"hit":[[22,42,20,4,4.1]],"fall":[[44,40,20,6,6.1],[66,56,30,24,13.1]]}}}}},
"damnatio":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,42,20,8,6.1],[42,42,18,7,5.1],[62,42,18,6,5.1],[82,42,18,6,5.1],[102,44,20,8,6.1],[124,42,18,7,5.1],[144,42,18,6,5.1],[164,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,44,20,10,6.1],[22,48,22,10,6.1],[46,52,24,12,7.1],[72,52,24,13,8.1],[98,42,18,8,5.1]],"slash":[[118,46,20,9,6.1],[140,48,22,9,6.1],[164,50,24,12,8.1],[190,52,24,12,8.1]],"sweep":[[216,46,22,9,6.1],[240,48,22,10,7.1],[264,50,24,10,7.1],[290,46,22,10,7.1]],"thrust":[[314,44,22,10,7.1],[338,46,22,12,7.1],[362,52,24,13,8.1],[388,46,20,11,7.1]],"throw":[[410,56,24,11,7.1],[436,50,22,12,8.1],[460,56,26,12,8.1],[488,52,24,13,8.1]],"block":[[514,42,18,8,5.1],[534,46,20,10,6.1],[556,48,22,12,7.1]],"hit":[[580,46,20,7,5.1],[602,42,20,7,5.1],[624,44,18,8,5.1]],"push":[[644,42,20,9,6.1],[666,48,24,10,7.1],[692,50,24,11,7.1],[718,56,28,13,8.1]],"topple":[[748,46,20,10,6.1],[770,52,24,12,7.1],[796,56,24,11,7.1],[822,56,26,14,9.1]],"knock":[[850,42,20,9,6.1],[872,50,22,10,7.1],[896,48,22,10,7.1]],"fall":[[920,48,22,7,5.1],[944,42,20,12,8.1],[966,46,22,12,8.1],[990,64,34,23,14.1],[1026,54,30,23,13.1]],"sever":[[1058,46,20,7,5.1],[1080,42,18,7,5.1],[1100,46,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,42,20,8,6.1],[42,42,18,6,5.1],[62,44,20,8,6.1],[84,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,12,7.1]],"hit":[[24,46,20,7,5.1]],"fall":[[46,46,22,12,8.1],[70,54,30,23,13.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,42,20,8,6.1],[42,42,18,6,5.1],[62,44,20,8,6.1],[84,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,24,12,7.1]],"hit":[[26,46,20,7,5.1]],"fall":[[48,46,22,12,8.1],[72,54,30,23,13.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,40,18,5,4.1]],"walk":[[20,42,18,5,4.1],[40,42,18,5,4.1],[60,40,18,4,4.1],[80,42,18,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,46,22,7,5.1]],"hit":[[24,44,20,5,4.1]],"fall":[[46,40,20,7,6.1],[68,54,30,23,13.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,40,18,5,4.1]],"walk":[[20,42,18,5,4.1],[40,42,18,5,4.1],[60,40,18,4,4.1],[80,42,18,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,44,20,4,4.1]],"hit":[[22,42,20,4,4.1]],"fall":[[44,38,20,5,6.1],[66,54,30,23,13.1]]}}}}},
"hero":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,22,8,6.1]],"walk":[[24,46,22,8,6.1],[48,46,22,7,6.1],[72,44,22,6,6.1],[96,44,22,6,6.1],[120,46,22,8,6.1],[144,46,22,7,6.1],[168,44,22,6,6.1],[192,44,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,50,24,10,6.1],[26,48,22,10,6.1],[50,56,24,12,7.1],[76,56,30,13,10.1],[108,46,22,8,6.1]],"slash":[[132,54,22,9,6.1],[156,54,24,9,6.1],[182,60,32,12,10.1],[216,56,26,12,8.1]],"sweep":[[244,50,24,9,6.1],[270,48,24,10,7.1],[296,50,24,10,7.1],[322,50,22,10,7.1]],"thrust":[[346,48,24,10,7.1],[372,56,26,12,7.1],[400,56,32,13,11.1],[434,50,24,11,7.1]],"throw":[[460,62,28,11,7.1],[490,56,26,12,8.1],[518,64,30,12,8.1],[550,56,26,13,8.1]],"block":[[578,46,20,8,5.1],[600,50,22,10,6.1],[624,52,24,12,7.1]],"hit":[[650,50,24,7,6.1],[676,46,20,7,6.1],[698,48,20,8,5.1]],"push":[[720,50,24,9,6.1],[746,58,28,10,7.1],[776,60,28,11,7.1],[806,66,34,13,10.1]],"topple":[[842,50,22,10,6.1],[866,56,24,12,7.1],[892,66,30,11,7.1],[924,66,30,14,9.1]],"knock":[[956,46,24,9,7.1],[982,56,26,10,7.1],[1010,58,26,10,7.1]],"fall":[[1038,52,24,7,5.1],[1064,46,22,12,8.1],[1088,48,24,12,8.1],[1114,68,36,27,16.1],[1152,66,34,31,16.1]],"sever":[[1188,50,24,7,6.1],[1214,48,22,7,5.1],[1238,50,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,20,8,5.1]],"walk":[[22,46,22,8,6.1],[46,44,22,6,6.1],[70,46,22,8,6.1],[94,44,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,22,12,7.1]],"hit":[[24,50,24,7,6.1]],"fall":[[50,48,24,12,8.1],[76,66,34,31,16.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,22,8,6.1]],"walk":[[24,46,22,8,6.1],[48,44,20,6,5.1],[70,46,22,8,6.1],[94,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,56,24,12,7.1]],"hit":[[26,50,22,7,5.1]],"fall":[[50,48,24,12,8.1],[76,62,32,27,15.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,22,5,7.1]],"walk":[[24,46,22,5,6.1],[48,44,22,5,6.1],[72,44,22,4,5.1],[96,46,22,5,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,24,7,5.1]],"hit":[[26,48,22,5,5.1]],"fall":[[50,48,24,11,8.1],[76,66,34,31,16.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,22,5,6.1]],"walk":[[24,46,22,5,5.1],[48,44,20,5,5.1],[70,44,20,4,5.1],[92,46,20,5,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,46,22,4,5.1]],"hit":[[24,46,24,4,6.1]],"fall":[[50,48,24,12,8.1],[76,66,34,31,16.1]]}}}}},
"royalty":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,20,8,5.1]],"walk":[[22,46,20,8,6.1],[44,46,20,7,5.1],[66,44,20,6,5.1],[88,44,20,6,5.1],[110,46,20,8,6.1],[132,46,20,7,5.1],[154,44,20,6,5.1],[176,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,46,22,10,6.1],[24,50,22,10,6.1],[48,54,26,12,7.1],[76,54,24,13,8.1],[102,46,20,8,5.1]],"slash":[[124,50,22,9,6.1],[148,50,22,9,6.1],[172,54,26,12,8.1],[200,54,26,12,8.1]],"sweep":[[228,50,24,9,6.1],[254,48,24,10,7.1],[280,50,24,10,7.1],[306,48,24,10,7.1]],"thrust":[[332,46,22,10,7.1],[356,50,22,12,7.1],[380,54,24,13,8.1],[406,50,22,11,7.1]],"throw":[[430,56,26,11,7.1],[458,54,24,12,8.1],[484,56,26,12,8.1],[512,56,26,13,8.1]],"block":[[540,46,20,8,5.1],[562,48,22,10,6.1],[586,52,22,12,7.1]],"hit":[[610,50,22,7,5.1],[634,46,20,7,5.1],[656,46,20,8,5.1]],"push":[[678,46,20,9,6.1],[700,50,24,10,7.1],[726,54,26,11,7.1],[754,56,28,13,8.1]],"topple":[[784,50,22,10,6.1],[808,56,24,12,7.1],[834,56,26,11,7.1],[862,58,28,14,9.1]],"knock":[[892,46,20,9,6.1],[914,52,24,10,7.1],[940,50,22,10,7.1]],"fall":[[964,50,24,7,5.1],[990,46,22,12,8.1],[1014,46,24,12,8.1],[1040,66,34,25,15.1],[1076,60,32,26,15.1]],"sever":[[1110,50,22,7,5.1],[1134,44,20,7,5.1],[1156,50,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,20,8,5.1]],"walk":[[22,46,20,8,6.1],[44,44,20,6,5.1],[66,46,20,8,6.1],[88,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,50,22,12,7.1]],"hit":[[24,50,22,7,5.1]],"fall":[[48,46,24,12,8.1],[74,60,32,26,15.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,46,20,8,5.1]],"walk":[[22,46,20,8,6.1],[44,44,20,6,5.1],[66,46,20,8,6.1],[88,44,20,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,54,26,12,7.1]],"hit":[[28,50,22,7,5.1]],"fall":[[52,46,24,12,8.1],[78,60,32,26,15.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,20,5,4.1]],"walk":[[22,46,20,5,4.1],[44,46,20,5,4.1],[66,44,20,4,4.1],[88,46,20,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,50,24,7,5.1]],"hit":[[26,48,20,5,4.1]],"fall":[[48,42,22,7,7.1],[72,60,32,26,15.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,20,5,4.1]],"walk":[[22,46,20,5,4.1],[44,46,20,5,4.1],[66,44,20,4,4.1],[88,44,20,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,46,24,4,5.1]],"hit":[[26,46,22,4,4.1]],"fall":[[50,42,24,7,8.1],[76,60,32,26,15.1]]}}}}},
"slave":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,58,26,9,7.1]],"walk":[[28,56,26,9,7.1],[56,54,24,9,7.1],[82,54,26,8,7.1],[110,52,24,8,7.1],[136,54,24,8,7.1],[162,54,24,8,7.1],[188,54,24,8,7.1],[214,54,26,8,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,58,28,10,8.1],[30,62,28,10,8.1],[60,66,34,12,10.1],[96,82,44,21,16.1],[142,56,26,9,7.1]],"slash":[[170,64,30,10,9.1],[202,62,28,11,9.1],[232,70,34,14,11.1],[268,62,32,15,12.1]],"sweep":[[302,64,32,11,10.1],[336,58,32,13,11.1],[370,62,32,16,12.1],[404,56,26,11,9.1]],"thrust":[[432,56,28,10,8.1],[462,66,32,12,9.1],[496,82,44,20,16.1],[542,64,30,11,8.1]],"throw":[[574,66,32,11,9.1],[608,68,30,12,8.1],[640,68,34,12,10.1],[676,60,28,13,9.1]],"block":[[706,56,26,8,7.1],[734,56,24,10,6.1],[760,56,30,14,11.1]],"hit":[[792,58,28,13,9.1],[822,56,28,13,9.1],[852,58,28,9,7.1]],"push":[[882,58,28,10,9.1],[912,64,34,14,11.1],[948,66,36,16,13.1],[986,76,40,19,14.1]],"topple":[[1028,54,22,10,6.1],[1052,60,28,12,9.1],[1082,72,34,11,9.1],[1118,70,36,14,12.1]],"knock":[[1156,60,32,15,11.1],[1190,66,30,10,8.1],[1222,60,28,10,8.1]],"fall":[[1252,56,30,10,10.1],[1284,58,28,15,9.1],[1314,58,28,14,9.1],[1344,78,40,25,16.1],[1386,76,38,33,18.1]],"sever":[[1426,58,28,13,9.1],[1456,54,28,9,9.1],[1486,46,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,22,8,7.1]],"walk":[[24,42,22,8,7.1],[48,44,22,8,7.1],[72,44,22,8,7.1],[96,44,22,8,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,12,7.1]],"hit":[[24,46,22,8,7.1]],"fall":[[48,46,24,13,9.1],[74,70,38,33,18.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,58,26,9,7.1]],"walk":[[28,56,26,9,7.1],[56,54,26,8,7.1],[84,54,24,8,6.1],[110,54,24,7,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,66,34,12,10.1]],"hit":[[36,58,28,13,9.1]],"fall":[[66,58,28,14,8.1],[96,66,34,23,14.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,60,28,8,7.1]],"walk":[[30,56,26,8,7.1],[58,58,26,8,7.1],[86,56,26,8,7.1],[114,56,26,8,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,60,34,7,10.1]],"hit":[[36,58,28,12,9.1]],"fall":[[66,62,30,16,9.1],[98,76,38,33,18.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,54,24,8,7.1]],"walk":[[26,46,22,7,7.1],[50,46,22,7,7.1],[74,48,22,7,7.1],[98,46,22,7,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,62,34,8,10.1]],"hit":[[36,58,26,13,9.1]],"fall":[[64,56,26,14,9.1],[92,76,38,33,18.1]]}}}}},
"soldier":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,24,8,7.1]],"walk":[[26,46,22,8,6.1],[50,44,22,7,6.1],[74,42,22,6,6.1],[98,42,22,6,6.1],[122,44,22,8,6.1],[146,44,20,7,5.1],[168,42,22,6,6.1],[192,42,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,22,10,6.1],[24,48,22,10,6.1],[48,58,26,12,7.1],[76,58,32,14,11.1],[110,44,22,8,6.1]],"slash":[[134,54,22,9,6.1],[158,54,24,9,6.1],[184,60,32,12,11.1],[218,54,26,12,8.1]],"sweep":[[246,50,22,9,6.1],[270,46,22,10,7.1],[294,48,24,10,7.1],[320,48,22,10,7.1]],"thrust":[[344,44,22,10,7.1],[368,58,28,12,8.1],[398,56,32,13,11.1],[432,50,26,11,8.1]],"throw":[[460,64,28,11,7.1],[490,56,24,12,8.1],[516,66,30,12,8.1],[548,54,26,13,8.1]],"block":[[576,44,22,8,6.1],[600,48,22,10,6.1],[624,50,22,12,7.1]],"hit":[[648,48,22,7,5.1],[672,44,20,7,5.1],[694,46,20,8,6.1]],"push":[[716,52,24,9,6.1],[742,58,28,10,7.1],[772,58,26,11,7.1],[800,70,36,13,11.1]],"topple":[[838,48,22,10,6.1],[862,54,26,12,7.1],[890,68,30,11,7.1],[922,64,30,14,9.1]],"knock":[[954,46,22,10,8.1],[978,58,26,10,7.1],[1006,60,28,10,7.1]],"fall":[[1036,50,22,7,5.1],[1060,44,20,12,8.1],[1082,48,24,12,8.1],[1108,66,34,25,15.1],[1144,60,32,27,15.1]],"sever":[[1178,48,22,7,5.1],[1202,42,18,7,5.1],[1222,48,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,18,8,5.1]],"walk":[[20,44,20,8,6.1],[42,42,18,6,5.1],[62,44,20,8,6.1],[84,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,50,22,12,7.1]],"hit":[[24,48,22,7,5.1]],"fall":[[48,48,24,12,8.1],[74,56,32,23,14.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,24,8,7.1]],"walk":[[26,46,22,8,6.1],[50,42,22,6,6.1],[74,44,22,8,6.1],[98,42,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,58,26,12,7.1]],"hit":[[28,48,22,7,5.1]],"fall":[[52,48,24,12,8.1],[78,60,32,27,15.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,24,7,8.1]],"walk":[[26,44,24,5,7.1],[52,42,24,5,7.1],[78,44,24,4,6.1],[104,42,22,5,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,54,24,7,5.1]],"hit":[[26,46,22,5,6.1]],"fall":[[50,46,24,11,8.1],[76,60,32,27,15.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,22,5,6.1]],"walk":[[24,44,20,5,4.1],[46,44,20,5,4.1],[68,44,20,4,4.1],[90,42,20,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,4,4.1]],"hit":[[24,46,20,4,4.1]],"fall":[[46,46,24,10,8.1],[72,60,32,27,15.1]]}}}}},
"venatore":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,54,26,9,7.1]],"walk":[[28,54,24,10,7.1],[54,52,24,10,7.1],[80,50,24,9,7.1],[106,50,22,8,6.1],[130,52,22,8,6.1],[154,52,22,8,6.1],[178,52,22,9,6.1],[202,54,24,9,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,58,30,10,9.1],[32,62,28,10,7.1],[62,66,36,12,11.1],[100,78,42,19,15.1],[144,56,24,10,7.1]],"slash":[[170,64,28,9,7.1],[200,60,26,9,6.1],[228,70,34,16,11.1],[264,60,32,15,11.1]],"sweep":[[298,64,32,9,8.1],[332,60,32,14,11.1],[366,60,32,17,12.1],[400,56,26,12,9.1]],"thrust":[[428,56,26,10,8.1],[456,66,32,12,10.1],[490,80,42,19,15.1],[534,62,30,11,8.1]],"throw":[[566,64,34,11,10.1],[602,68,30,12,8.1],[634,68,34,12,10.1],[670,60,28,14,9.1]],"block":[[700,54,24,9,7.1],[726,56,24,10,6.1],[752,52,22,12,7.1]],"hit":[[776,56,28,15,10.1],[806,58,26,14,9.1],[834,56,26,9,7.1]],"push":[[862,58,28,11,9.1],[892,60,34,15,12.1],[928,70,38,18,14.1],[968,72,36,17,13.1]],"topple":[[1006,52,22,10,6.1],[1030,60,28,13,10.1],[1060,66,34,11,9.1],[1096,68,36,14,12.1]],"knock":[[1134,60,30,16,11.1],[1166,66,30,10,7.1],[1198,62,26,10,7.1]],"fall":[[1226,58,32,12,10.1],[1260,58,28,15,10.1],[1290,56,26,14,8.1],[1318,74,38,23,15.1],[1358,66,34,23,14.1]],"sever":[[1394,56,28,15,10.1],[1424,42,18,7,5.1],[1444,48,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,44,20,8,6.1],[42,42,18,6,5.1],[62,44,20,8,6.1],[84,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,12,7.1]],"hit":[[24,48,20,7,5.1]],"fall":[[46,46,24,12,8.1],[72,54,30,23,13.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,54,26,9,7.1]],"walk":[[28,54,24,10,7.1],[54,50,24,9,7.1],[80,52,22,8,6.1],[104,52,22,9,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,66,36,12,11.1]],"hit":[[38,56,28,15,10.1]],"fall":[[68,56,26,14,8.1],[96,66,34,23,14.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,56,28,9,7.1]],"walk":[[30,52,26,9,7.1],[58,52,26,9,7.1],[86,56,24,9,7.1],[112,56,24,9,7.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,62,34,8,10.1]],"hit":[[36,58,30,13,10.1]],"fall":[[68,62,30,17,10.1],[100,66,34,23,14.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,50,24,9,7.1]],"walk":[[26,46,20,7,6.1],[48,44,20,7,6.1],[70,46,20,7,6.1],[92,44,20,7,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,64,36,9,11.1]],"hit":[[38,56,28,13,10.1]],"fall":[[68,52,24,12,7.1],[94,66,34,23,14.1]]}}}}},
"veteranus":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,24,8,7.1]],"walk":[[26,46,22,8,6.1],[50,44,22,7,6.1],[74,42,22,6,6.1],[98,42,22,6,6.1],[122,44,22,8,6.1],[146,42,20,7,5.1],[168,42,22,6,6.1],[192,42,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,52,22,10,6.1],[24,48,22,10,6.1],[48,58,26,12,7.1],[76,58,32,14,11.1],[110,44,22,8,6.1]],"slash":[[134,54,22,9,6.1],[158,54,24,9,6.1],[184,60,32,12,11.1],[218,52,24,12,8.1]],"sweep":[[244,50,22,9,6.1],[268,46,22,10,7.1],[292,48,24,10,7.1],[318,46,22,10,7.1]],"thrust":[[342,44,22,10,7.1],[366,58,28,12,8.1],[396,56,32,13,11.1],[430,50,26,11,8.1]],"throw":[[458,64,28,11,7.1],[488,56,24,12,8.1],[514,66,30,12,8.1],[546,52,24,13,8.1]],"block":[[572,44,22,8,6.1],[596,46,22,10,6.1],[620,48,22,12,7.1]],"hit":[[644,46,20,7,5.1],[666,44,20,7,5.1],[688,44,20,8,6.1]],"push":[[710,52,24,9,6.1],[736,58,28,10,7.1],[766,58,26,11,7.1],[794,70,36,13,11.1]],"topple":[[832,46,20,10,6.1],[854,54,26,12,7.1],[882,66,30,11,7.1],[914,64,30,14,9.1]],"knock":[[946,44,22,10,8.1],[970,58,26,10,7.1],[998,60,28,10,7.1]],"fall":[[1028,48,22,7,5.1],[1052,42,20,12,8.1],[1074,46,24,12,8.1],[1100,64,34,23,14.1],[1136,58,32,27,15.1]],"sever":[[1170,46,20,7,5.1],[1192,42,18,7,5.1],[1212,48,22,8,6.1]]}},"sev":{"rarm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,18,8,5.1]],"walk":[[20,44,20,8,6.1],[42,42,18,6,5.1],[62,44,20,8,6.1],[84,42,18,6,5.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,12,7.1]],"hit":[[24,46,20,7,5.1]],"fall":[[46,46,24,12,8.1],[72,54,30,23,13.1]]}}},"larm":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,44,24,8,7.1]],"walk":[[26,46,22,8,6.1],[50,42,22,6,6.1],[74,44,22,8,6.1],[98,42,22,6,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,58,26,12,7.1]],"hit":[[28,46,20,7,5.1]],"fall":[[50,46,24,12,8.1],[76,58,32,27,15.1]]}}},"rleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,42,24,7,8.1]],"walk":[[26,42,24,5,7.1],[52,42,24,5,7.1],[78,44,24,4,6.1],[104,42,22,5,6.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,54,24,7,5.1]],"hit":[[26,44,22,5,6.1]],"fall":[[50,44,24,11,8.1],[76,58,32,27,15.1]]}}},"lleg":{"move":{"v":5,"pxmm":1.3,"set":"move_sh","rows":{"idle":[[0,40,22,5,6.1]],"walk":[[24,42,20,5,4.1],[46,42,20,5,4.1],[68,44,20,4,4.1],[90,42,20,5,4.1]]}},"act":{"v":5,"pxmm":1.3,"set":"act_sh","rows":{"attack":[[0,48,22,4,4.1]],"hit":[[24,44,20,4,4.1]],"fall":[[46,42,24,9,8.1],[72,58,32,27,15.1]]}}}}}
};
/* L106_META:END */
/* L106_BMETA:BEGIN (generated by tools/art/anim100b/make.js l106) */
const L106_BMETA={
"arenosus":{"px":1.5715,"m":[54,30,18.4,11.8,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"arenosus_act":{"px":1.5715,"m":[54,30,18.4,11.8,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"brutum":{"px":0.7627,"m":[94,44,34.3,19.6,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"brutum_act":{"px":0.7627,"m":[94,44,34.3,19.6,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"commodus":{"px":1.5715,"m":[66,30,12.8,9.2,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"commodus_act":{"px":1.5715,"m":[100,48,38.8,22.2,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"glykon":{"px":1.5715,"m":[54,30,18.4,11.8,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"glykon_act":{"px":1.5715,"m":[54,30,18.4,11.8,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"leaena":{"px":0.7944,"m":[120,60,48.1,26.2,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"leaena_act":{"px":0.7944,"m":[120,60,48.1,26.2,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"leo":{"px":0.7944,"m":[162,84,67.7,40.1,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"leo_act":{"px":0.7944,"m":[162,84,67.7,40.1,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"moechus":{"px":1.5715,"m":[58,28,18.8,11,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"moechus_act":{"px":1.5715,"m":[58,28,18.8,11,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"tholo":{"px":1.5715,"m":[70,36,14.8,11.2,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"tholo_act":{"px":1.5715,"m":[114,56,45.8,25.2,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"ursa":{"px":0.7627,"m":[94,44,34.3,19.6,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"ursa_act":{"px":0.7627,"m":[94,44,34.3,19.6,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"valencia":{"px":1.5715,"m":[58,28,18.8,11,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"valencia_act":{"px":1.5715,"m":[58,28,18.8,11,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]},
"zora":{"px":1.5715,"m":[78,36,20.3,12.4,10],"rows":["idle0","idle1","idle2","idle3","walk0","walk1","walk2","walk3","walk4","walk5"]},
"zora_act":{"px":1.5715,"m":[78,36,20.3,12.4,13],"rows":["attack0","attack1","attack2","attack3","attack4","hit0","hit1","hit2","die0","die1","die2","die3","die4"]}
};
/* L106_BMETA:END */
const L106={kill:false,ov:'',noAuto:false,phone:null,auto:null,toasted:false,spr:new Map(),cc:new Map(),ccMax:240,img:{},layer:null,cont:new Map(),done:new Set(),
  frame:0,fm:[],smp:0,last:null,st:{ms:0,n:0,tStatic:0,tFig:0,tCont:0,builds:0,figs:0,contacts:0}};
try{L106.kill=localStorage.getItem('flavius_light106off')==='1';const v=localStorage.getItem('flavius_light106');if(v==='full'||v==='light'||v==='off')L106.ov=v;else if(v==='1')L106.ov='full';
  const au=localStorage.getItem('flavius_light106auto');L106.noAuto=au==='0'||(au!=='1'&&/HeadlessChrome/.test(navigator.userAgent||''));   /* headless test browsers rasterise in software: no auto-drop there unless asked (1) */
  if(localStorage.getItem('flavius_light106drop')==='1')L106.auto='light'}catch(e){}
/* phones start on Light (V4a): a narrow screen or a coarse pointer */
function l106Phone(){if(L106.phone==null){try{L106.phone=Math.min(innerWidth||9999,(screen&&screen.width)||9999)<=700||!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)}catch(e){L106.phone=false}}return L106.phone}
/* the chosen setting: full | light | off */
function l106Pref(){if(L106.kill)return 'off';if(L106.ov)return L106.ov;let v=null;try{v=SETTINGS.light106}catch(e){}if(v==='full'||v==='light'||v==='off')return v;return l106Phone()?'light':'full'}
/* the mode this frame (Full after an auto-drop = Light; never while HEADLESS, in the Event editor's board, a Naumachia or a chariot race) */
function l106Mode(){try{if(HEADLESS||typeof S==='undefined'||!S||S.sim||S.ed94)return 'off';if((typeof isNaum==='function'&&isNaum())||(typeof isChariot==='function'&&isChariot()))return 'off'}catch(e){return 'off'}
  const m=l106Pref();return m==='full'&&L106.auto?'light':m}
/* the sun on the board: screen offset per px of height (the board's 2:1 projection = a 30° camera) */
function l106K(){const a=LIGHT106.sun.az*Math.PI/180,e=LIGHT106.sun.el*Math.PI/180,t=0.866*Math.tan(e);return {kx:Math.cos(a)/t,ky:Math.sin(a)*0.5/t}}
const l106Q=v=>Math.round(Math.log(Math.max(1e-3,v))*33);
function l106Night(){try{return typeof night91On==='function'&&!!night91On()}catch(e){return false}}
const l106DS=()=>{try{const t=ctx.getTransform();return Math.max(0.25,Math.hypot(t.a,t.b)||1)}catch(e){return window.devicePixelRatio||1}};
const l106Mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));c._l106=1;return c};

/* ---------------- cached sprites ---------------- */
function l106Contact(){let c=L106.spr.get('contact');if(c)return c;c=l106Mk(128,128);const g=c.getContext('2d');
  const G=g.createRadialGradient(64,64,0,64,64,64);G.addColorStop(0,'rgba(0,0,0,1)');G.addColorStop(0.72,'rgba(0,0,0,1)');G.addColorStop(0.84,'rgba(0,0,0,.5)');G.addColorStop(0.93,'rgba(0,0,0,.16)');G.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=G;g.fillRect(0,0,128,128);L106.spr.set('contact',c);return c}
function l106Soft(){let c=L106.spr.get('soft');if(c)return c;c=l106Mk(128,128);const g=c.getContext('2d');
  const G=g.createRadialGradient(64,64,0,64,64,64);G.addColorStop(0,'rgba(0,0,0,1)');G.addColorStop(0.5,'rgba(0,0,0,.6)');G.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=G;g.fillRect(0,0,128,128);L106.spr.set('soft',c);return c}
/* a solid of revolution's cast shadow (profile in tiles) as a blurred sprite at T device px a tile (3% steps); anchor = the base centre.
   → {s:{c,x0,y0}, k} — k = CSS px per sprite px at the current TW */
function l106Solid(name,prof,ds){const q=l106Q(TW*ds),T=Math.exp(q/33),key=name+'|'+q+'|'+LIGHT106.sun.az+'|'+LIGHT106.sun.el;let s=L106.spr.get(key);if(s)return {s,k:TW/T};
  const {kx,ky}=l106K();const H=prof[prof.length-1][1]*T,R=Math.max(...prof.map(p=>p[2]))*T,pad=Math.ceil(LIGHT106.blur*T*3+4);
  const x0=-R-pad,y0=-R*0.5-pad,w=Math.ceil(R*2+kx*H+pad*2),h=Math.ceil(R+ky*H+pad*2);
  const a=l106Mk(w,h),g=a.getContext('2d');g.fillStyle='#000';
  for(const [h0,h1,r] of prof){const n=Math.max(2,Math.ceil((h1-h0)*T/1.5));for(let i=0;i<=n;i++){const hh=(h0+(h1-h0)*i/n)*T,rr=r*T;g.beginPath();g.ellipse(-x0+kx*hh,-y0+ky*hh,rr,rr*0.5,0,0,Math.PI*2);g.fill()}}
  const c=l106Mk(w,h),g2=c.getContext('2d');g2.filter='blur('+Math.max(0.6,LIGHT106.blur*T).toFixed(2)+'px)';g2.drawImage(a,0,0);
  s={c,x0,y0};L106.spr.set(key,s);while(L106.spr.size>40)L106.spr.delete([...L106.spr.keys()].find(k=>k!=='contact'&&k!=='soft'));return {s,k:TW/T}}
/* the contact shadow at a base centre (x, y), old disc radii rx, ry, on context g */
function l106ContactAt(g,x,y,rx,ry,L){const c=l106Contact(),sft=l106Soft(),{kx,ky}=l106K();const R=rx*LIGHT106.contactR,Ry=ry*LIGHT106.contactR;
  const a=g.globalAlpha;g.globalAlpha=a*L.soft;g.drawImage(sft,x+kx*TW*0.12-R*1.3,y+ky*TW*0.12-Ry*1.3,R*2.6,Ry*2.6);
  g.globalAlpha=a*L.contact;g.drawImage(c,x-R,y-Ry,R*2,Ry*2);g.globalAlpha=a;L106.st.contacts++}

/* ---------------- 1 · the static layer: pillars, jugs, chest, rubble ---------------- */
const l106PilMoving=pl=>{try{return typeof PUSH100!=='undefined'&&(PUSH100.live.has(pl)||PUSH100.wob.has(pl))}catch(e){return false}};
const l106PilOK=pl=>pl&&!pl.f76&&!pl.w76&&!pl.bst100g;
const l106HasPots=pl=>!!(pl.pots&&pl.pots.length);
function l106Key(md,night,ds){const c0=center(0,0),c1=center(0,1),c2=center(1,0),o=v=>Math.round(v/TW*20);
  let k=md+'|'+(night?1:0)+'|'+l106Q(TW*ds)+'|'+o(c1.x-c0.x)+','+o(c1.y-c0.y)+','+o(c2.x-c0.x)+','+o(c2.y-c0.y)+'|';
  for(const pl of S.pillars)k+=l106PilOK(pl)?pl.r+':'+pl.c+(l106HasPots(pl)?'j':'')+(l106PilMoving(pl)?'m':'')+';':'-;';
  k+='|'+(S.chest&&S.chest.held==null?S.chest.r+':'+S.chest.c:'');for(const rb of S.rubble||[])k+='|'+rb.r+':'+rb.c+':'+rb.dr+':'+rb.dc;return k}
/* the items of the layer in CSS board px: casts (full) and contacts */
function l106Items(md){const casts=[],conts=[],{kx,ky}=l106K();
  for(const pl of S.pillars){if(!l106PilOK(pl)||l106PilMoving(pl))continue;const m=center(pl.r,pl.c);if(md==='full')casts.push({t:'solid',m,name:l106HasPots(pl)?'pillar':'pillar0',prof:l106HasPots(pl)?LIGHT106.pillar:LIGHT106.pillar.slice(0,3)});
    conts.push({x:m.x,y:m.y+TW*0.01,rx:TW*0.27,ry:TW*0.13})}
  if(S.chest&&S.chest.held==null){const m=center(S.chest.r,S.chest.c);if(md==='full')casts.push({t:'solid',m,name:'chest',prof:LIGHT106.chest});conts.push({x:m.x,y:m.y,rx:TW*0.3,ry:TW*0.15})}
  if(md==='full')for(const rb of S.rubble||[])for(const [k9,sz] of [[0,1],[1,.75],[2,.5]]){const r=rb.r+rb.dr*k9,c=rb.c+rb.dc*k9;if(!inB(r,c))continue;const m=center(r,c);
    for(let i=0;i<5;i++){const a=i*2.4+rb.r*1.3+k9,x=m.x+Math.cos(a)*TW*0.18*sz,y=m.y+Math.sin(a)*TW*0.08*sz,rr=TW*0.06*sz+1,hh=TW*0.05*sz;
      casts.push({t:'stone',x:x+kx*hh-rr*1.2,y:y+ky*hh-rr*0.6,w:rr*2.4,h:rr*1.2})}}
  return {casts,conts}}
function l106Build(md,night,key,ds){const L=night?LIGHT106.night:LIGHT106.day,{casts,conts}=l106Items(md);const R=[];
  for(const it of casts){if(it.t==='solid'){const {s,k}=l106Solid(it.name,it.prof,ds);it.s=s;it.k=k;R.push([it.m.x+s.x0*k,it.m.y+s.y0*k,s.c.width*k,s.c.height*k])}else R.push([it.x,it.y,it.w,it.h])}
  for(const c of conts){const r=c.rx*LIGHT106.contactR*1.3,ry=c.ry*LIGHT106.contactR*1.3;R.push([c.x-r,c.y-ry,r*2+TW*0.12,ry*2+TW*0.1])}
  if(!R.length){L106.layer={key,c:null};L106.st.builds++;return L106.layer}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y,w,h] of R){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+w);y1=Math.max(y1,y+h)}x0-=2;y0-=2;x1+=2;y1+=2;
  const W=(x1-x0)*ds,H=(y1-y0)*ds,c=(L106.layer&&L106.layer.c&&L106.layer.c.width===Math.ceil(W)&&L106.layer.c.height===Math.ceil(H))?L106.layer.c:l106Mk(W,H),g=c.getContext('2d');
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(ds,0,0,ds,-x0*ds,-y0*ds);
  if(casts.length){const t=l106Mk(c.width,c.height),tg=t.getContext('2d');tg.setTransform(ds,0,0,ds,-x0*ds,-y0*ds);
    for(const it of casts){if(it.t==='solid')tg.drawImage(it.s.c,it.m.x+it.s.x0*it.k,it.m.y+it.s.y0*it.k,it.s.c.width*it.k,it.s.c.height*it.k);else{tg.globalAlpha=0.8;tg.drawImage(l106Soft(),it.x,it.y,it.w,it.h);tg.globalAlpha=1}}
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=L.cast;g.drawImage(t,0,0);g.restore();t.width=t.height=0}
  for(const ct of conts)l106ContactAt(g,ct.x,ct.y,ct.rx,ct.ry,L);
  const c0=center(0,0);L106.layer={key,c,rx:(x0-c0.x)/TW,ry:(y0-c0.y)/TW,rw:(x1-x0)/TW,rh:(y1-y0)/TW,casts:casts.length,conts:conts.length,
    ds,rects:R.map(([x,y,w,h])=>[(x-x0)*ds,(y-y0)*ds,w*ds,h*ds])};   /* v1.07: where it holds pixels (device px in the layer) */L106.st.builds++;return L106.layer}
/* the static layer on the board (v1.07: its own function, so 401-v107perf can draw it in aligned pieces) */
function l106DrawStatic(Ly,hp){const c0=center(0,0),X=c0.x+Ly.rx*TW,Y=c0.y+Ly.ry*TW,W=Ly.rw*TW,H=Ly.rh*TW;
  /* contacts in the layer are not lifted; casts are: when highlights are up the lift is applied to the whole layer (the contacts sit off the tiles) */
  l106Lifted(hp,(a,b)=>{ctx.globalAlpha=a;if(!b){ctx.drawImage(Ly.c,X,Y,W,H);return}
    const x0=Math.max(X,b[0]),y0=Math.max(Y,b[1]),x1=Math.min(X+W,b[2]),y1=Math.min(Y+H,b[3]);if(x1<=x0||y1<=y0)return;const kx=Ly.c.width/W,ky=Ly.c.height/H;
    ctx.drawImage(Ly.c,(x0-X)*kx,(y0-Y)*ky,(x1-x0)*kx,(y1-y0)*ky,x0,y0,x1-x0,y1-y0)})}
/* the figures' + beasts' cast shadows (ops = [canvas, x, y, w, h]) — v1.07: its own function (401-v107perf) */
function l106DrawFigs(ops,hp,L){l106Lifted(hp,(a,b)=>{ctx.globalAlpha=a*L.cast;for(const op of ops)if(l106Hit(op[1],op[2],op[3],op[4],b))ctx.drawImage(...op)})}
/* a pillar being shoved: its shadow drawn live at the shove's offset */
function l106MovingPillars(md,L,ds){for(const pl of S.pillars){if(!l106PilOK(pl)||!l106PilMoving(pl))continue;let o={dx:0,dy:0};try{if(typeof push100At==='function')o=push100At(pl)||o}catch(e){}
  const m=center(pl.r,pl.c),x=m.x+(o.dx||0),y=m.y+(o.dy||0);
  if(md==='full'){const {s,k}=l106Solid(l106HasPots(pl)?'pillar':'pillar0',l106HasPots(pl)?LIGHT106.pillar:LIGHT106.pillar.slice(0,3),ds);ctx.save();ctx.globalAlpha=L.cast;ctx.drawImage(s.c,x+s.x0*k,y+s.y0*k,s.c.width*k,s.c.height*k);ctx.restore()}
  ctx.save();l106ContactAt(ctx,x,y+TW*0.01,TW*0.27,TW*0.13,L);ctx.restore()}}

/* ---------------- 2 · figure + beast shadows (baked) ---------------- */
const l106HasFile=f=>{try{if(window.ASSET_DATA&&!window.ASSET_DATA[f])return false}catch(e){}return true};
/* a shadow sheet image (printed / beasts: a file; device: the blob from 311's render) → the image or null while it loads */
function l106File(f){let o=L106.img[f];if(o)return o.ok?o.im:null;o=L106.img[f]={ok:false,im:new Image()};if(!l106HasFile(f)){o.bad=1;return null}
  o.im.decoding='async';o.im.onload=()=>{o.ok=true;try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}};o.im.onerror=()=>{o.bad=1};o.im.src=assetURL(f);return null}
function l106Blob(sh){if(sh.bm)return sh.bm===1?null:sh.bm;sh.bm=1;try{createImageBitmap(sh.blob).then(b=>{sh.bm=b;try{draw()}catch(e){}},()=>{sh.bm=null;sh.bad=1})}catch(e){sh.bm=null}return null}
/* one cell pre-scaled to its drawn size at the device ratio (3% steps, LRU) */
function l106Cell(id,im,fx,fy,w,h,s,ds){const q=l106Q(s*ds),sq=Math.exp(q/33),key=id+'|'+fx+'|'+fy+'|'+q;let c=L106.cc.get(key);
  if(c){L106.cc.delete(key);L106.cc.set(key,c);return c}c=l106Mk(Math.round(w*sq),Math.round(h*sq));const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(im,fx,fy,w,h,0,0,c.width,c.height);
  L106.cc.set(key,c);while(L106.cc.size>L106.ccMax)L106.cc.delete(L106.cc.keys().next().value);return c}
/* a gladiator's shadow now: {c, x, y, w, h, key} in CSS px round its base centre, or null */
function l106GladSh(p,ds){if(typeof AN100==='undefined'||!AN100.on||typeof an100On!=='function'||!an100On())return null;
  let sp=null;try{sp=typeof tokenForP==='function'?tokenForP(p):null}catch(e){}
  const s0=an100St(p),sev=s0.sevT&&an100Now()<s0.sevT;const src=sev?an100SrcFor(p,sp,{whole:true}):an100SrcFor(p,sp);if(!src||!an100Bm(src,'move','idle'))return null;
  let P=an100Pose(p,src);if(P.set==='act'&&!an100Bm(src,'act',P.name))P={set:'move',name:'idle',i:0};
  let face=0;try{face=typeof miniFace==='function'?miniFace(p,'t93'):0}catch(e){}
  let im=null,meta=null,k=1,id='';
  if(src.cls){const M=L106_META[src.cls];meta=M&&(src.limb?(M.sev&&M.sev[src.limb]&&M.sev[src.limb][P.set]):M[P.set]);if(!meta)return null;
    const ph=l106Phone(),f0='anim106'+(ph?'p':'')+'_'+src.cls+(src.limb?'_'+src.limb:'')+'_';k=ph?0.5:1;id=f0+P.set+'_sh.webp';im=l106File(id);if(P.set==='move')l106File(f0+'act_sh.webp')}   /* the act shadows load right after (an action never waits for its shadow) */
  else{const o=src[P.set];if(!o||!o.sh||o.sh.bad)return null;meta=o.sh.meta;im=l106Blob(o.sh);id=src.key+P.set}
  if(!im||!meta)return null;const row=meta.rows[P.name]&&meta.rows[P.name][P.i];if(!row)return null;
  const [ry,w,h,ax,ay]=row.map(v=>v*k),s=TW*MINI_BASE/25.4/(meta.pxmm*k);const c=l106Cell(id,im,face*w,ry,w,h,s,ds);
  return {c,x:-ax*s,y:-ay*s,w:w*s,h:h*s,key:P.set+P.name+P.i+'|'+face}}
/* a beast's shadow now (312's sheets), or null */
function l106BeastSh(n,ds,now){if(typeof BST100==='undefined'||!BST100.on||typeof bst100Key!=='function')return null;const k=bst100Key(n),mode=bst100Mode();if(!k||mode==='off'||!bst100Img(k,0))return null;
  if(n.t==='zora'&&typeof pillarAt==='function'&&pillarAt(n.r,n.c))return null;
  const A=bst100St(n);bst100Track(n,A,mode,now);const pose=bst100Pose(n,k,A,mode,now);let face=0;try{face=miniFace(n,k)}catch(e){}
  let part=k,SM=L106_BMETA[k],row=-1;   /* the act part when the act sheet drew this pose, else the idle/walk part (idle0 like 312's fallback) */
  if(pose.act&&L106_BMETA[k+'_act']){const r=L106_BMETA[k+'_act'].rows.indexOf(pose.name);if(r>=0){part=k+'_act';SM=L106_BMETA[part];row=r}}
  if(row<0&&SM){row=SM.rows.indexOf(pose.act?'idle0':pose.name);if(row<0)row=Math.max(0,SM.rows.indexOf('idle0'))}
  if(!SM||row<0)return null;const ph=l106Phone(),kk=ph?0.5:1,id='anim106'+(ph?'p':'')+'_beast_'+part+'_sh.webp',im=l106File(id);if(part===k&&L106_BMETA[k+'_act'])l106File('anim106'+(ph?'p':'')+'_beast_'+k+'_act_sh.webp');if(!im)return null;
  const M=BEAST100_META[k],[w,h,ax,ay]=SM.m.map(v=>v*kk),s=bst100Scale(M)*M.px/(SM.px*kk);const c=l106Cell(id,im,face*w,row*h,w,h,s,ds);
  const o=bst100Off(n,A,now);return {c,x:-ax*s,y:-ay*s,w:w*s,h:h*s,key:SM.rows[row]+'|'+face,dx:o?o.dx:0,dy:o?o.dy:0}}
/* the screen offset of a moving gladiator (glide / shove) — 359's helper; a beast's shove */
function l106Off(p,npc){try{if(typeof fl104Offs==='function'&&(!npc||(typeof PUSH100!=='undefined'&&(PUSH100.live.has(p)||PUSH100.wob.has(p))))){const o=fl104Offs(p,npc);if(o)return o}}catch(e){}return {dx:0,dy:0}}

/* ---------------- 3 · contact: the old discs become records (size + place); the pass paints them ---------------- */
{const base=fl104Sh;fl104Sh=function(x,y,rx,ry){const md=l106Mode();if(md==='off')return base.apply(this,arguments);
  const p=typeof MINI_CUR!=='undefined'?MINI_CUR:null;
  if(p){const m=center(p.r,p.c);let k=1;try{if(typeof b3105Off==='function'&&b3105Off()&&typeof BS101!=='undefined'&&BS101.f)k=0.62}catch(e){}
    L106.cont.set(p,{rx:rx*k/TW,ry:ry*k/TW,ox:(x-2-m.x)/TW,oy:(y-3-m.y)/TW});if(L106.done.has(p))return}
  ctx.save();l106ContactAt(ctx,x-2,y-3,rx,ry,l106Night()?LIGHT106.night:LIGHT106.day);ctx.restore()}}
if(typeof pillarShadow82==='function'){const base=pillarShadow82;pillarShadow82=function(x,y,baseW){if(l106Mode()==='off')return base.apply(this,arguments);PILLAR_SHADOW82={w:baseW*PILLAR_SH82,base:baseW}}}

/* ---------------- the pass (end of 'decals') ---------------- */
/* the highlighted tiles as one path (the lift clips by it) */
function l106HLPath(){if(typeof HL==='undefined'||!HL.size||!(LIGHT106.hlLift>0))return null;const P=new Path2D();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const k of HL.keys()){const m=center(Math.floor(k/N),k%N);P.moveTo(m.x,m.y-TH/2);P.lineTo(m.x+TW/2,m.y);P.lineTo(m.x,m.y+TH/2);P.lineTo(m.x-TW/2,m.y);P.closePath();
    x0=Math.min(x0,m.x-TW/2);x1=Math.max(x1,m.x+TW/2);y0=Math.min(y0,m.y-TH/2);y1=Math.max(y1,m.y+TH/2)}return {p:P,b:[x0,y0,x1,y1]}}
/* draw(fn) twice when tiles are highlighted: outside them at full strength (box null), inside at (1 − lift) — fn gets the tiles' bounding box
   then, so it rasterises only what can show through the clip */
function l106Lifted(hp,fn){if(!hp){fn(1,null);return}const W=cv.width*4+TW*40;
  ctx.save();const out=new Path2D();out.rect(-W,-W,W*3,W*3);out.addPath(hp.p);ctx.clip(out,'evenodd');fn(1,null);ctx.restore();
  ctx.save();ctx.clip(hp.p);fn(1-LIGHT106.hlLift,hp.b);ctx.restore()}
const l106Hit=(x,y,w,h,b)=>!b||(x<b[2]&&x+w>b[0]&&y<b[3]&&y+h>b[1]);
function l106Pass(){const md=l106Mode();if(md==='off')return;const t0=performance.now();L106.frame++;L106.done.clear();L106.bp=new Map();
  const ds=l106DS(),night=l106Night(),L=night?LIGHT106.night:LIGHT106.day,now=performance.now();
  const last={md,night,static:false,built:false,figs:[],contacts:0};
  const pieces=[];if(!DRAW_EMPTY){for(const p of S.players)if(p.alive&&!p.exited&&!p.underground&&!(p.ch&&p.ch.mounted)&&!(typeof swimming==='function'&&swimming(p)))pieces.push([p,false]);
    for(const n of S.npcs)if(n.alive&&!n.out)pieces.push([n,true])}
  const hp=l106HLPath();
  /* 1 · the static layer */
  const key=l106Key(md,night,ds);let Ly=L106.layer;if(!Ly||Ly.key!==key){Ly=l106Build(md,night,key,ds);last.built=true}
  if(Ly.c){l106DrawStatic(Ly,hp);last.static=true}
  l106MovingPillars(md,L,ds);const t1=performance.now();
  /* 2 · figures + beasts */
  if(md==='full'){const ops=[];
    for(const [p,npc] of pieces){let r=null;try{r=npc?l106BeastSh(p,ds,now):l106GladSh(p,ds)}catch(e){r=null}if(!r)continue;const m=center(p.r,p.c),o=npc?(r.dx||r.dy?{dx:r.dx,dy:r.dy}:l106Off(p,true)):l106Off(p,false);
      const x=m.x+o.dx,y=m.y+o.dy;ops.push([r.c,x+r.x,y+r.y,r.w,r.h]);last.figs.push({id:p.id,npc,key:r.key,x:Math.round(x),y:Math.round(y)})}
    if(ops.length)l106DrawFigs(ops,hp,L);L106.st.figs+=ops.length}
  const t2=performance.now();
  /* 3 · contact */
  ctx.save();for(const [p,npc] of pieces){const C=L106.cont.get(p);if(!C)continue;const m=center(p.r,p.c),o=npc?l106NpcOff(p,now):l106Off(p,false);
    l106ContactAt(ctx,m.x+o.dx+C.ox*TW,m.y+o.dy+C.oy*TW,C.rx*TW,C.ry*TW,L);L106.done.add(p);last.contacts++}ctx.restore();
  const t3=performance.now();L106.st.tStatic+=t1-t0;L106.st.tFig+=t2-t1;L106.st.tCont+=t3-t2;L106.st.ms+=t3-t0;L106.st.n++;L106.last=last}
/* a beast's drawn offset (shove, else its walk glide) */
function l106NpcOff(n,now){try{if(typeof PUSH100!=='undefined'&&(PUSH100.live.has(n)||PUSH100.wob.has(n)))return l106Off(n,true);
  if(typeof bst100Off==='function'&&typeof BST100!=='undefined'&&BST100.on&&bst100Key(n)&&bst100Mode()!=='off'){const o=bst100Off(n,bst100St(n),now);if(o)return o}}catch(e){}return {dx:0,dy:0}}
{const base=drawLayers93;drawLayers93=function(layers){if(l106Mode()==='off'||!Array.isArray(layers))return base.apply(this,arguments);
  return base.call(this,layers.map(l=>l&&l[0]==='decals'?['decals',()=>{const r=l[1]();ctx.save();try{l106Pass()}catch(e){console.error(e)}finally{ctx.restore()}return r}]:l))}}

/* ---------------- Full → Light by itself (V4a): real frame times, sustained ---------------- */
function l106Drop(){if(L106.auto)return;L106.auto='light';L106.fm=[];try{localStorage.setItem('flavius_light106drop','1')}catch(e){}
  if(!L106.toasted){L106.toasted=true;try{mToast(_T('☀ Lighting set to Light: frames were slow. Settings → Board & pieces to change it.'))}catch(e){}}
  try{draw()}catch(e){}}
/* one rAF frame interval (ms) */
function l106Feed(dt,t){const A=LIGHT106.auto;if(L106.auto||L106.noAuto||l106Pref()!=='full'||L106.frame<A.warm)return;const now=t||performance.now();
  L106.fm.push([now,dt]);while(L106.fm.length&&L106.fm[0][0]<now-A.winMs)L106.fm.shift();
  if(L106.fm.length>=A.min){let s=0;for(const f of L106.fm)if(f[1]>A.slowMs)s++;if(s/L106.fm.length>=A.share)l106Drop()}}
function l106Watch(){if(L106.auto||L106.noAuto||l106Mode()!=='full'||L106.frame<LIGHT106.auto.warm)return;
  /* 288's meter, when shown, already samples every frame */
  if(typeof F100!=='undefined'&&F100.on){const A=LIGHT106.auto,now=performance.now();const fr=F100.fr.filter(f=>f.t>now-A.winMs);if(fr.length>=A.min){let s=0;for(const f of fr)if(f.dt>A.slowMs)s++;if(s/fr.length>=A.share)l106Drop()}return}
  /* else the interval of the two frames after a board draw (both commit what the draw asked for) */
  if(L106.smp||document.hidden)return;L106.smp=1;requestAnimationFrame(a=>requestAnimationFrame(b=>{L106.smp=0;l106Feed(b-a,b)}))}
{const base=draw;draw=function(){let r;try{r=base.apply(this,arguments)}finally{L106.bp=null}try{l106Watch()}catch(e){}return r}}
/* one pose per piece per draw: the pass picks it, the figure drawer reuses it (a pose step falling between the two would split them) */
if(typeof an100Pose==='function'){const base=an100Pose;an100Pose=function(p,src){const B=L106.bp;if(!B)return base.apply(this,arguments);const k=B.get(p);if(k&&k.src===src)return k.P;const P=base.apply(this,arguments);B.set(p,{src,P});return P}}
if(typeof bst100Pose==='function'){const base=bst100Pose;bst100Pose=function(n,k){const B=L106.bp;if(!B)return base.apply(this,arguments);const o=B.get(n);if(o&&o.k===k)return o.P;const P=base.apply(this,arguments);B.set(n,{k,P});return P}}

/* ---------------- Settings → Board & pieces → Lighting ---------------- */
if(typeof set98Pieces==='function'){const base=set98Pieces;set98Pieces=function(){let h=base.apply(this,arguments);if(L106.kill)return h;try{
  const cur=l106Pref(),dropped=cur==='full'&&!!L106.auto;
  const seg=`<div class="seg s98-seg" role="group" aria-label="${_T('Lighting')}">${[['full',_T('Full')],['light',_T('Light')],['off',_T('Off')]].map(([k,l])=>`<button type="button" data-light106="${k}" class="${cur===k?'on':''}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`;
  const d=_T('Full: the sun casts shadows from pillars, gladiators and beasts. Light: soft shadows at their feet only. Off: flat, the fastest.')+(dropped?' '+_T('Now on Light: frames were slow.'):'');
  const card=typeof set98Card==='function'?set98Card('☀',_T('Lighting'),`<div class="s98-rows">${set98Row(_T('Shadows'),d,seg)}</div>`):'';
  h=h.replace(/<\/div>$/,card+'</div>')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-light106]');if(!b)return;const v=b.dataset.light106;
  SETTINGS.light106=v;if(v==='full'){L106.auto=null;L106.fm=[];try{localStorage.removeItem('flavius_light106drop')}catch(x){}}applySettings();
  b.parentElement.querySelectorAll('[data-light106]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))});try{if(S&&!HEADLESS)draw()}catch(x){}});
