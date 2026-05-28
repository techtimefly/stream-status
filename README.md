# Maestro

A self-hosted homelab app for managing live-stream segments, tasks, and notes, with OBS browser-source overlays and a full OBS WebSocket integration. Maestro is your show-running console — prep the rundown, then conduct the stream live.

Runs on any Linux server with Python 3.11+. Three ways to run it — pick whichever fits your setup.

> **Note:** This project's directory, systemd unit, and on-disk paths are still named `stream-status` (its original name). Renaming filesystem paths is risky on a live deploy and not necessary — only the user-facing brand changed.

---

## Stack

| Layer | Detail |
|---|---|
| Backend | Python 3.11 · Flask · Gunicorn (2 workers) |
| Frontend | Vanilla JS · no build step · no npm |
| Persistence | JSON files at `/var/lib/stream-status/projects/` |
| Reverse proxy | nginx — serves static files, proxies `/api/` to Flask, WebSocket proxy to OBS |
| Process manager | systemd · Docker · or run directly |

---

## Getting started

```bash
git clone https://github.com/techtimefly/stream-status.git
cd stream-status
```

---

## Option A — Run directly (simplest)

Requires Python 3.11+ on the host. Handles venv creation and dependency install automatically on first run.

```bash
chmod +x run.sh
./run.sh
```

The app starts on `http://localhost:5000`. Data is written to `/var/lib/stream-status/projects/` by default — override with `DATA_DIR`:

```bash
DATA_DIR=~/stream-data ./run.sh
```

To keep it running in the background:

```bash
# Using tmux (recommended)
tmux new-session -d -s stream-status './run.sh'

# Or nohup
nohup ./run.sh > stream-status.log 2>&1 &
```

---

## Option B — Docker Compose (easiest, no Python required)

Requires Docker with the Compose plugin.

```bash
docker compose up -d
```

The app runs on `http://localhost:5000`. Project data is persisted in a named Docker volume (`stream-data`). To stop:

```bash
docker compose down
```

---

## Option C — systemd service (persistent, runs on boot)

Best for a dedicated server or homelab VM/LXC where you want the app to survive reboots.

**1 — Install Python and nginx** (Debian/Ubuntu):

```bash
# Python 3.11 is in the default repos on Ubuntu 24.04+
# On Ubuntu 22.04, add the deadsnakes PPA first:
# sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.11 python3.11-venv nginx
```

**2 — Copy files into place** (run as root):

```bash
# Backend
sudo mkdir -p /opt/stream-status
sudo cp app.py /opt/stream-status/

# Static files
sudo mkdir -p /var/www/stream-status
sudo cp index.html style.css script.js obs-websocket.js \
        overlay.html overlay.css overlay.js /var/www/stream-status/

# Data directory
sudo mkdir -p /var/lib/stream-status/projects
sudo chown -R <SERVICE_USER>:<SERVICE_USER> /var/lib/stream-status
```

**3 — Set up the virtualenv** (run as root):

```bash
sudo python3.11 -m venv /opt/stream-status/venv
sudo /opt/stream-status/venv/bin/pip install flask gunicorn
sudo chown -R <SERVICE_USER>:<SERVICE_USER> /opt/stream-status
```

Edit `deploy/stream-status-api.service` and set `User=` to your service user, then:

```bash
sudo cp deploy/stream-status-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now stream-status-api
```

**4 — Configure nginx**

Edit `deploy/nginx-stream-status.conf` — replace `YOUR_DOMAIN_OR_IP` and (if using OBS WebSocket proxy) `STREAMING_PC_IP`, then:

