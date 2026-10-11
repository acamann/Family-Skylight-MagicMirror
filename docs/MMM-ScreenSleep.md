# MMM-ScreenSleep — Product Requirements Document

## Overview

`MMM-ScreenSleep` is a MagicMirror² module that **powers the attached display
down when nobody is using the mirror**, and brings it back on automatically.

It renders nothing on screen. All scheduling happens in the browser (the Pi's
kiosk Chromium); `node_helper` runs the single command that changes the power
state.

The mirror is a hallway display that runs all day. Leaving the panel lit at full
brightness overnight is the single largest waste in the setup, and the backlight
is also the main contributor to burn-in on an always-on LCD. This module blanks
it properly — a real DPMS Off, not a black rectangle drawn over the UI.

Module lives in its own repo: `modules/MMM-ScreenSleep`.

## Goals

- [ ] Blank the display after **2 hours** of no interaction during the day.
- [ ] Blank it much sooner overnight — after **5 minutes** — between **22:00**
      and **06:00**, so the screen is not glowing in a dark hallway.
- [ ] Turn the display back on automatically at **06:45** every day, so it is
      already showing the calendar when the first person walks past.
- [ ] Wake on **any touch**, at any hour.
- [ ] Power the panel down properly via DPMS rather than hiding the UI, so the
      backlight actually turns off.
- [ ] Survive a client reload or server restart without leaving the panel stuck
      black.

## Non-goals

- Hiding or dimming MagicMirror content while the screen is on. DPMS blanks the
  panel; nothing needs hiding behind a CSS overlay.
- Content-aware sleep scheduling. The panel really does power down, so there is
  nothing to suspend.
