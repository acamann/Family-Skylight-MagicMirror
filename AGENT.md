# MagicMirror Command Center Architecture

## Heart & Aim of this Repository
- establish and maintain a family dashboard built upon MagicMirror2 which can accomplish a DIY subset of the functionality, general aesthetic, & usability of the more expensive subscription-based Skylight Calendar - including family calendar and todo lists.

## Core Stack & Environment
- **Engine**: MagicMirror2 (v2.37+)
- **Secrets Management**: Secrets loaded via `config.env` using `process.env.VAR_NAME` (Do NOT use hardcoded calendar URLs in `config.js`).
- **CSS Architecture**: Modular CSS. Core overrides live in `config/custom.css`.
- **User-Specific Config**: All user-specific customizations and custom styles should be isolated to `config/*`.  Do not update modules, etc which are common to the parent MagicMirror repo. 
- **Watcher**: Server watch targets are set in `config/config.js` watching `css/custom.css`, `config/config.js`, etc. for hot reloading.

## UI & Layout Philosophy
- **Layout Model**: Flexbox App Shell.
- **Sidebar**: Left vertical dock (`top_left` region fixed at 50px width, `z-index: 9999`).
- **Main Workspace**: Shifts left by 50px (`calc(100vw - 50px)`) using Flexbox for tiled module views.
- **Theme**: Clean, high-contrast, touch-friendly light theme (white background, dark typography).

## Page & Navigation Architecture
- **MMM-pages**: Manages tabbed views using 2D arrays (`modules: [ ["ModuleA"], ["ModuleB", "ModuleC"] ]`).
- **MMM-page-indicator**: Fixed to `top_left` or `bottom_bar` for touch navigation.

## Key Module References
- `MMM-CalendarExt3Journal`: 5-day rolling timeline schedule view.
- `MMM-CalendarExt3`: Full month grid calendar view.
- `MMM-pages`: Background tab state manager.
- a local copy of Module README documentation exists in `docs/*` for your reference