# v1.15a — Deaths fix (small fix release after v1.15)

Source: the deaths study (tools/plans/deaths112/REPORT.md, 2026-10-31). His answers 2026-10-31: **1a 2a 3a 4a 5a**.

1. **1a G3** half-price blood money for a house under fame 18 (any house; rivals sit at fame 46+). REPLACES 51-v49 `newcomerHouse`'s
   condition alone (v0.49: ≤ 2 fighters and < 120 coin) — the newcomer price stays, "fame under 18" is added (either one).
2. **2a G5** a death costs the house no fame while it is under fame 18. REPLACES 17 `killFighter`'s −2 fame for every death (docs/economy.md).
   Sim: 1a+2a (G35) → 0.47 deaths a season (from 2.37), fame 6 → 13, ≈ 77 coin a season on blood money; rivals unchanged; rank unchanged.
3. **3a** STAR_FAME stays [0,0,5,18,36,56] (opening it changed nothing measurable).
4. **4a** next: a separate STRENGTH study (roster 45 vs rivals 67; rivals 63 → 71): rivals' patron + building, tirones' training growth,
   barracks turnover (5–10 signings a season), undercard matchmaking (42 vs 55 OVR). Report → his picks → only then a release.
5. **5a** 1a + 2a ship as ONE small release right after v1.15: one module wrapping `bloodPrice` and `killFighter` (kill switch, test); the
   blood-money line says "half price — a small house".