- Backlight dimming between the off and on states.
- Any dependency on a PIR sensor, camera, GPIO, or root privileges.
- Supporting other display servers. See [Why `wlr-randr`](#why-wlr-randr-and-not-xset).

## Configuration

```js
{
  module: "MMM-ScreenSleep",
  position: "fullscreen_above",
  config: {
    dayIdleTimeout: 2 * 60 * 60 * 1000,
    nightIdleTimeout: 5 * 60 * 1000,
    nightStart: "22:00",
    nightEnd: "06:00",
    wakeAt: "06:45",
    wakeOnTouch: true,
    wlrOutput: "HDMI-A-1",
    waylandDisplay: "wayland-0"
  }
}
```

Must also appear in `MMM-pages`' `fixed` array — otherwise a page change hides
the module and the idle timer stops running.

No secrets, so nothing in `config/config.env`. It is in `updatenotification`'s
`ignoreModules` because its git remote is private and pm2 has no credentials.

## Behaviour

### Which timeout applies

Re-evaluated on **every tick**, not fixed at bedtime. A mirror left untouched at
21:59 blanks at 22:04 rather than sitting until 23:59.

### Wake sources

| Source | Behaviour |
| --- | --- |
| Touch / click / key | Wakes the panel if off; otherwise just resets the idle timer. |
| `wakeAt` schedule | Fires only while the panel is off, and only on a `wakeAt` that falls **after** it went to sleep. |

A scheduled wake is checked *before* the idle timeout while off. Without that
ordering the panel could never return unattended, since it is off precisely when
nobody is touching it.

### Why "is it past wakeAt?" is wrong

The first implementation asked exactly that, and it was wrong. The question is
true for all of 06:45–24:00, so a panel blanking at 21:00 was woken on the very
next 5-second tick and never stayed off. Field logs showed it plainly:

```
21:15:48  display power off
21:15:53  display power on
```

The rule is now: fire when there is a `wakeAt` that is both **after** `sleptAt`
and **at or before** now. A panel that slept at 02:00 is owed 06:45; one that
slept at 21:00 is owed nothing until the morning. The occurrence is built from
the calendar day rather than by adding 24 hours, so a daylight-saving change
cannot drift the wake.

### Reload and restart

`start()` asks for power on unconditionally. A reload while the panel is blanked
would otherwise leave it blanked: the new instance starts with
`screenOff = false` and never asks. It also recovers a panel stranded by a failed
blank.

### Result classification

A command that exits 0 while refusing on stderr counts as a failure. Not
hypothetical — `xset dpms force off` prints *"server does not have extension"*
and exits 0, and trusting the exit code made a failed blank log as a clean one.

## Architecture

```
MMM-ScreenSleep.js   tick loop, idle accounting, time-of-day windows
        │  socket notifications
        ▼
node_helper.js       the only process that runs wlr-randr
        │
        ▼
wlr-randr --output HDMI-A-1 --off | --on   →   labwc → DPMS
```

Scheduling stays client-side so the module has one clock — the Pi's own — and
`node_helper` stays a thin, auditable wrapper around one command.

### Why `wlr-randr` and not `xset`

`:0` is **Xwayland `-rootless`**, a compatibility shim layered on the compositor
so X11 apps still run. It has no hardware access and no DPMS extension. Three
other routes were tried on this hardware and all are dead ends:

| Mechanism | Result |
| --- | --- |
| `xset dpms force off` | *"server does not have extension"* — and it exits 0 |
| DRM sysfs `dpms` / `enabled` | Registered read-only by `vc4-hdmi`; the kernel rejects the write before permissions apply, so `sudo` and `chmod` change nothing |
| `ddcutil setvcp 96` | EDID reads succeed but DDC writes time out — the far end is a capture adapter (`GRHDMI`), which has no power control |
| `vcgencmd display_poweroff` | Firmware video service not registered |

`wlr-randr --off` is the only one that reaches the hardware, because the wlroots
compositor owns the display. It needs no root: the Wayland socket belongs to the
same user that runs MagicMirror.

An earlier version carried four backends with runtime probing. It picked `xset`
after a restart, `xset` silently did nothing, and the panel stayed lit while the
logs said otherwise. One mechanism, one code path.

## Placement

`position: "fullscreen_above"`, and listed in `MMM-pages`' `fixed` array.

The `fullscreen_above` region is forced to `pointer-events: none` in
`config/custom.css`, and the module's own node is `display: none`, so it cannot
swallow taps aimed at the `top_right` nav dock.

## Verification

```bash
pm2 logs magicmirror --lines 20
```

Healthy startup is two lines and nothing else:

```
MMM-ScreenSleep: ready, controlling HDMI-A-1 via wlr-randr
MMM-ScreenSleep: HDMI-A-1 restored
```

Then, with no interaction for the applicable timeout:

```
MMM-ScreenSleep: HDMI-A-1 blanked
```

and on a tap:

```
MMM-ScreenSleep: woke (activity)
MMM-ScreenSleep: HDMI-A-1 restored
```

To confirm the compositor responds by hand:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u) WAYLAND_DISPLAY=wayland-0
wlr-randr --output HDMI-A-1 --off
wlr-randr --output HDMI-A-1 --on
```

Note `--auto` does not exist in this build of `wlr-randr`; the module uses `--on`,
so the panel may take a second or two to resync on wake.

Automated:

```bash
cd modules/MMM-ScreenSleep && npm test
```

Both source files are evaluated in a `vm` context by the harnesses in
`tests/helpers/`, with a controllable clock. Neither is directly importable: the
browser module needs a `Module.register` global, and `node_helper.js` begins with
a `require` of a bare specifier only the MagicMirror server can resolve.

The boundary arithmetic is the behaviour most worth locking down, because an
off-by-one there silently costs a whole night of a lit screen:

- Untouched at 21:59 → blanks at **22:04**, not 23:59.
- Woken at 06:00 → blanks at **08:00**, not 06:05.
- Scheduled wake at 06:45 restarts the idle clock, so the next blank is 2h after
  the wake rather than 2h after the last touch of the previous day.
- One physical tap fires `registerActivity` twice (Chromium emits `touchstart`
  then a synthetic `mousedown`) and must wake exactly once.
- A panel that blanks at 07:00, 14:00, 21:00 or 23:00 must stay off.

When writing new tests: **move the clock forward only.** Winding it backwards
makes `isPastWakeTime` true and takes the scheduled-wake branch, which reads as
an idle-timeout bug.

## Open questions

- `nightEnd` is 06:00 while `wakeAt` is 06:45. The panel therefore stays dark
  until 06:45 by design. If it should come back at 06:00, set
  `nightEnd: "06:45"` so the quiet window closes with the wake.
- After 06:45 the idle clock restarts from the wake, so an untouched mirror
  blanks again at 08:45. Whether that is wanted is a judgement call about the
  morning routine.