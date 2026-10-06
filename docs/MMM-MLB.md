# MMM-MLB — Product Requirements Document

## Overview

`MMM-MLB` is a MagicMirror² module that displays the **current MLB postseason
bracket with live series standings** (e.g. "Brewers lead 2-0", "Series tied
1-1", "Dodgers win series 4-2", plus the next game time). Data comes from the
official MLB Stats API and refreshes on a slow interval (default: every 3
hours) so the mirror stays current without hammering the API.

The module is structured so it can be reused next season for related views:

- `view: 'bracket'` (v1) — playoff bracket with series standings.
- `view: 'standings'` (planned) — regular-season standings.
- `view: 'scores'` (planned) — latest game info.

## Goals

- [ ] Show every active/completed postseason series grouped by round
      (Wild Card / Division / Championship / World Series), AL vs NL split.
- [ ] Each series card shows both teams, their win counts in the series, and a
      one-line status: series winner, who's leading, tied, or not started,
      plus the next game's number and start time (or LIVE).
- [ ] Update automatically on a configurable interval (default 3 hours).
- [ ] Light, high-contrast styling consistent with `config/custom.css`.
- [ ] No API key required (official MLB Stats API is public).

## Non-goals (v1)

- Regular-season standings view (planned future `view`).
- Box scores / pitch-by-pitch detail.
- Team logos/colors beyond the neutral theme tokens.

## Configuration

```js
{
  module: 'MMM-MLB',
  position: 'fullscreen_below',
  config: {
    season: 2026,                       // MLB season year
    updateInterval: 3 * 60 * 60 * 1000, // refresh every 3 hours
    view: 'bracket',                    // only 'bracket' works for now
    animationSpeed: 0
  }
}
```

## Functional Requirements

| # | Requirement |
|---|---|
| F1 | Node helper polls `statsapi.mlb.com` for `gameType=F,D,L,W` games of the configured season. |
| F2 | Games are grouped into series (same pair of teams + same gameType); each team's wins counted from `Final` games. |
| F3 | Series cards are ordered by round (WC → D → L → WS), then AL before NL. |
| F4 | Status line: "X win series 4-2" when complete; "X lead 2-0" / "Series tied 1-1" / "Series not started" otherwise, followed by "· Game N <day> <time>" or "· Game N LIVE" when a next game exists. |
| F5 | Winner highlighted and eliminated team dimmed once a series is decided. |
| F6 | Errors (network/HTTP) surface in the UI and are logged server-side. |
| F7 | Footer shows the last successful refresh time. |

## Technical Requirements

| # | Requirement |
|---|---|
| T1 | Uses global `fetch` (Node 22) — no npm dependencies. |
| T2 | Front-end communicates via socket notifications `INIT` → `MLB_DATA` / `MLB_ERROR`. |
| T3 | Helper caches nothing between refreshes; every interval re-fetches the full schedule. |

## Page Integration

- `MMM-pages` gets a fourth page: `["MMM-MLB"]`.
- `MMM-page-indicator` `pages` count goes from 3 to 4.

## Open Questions / Future

- Add `view: 'standings'` (regular season standings per division) next season.
- Add `view: 'scores'` (today's final/live scores) next season.
- Team logo rendering via MLB CDN (`/api/v1/teams/{id}/logo.svg`).
