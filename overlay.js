/* v3 — layout builder support */
const params      = new URLSearchParams(location.search);
const VIEW        = params.get('view')       || 'segments';
const BG          = params.get('bg')         || 'transparent';
const PROJECT_ID  = params.get('project')    || '';
const SIZE        = params.get('size')       || 'md';
const POLL_S      = Math.max(3, parseInt(params.get('poll') || '5', 10));
const TRANSITION  = params.get('transition') || 'slide';
const SHOW_S      = params.get('show') ? Math.max(1, parseInt(params.get('show'), 10)) : null;
const LAYOUT_ID   = params.get('layout')     || '';

if (BG === 'green')   document.body.classList.add('bg-green');
if (BG === 'magenta') document.body.classList.add('bg-magenta');
document.body.classList.add(`size-${SIZE}`);

async function fetchProject() {
  let pid = PROJECT_ID;
  if (!pid) {
    try {
      const res = await fetch('/api/active');
      if (res.ok) { const d = await res.json(); pid = d.projectId; }
    } catch {}
  }
  if (!pid) return null;
  try {
    const res = await fetch(`/api/projects/${pid}`);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Time helpers ───────────────────────────────────────────────── */
function formatElapsed(startIso) {
  const secs = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function formatElapsedPaused(startIso, pausedDuration, pausedAt) {
  let secs = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
  secs -= (pausedDuration || 0);
  if (pausedAt) secs -= Math.floor((Date.now() - new Date(pausedAt).getTime()) / 1000);
  secs = Math.max(0, secs);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${String(s).padStart(2, '0')}s`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '00')}`;
}

/* ── Views ─────────────────────────────────────────────────────── */
function viewSegments(p) {
  const segs = p.segments || [];
  const done = segs.filter(s => s.done).length;
  const pct  = segs.length ? Math.round((done / segs.length) * 100) : 0;
  return `
    <div class="panel view-segments">
      <div class="panel-header">
        <span class="panel-title">${esc(p.name)}</span>
        <span class="panel-meta">${done} / ${segs.length} done</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      <div class="item-list">
        ${segs.length
          ? segs.map(s => `
              <div class="item${s.done ? ' item--done' : ''}">
                <span class="item-icon">${s.done ? '✓' : '○'}</span>
                <span class="item-text">${esc(s.title)}</span>
              </div>`).join('')
          : '<div class="item-empty">No segments defined</div>'}
      </div>
    </div>`;
}

function viewTasks(p) {
  const open = (p.tasks || []).filter(t => !t.completed);
  return `
    <div class="panel view-tasks">
      <div class="panel-header">
        <span class="panel-title">Tasks</span>
        <span class="panel-meta">${open.length} open</span>
      </div>
      <div class="item-list">
        ${open.length
          ? open.map(t => `
              <div class="item">
                <span class="item-icon">▸</span>
                <span class="item-text">${esc(t.text)}</span>
              </div>`).join('')
          : '<div class="item-empty">All tasks complete ✓</div>'}
      </div>
    </div>`;
}

function viewCurrent(p) {
  const segs    = p.segments || [];
  const current = segs.find(s => !s.done);
  const next    = current ? segs.find(s => !s.done && s.key !== current.key) : null;
  return `
    <div class="panel view-current">
      <div class="now-label">Now</div>
      <div class="now-title">${esc(current?.title || 'All done!')}</div>
      ${current?.description ? `<div class="now-desc">${esc(current.description)}</div>` : ''}
      ${next ? `<div class="now-next">Up next &#x2192; ${esc(next.title)}</div>` : ''}
    </div>`;
}

function viewProgress(p) {
  const segs = p.segments || [];
  const done = segs.filter(s => s.done).length;
  const pct  = segs.length ? Math.round((done / segs.length) * 100) : 0;
  return `
    <div class="panel view-progress">
      <div class="prog-header">
        <span>${esc(p.name)}</span>
        <span>${done} / ${segs.length} segments</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function viewTimer(p) {
  const live    = !!p.liveStartedAt;
  const paused  = !!p.obsBrbPausedAt;
  const display = live ? formatElapsedPaused(p.liveStartedAt, p.obsTimerPausedDuration, p.obsBrbPausedAt) : '--:--:--';
  const label   = live ? (paused ? 'BRB' : 'LIVE') : 'OFFLINE';
  return `
    <div class="panel view-timer${live ? ' live' : ''}${paused ? ' paused' : ''}">
      <div class="timer-label">${label}</div>
      <div class="timer-clock" id="timer-clock">${display}</div>
    </div>`;
}

function viewHealth(p) {
  const s = p.obsStats;
  if (!s) return `<div class="panel view-health"><div class="item-empty">No OBS data — connect OBS in the main app</div></div>`;
  const age   = Math.floor((Date.now() - new Date(s.updatedAt).getTime()) / 1000);
  const stale = age > 15;
  const cls   = (val, warn, caution) => val >= warn ? 'health-warn' : val >= caution ? 'health-caution' : '';
  return `
    <div class="panel view-health${stale ? ' health-stale' : ''}">
      <div class="panel-header">
        <span class="panel-title">Stream health</span>
        <span class="panel-meta">${stale ? 'stale' : s.fps + ' fps'}</span>
      </div>
      <div class="health-grid">
        <div class="health-stat">
          <span class="health-label">Bitrate</span>
          <span class="health-value">${s.kbps} <em>Kbps</em></span>
        </div>
        <div class="health-stat">
          <span class="health-label">Dropped</span>
          <span class="health-value ${cls(s.droppedFramesPct, 2, 0.5)}">${s.droppedFramesPct}%</span>
        </div>
        <div class="health-stat">
          <span class="health-label">Render lag</span>
          <span class="health-value ${cls(s.renderLagMs, 10, 3)}">${s.renderLagMs} <em>ms</em></span>
        </div>
        <div class="health-stat">
          <span class="health-label">CPU</span>
          <span class="health-value ${cls(s.cpuPct, 80, 60)}">${s.cpuPct}%</span>
        </div>
      </div>
    </div>`;
}

function viewCountdown(p) {
  if (!p.countdownTo) {
    return `
      <div class="panel view-countdown">
        <div class="cd-label">Countdown</div>
        <div class="cd-time cd-inactive">--:--</div>
      </div>`;
  }
  const remaining = new Date(p.countdownTo).getTime() - Date.now();
  const label     = p.countdownLabel || 'Countdown';
  const expired   = remaining <= 0;
  return `
    <div class="panel view-countdown${expired ? ' expired' : ''}">
      <div class="cd-label">${esc(label)}</div>
      <div class="cd-time" id="cd-clock">${expired ? "Time's up!" : formatRemaining(remaining)}</div>
    </div>`;
}

function viewSocial(p) {
  const social = p.social || {};
  const platforms = [
    { key: 'twitch',  label: 'Twitch',   prefix: 'twitch.tv/' },
    { key: 'youtube', label: 'YouTube',  prefix: 'youtube.com/' },
    { key: 'github',  label: 'GitHub',   prefix: 'github.com/' },
    { key: 'discord', label: 'Discord',  prefix: '' },
    { key: 'twitter', label: 'X',        prefix: '@' },
    { key: 'website', label: 'Website',  prefix: '' },
  ];
  const active = platforms.filter(pl => social[pl.key]?.trim());
  if (!active.length) {
    return `
      <div class="panel view-social">
        <div class="social-name">${esc(p.name)}</div>
        <div class="item-empty">No social links configured</div>
      </div>`;
  }
  return `
    <div class="panel view-social">
      <div class="social-name">${esc(p.name)}</div>
      <div class="social-list">
        ${active.map(pl => `
          <div class="social-item">
            <span class="social-label">${pl.label}</span>
            <span class="social-handle">${esc(pl.prefix)}${esc(social[pl.key])}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function viewTransition(p) {
  const segs    = p.segments || [];
  const done    = segs.filter(s => s.done);
  const pending = segs.filter(s => !s.done);
  const last    = done[done.length - 1];
  const next    = pending[0];

  if (!segs.length) {
    return `<div class="panel view-transition"><div class="item-empty">No segments defined</div></div>`;
  }
  return `
    <div class="panel view-transition">
      <div class="tr-side tr-done">
        <div class="tr-side-label">Just completed</div>
        <div class="tr-side-title${!last ? ' tr-none' : ''}">${last ? esc(last.title) : 'Nothing yet'}</div>
      </div>
      <div class="tr-arrow">&#x2192;</div>
      <div class="tr-side tr-next">
        <div class="tr-side-label">Up next</div>
        <div class="tr-side-title${!next ? ' tr-none' : ''}">${next ? esc(next.title) : 'All done!'}</div>
      </div>
    </div>`;
}

function viewDone(p) {
  const completed = (p.tasks || [])
    .filter(t => t.completed)
    .sort((a, b) => (b.completedAt || '') > (a.completedAt || '') ? 1 : -1)
    .slice(0, 4);
  return `
    <div class="panel view-done">
      <div class="panel-header">
        <span class="panel-title">Recently completed</span>
        <span class="panel-meta">${completed.length} task${completed.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="item-list">
        ${completed.length
          ? completed.map(t => `
              <div class="item item--done">
                <span class="item-icon">✓</span>
                <span class="item-text">${esc(t.text)}</span>
              </div>`).join('')
          : '<div class="item-empty">No completed tasks yet</div>'}
      </div>
    </div>`;
}

function viewLowerThird(p) {
  const seg    = (p.segments || []).find(s => !s.done);
  const tips   = (seg?.tips || []).filter(t => t.trim());
  const segKey = seg?.key ?? null;
  if (segKey !== ltSegKey) ltIdx = 0;
  const label  = seg?.title || p.name;
  const tip    = tips[ltIdx] ?? tips[0] ?? 'No tips for this segment';
  const dots   = tips.length > 1
    ? `<div class="lt-dots">${tips.map((_, i) => `<span class="lt-dot${i === ltIdx ? ' lt-dot--active' : ''}"></span>`).join('')}</div>`
    : '';
  return `
    <div class="panel view-lowerthird${TRANSITION === 'fade' ? ' lt-fade' : ''}">
      <div class="lt-context">${esc(label)}</div>
      <div class="lt-text" id="lt-text">${esc(tip)}</div>
      ${dots}
    </div>`;
}

function startLtTick(p, intervalMs) {
  const seg    = (p.segments || []).find(s => !s.done);
  const tips   = (seg?.tips || []).filter(t => t.trim());
  const segKey = seg?.key ?? null;
  const showMs = SHOW_S ? Math.min(SHOW_S * 1000, intervalMs - 500) : null;

  const needsTick = tips.length > 1 || showMs;
  if (!needsTick) { clearInterval(ltTickHandle); ltTickHandle = null; return; }

  /* Keep the existing tick if the same segment is already running */
  if (ltTickHandle !== null && segKey === ltSegKey) return;

  clearInterval(ltTickHandle);
  ltIdx    = 0;
  ltSegKey = segKey;

  const fadeOnly  = TRANSITION === 'fade';
  const swapDelay = fadeOnly ? 600 : 350;

  function panel()  { return document.querySelector('.view-lowerthird'); }
  function tipEl()  { return document.getElementById('lt-text'); }

  function scheduleHide() {
    if (!showMs) return;
    setTimeout(() => { const el = panel(); if (el) el.style.opacity = '0'; }, showMs);
  }

  scheduleHide(); /* hide the first tip after showMs */

  ltTickHandle = setInterval(() => {
    const p = panel();
    if (!p) { clearInterval(ltTickHandle); ltTickHandle = null; return; }

    if (tips.length > 1) {
      ltIdx = (ltIdx + 1) % tips.length;
      const t = tipEl();
      p.style.opacity = '1';
      if (t) { t.style.opacity = '0'; if (!fadeOnly) t.style.transform = 'translateY(8px)'; }
      setTimeout(() => {
        const t2 = tipEl();
        if (t2) {
          t2.textContent = tips[ltIdx];
          t2.style.opacity   = '1';
          if (!fadeOnly) t2.style.transform = 'translateY(0)';
        }
        document.querySelectorAll('.lt-dot').forEach((d, i) => d.classList.toggle('lt-dot--active', i === ltIdx));
      }, swapDelay);
    } else {
      p.style.opacity = '1'; /* single tip: just re-show */
    }

    scheduleHide();
  }, intervalMs);
}

function viewError() {
  return `<div class="panel view-error">No project loaded</div>`;
}

/* ── Layout renderer ────────────────────────────────────────────── */

/** Dispatch a view name → HTML string using the existing view functions. */
function renderWidgetHtml(view, p) {
  switch (view) {
    case 'segments':   return viewSegments(p);
    case 'tasks':      return viewTasks(p);
    case 'current':    return viewCurrent(p);
    case 'progress':   return viewProgress(p);
    case 'timer':      return viewTimer(p);
    case 'countdown':  return viewCountdown(p);
    case 'social':     return viewSocial(p);
    case 'transition': return viewTransition(p);
    case 'done':       return viewDone(p);
    case 'lowerthird': return viewLowerThird(p);
    case 'health':     return viewHealth(p);
    default: return `<div class="panel view-error">${esc(view)}</div>`;
  }
}

/** First-render: set canvas dimensions and build all widget containers. */
function buildLayoutStructure(p, layout) {
  const root = document.getElementById('overlay-root');
  root.style.cssText =
    `position:relative;width:${layout.canvasW}px;height:${layout.canvasH}px;` +
    `overflow:hidden;padding:0;display:block;`;

  if (layout.mode === 'zones') {
    root.innerHTML = (layout.zones || []).map(zone => {
      const zStyle =
        `position:absolute;left:${zone.x}px;top:${zone.y}px;` +
        `width:${zone.w}px;height:${zone.h}px;display:flex;` +
        `flex-direction:${zone.direction || 'row'};gap:${zone.gap || 0}px;` +
        `align-items:${zone.align || 'flex-start'};overflow:hidden;box-sizing:border-box;`;
      const widgets = (zone.widgets || []).map((zw, i) =>
        `<div class="lz-w" data-lview="${zone.id}-${i}" data-view="${zw.view}">` +
        renderWidgetHtml(zw.view, p) + `</div>`
      ).join('');
      return `<div style="${zStyle}">${widgets}</div>`;
    }).join('');
  } else {
    root.innerHTML = (layout.widgets || []).map(w =>
      `<div class="lf-w" data-lview="${w.id}" data-view="${w.view}" ` +
      `style="position:absolute;left:${w.x}px;top:${w.y}px;` +
      `width:${w.w}px;height:${w.h}px;overflow:hidden;">` +
      renderWidgetHtml(w.view, p) + `</div>`
    ).join('');
  }
}

/** Subsequent polls: update each widget's innerHTML in-place (preserves LT animation). */
function updateLayoutInPlace(p, skipLt) {
  const root = document.getElementById('overlay-root');
  root.querySelectorAll('[data-lview]').forEach(el => {
    const view = el.dataset.view;
    if (view === 'lowerthird' && skipLt) return;
    el.innerHTML = renderWidgetHtml(view, p);
  });
}

/* ── Tick handles ───────────────────────────────────────────────── */
let cachedProject       = null;
let timerTickHandle     = null;
let countdownTickHandle = null;
let ltTickHandle        = null;
let ltIdx               = 0;
let ltSegKey            = null;

function startTimerTick() {
  clearInterval(timerTickHandle);
  timerTickHandle = setInterval(() => {
    const el = document.getElementById('timer-clock');
    if (el && cachedProject?.liveStartedAt)
      el.textContent = formatElapsedPaused(cachedProject.liveStartedAt, cachedProject.obsTimerPausedDuration, cachedProject.obsBrbPausedAt);
  }, 1000);
}

function startCountdownTick() {
  clearInterval(countdownTickHandle);
  countdownTickHandle = setInterval(() => {
    const el = document.getElementById('cd-clock');
    if (!el || !cachedProject?.countdownTo) { clearInterval(countdownTickHandle); return; }
    const remaining = new Date(cachedProject.countdownTo).getTime() - Date.now();
    if (remaining <= 0) {
      el.textContent = "Time's up!";
      el.closest('.panel')?.classList.add('expired');
      clearInterval(countdownTickHandle);
    } else {
      el.textContent = formatRemaining(remaining);
    }
  }, 1000);
}

/* ── Render loop ────────────────────────────────────────────────── */
async function update() {
  const p    = await fetchProject();
  const root = document.getElementById('overlay-root');
  if (!p) {
    root.innerHTML = viewError();
    clearInterval(timerTickHandle);
    clearInterval(countdownTickHandle);
    clearInterval(ltTickHandle);
    return;
  }
  cachedProject = p;

  switch (VIEW) {
    case 'tasks':      root.innerHTML = viewTasks(p);      break;
    case 'current':    root.innerHTML = viewCurrent(p);    break;
    case 'progress':   root.innerHTML = viewProgress(p);   break;
    case 'social':     root.innerHTML = viewSocial(p);     break;
    case 'transition': root.innerHTML = viewTransition(p); break;
    case 'done':       root.innerHTML = viewDone(p);       break;
    case 'timer':
      root.innerHTML = viewTimer(p);
      if (p.liveStartedAt) startTimerTick(); else clearInterval(timerTickHandle);
      break;
    case 'countdown':
      root.innerHTML = viewCountdown(p);
      if (p.countdownTo && new Date(p.countdownTo).getTime() > Date.now())
        startCountdownTick();
      else clearInterval(countdownTickHandle);
      break;
    case 'lowerthird': {
      const intervalMs = Math.max(3, parseInt(params.get('interval') || '8', 10)) * 1000;
      const curSegKey  = ((p.segments || []).find(s => !s.done))?.key ?? null;
      if (curSegKey !== ltSegKey || !ltTickHandle) root.innerHTML = viewLowerThird(p);
      startLtTick(p, intervalMs);
      break;
    }
    case 'health':     root.innerHTML = viewHealth(p);     break;
    case 'layout': {
      if (!LAYOUT_ID) { root.innerHTML = viewError(); break; }
      const layout = (p.layouts || []).find(l => l.id === LAYOUT_ID);
      if (!layout) {
        root.innerHTML = `<div class="panel view-error">Layout "${esc(LAYOUT_ID)}" not found</div>`;
        break;
      }

      const intervalMs = Math.max(3, parseInt(params.get('interval') || '8', 10)) * 1000;
      const curSegKey  = ((p.segments || []).find(s => !s.done))?.key ?? null;
      const ltChanged  = curSegKey !== ltSegKey || !ltTickHandle;

      if (!root.dataset.lbReady) {
        // First render — build full canvas structure
        root.dataset.lbReady = '1';
        buildLayoutStructure(p, layout);
        startLtTick(p, intervalMs);
      } else {
        // Subsequent polls — update widgets in-place, preserve LT animation
        updateLayoutInPlace(p, !ltChanged);
        if (ltChanged) startLtTick(p, intervalMs);
      }

      // Timer tick
      if (p.liveStartedAt) startTimerTick(); else clearInterval(timerTickHandle);
      // Countdown tick
      if (p.countdownTo && new Date(p.countdownTo).getTime() > Date.now())
        startCountdownTick();
      else clearInterval(countdownTickHandle);
      break;
    }
    default: root.innerHTML = viewSegments(p); break;
  }
}

update();
setInterval(update, POLL_S * 1000);
