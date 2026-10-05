# MMM-AnyLists — Product Requirements Document

## Overview

`MMM-AnyLists` is a MagicMirror² module (adapted from upstream
[`codetheweb/MMM-AnyList`](https://github.com/codetheweb/MMM-AnyList)) that
displays **three AnyList todo lists side-by-side on one panel** — one per kid —
and allows kids to **tap an item to check it off directly on the mirror**.

Checking an item on the mirror writes back to AnyList, so:

- Parents manage the lists from the AnyList mobile/web app.
- Kids check items off on the mirror.
- Both apps stay in sync via AnyList's live update channel.

## Goals

- [ ] Display 3 AnyList lists (one per kid) on the third page of the mirror.
- [ ] Parents add/edit/remove items in the AnyList app; changes appear on the
      mirror within seconds (AnyList websocket-driven refresh), no mirror edits
      required.
- [ ] Kids tap an item on the mirror to toggle its checked state; the change is
      persisted to AnyList (`item.checked` + `item.save()`), and the item stays
      visible as **struck-through / dimmed** until manually removed in the
      AnyList app.
- [ ] One AnyList login per mirror (single shared family account), not one
      login per list/instance.
- [ ] Credentials loaded from `config/config.env` (`${ANYLIST_EMAIL}`,
      `${ANYLIST_PASSWORD}`) — never hardcoded in `config.js`.
- [ ] Light, high-contrast, touch-friendly styling consistent with the
      existing `config/custom.css` theme.

## Non-goals (v1)

- Adding/deleting/renaming items from the mirror.
- Per-kid AnyList accounts or separate logins.
- Hiding checked items automatically (checked items persist struck-through
  until parents remove them in the AnyList app).
- Recipes, grocery categories, or AnyList features beyond list items.

## Configuration

```js
{
  module: 'MMM-AnyLists',
  position: 'fullscreen_below',
  config: {
    email: '${ANYLIST_EMAIL}',
    password: '${ANYLIST_PASSWORD}',
    lists: ['Daniel', 'Luke', 'Ben'], // exact AnyList list names, one column each
    refreshOnExternalChange: true,     // websocket-driven reload (default true)
    maxItemsPerList: 0,                // 0 = unlimited
    textAlign: 'left',
    showQuantities: false,
    columnSeparator: true,
  }
}
```

## Functional Requirements

| # | Requirement |
|---|---|
| F1 | One module instance renders all configured lists as equally-width columns. |
| F2 | Column header shows the AnyList list name. |
| F3 | Each item row is a tap target sized for touch (≥ 40px tall). |
| F4 | Tapping an item toggles checked state, persists to AnyList, and immediately updates the local UI (optimistic strike-through), later reconciled by the live-refresh event. |
| F5 | Checked items render struck-through and dimmed, and remain in place until removed in the AnyList app. |
| F6 | Items added/removed/checked in the AnyList app appear on the mirror without restart (websocket `lists-update`). |
| F7 | Login errors surface in the UI as a small error message and are logged server-side. |
| F8 | Concurrent interactions are serialized through the helper queue (prevent AnyList login/update errors from parallel requests). |

## Technical Requirements

| # | Requirement |
|---|---|
| T1 | Based on upstream MMM-AnyList code: reuse its `node_helper` login, queue, and websocket plumbing; rename module to `MMM-AnyLists`. |
| T2 | Node helper owns the `anylist` client instance; front-end communicates only via socket notifications (`INIT`, `TOGGLE_ITEM`, `LIST_DATA`, `ANYLIST_ERROR`). |
| T3 | Toggle payload carries `{listId, identifier}`; helper locates the live `Item` instance, flips `checked`, calls `save()`. |
| T4 | No per-instance duplicate logins — the three lists are loaded from one `AnyList` client. |
| T5 | Dependencies: `anylist`, `async` (queue); installed via `npm install` in `modules/MMM-AnyLists`. |
| T6 | Module has its own git repo (local `git init` now, GitHub remote added later). |
| T7 | Secrets only via env; `config.js` uses `${ANYLIST_EMAIL}` / `${ANYLIST_PASSWORD}`. |

## Page Integration

- `MMM-pages` third page becomes `["MMM-AnyLists"]`.
- `MMM-page-indicator` updated from `pages: 2` to `pages: 3`.
- Watcher `watchTargets` unchanged (CSS changes in `config/*` are already
  watched; module CSS changes trigger MM server reload).

## Styling

- Light theme (white background, dark text), matching `config/custom.css`.
- Three-column flex row, thin vertical separators between columns.
- Each row: circular checkbox affordance + item name; checked = line-through,
  40–50% opacity, filled checkbox.
- Font size readable from several feet away (~18–20px item text).

## Open Questions / Future

- Exact AnyList list names for the 3 columns (confirm with user before final
  config).
- Optional "add item" input per column (kiosk keyboard) — out of scope for v1.
- Per-kid color accents matching calendar colors (Daniel/Luke/Ben) — nice-to-have.