```bash
sudo cp deploy/nginx-stream-status.conf /etc/nginx/sites-available/stream-status
sudo ln -s /etc/nginx/sites-available/stream-status /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The OBS WebSocket proxy block (`/obs-ws`) is optional — remove it from the nginx config if you're not using OBS integration.

---

## (Optional) Configure AI provider

Copy `.env.example` to `.env` (or `/opt/stream-status/.env` for systemd) and fill in your key(s). The app runs fine without it — AI features are simply disabled.

```bash
cp .env.example .env
# edit .env, then restart the app
```

---

## Verify

```bash
curl http://localhost:5000/api/capabilities   # Options A & B
curl http://localhost/api/capabilities        # Option C (nginx on port 80)
# → {"aiTips": false, "provider": null}
```

---

## Make targets

For convenience, common tasks are available via `make`:

```bash
make install   # create venv and install dependencies
make run       # start gunicorn in the foreground (same as ./run.sh)
make service   # install and enable the systemd unit (requires root)
make logs      # follow systemd service logs
```

---

## File layout

```
/opt/stream-status/
  app.py                    Flask API
  venv/                     Python virtualenv
  .env                      Optional: AI provider config (see AI features)

/var/www/stream-status/
  index.html                Main app shell (Plan / Live / Setup tabs)
  style.css                 Main app styles
  script.js                 Main app logic + Router + Style system
  layout-builder.js         Layout builder editor & inspector
  obs-websocket.js          obs-websocket-js v5 UMD bundle (self-hosted)
  overlay.html              OBS overlay shell (minimal)
  overlay.css               Overlay widget styles (CSS custom-property driven)
  overlay.js                Overlay logic, view functions, style resolution

/var/lib/stream-status/
  projects/<uuid>.json      One file per project (persistent)
  active.json               Pointer to the currently active project
  global-layouts.json       Cross-project layouts (created on first save)
  global-styles.json        Cross-project styles (created on first save)

/etc/systemd/system/
  stream-status-api.service Gunicorn service unit

/etc/nginx/sites-available/
  stream-status             nginx vhost config (includes /obs-ws WebSocket proxy)
```

---

## Service management

```bash
# Status
systemctl status stream-status-api

# Restart after backend changes
systemctl restart stream-status-api

# Logs
journalctl -u stream-status-api -f
```

nginx is managed separately:

```bash
nginx -t              # test config before reloading
systemctl reload nginx
```

---

## Updating

Static files (HTML/CSS/JS) — copy to `/var/www/stream-status/`, no restart needed.  
Backend (`app.py`) — copy to `/opt/stream-status/`, then `systemctl restart stream-status-api`.

---

## REST API

Base URL: `http://<SERVER_IP>/api`

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects` | List all projects (summary fields only) |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:id` | Get full project document |
| `PUT` | `/projects/:id` | Replace full project document |
| `DELETE` | `/projects/:id` | Delete project, returns 204 |
| `PUT` | `/projects/:id/obs-stats` | Write OBS stream health stats (called by app every 5 s when connected) |
| `GET` | `/active` | Returns `{"projectId": "<uuid>"}` for the currently active project |
| `PUT` | `/active` | Set the active project — body: `{"projectId": "<uuid>"}` |
| `GET` | `/capabilities` | AI provider status — `{"aiTips": bool, "provider": "ollama"\|"anthropic"\|null}` |
| `POST` | `/generate-tips` | Generate 8 lower-third tips for a segment topic |
| `POST` | `/generate-segments` | Generate a 5–7 segment plan for a project |
| `POST` | `/suggest-tasks` | Suggest 5–6 tasks for a specific segment |
| `POST` | `/generate-writeup` | Generate a YouTube-style stream description |
| `GET` | `/layouts` | List global layouts (cross-project) |
| `POST` | `/layouts` | Create or upsert a global layout — body must include `id` |
| `GET` | `/layouts/:id` | Get a single global layout |
| `PUT` | `/layouts/:id` | Update a global layout |
| `DELETE` | `/layouts/:id` | Delete a global layout, returns 204 |
| `GET` | `/styles` | List global styles |
| `POST` | `/styles` | Create or upsert a global style — body must include `id` |
| `GET` | `/styles/:id` | Get a single global style |
| `PUT` | `/styles/:id` | Update a global style |
| `DELETE` | `/styles/:id` | Delete a global style, returns 204 |

`PUT` is a full replace — the frontend always sends the entire project object. `createdAt` is preserved server-side; `updatedAt` is stamped on every write.

All AI endpoints return `503` if no provider is configured, `400` if required fields are missing. They try Anthropic first, then Ollama.

---

## Project document schema

