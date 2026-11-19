# Silent-failure audit of saves (2026-11-19, read-only; his item 2) — lead-verified root cause, sizes NOT measured yet

ROOT CAUSE (verified by the lead in src/meta/10-meta.js Store): `Store.put` / `Store.del` never throw. On the live site there is no shared
DB, so every write is `localStorage.setItem` inside an empty `catch(e){}`; put then returns `false` and almost no caller reads it
(`.catch(()=>{})` can never fire). Safari gives an origin ~5 MB of localStorage; every career is stored in ONE key (flavius_mgrCareers,
each world as a JSON string) and every save rewrites all careers at once, so a full origin stops ALL saving, silently.

Ranked (what a player can lose):
1. Manager careers — saveWorld (manager/17-manager.js:98), applyActivePurse, migrate-on-load: progress stops being saved while play goes on;
   a reload loses everything since the last good save. Likely on Safari with a big/old world or several careers.
2. Backup restore — loadSnapshot (ui/12-settings.js:262): deletes current docs FIRST, ignores put results, reloads → current progress gone,
   restore partial, no message. Worst harm, medium likelihood.
3. Match autosave / resume pointer — 38-matchsave matchAutosave, 337 r102Write: an in-progress match cannot be resumed after a crash.
4. Ludus gladiators — 10-meta / 11-extra (row.p.saved trusted though never written) / 46-tourney: deaths, freedom, XP lost.
5. Studio creations — studio/* say "saved" regardless of the result: designer work lost.
6. Hall / Annals / Infamis / wallet (active-career pointer) / mgrArchives.
7. Small prefs: tournament bracket, crowd, sponsors, calendar, betlog, hot-seat profiles, token overrides, replay index.
8. Import of a career / match file (51-v49 saveUpload): "is in your careers" shown even when not stored.
Also: snapshotAll exports an EMPTY collection if listing it failed (a backup that looks fine); no pagehide flush for saveWorld's 400 ms debounce.
Handled well (leave): settings (422 read-back + cookie), matchSaveDialog / Settings "Save now", replays (drop oldest until it fits).

Proposed fixes (his picks wanted):
F1 Store.put reports failure (Store.lastError + BUS 'saveFail'); ONE visible banner per session: "Your progress could not be saved — storage
   is full. Download a backup." (+ the button); the previous save is kept.
F2 loadSnapshot: write the new docs first, check each, delete the old only when all succeeded; on failure stop, say so, no reload.
F3 "saved" toasts (Studio, import, gladiators, match autosave) only when the write really succeeded.
F4 careers one key each (or IndexedDB, which allows far more than 5 MB) + a storage-use line in Settings → Saves.
F5 snapshotAll refuses/warns instead of exporting an empty collection; pagehide flush of the pending saveWorld.
Measure first: a seeded mature world's size per localStorage key (Playwright), to know how close real players are to the limit.
