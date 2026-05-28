/* v4 — style system */
const PAGE_LOAD_MS = Date.now();           // Frozen at load — base for custom countdown durations
const widgetCountdownTargets = {};         // widgetId → epoch ms, computed once per session
const params      = new URLSearchParams(location.search);
const VIEW        = params.get('view')       || 'segments';
const BG          = params.get('bg')         || 'transparent';
const PROJECT_ID  = params.get('project')    || '';
const SIZE        = params.get('size')       || 'md';
const POLL_S      = Math.max(3, parseInt(params.get('poll') || '5', 10));
const TRANSITION  = params.get('transition') || 'slide';
const SHOW_S      = params.get('show') ? Math.max(1, parseInt(params.get('show'), 10)) : null;
const LAYOUT_ID   = params.get('layout')     || '';
const STYLE_ID    = params.get('style')      || '';

if (BG === 'green')   document.body.classList.add('bg-green');
if (BG === 'magenta') document.body.classList.add('bg-magenta');
document.body.classList.add(`size-${SIZE}`);

/* ── Social brand icons (Simple Icons / CC0) ───────────────────── */
const SOCIAL_ICONS = {
  twitch:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  github:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
};

/* ── Style system ──────────────────────────────────────────────── */
const PRESET_STYLES = [
  {
    id: 'preset-minimal', name: 'Minimal',
    font: 'system-ui',
    accent: '#60a5fa', text: '#e8edf5',
    surface: 'rgba(9, 11, 16, 0.88)', border: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 18, borderWidth: 1, padding: 16,
    glow: false, shadow: false,
  },
  {
    id: 'preset-broadcast', name: 'Broadcast',
    font: 'Inter',
    accent: '#3b82f6', text: '#ffffff',
    surface: 'rgba(15, 23, 42, 0.95)', border: 'rgba(96, 165, 250, 0.0)',
    borderRadius: 6, borderWidth: 0, padding: 18,
    glow: false, shadow: true,
  },
  {
    id: 'preset-synthwave', name: 'Synthwave',
    font: 'Space Grotesk',
    accent: '#ff0080', text: '#ffffff',
    surface: 'rgba(0, 0, 0, 0.7)', border: 'rgba(255, 0, 128, 0.4)',
    borderRadius: 12, borderWidth: 2, padding: 16,
    glow: true, shadow: false,
  },
  {
    id: 'preset-newsroom', name: 'Newsroom',
    font: 'Roboto Slab',
    accent: '#dc2626', text: '#ffffff',
    surface: 'rgba(20, 20, 24, 0.96)', border: 'transparent',
    borderRadius: 2, borderWidth: 0, padding: 20,
    glow: false, shadow: true,
  },
  {
    id: 'preset-terminal', name: 'Terminal',
    font: 'JetBrains Mono',
    accent: '#22c55e', text: '#a3e635',
    surface: 'rgba(0, 0, 0, 0.85)', border: 'rgba(34, 197, 94, 0.4)',
    borderRadius: 0, borderWidth: 1, padding: 14,
    glow: false, shadow: false,
  },
];

const GOOGLE_FONTS = {
  'Inter':            'Inter:wght@400;700',
  'Space Grotesk':    'Space+Grotesk:wght@400;700',
  'Roboto Slab':      'Roboto+Slab:wght@400;700',
  'JetBrains Mono':   'JetBrains+Mono:wght@400;700',
};