```jsonc
{
  "id": "uuid",
  "name": "OPNsense Deep Dive",
  "description": "...",
  "focus": "VLAN segmentation",
  "platform": "OPNsense / FreeBSD",
  "notes": "free-form stream notes...",
  "liveStartedAt": "2026-05-25T18:00:00Z",   // null when offline
  "countdownTo": "2026-05-25T19:00:00Z",      // null when unset
  "countdownLabel": "Stream starts in",

  // OBS integration fields (all optional, written by the app)
  "obsTimerPausedDuration": 300,              // cumulative BRB seconds excluded from timer
  "obsBrbPausedAt": null,                     // ISO string when BRB is active, null otherwise
  "highlights": [                             // logged when ★ is clicked during stream
    { "at": "2026-05-25T18:42:10Z", "segment": "VLAN Setup" }
  ],
  "obsStats": {                               // written every 5 s while OBS is connected
    "updatedAt": "2026-05-25T18:30:00Z",
    "kbps": 6000,
    "droppedFramesPct": 0.01,
    "renderLagMs": 0.5,
    "fps": 59.94,
    "cpuPct": 12.3
  },

  "social": {
    "twitch": "yourhandle",
    "youtube": "yourchannel",
    "github": "yourusername",
    "discord": "Your Server",
    "twitter": "yourhandle",
    "website": "https://example.com"
  },

  // Stream style (optional — defaults to Minimal preset look if absent)
  "activeStyleId": "preset-synthwave",         // preset id, global-<n>, or style-<n>
  "styles": [                                  // project-scoped style library
    { "id": "style-1716700000000", "name": "My custom",
      "font": "Inter", "accent": "#60a5fa", "text": "#ffffff",
      "surface": "rgba(0,0,0,0.7)", "border": "rgba(255,255,255,0.1)",
      "borderRadius": 12, "borderWidth": 1, "padding": 16,
      "glow": true, "shadow": false }
  ],

  "segments": [
    {
      "key": "1716652800000",   // Date.now() string — stable ID
      "title": "Intro & goals",
      "description": "Optional detail shown in app",
      "done": false,
      "doneAt": null,           // ISO string when marked done, null otherwise
      "duration": 15,           // Planned duration in minutes, null if unset
      "obsScene": "Main",       // OBS scene name — auto-switches when next segment becomes active
      "tips": [
        "OPNsense is based on HardenedBSD",
        "Firewall rules are stateful by default"
      ]
    }
  ],
  "tasks": [
    {
      "id": "1716652900000",
      "text": "Configure VLAN 20",
      "completed": false,
      "completedAt": null
    }
  ],
  "createdAt": "2026-05-25T17:00:00Z",
  "updatedAt": "2026-05-25T18:30:00Z"
}
```

---

## Tabs and routing

The app is organized into three workflow-aligned tabs, each backed by a real URL so they're bookmarkable and survive browser back/forward.

| Route | Tab | Purpose |
|---|---|---|
| `/p/<uuid>/plan`  | **Plan**  | Pre-stream prep — project hero, segments, tasks, notes, countdown |
| `/p/<uuid>/live`  | **Live**  | Operator control surface — large timer, current/next segment, OBS scene picker, BRB indicator, highlight (★), open-task counter, OBS stream health |
| `/p/<uuid>/setup` | **Setup** | Project details, OBS connection, Stream style, overlay sources, layout builder, reset-progress |

Hitting `/` redirects to the last-used project's Plan view. Direct navigation to any route works (nginx falls back to `index.html` for unmatched paths). Switching tabs is instant — all three views are in the DOM and CSS-toggled by `body[data-view="X"]`.

A slim **live strip** at the top of Plan/Setup shows the current segment, timer and open-task count whenever the stream is live; it's hidden on the Live tab (which already shows everything at full size).

### Reset progress

The Setup tab has a **Reset progress** button (in the Project details panel) that clears all `done`/`completed` flags, the live timer (`liveStartedAt`, `streamStartedAt`, `obsTimerPausedDuration`, `obsBrbPausedAt`) and the `highlights` log. Segments, tasks, notes, social, OBS settings, and the project metadata are preserved. Intended for dry-run testing without re-creating the project.

---

## Main app features

