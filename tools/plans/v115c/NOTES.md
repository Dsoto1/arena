# v1.15c (proposed) — mouse-wheel zoom on the arena

His note 2026-11-01: "when player is hovering their mouse over the arena, scroll up and down would do zoom in or out respectively" ("sometime").
🆕 small feature. Reuses the phone pinch zoom (86-v66 `CAM.z`, 1–2.4, v0.66) and the 🔍 toggle (`S.zoomIn`) — no new zoom system.
Questions asked 2026-11-01 (answers below when he gives them). Do NOT build before his go.

His answers 2026-11-01: **1a 2a 3a 4a 5a 6a**
1. 1a its own small release v1.15c right after v1.15b ships (build now, keep off the work branch until then).
2. 2a each wheel step ≈10% zoom, range 1×–2.4× (CAM.z, the pinch range; CAM_MAX).
3. 3a centred on the active fighter — the follow camera / pinch behaviour (camFocus), not the pointer.
4. 4a over the arena the wheel never scrolls the page (preventDefault on the board canvas).
5. 5a Mac trackpad pinch (ctrl+wheel) zooms too.
6. 6a always on; kill switch only (flavius_v115czoomoff=1), no new setting.

Built 2026-11-03: 433-v115czoom (first builder interrupted; WIP finished + verified by a second builder). The event title card (#evIntro, ~3.4 s) is not the canvas: the wheel over it scrolls as before (spec: canvas only).
