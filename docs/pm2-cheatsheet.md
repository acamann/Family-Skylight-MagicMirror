# pm2 Cheat Sheet

Reference for running MagicMirror² under [pm2](https://pm2.keymetrics.io/) on the
Raspberry Pi, where the mirror's `server:watch` mode was previously run by hand.

All commands assume you're in the project directory and running as the user that
owns it (`acamann`). Avoid `sudo pm2` — it creates root-owned files in `logs/`
and `~/.pm2`.

## Current Setup

The process is started directly from `serveronly/watcher.js`, which is exactly
what `npm run server:watch` runs:

```bash
pm2 start ./serveronly/watcher.js --name magicmirror --kill-timeout 3000
```

Starting the file directly instead of `npm run server:watch` keeps the process
tree shallow:

```
pm2 -> node ./serveronly/watcher.js -> node ./serveronly
```

vs. going through npm:

```
pm2 -> npm -> node --run -> node ./serveronly/watcher.js -> node ./serveronly
```

That extra nesting is where orphaned children holding port 8080 tend to come
from after a `pm2 stop`. It also lets `watcher.js:256` receive the SIGINT pm2
sends by default, which cleanly kills the server child.

`pm2 status` will show `watching disabled`. That column refers to pm2's own
file watcher and is unrelated to MagicMirror's — watching happens inside
`watcher.js` and works regardless.

## Daily Commands

| Task | Command |
| --- | --- |
| List processes | `pm2 status` |
| Tail logs (both streams) | `pm2 logs magicmirror` |
| Last 40 lines, then follow | `pm2 logs magicmirror --lines 40` |
| Restart after editing server- or module-side code | `pm2 restart magicmirror` |
| Restart without dropping connections | `pm2 reload magicmirror` |
| Refresh open browsers | `curl http://localhost:8080/reload` |
| Stop (keeps the saved entry) | `pm2 stop magicmirror` |
| Remove from pm2 entirely | `pm2 delete magicmirror` |
| Zero-downtime restart of all | `pm2 reload all` |
| List saved processes | `pm2 save --list` |
| Memory / CPU usage | `pm2 monit` |

`pm2 logs` exits with `Ctrl-C`. That only detaches from the log; the process
keeps running.

## Surviving a Reboot

`pm2 startup` installs the systemd unit. It does **not** save your process
list — without `pm2 save` the unit resurrects nothing on boot.

```bash
pm2 startup
# run the printed sudo env PATH=... command verbatim
pm2 save
```

Check what will come back:

```bash
systemctl status pm2-acamann
pm2 save --list
```

To remove the boot unit: `pm2 unstartup systemd`.

## Module Edits

Files in `config.watchTargets` are handled by the server-side watcher. Files
under `modules/` are not — nothing restarts for them, so a module edit needs:

```bash
pm2 restart magicmirror
```

The restart alone does not refresh open browsers; nothing requests `/reload` on
startup. Refresh the tab by hand, or ask the server to broadcast it:

```bash
curl http://localhost:8080/reload
```

That endpoint emits `RELOAD` over socket.io (`js/server.js:161`), which every
connected client acts on at `js/main.js:605`, so the Pi's browser and any remote
tab refresh together.

## Verifying Watch Mode Is Live

```bash
pm2 logs magicmirror --lines 30
```

Expect `Watch mode enabled. Watching 10 file(s)` followed by one
`Watching file: ...` line per target. If you see the `no watchTargets are
configured` warning from `watcher.js:226`, the config path is wrong.

## What Watch Mode Covers

`watchTargets` in `config/config.js` drives this. The current list covers
`css/main.css`, `config/config.js`, `config/config.env`, and several files under
`config/`.

On change, `watcher.js` restarts the server and requests `/reload`
(`js/server.js:161`), which emits `RELOAD` over socket.io. Every connected
client picks it up at `js/main.js:605` and calls `window.location.reload()`.
The Pi's browser and any remote tab both refresh on their own, provided both
tabs stay open.

View remotely at `http://<pi-ip>:8080`. The config binds `0.0.0.0` with an
empty `ipWhitelist`, so no change is needed for LAN access. If the port is
blocked: `sudo ufw allow 8080/tcp`.

### Not Covered

Files outside `watchTargets` — including everything under `modules/`
(`MMM-AnyLists`, `MMM-CalendarExt3`, `MMM-CalendarExt3Journal`, `MMM-MLB`,
`MMM-page-indicator`, `MMM-pages`, `MMM-updates-icon`) — reach the Pi but never
trigger a reload on their own. See [Module Edits](#module-edits) above.

`watcher.js` watches individual files only; `watcher.js:245` rejects
directories. Listing a whole module directory in `watchTargets` will not work.

## How the Project Directory Is Reached

`~/MagicMirror` is a local `ext4` directory on the Pi (`/dev/mmcblk0p2`). Windows
reaches it over SMB as `M:\`.

This matters for watch mode. `fs.watch` relies on inotify, which is unreliable
when the *watching* machine reads files over a network mount. Not the case here:
the watched inode is local ext4, and SMB writes arrive through the Pi's VFS like
any other write, so events fire normally. There is no sync latency either — the
file is already the Pi's file the moment you save it.

Node also reads `node_modules` at native disk speed rather than over the
network. Running the server with `node_modules` on a mounted share is the slow,
pathological case; this setup avoids it.

Practical implication: edit on `M:\` as normal, leave both browser tabs open, and
reloads happen on their own. Editors that save atomically (temp file, then
rename) work fine — `watcher.js:189` watches the parent directory and filters on
filename specifically to handle that.

## Troubleshooting

**Port 8080 still occupied after a stop.** A child survived.

```bash
ss -ltnp | grep -w 8080
sudo fuser -k -TERM 8080/tcp
```

**Find the process tree.**

```bash
ps -eo pid,ppid,cmd | grep -E "serveronly|server:watch" | grep -v grep
```

To kill one, match both patterns. The npm wrapper's command line reads
`npm run server:watch` and does not contain `serveronly`, so it needs its own
match:

```bash
kill <npm-pid>; pkill -f "serveron[l]y"; sleep 1; pkill -9 -f "serveron[l]y"
```

**Why the bracket in `"serveron[l]y"`?** Over ssh, a plain `pkill -f serveronly`
also matches the remote `bash -c` process running that very command and kills
your own shell. Brackets break the self-match.

**Logs.** On disk at `~/.pm2/logs/magicmirror-out.log` and
`magicmirror-error.log`.

```bash
tail -n 100 ~/.pm2/logs/magicmirror-error.log
pm2 flush magicmirror   # truncate
```