### Projects
Multiple independent projects (workspaces). The last-used project is remembered in `localStorage`. Switch or create projects via the **Switch project** button.

### Stream segments
Ordered checklist of stream sections. Mark done as you progress. Inline progress bar tracks completion. Each segment supports a description, planned duration, lower-third tips, and an OBS scene name.

**Drag-to-reorder** — grab the ⠿ handle on any segment card and drag it to a new position. The reordered list is saved immediately.

**Planned duration** — set an optional duration (minutes) on each segment. Once you Go Live, each segment card shows elapsed time vs planned. The active segment updates every second; done segments show actual time taken with an over/under indicator.

#### Add Segment wizard

Clicking **+ Segment** opens a 3-step wizard designed for pre-stream prep:

| Step | Fields | AI (if configured) |
|---|---|---|
| 1 — Details | Title, description, planned duration, OBS scene | — |
| 2 — Tips | Lower-third tips textarea | Auto-generates 8 tips on entry if textarea is empty |
| 3 — Tasks | Task checklist for this segment | Auto-suggests 5–6 tasks on entry |

- **Back / Skip** available on steps 2 and 3. Skip goes to the next step without generating or saving.
- On step 3, clicking **Add segment** commits any checked tasks to the task list and saves the segment in one action.
- The **pencil (edit) icon** on an existing card opens a flat view with all three panels visible at once — lower friction for quick mid-stream edits.

#### OBS scene field

The **OBS scene** field in step 1 (and the edit modal) controls automatic scene switching. When OBS is connected, this field becomes a **dropdown populated live from OBS** — no typing, no typos. When OBS is disconnected it falls back to a plain text input.

The name must match your OBS scene name exactly (case-sensitive).

#### Generate segment plan

When a project has no segments and an AI provider is configured, a **✦ Generate segment plan** button appears. It proposes a 5–7 segment structure based on the project name, description, focus, and platform. A preview modal shows each proposed segment with checkboxes — uncheck anything you don't want.

Two add options appear at the bottom of the preview:

- **Add selected** — saves the chosen segments immediately.
- **✦ Add & Set Up Tips** — saves the segments and opens the **Set up lower thirds** modal, which fires tip generation for all segments simultaneously (parallel API calls). Each segment row shows live progress and a confirmation once done.

#### Card nudges

Any segment card with no tips shows an inline **✦ Generate tips** button directly on the card. Clicking it generates and saves tips without opening any modal.

### Task list
Ad-hoc task tracking with three filter views (All / Open / Done). Tasks record a `completedAt` timestamp when checked, used by the "Recently completed" overlay.

Tasks are global to the project. The **✦ Suggest** button in wizard step 3 (or the edit modal) generates 5–6 segment-specific tasks as a selectable checklist.

### Stream timer
**Go Live** starts an elapsed timer (HH:MM:SS) stored as `liveStartedAt` on the project. **End Stream** clears it. The timer survives page refreshes.

When OBS is connected, **Go Live** and **End Stream** are also triggered automatically by OBS stream start/stop events — you don't need to click the button if you start streaming from OBS directly.

**BRB pause** — when OBS switches to the designated BRB scene the timer pauses automatically. It resumes when OBS switches away. Paused time is tracked cumulatively so the elapsed time always reflects actual on-air time, not wall-clock time.

**✦ Write-up** — once at least one segment is marked done and an AI provider is configured, a **✦ Write-up** button appears alongside the timer. Click it to generate a YouTube-style stream description (3–4 paragraphs). The result opens in a modal with a **Copy to clipboard** button. Stream duration and completed segment list are sent automatically as context.

### Countdown
Set a target date/time and an optional label (e.g. "Back in", "Next stream"). Displays remaining time; shows "Time's up!" when expired. Cleared with the ✕ button.

### Live strip
A slim bar at the top of the Plan and Setup tabs shows the current segment name, live elapsed timer, and open task count — visible whenever a stream is live, hidden on the Live tab (which already displays everything at full size).

### Navigation

A pill-style tab nav in the global header switches between **Plan**, **Live**, and **Setup**. Tab clicks push real URLs (`/p/<id>/<view>`), so browser back/forward works and the Live tab is bookmarkable on a second monitor. See **Tabs and routing** above for details.

