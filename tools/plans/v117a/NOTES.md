# v1.17a — saves never fail silently (his picks 2026-11-19 on tools/plans/v117/AUDIT-saves.md)

His picks: F1 + F2 + F3 + F5 (not F4 storage migration, not "measure first"); release = v1.17a right AFTER v1.17, own beta.
- F1 Store.put reports a failure (Store.lastError + BUS 'saveFail'); ONE visible banner per session: progress could not be saved,
  storage full, with a "Download a backup" button; the previous save is kept. Deliberate no-op puts (RPP, hot seat, daily,
  designer-test Promise.resolve(false)) are not failures.
- F2 loadSnapshot: write the new docs first and check each; delete the old ones only when all succeeded; on any failure stop, say so,
  no reload.
- F3 "saved" toasts / flags (Studio, career/match import, gladiators row.p.saved, match autosave, resume pointer) only on a real success.
- F5 snapshotAll warns/refuses instead of exporting an empty collection; pagehide flush of a pending saveWorld (400 ms debounce).
Built on its own branch until release/v1.17 is cut (v1.17 must not carry it).
