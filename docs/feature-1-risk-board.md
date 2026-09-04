# Feature 1 — Live District Risk Board

Owner: Hasiru · Branch: `feature/risk-board`

Scores all 25 Sri Lankan districts for flood and landslide risk from live
rainfall forecasts, and turns each score into one instruction a household can
act on.

## Where the code lives

| File | Responsibility |
| --- | --- |
| [lib/types.ts](../lib/types.ts) | Shared types: `District`, `DistrictRisk`, API payloads |
| [lib/districts.ts](../lib/districts.ts) | The 25 districts, their coordinates, basin and vulnerability |
| [lib/risk.ts](../lib/risk.ts) | Scoring, banding, and the colour/instruction attached to each band |
| [lib/scenarios.ts](../lib/scenarios.ts) | Rainfall multipliers used to exercise the bands between monsoons |
| [lib/format.ts](../lib/format.ts) | Millimetre and timestamp formatting |
| [app/api/risk/route.ts](../app/api/risk/route.ts) | Server route: one Open-Meteo call, scores, sorts |
| [components/risk-board.tsx](../components/risk-board.tsx) | Client state: fetch, search, filter, refresh, which view shows |
| [components/hero-district.tsx](../components/hero-district.tsx) | The highest-risk district panel |
| [components/board-controls.tsx](../components/board-controls.tsx) | Search box, band filter, refresh button, result count |
| [components/district-card.tsx](../components/district-card.tsx) | One district in the grid |
| [components/board-states.tsx](../components/board-states.tsx) | Loading skeleton, error card, empty state |
| [components/risk-badge.tsx](../components/risk-badge.tsx) | Coloured band pill |

## Requirement traceability

| FR | Where it is implemented | How to demonstrate it |
| --- | --- | --- |
| **1.1** Fetch rainfall for all 25 districts in one request | [app/api/risk/route.ts](../app/api/risk/route.ts) builds comma-separated `latitude`/`longitude` lists and calls Open-Meteo once. No API key. | Network tab: a single request to `api.open-meteo.com` returning a 25-element array |
| **1.2** Calculate a risk score | `scoreDistrict()` in [lib/risk.ts](../lib/risk.ts) | See the worked example below |
| **1.3** Assign a risk band | `bandForScore()` and `RISK_BANDS` in [lib/risk.ts](../lib/risk.ts) | Switch the scenario to "Simulated monsoon": cards cross 30, 50 and 70, and their colour and advice change with them |
| **1.4** Display the highest-risk district | [components/hero-district.tsx](../components/hero-district.tsx), fed `board.districts[0]` (the API sorts descending) | Hero names the district, both rainfall totals, its band and its instruction |
| **1.5** Search districts | `visible` memo in [components/risk-board.tsx](../components/risk-board.tsx) — case-insensitive substring on name, province and basin | Type `kalu` → Kalutara (name) plus Ratnapura (Kalu Ganga basin) |
| **1.6** Filter by minimum risk band | Same memo, using `bandRank()` against the selected floor | On the monsoon scenario, pick "High and above" → Low and Moderate districts disappear and the count drops |
| **1.7** Refresh on demand | `load()` is bound to the Refresh button; `isPending` disables it | Button reads "Refreshing…", is unclickable, and the grid dims |
| **1.8** Handle failure | `catch` in `load()` clears the board and sets a named message; [components/board-states.tsx](../components/board-states.tsx) renders it with Retry | Block `api.open-meteo.com` in devtools, press Refresh → error card, not a blank page |
| **1.9** Report result counts | `BoardControls` shows "Showing X of 25"; `BoardEmpty` covers no matches | Search `zzz` → count reads 0 and the empty state appears |

## The scoring formula

```
score = min(rain24h / 100, 1) × 50      // short burst
      + min(rain72h / 250, 1) × 30      // sustained saturation
      + vulnerability        × 20       // standing exposure
```

Rounded to a whole number. The two rainfall terms are capped, so rain beyond
the cap does not keep pushing the score up.

**Why these weights.** The 24-hour term dominates because flash flooding in the
Kelani and Kalu basins follows a single very heavy day. The 72-hour term catches
the slower landslide case, where the ground is already saturated and a modest
extra fall is enough to move a slope. Vulnerability acts as a floor so a
district that always floods never reads as completely safe.

### Worked examples

| Input | Working | Score | Band |
| --- | --- | --- | --- |
| 0 mm / 24 h, 0 mm / 72 h, vulnerability 0.90 | 0 + 0 + 18 | **18** | Low |
| 150 mm / 24 h, 300 mm / 72 h, vulnerability 0.90 | 50 + 30 + 18 (both capped) | **98** | Severe |

### Bands

| Band | Score | Action |
| --- | --- | --- |
| Severe | 70+ | Move now |
| High | 50–69 | Prepare to move |
| Moderate | 30–49 | Stay alert |
| Low | under 30 | Normal conditions |

A score sitting exactly on a threshold lands in the higher band — 70 is Severe,
not High.

## Rainfall scenarios

Sri Lanka sits between monsoons for much of the year. On a calm September week
the live forecast correctly puts all 25 districts in the Low band — which makes
the warning logic impossible to show, because you cannot wait for a flood in a
four-hour demo.

The scenario selector scales the forecast rainfall before scoring:

| Scenario | Multiplier | What it represents |
| --- | --- | --- |
| Live forecast | ×1 | The real Open-Meteo forecast. The default, always. |
| Simulated monsoon | ×8 | A heavy south-west monsoon week. Chosen by testing every multiplier from 4 to 14 against a live forecast and keeping the one that filled all four bands at once. |
| Simulated extreme event | ×14 | The scale of the May 2017 Kalu Ganga floods. Pushes the wet zone to Severe. |

Two things make this honest rather than a fake:

1. It scales the **input** only. `scoreDistrict()` is never touched, so the
   formula being demonstrated is the real one.
2. Any non-live scenario renders an unmissable amber banner reading
   *"Simulated data — this is not a real warning"* with a one-click return to
   the live forecast. A deployed flood-warning page must never let an invented
   Severe alert pass as genuine.

Use "Simulated monsoon" for the demo: it is the setting that puts districts in
all four bands at once.

## Design decisions worth defending

**Scoring runs on the server, not in the browser.** The route handler at
`/api/risk` does the Open-Meteo call and the arithmetic, so the numbers come
from one place and the client stays a thin view. It also means the browser
makes one same-origin request instead of a cross-origin one.

**The hero ignores the search and filter.** Filtering the grid should not hide
the district in the most danger. `worst` is read from the unfiltered list.

**An error clears the board rather than keeping the old data.** Stale rainfall
presented as the current warning is more dangerous than showing nothing, so
`setBoard(null)` runs before the error is displayed. This is the behaviour
FR-1.8 asks for.

**`vulnerability` is a fixed input, not a prediction.** It encodes terrain,
drainage and flood history — the things that do not change between refreshes.
Only the rainfall half of the score moves.

## Data source

Open-Meteo forecast API, `daily=precipitation_sum`, `forecast_days=3`,
`timezone=Asia/Colombo`. Free, no API key, no registration. Rainfall figures
are theirs; the risk scores are ours.