### Themes (app chrome)

Five accent color presets are available via the dot picker in the global header. The choice is saved to `localStorage` and applied before the first paint. **This only affects the app UI** — see **Stream styles** for what viewers see in the overlays.

| Theme | Accent |
|---|---|
| Teal (default) | Emerald green |
| Purple | Violet |
| Orange | Amber |
| Blue | Cyan |
| Red | Rose |

### Notes
Free-form textarea, auto-saved 800 ms after you stop typing.

### Social links
Set per-project via **Edit Project**: Twitch, YouTube, GitHub, Discord, X/Twitter, Website. Each field is prefixed with the platform's brand icon (inline SVG, no CDN). The `view=social` overlay renders the same icons in place of text labels; icon color follows the active stream style's accent.

---

## OBS WebSocket integration

The app connects to OBS via WebSocket v5 (built into OBS 28+) through an nginx proxy. This enables two-way communication: the app can control OBS, and OBS events update the app in real time.

### How the connection works

OBS WebSocket runs on the **streaming PC** at port `4455`. Browser pages served over HTTPS cannot connect directly to a local `ws://` endpoint (mixed content). The solution is an nginx WebSocket proxy:

```
Browser (HTTPS) → wss://<YOUR_DOMAIN>/obs-ws → nginx proxy → ws://<STREAMING_PC_IP>:4455 → OBS
```

The nginx block (e.g. `/etc/nginx/sites-enabled/<YOUR_DOMAIN>`):

