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
- **Modules are not tracked in this repo**: `.gitignore` excludes `/modules/*`. Every module is a separate git clone with its own remote, and all of them live under `acamann/` on GitHub — our own modules (`MMM-AnyLists`, `MMM-ScreenSleep`, `MMM-MLBPlayoffs`, `MMM-Refresh`) as standalone repos on `master`. Nothing under `modules/` is committed here, so a fresh clone needs each module cloned separately.
- **Watcher**: Server watch targets are set in `config/config.js` watching `css/main.css`, `config/config.js`, `config/config.env`, `config/custom.css`, and the other `config/*.css` files for hot reloading.

## UI & Layout Philosophy
- **Layout Model**: Flexbox App Shell.
- **Sidebar**: Right vertical dock (`top_right` region fixed at `--nav-sidebar-width`, `z-index: 9999`). Both the dock and its buttons size off `--nav-sidebar-width` / `--nav-icon-size` in `config/custom.css`.
- **Main Workspace**: Shrinks by the dock width (`calc(100vw - var(--nav-sidebar-width))`) and is inset from the right edge (`right: var(--nav-sidebar-width)`) using Flexbox for tiled module views.
- **Theme**: Clean, high-contrast, touch-friendly light theme (white background, dark typography).
- **Touch Input**: The mirror is tap-driven (page-indicator dots, AnyLists item check-off). The empty `fullscreen above` region must always stay `pointer-events: none` (enforced in `config/custom.css`) — it overlays the entire workspace and silently swallows every tap if made interactive.

## Page & Navigation Architecture
- **MMM-pages**: Manages tabbed views using 2D arrays (`modules: [ ["ModuleA"], ["ModuleB", "ModuleC"] ]`).
- **Current pages** (4): page 0 = `MMM-CalendarExt3Journal` (rolling timeline), page 1 = `MMM-CalendarExt3` (4-week grid), page 2 = `MMM-AnyLists` (kids' todo lists), page 3 = `MMM-MLBPlayoffs` (live playoffs bracket).
- **MMM-page-indicator**: Fixed to `top_right` as the sidebar dock for touch navigation; its `pages` count must match the MMM-pages page count (currently 4).

## Key Module References
- `MMM-CalendarExt3Journal`: Rolling timeline schedule view (currently `days: 6`).
- `MMM-CalendarExt3`: Calendar grid view (`mode: "week"`, `weeksInView: 4`, instanceId `fourWeekCalendar`).
- `MMM-AnyLists`: Kids' todo lists — three AnyList lists (Daniel / Luke / Ben) side-by-side in `fullscreen_below`, under a configurable `header` ("To Do") whose right side holds a show/hide-checked toggle. Tapping an item toggles `checked` in AnyList (optimistic update, reconciled by websocket `lists-update`); checked items are **hidden by default** (revealed ones render struck-through) and the visibility choice persists in `localStorage`. One shared AnyList login lives in its `node_helper`; all AnyList operations are serialized through an `async` queue of concurrency 1. Own repo: `https://github.com/acamann/MMM-AnyLists.git`. PRD: `docs/MMM-AnyLists.md`.
- `MMM-pages`: Background tab state manager.
- `MMM-ScreenSleep`: Blanks the display via `wlr-randr` after 2h idle by day, 5m between 22:00–06:00; scheduled wake at 06:45, plus wake on any touch. Scheduling is client-side; `node_helper` runs `wlr-randr` against the labwc compositor (`:0` is Xwayland -rootless and has no hardware access, so `xset`/DPMS cannot blank this panel). **Must stay in `MMM-pages`' `fixed` array**, or page changes stop the idle timer. Own repo: `https://github.com/acamann/MMM-ScreenSleep.git`. PRD: `docs/MMM-ScreenSleep.md`.
- `MMM-MLBPlayoffs`: Live MLB postseason bracket with series standings, refreshed hourly (every 15 min while a game is live) from the official Stats API (`https://statsapi.mlb.com/api/v1/schedule?...`). Repo: `https://github.com/acamann/MMM-MLBPlayoffs.git`. `view: 'bracket'` is the only view for now; a `standings` view is planned for next season. PRD: `docs/MMM-MLBPlayoffs.md`.
- `MMM-Refresh`: A dimmed reload glyph at the **bottom of the nav dock, centred horizontally** on the dock's vertical axis so it lines up with the four page icons above it (44px touch target, 26px glyph at `opacity: 0.45`, 10px bottom inset, no hairline and no full-bleed background so it still reads as chrome and not a fifth page). Tapping it spins the glyph once and calls `location.reload()` after `reloadDelay` — the fast way to recover a mirror whose websocket has gone quiet. Must stay in `MMM-pages`' `fixed` array. Registered **after** `MMM-updates-icon` so it renders last in the dock. It owns the dock's `margin-top: auto` slot (the flex-column slot for the bottom edge), so `config/updates-icon.css` sets `margin-top: 0` — two auto margins would split the leftover space and float both off the bottom. Icon is a Material Symbols *outlined* `refresh`, colocated in the module folder. Centring is `justify-content: center` plus zero horizontal padding — `flex-start` or asymmetric padding skews it (measured: `padding-left + button/2 − dock/2`), and hand-computed padding would drift whenever `--nav-sidebar-width` or `iconSize` changes. Lives in `modules/MMM-Refresh` (JS + CSS + `refresh.svg`). Repo: `https://github.com/acamann/MMM-Refresh.git`.
- a local copy of Module README documentation exists in `docs/*` for your reference
