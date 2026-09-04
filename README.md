# FloodWatch LK

Live flood and landslide risk for all 25 districts of Sri Lanka, scored from
public rainfall forecasts and turned into one instruction a household can act on.

SLIIT · SE3090 Software Engineering Frameworks · Assignment 2 Mini Hackathon

- **Deployed application:** _TODO — paste the Vercel URL here_
- **Demonstration video:** _TODO — paste the OneDrive link here_

## The problem

Sri Lanka floods twice a year on a schedule. The south-west monsoon fills the
Kelani and Kalu river basins between May and September; the north-east monsoon
soaks the Eastern Province from December to February. The same districts fail
the same way each time — Ratnapura goes under water, Kegalle and Nuwara Eliya
slide, and Kolonnawa and Kelaniya back up because the drains cannot discharge
into a full river.

The May 2016 landslide at Aranayake in Kegalle took more than a hundred lives.
A year later the Kalu Ganga floods displaced hundreds of thousands across
Ratnapura, Kalutara, Galle and Matara. **Both events were forecast.** Heavy
rainfall warnings were published before the water arrived.

The gap is not prediction, it is translation. Official bulletins give regional
rainfall figures — "falls above 150 mm in the Sabaragamuwa Province" — and a
household has to work out for itself whether that means watch, pack, or leave.
People who have been flooded before over-read it and lose days of work. People
who have not under-read it and leave too late.

### Who it is for

- Families in low-lying wards of **Ratnapura and Kalutara** along the Kalu Ganga.
- Estate and smallholder households on the slopes of **Kegalle, Nuwara Eliya and
  Badulla**, where a third wet day matters more than a heavy first one.
- **Grama Niladhari officers**, who decide when to open a safe centre and would
  rather read one ranked list than 25 separate forecasts.

## The solution

One request to the Open-Meteo forecast API returns three days of rainfall for
all 25 district capitals. Each district is scored out of 100:

```
score = min(rain24h / 100mm, 1) × 50    // short burst — flash flooding
      + min(rain72h / 250mm, 1) × 30    // saturation — landslide trigger
      + vulnerability           × 20    // terrain, drainage, flood history
```

Each score maps to one of four bands, and each band carries a specific
instruction rather than a colour alone:

| Band | Score | Action |
| --- | --- | --- |
| Severe | 70+ | Move now |
| High | 50–69 | Prepare to move |
| Moderate | 30–49 | Stay alert |
| Low | under 30 | Normal conditions |

## Main features

**1. Live District Risk Board** — every district scored and ranked from live
forecasts, with the highest-risk district raised to the top of the page.
Searchable by district, province or river basin; filterable by minimum band;
refreshable on demand, with proper loading, error and empty states.

Because Sri Lanka is between monsoons for much of the year, the board also
offers **simulated rainfall scenarios**, so the Severe and High bands can be
exercised without waiting for a flood. Simulations scale the forecast input
only — the scoring formula is untouched — and any non-live scenario shows a
prominent "this is not a real warning" banner.
Details: [docs/feature-1-risk-board.md](docs/feature-1-risk-board.md)

_TODO — Feature 2 (Oshadhi, `feature/water-report`)_

_TODO — Feature 3 (Hasaranga, `feature/safe-centres`)_

## Technologies used

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Route handlers let us keep the scoring server-side and the client thin |
| Language | TypeScript | The scoring inputs and band ids are easy to get wrong untyped |
| Styling | Tailwind CSS v4 | Responsive layout and dark mode without a separate stylesheet to maintain |
| Data | [Open-Meteo](https://open-meteo.com/) forecast API | Free, no API key, accepts all 25 coordinates in one request |
| Hosting | Vercel | Native Next.js target; route handlers deploy without configuration |

## Running it locally

```bash
git clone https://github.com/IT24102850/hackathon.git
cd hackathon
npm install
npm run dev
```

Open <http://localhost:3000>. No environment variables or API keys are needed —
Open-Meteo is public.

```bash
npm run build   # production build
npm run lint    # eslint
```

> **On the SLIIT network,** `registry.npmjs.org` is blocked by TLS
> interception, which makes `npm install` fail with `403 Forbidden`. Install
> through the mirror instead:
> `npm install --registry=https://registry.yarnpkg.com`

## Team and contributions

> Written by each member in their own words, as the assignment requires.

| Member | Student ID | Branch | Contribution |
| --- | --- | --- | --- |
| Hasiru | _TODO_ | `feature/risk-board` | _TODO — in your own words_ |
| Oshadhi | _TODO_ | `feature/water-report` | _TODO — in your own words_ |
| Hasaranga | _TODO_ | `feature/safe-centres` | _TODO — in your own words_ |

## AI usage declaration

> Required by section 2.3 of the assignment. Every member must be able to
> explain the code attributed to them. **Check this list is complete and
> accurate before submitting** — an undeclared dependency found during the demo
> is treated as a breach.

- **Claude (Claude Code)** — generated the initial component structure, the
  `/api/risk` route handler and the Tailwind styling for the district risk
  board. We set the scoring weights and the per-district vulnerability values
  ourselves, verified the formula against the two worked examples in
  [docs/feature-1-risk-board.md](docs/feature-1-risk-board.md), and tested the
  error and empty states by blocking the API in devtools.

_TODO — add a line for every other AI tool any member used, or state
explicitly that no others were used._

## Disclaimer

This is a student project. Risk scores are our own calculation, not an official
forecast, and do not replace warnings from the Disaster Management Centre or the
National Building Research Organisation. In an emergency call **117**.