```nginx
location /obs-ws {
    proxy_pass http://<STREAMING_PC_IP>:4455;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

Update `<STREAMING_PC_IP>` if the streaming PC's IP changes, then `systemctl reload nginx`.

### OBS setup

1. In OBS: **Tools → WebSocket Server Settings** → enable WebSocket server, port `4455`, set a password (optional but recommended).
2. In the stream status app: click the **OBS** badge in the top bar to open settings.
3. Enter the WebSocket password (if set) and enable the connection. The badge turns green when connected.

**Reconnection** — the app reconnects automatically with exponential backoff (2 s → 30 s max) if OBS restarts or the connection drops.

### OBS settings fields

| Field | Description |
|---|---|
| **Password** | OBS WebSocket password. Leave blank if authentication is disabled. |
| **Streaming PC IP** | Informational only — update the nginx `proxy_pass` separately if the IP changes. |
| **BRB scene** | Scene name that triggers timer pause (e.g. `BRB Screen`). |
| **Ignored scenes** | Comma-separated scene names that won't move the active segment indicator (e.g. `Starting Soon, End Screen`). |
| **Lower thirds text source** | Name of an OBS text source to push the active segment title to instantly on each transition (e.g. `Segment Title`). Leave blank to disable. |

### Scene switching (app → OBS)

Assign an **OBS scene** to each segment. When you mark a segment done, the app automatically calls `SetCurrentProgramScene` for the *next* unfinished segment's scene. No manual scene clicks needed during the stream.

Example segment→scene mapping:

| Segment | OBS scene |
|---|---|
| Intro & goals | `Starting Soon` |
| VLAN setup | `Main` |
| Break | `BRB Screen` |
| Testing | `Main` |
| Wrap-up | `Just Chatting` |

### Reverse scene sync (OBS → app)

When you switch a scene **manually in OBS** (or via Stream Deck / hotkey), the app detects the `CurrentProgramSceneChanged` event and updates the active segment indicator:

- The matching segment card gets a blue `▶` marker and a blue border.
- The list scrolls it into view.
- If a **lower thirds text source** is configured, the segment title is pushed to that OBS source immediately.

Scenes listed in **Ignored scenes** are skipped — switching to `Starting Soon` or `End Screen` won't move the indicator. Done state is never touched by reverse sync; you still control that manually.

### Lower thirds text source push

When configured, every segment transition — whether triggered by marking done in the app or by switching scenes in OBS — pushes the new segment's title to the configured OBS text source via `SetInputSettings`. This is instant (no poll cycle) and works even if the browser source overlay is offline.

**Setup in OBS:**
1. Add a **Text GDI+** (Windows) or **Text (FreeType 2)** (Linux/Mac) source to your scene.
2. Name it exactly what you type in the **Lower thirds text source** field (e.g. `Segment Title`).
3. Save in the app. From that point, every segment transition updates the source automatically.

### BRB timer pause

Set a **BRB scene** name in OBS settings. When OBS switches to that scene:
- The stream timer pauses automatically.
- The timer widget shows "BRB" in amber.
- A toast notification confirms the pause.

When OBS switches away from the BRB scene, the timer resumes. Accumulated BRB time is stored in `obsTimerPausedDuration` and subtracted from all timer calculations — elapsed time always reflects on-air time only.

### Stream health overlay

While OBS is connected, the app polls OBS every 5 seconds for stream stats and writes them to the project via `PUT /api/projects/:id/obs-stats`. The `view=health` overlay widget reads these on its normal poll cycle.

Stats collected: bitrate (kbps), dropped frames (%), render lag (ms), FPS, CPU usage (%).

The health widget uses colour thresholds:
- Dropped frames > 0.5% → amber warning
- Dropped frames > 2% → red alert

### Highlight logger

When live and OBS is connected, each segment card shows a **★** button. Clicking it:
1. Appends a timestamped entry to `project.highlights` (segment name + ISO time).
2. Calls `SaveReplayBuffer` on OBS — saves the last N seconds of footage (requires Replay Buffer to be running in OBS output settings).

Use this to mark moments worth clipping. The `highlights` array in the project JSON gives you the exact times relative to stream start.

### What each event does

| Trigger | App action | OBS action |
|---|---|---|
| Start streaming in OBS | Sets `liveStartedAt`, starts timer | — |
| Stop streaming in OBS | Clears `liveStartedAt`, stops timer | — |
| Switch to BRB scene in OBS | Pauses timer | — |
| Switch away from BRB in OBS | Resumes timer | — |
| Switch to any other scene in OBS | Moves `▶` indicator to matching segment, pushes title to text source | — |
| Mark segment done in app | Saves `doneAt` | Switches to next segment's scene, pushes title to text source |
| Click ★ highlight in app | Logs timestamp | Saves replay buffer |

---

## OBS overlay sources

Open the **OBS overlay sources** section at the bottom of the main app to get copy-paste URLs for each widget. Add each as a **Browser Source** in OBS and enable **Allow transparency**.

### Universal vs Pinned mode

Toggle between the two modes with the **Universal / Pinned** button at the top of the overlay section.

| Mode | URL format | Behaviour |
|---|---|---|
| **Universal** (default) | `http://<SERVER_IP>/overlay.html?view=<view>` | Follows whichever project is currently active. Switching projects in the app updates all universal widgets automatically. |
| **Pinned** | `http://<SERVER_IP>/overlay.html?project=<uuid>&view=<view>` | Locked to a specific project UUID. Useful when running multiple projects simultaneously. |

### Inline widget controls

Each overlay card in the app has inline controls that update the URL in real time. Settings are saved to `localStorage` per widget type.

| Control | Options | Notes |
|---|---|---|
| **bg** | `none` · `green` · `magenta` | `none` = transparent (default). `green`/`magenta` for chroma key. |
| **size** | `sm` · `md` · `lg` | Font/element size scale. Default: `md`. |
| **interval** *(Lower thirds only)* | number (seconds) | Tip rotation interval. Default: 8 s. |
| **show** *(Lower thirds only)* | number (seconds) | How long a tip stays visible before fading. Blank = always on. |

### Common URL parameters

| Param | Default | Description |
|---|---|---|
| `view` | `segments` | Which widget to render |
| `bg` | `transparent` | `green` or `magenta` for chroma key |
| `size` | `md` | Font size: `sm`, `md`, `lg` |
| `poll` | `5` | API refresh interval in seconds (min 3) |
| `style` | (none) | Style id to apply — a preset slug, a global style id, or a project-scoped style id. Overrides `project.activeStyleId`. See **Stream styles** below. |

---

### Views

#### `view=segments` — Segment list
All segments with done/pending indicators and a progress bar.  
Recommended OBS size: **360 × auto**

