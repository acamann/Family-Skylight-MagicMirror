# MagicMirror Command Center Architecture

## Heart & Aim of this Repository
- establish and maintain a family dashboard built upon MagicMirror2 which can accomplish a DIY subset of the functionality, general aesthetic, & usability of the more expensive subscription-based Skylight Calendar - including family calendar and todo lists.
- Todo lists are delivered via AnyList: parents manage items in the AnyList app, kids check them off on the mirror, and both stay in sync via AnyList's websocket live-update channel.

## Core Stack & Environment
- **Engine**: MagicMirror2 (v2.38)
- **Git Remotes**: `origin` = upstream MagicMirrorOrg/MagicMirror (never push); `fork` = acamann/Family-Skylight-MagicMirror (push target for `main`).
- **Secrets Management**: Secrets loaded via `config/config.env` (gitignored), substituted into `config.js` as `${VAR_NAME}` placeholders (Do NOT use hardcoded calendar URLs or credentials in `config.js`). Currently holds `CAL_*` calendar ics URLs and the shared AnyList account (`ANYLIST_EMAIL`, `ANYLIST_PASSWORD`).
- **CSS Architecture**: Modular CSS. Core overrides and `--theme-*` design tokens live in `config/custom.css`, which imports the other `config/*.css` subsystem files. Module-specific styles live inside each module (e.g. `modules/MMM-AnyLists/MMM-AnyLists.css`).
- **User-Specific Config**: All user-specific customizations and custom styles should be isolated to `config/*`.  Do not update modules, etc which are common to the parent MagicMirror repo.
- **Modules are not tracked in this repo**: `.gitignore` excludes `/modules/*`. Third-party modules are plain git clones. `modules/MMM-AnyLists` is our own module with its own local git repo (GitHub remote to be added later).
- **Watcher**: Server watch targets are set in `config/config.js` watching `css/main.css`, `config/config.js`, `config/config.env`, `config/custom.css`, and the other `config/*.css` files for hot reloading.

## UI & Layout Philosophy
- **Layout Model**: Flexbox App Shell.
- **Sidebar**: Left vertical dock (`top_left` region fixed at 50px width, `z-index: 9999`).
- **Main Workspace**: Shifts left by 50px (`calc(100vw - 50px)`) using Flexbox for tiled module views.
- **Theme**: Clean, high-contrast, touch-friendly light theme (white background, dark typography).
- **Touch Input**: The mirror is tap-driven (page-indicator dots, AnyLists item check-off). The empty `fullscreen above` region must always stay `pointer-events: none` (enforced in `config/custom.css`) — it overlays the entire workspace and silently swallows every tap if made interactive.

## Page & Navigation Architecture
- **MMM-pages**: Manages tabbed views using 2D arrays (`modules: [ ["ModuleA"], ["ModuleB", "ModuleC"] ]`).
- **Current pages** (4): page 0 = `MMM-CalendarExt3Journal` (rolling timeline), page 1 = `MMM-CalendarExt3` (4-week grid), page 2 = `MMM-AnyLists` (kids' todo lists), page 3 = `MMM-MLB` (live playoffs bracket).
- **MMM-page-indicator**: Fixed to `top_left` as the sidebar dock for touch navigation; its `pages` count must match the MMM-pages page count (currently 4).

## Key Module References
- `MMM-CalendarExt3Journal`: Rolling timeline schedule view (currently `days: 6`).
- `MMM-CalendarExt3`: Calendar grid view (`mode: "week"`, `weeksInView: 4`, instanceId `fourWeekCalendar`).
- `MMM-AnyLists`: Kids' todo lists — three AnyList lists (Daniel / Luke / Ben) side-by-side in `fullscreen_below`. Tapping an item toggles `checked` in AnyList (optimistic strike-through, reconciled by websocket `lists-update`); checked items stay visible struck-through until removed in the app. One shared AnyList login lives in its `node_helper`; all AnyList operations are serialized through an `async` queue of concurrency 1. PRD: `docs/MMM-AnyLists.md`.
- `MMM-pages`: Background tab state manager.
- `MMM-MLB`: Live MLB postseason bracket with series standings, refreshed every 3 hours from the official Stats API (`https://statsapi.mlb.com/api/v1/schedule?...`). `view: 'bracket'` is the only view for now; a `standings` view is planned for next season. PRD: `docs/MMM-MLB.md`.
- a local copy of Module README documentation exists in `docs/*` for your reference
