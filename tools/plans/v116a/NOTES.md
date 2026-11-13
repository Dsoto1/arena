# v1.16a (proposed) — phone load, first step (his order 2026-11-13: 3 · 1 · 4 · 2 · 5)

His pick 2026-11-06 (3b "my recs"): Brotli + a loading bar first, then the build split (v1.17). NOTHING built yet — questions below.

## Facts found 2026-11-13 (lead)
- flavius.sh `put` uploads play/index.html with NO Content-Encoding; compression is left to CloudFront's automatic compression, which only
  compresses objects of 1 000 – 10 000 000 bytes. The page is 10 618 634 bytes → over the limit → very likely served UNCOMPRESSED today
  (10.6 MB on the wire, not the 3.86 MB tv116load assumed). Not verifiable from the sandbox (the proxy blocks flaviusrule.com) → he runs
  one curl line in CloudShell, or `flavius.sh status` gets the check.
- Sizes: raw 10.62 MB · gzip -9 3.85 MB (0.3 s) · Brotli q11 2.84 MB (22 s with node's zlib; CloudShell has node).
- The boot cover (#boot in 01-head.html: logo + spinner) already shows while the script downloads (the HTML streams). A TRUE progress bar is
  not possible for an inline script (the page cannot read its own download progress) — only after the v1.17 split (chunks fetched with
  progress). BUG: `#boot{animation:bootgone .3s linear 12s forwards}` hides the cover after 12 s "even if the script fails" → on a slow
  phone the cover vanishes at 12 s and the player looks at an unfinished page until the script arrives.

## Proposed (waiting on his answers)
1. Deploy: flavius.sh compresses play/index.html with Brotli q11 (node zlib) and uploads it with Content-Encoding: br (+ Vary) — game and
   beta; FSH_VER up; `status` prints "page: N MB on the wire (br)". Replaces: reliance on CloudFront's automatic compression for the page.
2. Boot cover: stays until the game is really up; the 12 s auto-hide becomes a 90 s last resort + hide on a script error (window.onerror).
   One line under the logo ("Opening the arena…", translated). Replaces the 12 s safety (01-head, v0.9x).
3. No fake percentage bar; the real bar comes with v1.17's chunks.

## His answers 2026-11-13: **1a 2a 3a** (go)
1a the deploy compresses the page itself with Brotli (Content-Encoding: br), game + beta; `status` prints the size on the wire.
2a the boot cover stays until the game is up (90 s last resort, hide on a script error) + one line "Opening the arena…". 3a no fake bar.
His curl line (CloudShell, 2026-11-13) printed "0 bytes, encoding:" = no body (a redirect or an error status; the line did not follow
redirects or print the status) → inconclusive; the `status` check built in 1a answers it properly.

## Item 3 of his order — the Safari touch tap: CAUSE FOUND + FIXED (396-v106aim, one line)
Probe tools/ci/wkprobe.js on webkit.yml (run 43424100538): after ONE touch tap WebKit delivers pointerdown/up with pointerType 'touch' but
the CLICK is a PointerEvent with pointerType 'mouse' (Chromium: 'touch'). 396's capture click read `e.pointerType||AIM106.lastPT` → 'mouse'
→ not a touch → the board's own click struck at once. So on Safari / iPad the first tap ATTACKED instead of selecting (u2a: tap = select,
same target again = strike). Fix: the pointerdown just before decides (`AIM106.lastPT||e.pointerType`). tv106d + tv106g green on Chromium;
WebKit proof = webkit.yml dispatch tv106d. Still worth his one tap on the iPad after the release.