#### `view=tasks` — Open task list
Pending tasks only, auto-refreshes.  
Recommended OBS size: **360 × auto**

#### `view=current` — Current segment
Active segment title + description + "Up next" hint.  
Recommended OBS size: **500 × auto**

#### `view=progress` — Progress bar
Compact single-bar view of segment completion percentage.  
Recommended OBS size: **500 × 80**

#### `view=timer` — Stream timer
Elapsed time since Go Live (HH:MM:SS). Shows OFFLINE when not live, BRB in amber when paused.  
Recommended OBS size: **260 × 80**

#### `view=countdown` — Countdown
Time remaining to the configured countdown target. Shows "Time's up!" when expired.  
Recommended OBS size: **300 × 90**

#### `view=social` — Social / CTA
Configured social handles displayed as a panel.  
Recommended OBS size: **320 × auto**

#### `view=transition` — Just did / Up next
Side-by-side split showing the last completed segment and the next pending one.  
Recommended OBS size: **560 × auto**

#### `view=done` — Recently completed tasks
Last 4 completed tasks, sorted by completion time.  
Recommended OBS size: **360 × auto**

#### `view=health` — Stream health
Live stream stats sourced from OBS via the WebSocket integration: bitrate, dropped frames, render lag, FPS, CPU. Values colour-coded by severity. Shows stale indicator if stats haven't updated in 15 s.  
Recommended OBS size: **360 × auto**

#### `view=lowerthird` — Lower thirds
Rotating tips/facts sourced from the active segment's tips list. Automatically advances to the current segment's tips when you mark one done.

**Additional parameters:**

| Param | Default | Description |
|---|---|---|
| `interval` | `8` | Seconds between tip rotations (min 3) |
| `show` | *(always on)* | Seconds each tip stays visible before fading out |
| `transition` | `slide` | `slide` — tip slides up + fades in. `fade` — pure opacity crossfade. |

Example — tip visible for 6 s, dark for 9 s, pure fade, 15 s cycle:
```
?view=lowerthird&interval=15&show=6&transition=fade
```

Recommended OBS size: **620 × auto**

---

## Stream styles

Overlays read their look (font, accent color, surface, border, padding, glow, text shadow) from a small style object. Three tiers, lowest → highest precedence:

| Tier | Where it lives | When it applies |
|---|---|---|
| **Default** | Built-in CSS values in `overlay.css` (= Minimal preset) | Always, unless overridden |
| **Project active** | `project.activeStyleId` | When `?project=<id>` is in the overlay URL |
| **Explicit** | `?style=<id>` query param | Beats project active for that URL |
| **Per-widget** | `widget.params.styleId` inside a layout-builder layout | Beats everything for that one widget |

Manage styles in the **Setup tab → Stream style** panel: pick from the **Active style** dropdown (Presets / Global / Project sections), click **Edit active** to open the editor, or **+ New style** to create a project-scoped one.

### Preset styles (shipped)

| Slug | Look |
|---|---|
| `preset-minimal`   | Current default — neutral surface, blue accent, system font |
| `preset-broadcast` | Solid dark, bold blue, Inter, drop-shadow text |
| `preset-synthwave` | Translucent black, pink accent, Space Grotesk, accent glow |
| `preset-newsroom`  | Sharp corners, red accent, Roboto Slab, shadow text |
| `preset-terminal`  | Mono, green-on-black, JetBrains Mono, hairline border |

Presets are read-only — use the **Save as global** button in the editor to clone one into a global style you can edit. Google Fonts referenced by a style are lazily injected as a single `<link>` per font when the overlay first loads.

### Style editor

Open via Setup → **Edit active**. Two-column layout:

- **Form (left)**: name, font dropdown, accent + text color pickers (with paired hex inputs), surface and border (color swatch + 0–100% opacity slider — slide opacity to 0 for transparent), border-radius / border-width / padding sliders, glow and text-shadow toggles.
- **Live preview (right)**: a mini "current segment" card rendered with the style applied; updates on every input change.

The form `Save` button writes back to wherever the style lives — project-scoped styles save into `project.styles[]`, global styles save through `/api/styles`. **Save as global** clones the current form data into a new global style. Live overlays update on their next poll cycle.

### Style scoping options chosen

