/* =====================================================================
   424-v111speed — v1.11c THE CPU SPEED IS REMEMBERED (his 1b, 2026-10-23). Until v1.11b every event began on Slow (02-data SPEED, 05-flow
   startEvent "CPU pace always begins on Slow"). Now the last speed the player CHOSE (Slow / Normal / Fast, from the arena bar or the
   Settings CPU-speed switch — both press the same [data-speed] button) is kept in localStorage flavius_speed111 and every new event starts on
   it. Pause, Step and the Snap fast-forward are never remembered, and a window's automatic pause (modalPause) is not a choice: the click
   listener only runs on a real button press. First run (nothing stored) stays Slow.
   Unchanged (still Slow): online matches (S.onl — lockstep), lessons (S.tutorial), replays (RPP.on), sims/HEADLESS, resumed match saves
   (38-matchsave sets its own).
   DISPLAY ONLY: no rand(), nothing sent, no save shape change. Kill switch localStorage flavius_v111speedoff=1 = v1.11b (always Slow).
   Test tv111sp.
   ===================================================================== */
{
  const KEY = 'flavius_speed111', OK = ['slow', 'normal', 'fast'];
  const off = () => { try { return localStorage.getItem('flavius_v111speedoff') === '1'; } catch (e) { return false; } };
  const get = () => { try { const v = localStorage.getItem(KEY); return OK.includes(v) ? v : null; } catch (e) { return null; } };
  if (!HEADLESS && !off()) {
    /* the player's own press (the Settings switch clicks the same button); read after the button's handler has set SPEED */
    document.addEventListener('click', e => {
      try {
        const b = e.target && e.target.closest && e.target.closest('[data-speed]');
        if (!b || off() || !OK.includes(b.dataset.speed) || SPEED !== b.dataset.speed) return;
        localStorage.setItem(KEY, SPEED);
      } catch (x) {}
    });
    /* startEvent resets to Slow synchronously (no await before it); put the remembered speed back right after */
    const base = startEvent;
    startEvent = function (...a) {
      const r = base.apply(this, a);
      try {
        const v = get(), cf = a[0] || {};
        const rp = typeof RPP !== 'undefined' && RPP.on;
        if (v && !off() && S && !S.sim && !S.onl && !cf.onl && !S.tutorial && !cf.tutorial && !(typeof TUT !== 'undefined' && TUT.on) && !rp && SPEED === 'slow' && v !== 'slow') setSpeedUI(v);
      } catch (x) {}
      return r;
    };
  }
}