function loadGoogleFont(name) {
  if (!name || !GOOGLE_FONTS[name]) return;
  if (document.querySelector(`link[data-font="${name}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.font = name;
  link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS[name]}&display=swap`;
  document.head.appendChild(link);
}

function applyStyle(s) {
  if (!s) return;
  const root = document.documentElement;
  const fontStack = GOOGLE_FONTS[s.font]
    ? `'${s.font}', system-ui, sans-serif`
    : (s.font || 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif');
  root.style.setProperty('--ov-font',         fontStack);
  root.style.setProperty('--ov-accent',       s.accent  || '#60a5fa');
  root.style.setProperty('--ov-text',         s.text    || '#e8edf5');
  root.style.setProperty('--ov-surface',      s.surface || 'rgba(9, 11, 16, 0.88)');
  root.style.setProperty('--ov-border',       s.border  || 'rgba(255, 255, 255, 0.10)');
  root.style.setProperty('--ov-radius',       `${s.borderRadius ?? 18}px`);
  root.style.setProperty('--ov-border-width', `${s.borderWidth  ?? 1}px`);
  root.style.setProperty('--ov-padding',      `${s.padding      ?? 16}px`);
  root.style.setProperty('--ov-glow',         s.glow ? `0 0 24px ${s.accent || '#60a5fa'}` : 'none');
  root.style.setProperty('--ov-text-shadow',  s.shadow ? '0 1px 3px rgba(0,0,0,0.6)' : 'none');
  loadGoogleFont(s.font);
}

let globalStylesCache = null;
async function ensureGlobalStyles() {
  if (globalStylesCache) return globalStylesCache;
  try {
    const r = await fetch('/api/styles');
    globalStylesCache = r.ok ? await r.json() : [];
  } catch { globalStylesCache = []; }
  return globalStylesCache;
}

function findStyleSync(id, project) {
  if (!id) return null;
  return PRESET_STYLES.find(s => s.id === id)
      || (project?.styles || []).find(s => s.id === id)
      || (globalStylesCache || []).find(s => s.id === id)
      || null;
}

function styleVarsInline(style) {
  if (!style) return '';
  const fontStack = GOOGLE_FONTS[style.font]
    ? `'${style.font}', system-ui, sans-serif`
    : (style.font || 'system-ui');
  loadGoogleFont(style.font);
  return [
    `--ov-font:${fontStack}`,
    `--ov-accent:${style.accent}`,
    `--ov-text:${style.text}`,
    `--ov-surface:${style.surface}`,
    `--ov-border:${style.border}`,
    `--ov-radius:${style.borderRadius ?? 18}px`,
    `--ov-border-width:${style.borderWidth ?? 1}px`,
    `--ov-padding:${style.padding ?? 16}px`,
    `--ov-glow:${style.glow ? `0 0 24px ${style.accent}` : 'none'}`,
    `--ov-text-shadow:${style.shadow ? '0 1px 3px rgba(0,0,0,0.6)' : 'none'}`,
  ].join(';');
}

async function resolveStyle(project) {
  // 1. Explicit ?style= wins.
  let styleId = STYLE_ID;
  // 2. Otherwise, if scoped to a project, use its activeStyleId.
  if (!styleId && project && project.activeStyleId) styleId = project.activeStyleId;
  if (!styleId) return null;

  // Project-scoped style (id stored on project.styles[])
  const projStyle = (project?.styles || []).find(s => s.id === styleId);
  if (projStyle) return projStyle;
  // Preset
  const preset = PRESET_STYLES.find(s => s.id === styleId);
  if (preset) return preset;
  // Global style (fetch)
  try {
    const res = await fetch(`/api/styles/${encodeURIComponent(styleId)}`);
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

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

function viewCountdown(p, widgetId = 'default', targetMs = null) {
  const target = targetMs ?? (p.countdownTo ? new Date(p.countdownTo).getTime() : null);
  if (!target) {
    return `
      <div class="panel view-countdown">
        <div class="cd-label">Countdown</div>
        <div class="cd-time cd-inactive" data-cd-clock="${widgetId}">--:--</div>
      </div>`;
  }
  const remaining = target - Date.now();
  const label     = p.countdownLabel || 'Countdown';
  const expired   = remaining <= 0;
  return `
    <div class="panel view-countdown${expired ? ' expired' : ''}">
      <div class="cd-label">${esc(label)}</div>
      <div class="cd-time" data-cd-clock="${widgetId}">${expired ? "Time's up!" : formatRemaining(remaining)}</div>
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
            <span class="social-icon" data-platform="${pl.key}" title="${pl.label}">${SOCIAL_ICONS[pl.key] || ''}</span>
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

/** Dispatch a view name → HTML string using the existing view functions.
 *  wparams = widget-level params object (from layout builder); wid = stable widget ID. */
function renderWidgetHtml(view, p, wparams, wid) {
  switch (view) {
    case 'segments':   return viewSegments(p);
    case 'tasks':      return viewTasks(p);
    case 'current':    return viewCurrent(p);
    case 'progress':   return viewProgress(p);
    case 'timer':      return viewTimer(p);
    case 'countdown': {
      // Widget-level duration override: compute target once at page load, cache it
      let targetMs = null;
      if (wparams?.countdownMinutes > 0) {
        const key = wid || 'default';
        if (!widgetCountdownTargets[key])
          widgetCountdownTargets[key] = PAGE_LOAD_MS + wparams.countdownMinutes * 60000;
        targetMs = widgetCountdownTargets[key];
      }
      // Allow widget-level label override
      const pWithLabel = wparams?.countdownLabel
        ? { ...p, countdownLabel: wparams.countdownLabel }
        : p;
      return viewCountdown(pWithLabel, wid || 'default', targetMs);
    }
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
      const widgets = (zone.widgets || []).map((zw, i) => {
        const bgCls   = zw.params?.showBg ? ' has-bg' : '';
        const opacPct = zw.params?.opacity;
        const opacSty = opacPct != null && opacPct < 100 ? `opacity:${opacPct / 100};` : '';
        const styVars = zw.params?.styleId ? styleVarsInline(findStyleSync(zw.params.styleId, p)) : '';
        const inline  = [opacSty, styVars].filter(Boolean).join(';');
        return `<div class="lz-w${bgCls}" data-lview="${zone.id}-${i}" ` +
          `data-view="${zw.view}" data-zwid="${zw.id}"` +
          (inline ? ` style="${inline}"` : '') + `>` +
          renderWidgetHtml(zw.view, p, zw.params, zw.id) + `</div>`;
      }).join('');
      return `<div style="${zStyle}">${widgets}</div>`;
    }).join('');
  } else {
    root.innerHTML = (layout.widgets || []).map(w => {
      const bgCls   = w.params?.showBg ? ' has-bg' : '';
      const opacPct = w.params?.opacity;
      const opacSty = opacPct != null && opacPct < 100 ? `;opacity:${opacPct / 100}` : '';
      const styVars = w.params?.styleId ? `;${styleVarsInline(findStyleSync(w.params.styleId, p))}` : '';
      return `<div class="lf-w${bgCls}" data-lview="${w.id}" data-view="${w.view}" ` +
        `style="position:absolute;left:${w.x}px;top:${w.y}px;` +
        `width:${w.w}px;height:${w.h}px;overflow:hidden${opacSty}${styVars};">` +
        renderWidgetHtml(w.view, p, w.params, w.id) + `</div>`;
    }).join('');
  }
}

/** Subsequent polls: update each widget's innerHTML in-place (preserves LT animation). */
function updateLayoutInPlace(p, skipLt) {
  const root   = document.getElementById('overlay-root');
  const layout = (p.layouts || []).find(l => l.id === LAYOUT_ID);
  root.querySelectorAll('[data-lview]').forEach(el => {
    const view = el.dataset.view;
    if (view === 'lowerthird' && skipLt) return;

    // Re-sync appearance params (freeform)
    if (el.classList.contains('lf-w') && layout) {
      const w = (layout.widgets || []).find(w => w.id === el.dataset.lview);
      // Reapply per-widget style vars (in case styleId changed since first render)
      const sid = w?.params?.styleId;
      const s   = sid ? findStyleSync(sid, p) : null;
      // Strip any old --ov-* and reapply
      el.style.cssText = el.style.cssText.replace(/--ov-[^:]+:[^;]+;?/g, '');
      if (s) el.style.cssText += `;${styleVarsInline(s)}`;
      el.innerHTML = renderWidgetHtml(view, p, w?.params, w?.id);
      if (w) {
        el.classList.toggle('has-bg', !!w.params?.showBg);
        const opacPct = w.params?.opacity;
        el.style.opacity = opacPct != null && opacPct < 100 ? String(opacPct / 100) : '';
      }
    } else if (el.classList.contains('lz-w') && layout) {
      // Re-sync appearance params (zone widgets)
      const zwid = el.dataset.zwid;
      const zw   = zwid
        ? (layout.zones || []).flatMap(z => z.widgets || []).find(w => w.id === zwid)
        : null;
      // Reapply per-widget style vars (in case styleId changed since first render)
      el.style.cssText = el.style.cssText.replace(/--ov-[^:]+:[^;]+;?/g, '');
      const sid = zw?.params?.styleId;
      const s   = sid ? findStyleSync(sid, p) : null;
      if (s) el.style.cssText += `;${styleVarsInline(s)}`;
      el.innerHTML = renderWidgetHtml(view, p, zw?.params, zw?.id);
      if (zw) {
        el.classList.toggle('has-bg', !!zw.params?.showBg);
        const opacPct = zw.params?.opacity;
        el.style.opacity = opacPct != null && opacPct < 100 ? String(opacPct / 100) : '';
      }
    } else {
      el.innerHTML = renderWidgetHtml(view, p);
    }
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
    const clocks = document.querySelectorAll('[data-cd-clock]');
    if (!clocks.length) { clearInterval(countdownTickHandle); return; }
    let anyActive = false;
    clocks.forEach(el => {
      const wid    = el.dataset.cdClock;
      // Widget-level target (from page-load duration) takes priority over project countdownTo
      const target = widgetCountdownTargets[wid]
                  ?? (cachedProject?.countdownTo ? new Date(cachedProject.countdownTo).getTime() : null);
      if (!target) return;
      const remaining = target - Date.now();
      if (remaining <= 0) {
        el.textContent = "Time's up!";
        el.closest('.panel')?.classList.add('expired');
      } else {
        anyActive = true;
        el.textContent = formatRemaining(remaining);
      }
    });
    if (!anyActive) clearInterval(countdownTickHandle);
  }, 1000);
}

/* ── Render loop ────────────────────────────────────────────────── */
let lastAppliedStyleId = null;

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

  // Resolve & apply the active style (only re-apply when it actually changes,
  // so we don't pile up <link> tags or thrash :root on every poll cycle).
  const desiredStyleId = STYLE_ID || p.activeStyleId || null;
  if (desiredStyleId !== lastAppliedStyleId) {
    const resolved = await resolveStyle(p);
    if (resolved) applyStyle(resolved);
    lastAppliedStyleId = desiredStyleId;
  }

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
    case 'countdown': {
      // Standalone overlay: ?countdownMinutes=N counts from page load
      const paramMins = parseFloat(params.get('countdownMinutes') || '0');
      let targetMs = null;
      if (paramMins > 0) {
        if (!widgetCountdownTargets['standalone'])
          widgetCountdownTargets['standalone'] = PAGE_LOAD_MS + paramMins * 60000;
        targetMs = widgetCountdownTargets['standalone'];
      }
      const standaloneLabel = params.get('countdownLabel') || undefined;
      const pStandalone = standaloneLabel ? { ...p, countdownLabel: standaloneLabel } : p;
      root.innerHTML = viewCountdown(pStandalone, 'standalone', targetMs);
      const hasTarget = targetMs != null || (p.countdownTo && new Date(p.countdownTo).getTime() > Date.now());
      if (hasTarget) startCountdownTick(); else clearInterval(countdownTickHandle);
      break;
    }
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
      // Preload global styles so per-widget styleId lookups can find them sync
      await ensureGlobalStyles();
      let layout = (p.layouts || []).find(l => l.id === LAYOUT_ID);
      // Fall back to global layouts if not found in project
      if (!layout) {
        try {
          const gr = await fetch(`/api/layouts/${encodeURIComponent(LAYOUT_ID)}`);
          if (gr.ok) layout = await gr.json();
        } catch {}
      }
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
      // Countdown tick — start if any countdown widget is present in the layout
      if (document.querySelector('[data-cd-clock]')) startCountdownTick();
      else clearInterval(countdownTickHandle);
      break;
    }
    default: root.innerHTML = viewSegments(p); break;
  }
}

update();
setInterval(update, POLL_S * 1000);