- **Universal overlay URLs** (`?view=X` with no `project=`) ignore project styles. To style them, pass `?style=<id>` explicitly.
- **Project-scoped overlays** (`?project=<uuid>&view=X`) inherit `project.activeStyleId` by default.

### Per-widget styles (layout builder)

In the layout builder, each widget instance has an optional **Style** field in its inspector. When set, that widget renders with the chosen style regardless of the layout's project-level style. The editor header also has an **Apply style to all…** dropdown that bulk-sets every widget in the layout to the chosen style (or clears overrides).

Useful for mixed looks — e.g. a `preset-synthwave` timer alongside a `preset-minimal` task list in the same layout.

---

## Adding tips to a segment

**1 — Add Segment wizard (step 2)**  
Auto-generates 8 tips if the textarea is empty and an AI provider is configured.

**2 — Edit modal**  
Click the pencil icon → **Lower-third tips** panel → **✦ Generate** button. One tip per line.

**3 — Card nudge**  
Segment cards with no tips show an inline **✦ Generate tips** button. No modal required.

---

## AI features

When an AI provider is configured, the following generation features are available:

| Feature | Where | What it does |
|---|---|---|
| ✦ Generate segment plan | Empty segments area | Proposes a 5–7 segment structure for the project |
| ✦ Add & Set Up Tips | Plan preview modal | Saves plan segments and generates tips for all in parallel |
| ✦ Generate (tips) | Wizard step 2 / edit modal | Writes 8 lower-third facts for the segment topic |
| ✦ Suggest (tasks) | Wizard step 3 / edit modal | Suggests 5–6 actionable tasks for the segment |
| ✦ Generate tips (nudge) | Segment card (no tips) | Generates and saves tips inline without a modal |
| ✦ Write-up | Timer area (when segments done) | Generates a YouTube-style stream description |

The backend tries providers in priority order:

| Priority | Provider | Config required |
|---|---|---|
| 1 | Anthropic (Claude Haiku) | `ANTHROPIC_API_KEY` env var |
| 2 | Ollama (local) | `OLLAMA_BASE_URL` + Ollama running on the network |

`GET /api/capabilities` returns `{"aiTips": true, "provider": "ollama"}` when a provider is available.

---

### Option A — Ollama (free, local, recommended for homelab)

**Expose Ollama on the LAN** (edit `/etc/systemd/system/ollama.service`):

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

```bash
systemctl daemon-reload && systemctl restart ollama
```

**Configure the LXC** (replace `<LXC_ID>` with your container ID):

```bash
printf 'OLLAMA_BASE_URL=http://<OLLAMA_HOST_IP>:11434\nOLLAMA_MODEL=gemma4\n' | \
  sudo /usr/sbin/pct exec <LXC_ID> -- tee /opt/stream-status/.env
sudo /usr/sbin/pct exec <LXC_ID> -- chmod 600 /opt/stream-status/.env
sudo /usr/sbin/pct exec <LXC_ID> -- systemctl restart stream-status-api
```

**Verify:** `curl http://<SERVER_IP>/api/capabilities` → `{"aiTips": true, "provider": "ollama"}`

---

### Option B — Anthropic API

```bash
echo 'ANTHROPIC_API_KEY=sk-ant-your-key-here' | \
  sudo /usr/sbin/pct exec <LXC_ID> -- tee /opt/stream-status/.env
sudo /usr/sbin/pct exec <LXC_ID> -- chmod 600 /opt/stream-status/.env
sudo /usr/sbin/pct exec <LXC_ID> -- systemctl restart stream-status-api
```

**Verify:** `curl http://<SERVER_IP>/api/capabilities` → `{"aiTips": true, "provider": "anthropic"}`

---

### Both providers

Both keys can coexist in `.env`. Anthropic takes priority when `ANTHROPIC_API_KEY` is set:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
OLLAMA_BASE_URL=http://<OLLAMA_HOST_IP>:11434
OLLAMA_MODEL=gemma4
```

The `EnvironmentFile=-/opt/stream-status/.env` line in the systemd unit loads variables at startup. The `-` prefix means the service starts normally if the file is absent — AI tips are simply disabled.
