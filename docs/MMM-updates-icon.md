# MMM-updates-icon — Product Requirements Document

## Overview

`MMM-updates-icon` is a custom MagicMirror² module that replaces the
full-width `updatenotification` banner with a **single yellow exclamation
icon pinned to the bottom of the left nav panel**. Tap the icon and a popover
listing the outdated modules appears; tap again to dismiss it.

Update detection and scanning stay in the stock MagicMirror `updatenotification`
module — this module is purely a front-end display of the update info that
module broadcasts.

## Goals

- [ ] Show one yellow `!` button at the bottom of the left sidebar
      (`top_left` region), styled to match the existing nav-panel touch
      squares (same size, border separators, touch feedback).
- [ ] Display nothing when no module updates are pending.
- [ ] React to the `updatenotification` `UPDATES` broadcast: icon appears
      when outdated modules are reported.
- [ ] Tapping the icon opens a popover card (next to the sidebar) listing each
      outdated module and how many commits behind it is; tapping again
      dismisses it.
- [ ] The icon stays visible on all pages (add to `MMM-pages` `fixed` list).
- [ ] Hide the original full-width banner (`.module.updatenotification`).

## Non-goals (v1)

- Performing updates from the popover (`git pull` is still done manually /
  by `updatenotification`'s update feature).
- Dismissing the alert permanently (the icon reflects the latest non-empty
  scan result; if the last pending update is cleared, a browser reload clears
  the icon since no further `UPDATES` broadcast fires — documented limitation).
- Styled integration with the `alert` toast module.

## Configuration

```js
// config/config.js
{
  module: 'MMM-updates-icon',
  position: 'top_left',     // same region as MMM-page-indicator; pinned to
                            // the bottom of the dock via CSS `margin-top: auto`
  config: {
    animationSpeed: 0
  }
},
{
  module: 'updatenotification',
  position: 'top_bar',
  config: {
    ignoreModules: ['MagicMirror'],   // core repo check incompatible w/ fork
    sendUpdatesNotifications: true    // broadcast "UPDATES" for our module
  }
},
// MMM-pages fixed list must include 'MMM-updates-icon' so page changes
// don't hide it.
```

## Functional Requirements

| # | Requirement |
|---|---|
| F1 | Render nothing (empty wrapper) until the first `UPDATES` notification arrives. |
| F2 | Render a yellow square button (75px, dock-style) in the bottom of the left sidebar when ≥ 1 outdated module is reported. |
| F3 | Tap toggles the detail popover; popover lists module name and "N commit(s) behind `<tracking>`". |
| F4 | Icon remains on page 0, 1, 2 (fixed module class for MMM-pages). |
| F5 | Old full-width `updatenotification` banner hidden via CSS. |
| F6 | Popover appears to the right of the sidebar, above fullscreen calendar modules (z-index). |

## Technical Requirements

| # | Requirement |
|---|---|
| T1 | Single `MMM-updates-icon.js`, no `node_helper`, no npm deps — listens for the frontend `UPDATES` notification broadcast by `updatenotification` when `sendUpdatesNotifications: true`. |
| T2 | Payload shape comes from `git_helper.checkUpdates()`: `[{ module, behind, current, tracking, isBehindInStatus, ... }]`. |
| T3 | Popover state (`open`/`closed`) is local to the module; `updateDom` re-renders after toggle. |
| T4 | Own local git repo (`git init`), no GitHub remote yet. |
| T5 | Module CSS pins the wrapper to the bottom of the `top_left` flex column and sizes the button to match `--nav-sidebar-width`. |

## Styling

- Module CSS ships only generic defaults: a small light-yellow rounded
  button with a dark refresh glyph and a light popover card — usable
  everywhere.
- Users override the look via their own config CSS (for this repo,
  `config/updates-icon.css`) to match the nav panel: nav-blue square
  (`--nav-sidebar-bg: #49536A`), soft yellow (`#f7e9a8`) glyph, dock
  sizing, bottom-pinned.
- Popover is `position: fixed` at the bottom, immediately right of the nav
  sidebar (`left: calc(var(--nav-sidebar-width) + 8px)`).

## Open Questions / Future

- Add a "Update now" action in the popover that triggers
  `updatenotification`'s update flow (it already has the plumbing).
- Clear-icon UX when all updates are resolved without a reload — would
  require `updatenotification` to broadcast an empty set (upstream change).
