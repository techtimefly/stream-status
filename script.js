/* ── API ─────────────────────────────────────────────────────────── */
async function api(method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, opts);
  if (!res.ok && res.status !== 204) throw new Error(`API ${method} /api${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/* ── Social brand icons (Simple Icons / CC0) ─────────────────────── */
const SOCIAL_ICONS = {
  twitch:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  github:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
};

function populateSocialIcons() {
  document.querySelectorAll('.social-input-icon[data-skip]').forEach(el => el.remove());
  document.querySelectorAll('.social-input-row').forEach(row => {
    const platform = row.dataset.platform;
    const slot     = row.querySelector('.social-input-icon');
    if (slot && SOCIAL_ICONS[platform] && !slot.innerHTML.trim()) {
      slot.innerHTML = SOCIAL_ICONS[platform];
    }
  });
}

/* ── Style system ────────────────────────────────────────────────── */
const PRESET_STYLES = [
  { id: 'preset-minimal',   name: 'Minimal',   font: 'system-ui',
    accent: '#60a5fa', text: '#e8edf5',
    surface: 'rgba(9, 11, 16, 0.88)', border: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 18, borderWidth: 1, padding: 16, glow: false, shadow: false },
  { id: 'preset-broadcast', name: 'Broadcast', font: 'Inter',
    accent: '#3b82f6', text: '#ffffff',
    surface: 'rgba(15, 23, 42, 0.95)', border: 'rgba(96, 165, 250, 0.0)',
    borderRadius: 6, borderWidth: 0, padding: 18, glow: false, shadow: true },
  { id: 'preset-synthwave', name: 'Synthwave', font: 'Space Grotesk',
    accent: '#ff0080', text: '#ffffff',
    surface: 'rgba(0, 0, 0, 0.7)',    border: 'rgba(255, 0, 128, 0.4)',
    borderRadius: 12, borderWidth: 2, padding: 16, glow: true,  shadow: false },
  { id: 'preset-newsroom',  name: 'Newsroom',  font: 'Roboto Slab',
    accent: '#dc2626', text: '#ffffff',
    surface: 'rgba(20, 20, 24, 0.96)', border: 'transparent',
    borderRadius: 2,  borderWidth: 0, padding: 20, glow: false, shadow: true },
  { id: 'preset-terminal',  name: 'Terminal',  font: 'JetBrains Mono',
    accent: '#22c55e', text: '#a3e635',
    surface: 'rgba(0, 0, 0, 0.85)',   border: 'rgba(34, 197, 94, 0.4)',
    borderRadius: 0,  borderWidth: 1, padding: 14, glow: false, shadow: false },
];

let globalStyles = [];      // fetched from /api/styles
let editingStyleId = null;  // style currently open in the editor
let editingStyleScope = 'project'; // 'project' | 'global' | 'preset'

/* ── State ───────────────────────────────────────────────────────── */
const LOCAL_KEY       = 'stream-status-project-id';
const VIEWS           = ['plan', 'live', 'setup'];
let projects          = [];
let project           = null;
let filter            = 'all';
let activeSegmentKey  = null;
let editingSegmentKey = null;
let timerInterval     = null;
let countdownInterval = null;
let toastTimer        = null;
let notesDebounce     = null;
let capabilities      = {};
let wizardMode        = false;
let currentWizardStep = 1;

/* ── Toast ───────────────────────────────────────────────────────── */
function showToast(msg = '✓ Saved') {
  const el = document.getElementById('save-toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 1800);
}

/* ── Persist ─────────────────────────────────────────────────────── */
async function saveProject() {
  if (!project) return;
  project = await api('PUT', `/projects/${project.id}`, project);
  showToast();
}

/* ── Router ──────────────────────────────────────────────────────── */
const Router = {
  current: 'plan',

  parseUrl() {
    const m = location.pathname.match(/^\/p\/([^/]+)\/(plan|live|setup)\/?$/);
    if (m) return { projectId: m[1], view: m[2] };
    return { projectId: null, view: 'plan' };
  },

  setView(view, opts = {}) {
    if (!VIEWS.includes(view)) view = 'plan';
    this.current = view;
    document.body.dataset.view = view;
    document.querySelectorAll('.tab-link').forEach(a =>
      a.classList.toggle('active', a.dataset.view === view)
    );
    if (project && !opts.silent) {
      const newPath = `/p/${project.id}/${view}`;
      if (location.pathname !== newPath) {
        history.pushState({ view, projectId: project.id }, '', newPath);
      }
    }
    this.onEnter(view);
  },

  // Replace current history entry (used during init / project switch
  // so we don't pile up entries the user didn't trigger).
  replaceView(view) {
    if (!VIEWS.includes(view)) view = 'plan';
    this.current = view;
    document.body.dataset.view = view;
    document.querySelectorAll('.tab-link').forEach(a =>
      a.classList.toggle('active', a.dataset.view === view)
    );
    if (project) {
      const newPath = `/p/${project.id}/${view}`;
      history.replaceState({ view, projectId: project.id }, '', newPath);
    }
    this.onEnter(view);
  },

  onEnter(view) {
    if (!project) return;
    if (view === 'live')  { renderLive(); populateLiveSceneSelect(); }
    if (view === 'setup') { renderSetupMeta(); renderStylePanel(); renderOverlayLinks(); if (typeof renderLayoutList === 'function') renderLayoutList(); }
  },

  init() {
    window.addEventListener('popstate', async () => {
      const { projectId, view } = this.parseUrl();
      if (projectId && projectId !== project?.id && projects.find(p => p.id === projectId)) {
        await switchProject(projectId);
        render();
      }
      this.current = view;
      document.body.dataset.view = view;
      document.querySelectorAll('.tab-link').forEach(a =>
        a.classList.toggle('active', a.dataset.view === view)
      );
      this.onEnter(view);
    });

    document.getElementById('tab-nav')?.addEventListener('click', e => {
      const link = e.target.closest('.tab-link');
      if (!link) return;
      e.preventDefault();
      this.setView(link.dataset.view);
    });
  },
};

/* ── Bootstrap ───────────────────────────────────────────────────── */
async function init() {
  try {
    [projects, capabilities, globalStyles] = await Promise.all([
      api('GET', '/projects'),
      api('GET', '/capabilities').catch(() => ({})),
      api('GET', '/styles').catch(() => []),
    ]);
    const { projectId: urlPid } = Router.parseUrl();
    const savedId = localStorage.getItem(LOCAL_KEY);
    const target =
      (urlPid   && projects.find(p => p.id === urlPid))   ? urlPid   :
      (savedId  && projects.find(p => p.id === savedId))  ? savedId  :
      projects.length ? projects[0].id : null;
    if (target) await switchProject(target);
  } catch (e) {
    console.error('Init error:', e);
  }
  render();
  bindEvents();
  Router.init();
  const { view: initialView } = Router.parseUrl();
  Router.replaceView(project ? initialView : 'plan');
  if (OBS.getSettings().enabled) OBS.enable();
}

async function switchProject(id) {
  stopTimerTick();
  stopCountdownTick();
  project = await api('GET', `/projects/${id}`);
  localStorage.setItem(LOCAL_KEY, id);
  filter = 'all';
  activeSegmentKey = null;
  if (project.liveStartedAt) startTimerTick();
  if (project.countdownTo)   startCountdownTick();
  api('PUT', '/active', { projectId: id }).catch(() => {});
}

/* ── Escape ──────────────────────────────────────────────────────── */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Time helpers ────────────────────────────────────────────────── */
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
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSegTime(secs) {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ── Pacing helpers ──────────────────────────────────────────────── */
function segStartIso(segs, idx) {
  if (!project?.liveStartedAt) return null;
  for (let i = idx - 1; i >= 0; i--) {
    if (segs[i].doneAt) return segs[i].doneAt;
  }
  return project.liveStartedAt;
}

function buildPaceHtml(segs, s, idx) {
  const hasDuration = !!s.duration;
  const live        = !!project?.liveStartedAt;
  if (!hasDuration && !live) return '';

  const startIso = segStartIso(segs, idx);

  if (s.done && s.doneAt && startIso) {
    const elapsed = Math.floor((new Date(s.doneAt) - new Date(startIso)) / 1000);
    const planned = hasDuration ? s.duration * 60 : null;
    const over    = planned && elapsed > planned;
    const base    = formatSegTime(elapsed);
    const suffix  = planned
      ? (over
          ? ` / ${s.duration}:00 <span class="seg-pace-over">+${formatSegTime(elapsed - planned)}</span>`
          : ` / ${s.duration}:00 ✓`)
      : '';
    return `<div class="seg-pace seg-pace--done">${base}${suffix}</div>`;
  }

  const isActive = segs.find(seg => !seg.done)?.key === s.key;
  if (isActive && startIso) {
    const elapsed = Math.floor((Date.now() - new Date(startIso)) / 1000);
    const planned = hasDuration ? s.duration * 60 : null;
    const over    = planned && elapsed > planned;
    const suffix  = planned ? ` / ${s.duration}:00` : '';
    return `<div class="seg-pace${over ? ' seg-pace--over' : ''}" id="active-seg-pace">${formatSegTime(elapsed)}${suffix}</div>`;
  }

  if (!s.done && hasDuration) {
    return `<div class="seg-pace">${s.duration} min planned</div>`;
  }

  return '';
}

/* ── Render ──────────────────────────────────────────────────────── */
function render() {
  document.getElementById('loading-state').classList.add('hidden');
  const has = !!project;
  document.getElementById('empty-state').classList.toggle('hidden', has);
  document.getElementById('main-app').classList.toggle('hidden', !has);
  if (!has) return;
  renderHero();
  renderSegments();
  renderTasks();
  renderTimer();
  renderCountdown();
  renderNotes();
  renderOverlayLinks();
  renderLive();
  renderSetupMeta();
  renderStylePanel();
  updateStickyBar();
}

/* ── Live strip (slim bar shown on Plan/Setup when live) ─────────── */

function updateWriteupButton() {
  const btn = document.getElementById('writeup-btn');
  if (!btn) return;
  const hasDone = (project?.segments || []).some(s => s.done);
  btn.classList.toggle('hidden', !capabilities.aiTips || !hasDone);
}

function updateChaptersButton() {
  const btn = document.getElementById('chapters-btn');
  if (!btn) return;
  btn.classList.toggle('hidden', !project?.streamStartedAt || !(project?.segments || []).length);
}

function buildChaptersText(proj) {
  const start = new Date(proj.streamStartedAt);
  const segs  = proj.segments || [];
  const pad   = n => String(n).padStart(2, '0');
  const fmtMs = ms => {
    const s   = Math.max(0, Math.floor(ms / 1000));
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  };
  return segs.map((s, i) => {
    if (i === 0) return `0:00 ${s.title}`;
    const prev = segs[i - 1];
    return prev.doneAt
      ? `${fmtMs(new Date(prev.doneAt) - start)} ${s.title}`
      : `?:?? ${s.title}`;
  }).join('\n');
}

function updateStickyBar() {
  if (!project) return;
  const seg  = (project.segments || []).find(s => !s.done);
  const live = !!project.liveStartedAt;
  const open = (project.tasks || []).filter(t => !t.completed).length;
  const strip = document.getElementById('live-strip');
  if (strip) strip.classList.toggle('visible', live);
  const segEl = document.getElementById('sticky-segment');
  if (segEl) segEl.textContent = seg?.title || 'All done!';
  const timerEl = document.getElementById('sticky-timer');
  if (timerEl) {
    timerEl.textContent = live ? formatElapsedPaused(project.liveStartedAt, project.obsTimerPausedDuration, project.obsBrbPausedAt) : '–';
    timerEl.classList.toggle('live', live);
  }
  const tasksEl = document.getElementById('sticky-tasks');
  if (tasksEl) tasksEl.textContent = `${open} open task${open !== 1 ? 's' : ''}`;
}

/* ── Active-segment pace tick ────────────────────────────────────── */
function updateActivePace() {
  if (!project?.liveStartedAt) return;
  const segs      = project.segments || [];
  const activeIdx = segs.findIndex(s => !s.done);
  if (activeIdx < 0) return;
  const startIso  = segStartIso(segs, activeIdx);
  if (!startIso) return;
  const elapsed   = Math.floor((Date.now() - new Date(startIso)) / 1000);
  const seg       = segs[activeIdx];
  const planned   = seg.duration ? seg.duration * 60 : null;
  const over      = planned && elapsed > planned;
  const text      = planned ? `${formatSegTime(elapsed)} / ${seg.duration}:00` : formatSegTime(elapsed);

  const el = document.getElementById('active-seg-pace');
  if (el) {
    el.classList.toggle('seg-pace--over', !!over);
    el.textContent = text;
  }
  const live = document.getElementById('live-current-pace');
  if (live) {
    live.classList.toggle('live-pace--over', !!over);
    live.textContent = text;
  }
}

/* ── Hero ────────────────────────────────────────────────────────── */
function renderHero() {
  document.getElementById('project-title').textContent       = project.name;
  const planTitle = document.getElementById('plan-project-title');
  if (planTitle) planTitle.textContent = project.name;
  const descEl = document.getElementById('project-description');
  if (descEl) {
    descEl.textContent = project.description || '';
    descEl.classList.toggle('hidden', !project.description);
  }
  document.getElementById('project-focus').textContent       = project.focus    || '–';
  document.getElementById('project-platform').textContent    = project.platform || '–';
  document.title = `${project.name} — Maestro`;
}

/* ── Segments ────────────────────────────────────────────────────── */
function renderSegments() {
  const el   = document.getElementById('segment-list');
  const segs = project.segments || [];
  const done = segs.filter(s => s.done).length;

  if (!segs.length) {
    el.innerHTML = `<p class="panel-empty">No segments yet. Click <em>+ Segment</em> to add one.</p>
      ${capabilities.aiTips ? '<button class="btn-ghost btn-sm" id="generate-plan-btn">✦ Generate segment plan</button>' : ''}`;
    if (capabilities.aiTips) {
      document.getElementById('generate-plan-btn').addEventListener('click', generatePlan);
    }
    updateWriteupButton();
    updateChaptersButton();
    return;
  }

  el.innerHTML = `
    <div class="segment-progress">
      <div class="seg-progress-track">
        <div class="seg-progress-fill" style="width:${segs.length ? Math.round((done/segs.length)*100) : 0}%"></div>
      </div>
      <span class="seg-progress-label">${done} / ${segs.length} done</span>
    </div>
    ${segs.map((s, idx) => `
      <article class="segment-card${s.done ? ' completed' : ''}${s.key === activeSegmentKey ? ' obs-active' : ''}" data-key="${esc(s.key)}" draggable="true">
        <span class="drag-handle" title="Drag to reorder">⠿</span>
        <div class="segment-body">
          <h3>${s.key === activeSegmentKey ? '<span class="obs-active-pip" title="OBS scene active">▶</span> ' : ''}${esc(s.title)}</h3>
          ${s.description ? `<p>${esc(s.description)}</p>` : ''}
          ${buildPaceHtml(segs, s, idx)}
          ${capabilities.aiTips && !(s.tips && s.tips.length)
            ? `<div class="seg-nudge"><span class="seg-nudge-label">No tips</span><button class="seg-nudge-btn btn-ghost" data-key="${esc(s.key)}" data-action="tips">✦ Generate tips</button></div>`
            : ''}
        </div>
        <div class="segment-actions">
          <button class="segment-toggle" data-key="${esc(s.key)}">${s.done ? 'Undo' : 'Mark done'}</button>
          ${!s.done && project.liveStartedAt && OBS.status === 'connected'
            ? `<button class="segment-highlight icon-btn" data-key="${esc(s.key)}" title="Log highlight + save replay">&#x2605;</button>`
            : ''}
          <button class="segment-edit icon-btn" data-key="${esc(s.key)}" title="Edit segment">&#x270E;</button>
          <button class="segment-delete icon-btn" data-key="${esc(s.key)}" title="Remove segment">&#x2715;</button>
        </div>
      </article>
    `).join('')}
  `;
  updateWriteupButton();
  updateChaptersButton();
}

/* ── Tasks ───────────────────────────────────────────────────────── */
function renderTasks() {
  const tasks   = project.tasks || [];
  const visible = tasks.filter(t =>
    filter === 'active'    ? !t.completed :
    filter === 'completed' ?  t.completed : true
  );
  document.getElementById('task-list').innerHTML = visible.map(t => `
    <div class="task-item${t.completed ? ' completed' : ''}" data-id="${esc(t.id)}">
      <label>
        <input type="checkbox" ${t.completed ? 'checked' : ''} />
        <span>${esc(t.text)}</span>
      </label>
      <button class="delete-task">Remove</button>
    </div>
  `).join('');
  const open = tasks.filter(t => !t.completed).length;
  document.getElementById('task-count').textContent = `${open} open task${open !== 1 ? 's' : ''}`;
}

function renderNotes() {
  document.getElementById('notes-textarea').value = project.notes || '';
}

/* ── Stream timer ────────────────────────────────────────────────── */
function renderTimer() {
  const display = document.getElementById('timer-display');
  const btn     = document.getElementById('go-live-btn');
  const live    = !!project.liveStartedAt;
  const paused = !!project.obsBrbPausedAt;
  display.textContent = live ? formatElapsedPaused(project.liveStartedAt, project.obsTimerPausedDuration, project.obsBrbPausedAt) : '--:--:--';
  display.classList.toggle('live', live && !paused);
  display.classList.toggle('paused', live && paused);
  btn.textContent = live ? '■ End Stream' : '▶ Go Live';
  btn.classList.toggle('go-live-btn--active', live);
}

function startTimerTick() {
  stopTimerTick();
  timerInterval = setInterval(() => {
    if (!project?.liveStartedAt) { stopTimerTick(); return; }
    document.getElementById('timer-display').textContent = formatElapsedPaused(project.liveStartedAt, project.obsTimerPausedDuration, project.obsBrbPausedAt);
    updateStickyBar();
    updateActivePace();
  }, 1000);
}

function stopTimerTick() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/* ── Countdown ───────────────────────────────────────────────────── */
function renderCountdown() {
  const display  = document.getElementById('countdown-display');
  const labelEl  = document.getElementById('countdown-label-display');
  const clearBtn = document.getElementById('clear-countdown-btn');
  const active   = !!project.countdownTo;

  clearBtn.classList.toggle('hidden', !active);
  labelEl.textContent = project.countdownLabel || 'Countdown';

  if (!active) {
    display.textContent = '–';
    display.classList.remove('expired');
    stopCountdownTick();
    return;
  }
  tickCountdownDisplay();
  startCountdownTick();
}

function tickCountdownDisplay() {
  const display   = document.getElementById('countdown-display');
  const remaining = new Date(project.countdownTo).getTime() - Date.now();
  if (remaining <= 0) {
    display.textContent = "Time's up!";
    display.classList.add('expired');
    stopCountdownTick();
  } else {
    display.textContent = formatRemaining(remaining);
    display.classList.remove('expired');
  }
}

function startCountdownTick() {
  stopCountdownTick();
  countdownInterval = setInterval(tickCountdownDisplay, 1000);
}

function stopCountdownTick() {
  clearInterval(countdownInterval);
  countdownInterval = null;
}

/* ── Project list modal ──────────────────────────────────────────── */
function renderProjectModal() {
  document.getElementById('project-list-modal').innerHTML = projects.length
    ? projects.map(p => `
      <div class="project-row${p.id === project?.id ? ' active' : ''}">
        <span class="project-row-name">${esc(p.name)}</span>
        <div class="project-row-actions">
          ${p.id === project?.id
            ? '<span class="current-badge">Current</span>'
            : `<button class="btn-ghost project-switch" data-id="${esc(p.id)}">Switch</button>`}
          <button class="icon-btn project-delete" data-id="${esc(p.id)}" title="Delete project">&#x2715;</button>
        </div>
      </div>
    `).join('')
    : '<p class="panel-empty">No projects yet.</p>';
}

/* ── Overlay links ───────────────────────────────────────────────── */
let overlayUniversal = true;

/* ── Overlay widget prefs ────────────────────────────────────────── */
const OVERLAY_PREFS_KEY = 'overlay-widget-prefs';
const OVERLAY_DEFAULTS  = { bg: 'transparent', size: 'md', interval: 8, show: '' };

function getOverlayPrefs() {
  try { return JSON.parse(localStorage.getItem(OVERLAY_PREFS_KEY) || '{}'); }
  catch { return {}; }
}

function setOverlayPref(view, param, value) {
  const prefs = getOverlayPrefs();
  if (!prefs[view]) prefs[view] = {};
  prefs[view][param] = value;
  localStorage.setItem(OVERLAY_PREFS_KEY, JSON.stringify(prefs));
}

function buildOverlayUrl(base, view, prefs) {
  const p   = { ...OVERLAY_DEFAULTS, ...(prefs[view] || {}) };
  const sep = base.includes('?') ? '&' : '?';
  let url   = `${base}${sep}view=${view}`;
  if (p.bg && p.bg !== 'transparent') url += `&bg=${p.bg}`;
  if (p.size && p.size !== 'md')      url += `&size=${p.size}`;
  if (view === 'lowerthird') {
    const iv = parseInt(p.interval);
    const sh = parseInt(p.show);
    if (iv && iv !== 8) url += `&interval=${iv}`;
    if (sh && sh > 0)   url += `&show=${sh}`;
  }
  if (view === 'countdown') {
    const mins = parseFloat(p.countdownMinutes);
    if (mins > 0) url += `&countdownMinutes=${mins}`;
    if (p.countdownLabel?.trim()) url += `&countdownLabel=${encodeURIComponent(p.countdownLabel.trim())}`;
  }
  return url;
}

function updateCardUrl(view) {
  const card = document.querySelector(`.overlay-card[data-view="${view}"]`);
  if (!card) return;
  const base  = overlayUniversal
    ? `${location.origin}/overlay.html`
    : `${location.origin}/overlay.html?project=${encodeURIComponent(project.id)}`;
  const prefs = getOverlayPrefs();
  const url   = buildOverlayUrl(base, view, prefs);
  const p     = { ...OVERLAY_DEFAULTS, ...(prefs[view] || {}) };

  card.querySelector('.overlay-url-text').textContent = url;
  card.querySelector('.copy-overlay-url').dataset.url = url;
  const previewA = card.querySelector('a.btn-ghost[target="_blank"]');
  if (previewA) previewA.href = url;

  card.querySelectorAll('.oc-chip').forEach(chip => {
    const cur = String(p[chip.dataset.param] ?? OVERLAY_DEFAULTS[chip.dataset.param]);
    chip.classList.toggle('active', chip.dataset.value === cur);
  });
}

function renderOverlayLinks() {
  const universalBase = `${location.origin}/overlay.html`;
  const pinnedBase    = `${location.origin}/overlay.html?project=${encodeURIComponent(project.id)}`;
  const base          = overlayUniversal ? universalBase : pinnedBase;

  const modeBtn = document.getElementById('overlay-mode-btn');
  if (modeBtn) {
    modeBtn.textContent  = overlayUniversal ? 'Pinned' : 'Universal';
    modeBtn.title        = overlayUniversal
      ? 'Switch to URLs pinned to this project'
      : 'Switch to universal URLs (follow active project)';
  }

  const overlays = [
    { view: 'segments',   label: 'Segment list',      desc: 'All segments with done/pending indicators. Rec. size: 360 &times; auto.' },
    { view: 'tasks',      label: 'Task list',          desc: 'Open tasks only, auto-refreshes. Rec. size: 360 &times; auto.' },
    { view: 'current',    label: 'Current segment',    desc: 'Active segment + "up next". Rec. size: 500 &times; auto.' },
    { view: 'progress',   label: 'Progress bar',       desc: 'Compact segment progress. Rec. size: 500 &times; 80.' },
    { view: 'timer',      label: 'Stream timer',       desc: 'Elapsed time since Go Live. Rec. size: 260 &times; 80.' },
    { view: 'countdown',  label: 'Countdown',          desc: 'Time remaining to your set countdown. Rec. size: 300 &times; 90.' },
    { view: 'social',     label: 'Social / CTA',       desc: 'Your configured social handles. Rec. size: 320 &times; auto.' },
    { view: 'transition', label: 'Just did / Up next', desc: 'Last completed &rarr; next segment. Rec. size: 560 &times; auto.' },
    { view: 'done',       label: 'Recently completed', desc: 'Last 4 completed tasks. Rec. size: 360 &times; auto.' },
    { view: 'lowerthird', label: 'Lower thirds',       desc: 'Rotating tips for the active segment. Rec. size: 620 &times; auto.' },
    { view: 'health',     label: 'Stream health',     desc: 'Live OBS stats: bitrate, dropped frames, CPU. Requires OBS connection. Rec. size: 360 &times; auto.' },
  ];

  const prefs = getOverlayPrefs();

  document.getElementById('overlay-grid').innerHTML = overlays.map(o => {
    const url = buildOverlayUrl(base, o.view, prefs);
    const p   = { ...OVERLAY_DEFAULTS, ...(prefs[o.view] || {}) };

    const bgChips = ['transparent', 'green', 'magenta'].map(v =>
      `<button class="oc-chip${p.bg === v ? ' active' : ''}" data-view="${o.view}" data-param="bg" data-value="${v}">${v === 'transparent' ? 'none' : v}</button>`
    ).join('');

    const sizeChips = ['sm', 'md', 'lg'].map(v =>
      `<button class="oc-chip${p.size === v ? ' active' : ''}" data-view="${o.view}" data-param="size" data-value="${v}">${v}</button>`
    ).join('');

    const ltControls = o.view === 'lowerthird' ? `
      <div class="oc-row">
        <span class="oc-label">interval</span>
        <input class="oc-number" type="number" min="3" max="120" value="${parseInt(p.interval) || 8}" data-view="${o.view}" data-param="interval" />
        <span class="oc-unit">s</span>
        <span class="oc-label oc-label--gap">show</span>
        <input class="oc-number" type="number" min="1" max="60" value="${parseInt(p.show) || ''}" placeholder="–" data-view="${o.view}" data-param="show" />
        <span class="oc-unit">s</span>
      </div>` : '';

    const cdControls = o.view === 'countdown' ? `
      <div class="oc-row">
        <span class="oc-label">duration</span>
        <input class="oc-number" type="number" min="0" max="480" step="0.5"
               value="${parseFloat(p.countdownMinutes) || ''}" placeholder="–"
               data-view="${o.view}" data-param="countdownMinutes" />
        <span class="oc-unit">min</span>
      </div>
      <div class="oc-row">
        <span class="oc-label">label</span>
        <input class="oc-text" type="text" maxlength="40"
               value="${esc(p.countdownLabel || '')}" placeholder="Countdown"
               data-view="${o.view}" data-param="countdownLabel" />
      </div>` : '';

    return `
      <div class="overlay-card" data-view="${o.view}">
        <div class="overlay-card-top">
          <span class="overlay-card-label">${o.label}</span>
        </div>
        <p class="overlay-card-desc">${o.desc}</p>
        <div class="overlay-card-controls">
          <div class="oc-row">
            <span class="oc-label">bg</span>
            <div class="oc-chips">${bgChips}</div>
          </div>
          <div class="oc-row">
            <span class="oc-label">size</span>
            <div class="oc-chips">${sizeChips}</div>
          </div>
          ${ltControls}
          ${cdControls}
        </div>
        <div class="overlay-card-url">
          <code class="overlay-url-text">${esc(url)}</code>
          <div class="overlay-card-actions">
            <button class="btn-ghost copy-overlay-url" data-url="${esc(url)}">Copy</button>
            <a class="btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">Preview</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Live view ───────────────────────────────────────────────────── */
function renderLive() {
  if (!project) return;
  const segs    = project.segments || [];
  const done    = segs.filter(s => s.done).length;
  const current = segs.find(s => !s.done);
  const next    = current ? segs.slice(segs.indexOf(current) + 1).find(s => !s.done) : null;

  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const setHide = (id, hide) => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', hide); };

  setText('live-current-title', current?.title || 'All segments done');
  setText('live-current-desc',  current?.description || '');
  setText('live-next-title',    next?.title    || (current ? '— end of stream —' : ''));
  setText('live-next-desc',     next?.description || '');

  // Mark done button: enabled only if there is a current segment
  const md = document.getElementById('live-mark-done-btn');
  if (md) md.disabled = !current;

  // Highlight button: only when live + OBS connected
  const liveHasObs = !!project.liveStartedAt && OBS.status === 'connected';
  setHide('live-highlight-btn', !liveHasObs || !current);

  // Progress
  const pct = segs.length ? Math.round((done / segs.length) * 100) : 0;
  const fill = document.getElementById('live-seg-fill');
  if (fill) fill.style.width = `${pct}%`;
  setText('live-seg-counter', `${done} / ${segs.length} done`);

  // Pace text for current segment
  const live = document.getElementById('live-current-pace');
  if (live) {
    if (current && project.liveStartedAt) {
      const startIso = segStartIso(segs, segs.indexOf(current));
      if (startIso) {
        const elapsed = Math.floor((Date.now() - new Date(startIso)) / 1000);
        const planned = current.duration ? current.duration * 60 : null;
        const over    = planned && elapsed > planned;
        live.classList.toggle('live-pace--over', !!over);
        live.textContent = planned
          ? `${formatSegTime(elapsed)} / ${current.duration}:00`
          : formatSegTime(elapsed);
      } else {
        live.textContent = '';
      }
    } else if (current?.duration) {
      live.textContent = `${current.duration} min planned`;
      live.classList.remove('live-pace--over');
    } else {
      live.textContent = '';
    }
  }

  renderLiveTasks();
  renderLiveHealth();
  // Writeup / chapters buttons appear in the Live timer card too — share the same IDs
  updateWriteupButton();
  updateChaptersButton();
}

function renderLiveTasks() {
  const tasks = project.tasks || [];
  const open  = tasks.filter(t => !t.completed);
  const countEl = document.getElementById('live-tasks-count');
  if (countEl) countEl.textContent = String(open.length);
  const listEl = document.getElementById('live-tasks-list');
  if (listEl) {
    listEl.innerHTML = open.slice(0, 6).map(t =>
      `<li class="live-task-row" data-id="${esc(t.id)}"><label><input type="checkbox" /> <span>${esc(t.text)}</span></label></li>`
    ).join('');
  }
}

function renderLiveHealth() {
  const s = project.obsStats;
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  if (!s) {
    setText('live-h-kbps',  '–');
    setText('live-h-drops', '–');
    setText('live-h-fps',   '–');
    setText('live-h-cpu',   '–');
    setText('live-h-stale', OBS.status === 'connected' ? 'Waiting for stats…' : 'OBS not connected');
    return;
  }
  setText('live-h-kbps',  `${s.kbps || 0} kbps`);
  setText('live-h-drops', `${(s.droppedFramesPct ?? 0).toFixed(2)}%`);
  setText('live-h-fps',   `${(s.fps ?? 0).toFixed(1)}`);
  setText('live-h-cpu',   `${(s.cpuPct ?? 0).toFixed(1)}%`);
  const stale = s.updatedAt && (Date.now() - new Date(s.updatedAt).getTime() > 15000);
  setText('live-h-stale', stale ? 'Stats stale (>15s old)' : '');
}

async function populateLiveSceneSelect() {
  const wrap = document.getElementById('live-scene-wrap');
  if (!wrap) return;
  if (OBS.status !== 'connected') {
    wrap.innerHTML = '<span class="live-scene-empty">OBS not connected</span>';
    return;
  }
  const scenes = await OBS.getScenes();
  if (!scenes.length) {
    wrap.innerHTML = '<span class="live-scene-empty">No scenes from OBS</span>';
    return;
  }
  let current = '';
  try { current = (await OBS.getCurrentScene()) || ''; } catch {}
  const options = scenes.map(s =>
    `<option value="${s.replace(/"/g, '&quot;')}"${s === current ? ' selected' : ''}>${esc(s)}</option>`
  ).join('');
  wrap.innerHTML = `<select id="live-scene-select" class="live-scene-select">${options}</select>`;
}

/* ── Style management ────────────────────────────────────────────── */
function getAllStylesForProject() {
  // Order: presets, then global styles, then project styles
  const proj = project?.styles || [];
  return [
    ...PRESET_STYLES.map(s   => ({ ...s, scope: 'preset' })),
    ...globalStyles.map(s    => ({ ...s, scope: 'global' })),
    ...proj.map(s            => ({ ...s, scope: 'project' })),
  ];
}

function findStyle(id) {
  if (!id) return null;
  return getAllStylesForProject().find(s => s.id === id) || null;
}

/* Parse a color value (rgba/hex/transparent) into a { hex, alpha } pair
   so it can be edited with a color picker + opacity slider. */
function parseColorValue(str) {
  const s = (str || '').trim();
  if (!s || s === 'transparent') return { hex: '#000000', alpha: 0 };
  const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (rgba) {
    const r = parseInt(rgba[1], 10), g = parseInt(rgba[2], 10), b = parseInt(rgba[3], 10);
    const a = rgba[4] !== undefined ? parseFloat(rgba[4]) : 1;
    return { hex: '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join(''), alpha: a };
  }
  const hex6 = s.match(/^#([0-9a-fA-F]{6})$/);
  if (hex6) return { hex: '#' + hex6[1].toLowerCase(), alpha: 1 };
  const hex3 = s.match(/^#([0-9a-fA-F]{3})$/);
  if (hex3) return { hex: '#' + hex3[1].split('').map(c => c+c).join('').toLowerCase(), alpha: 1 };
  return { hex: '#000000', alpha: 1 };
}

function buildRgba(hex, alpha) {
  const m = (hex || '').match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return hex || 'transparent';
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function defaultStyleBlank() {
  return {
    id: `style-${Date.now()}`,
    name: 'New style',
    font: 'system-ui',
    accent: '#60a5fa', text: '#e8edf5',
    surface: 'rgba(9, 11, 16, 0.88)', border: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 18, borderWidth: 1, padding: 16,
    glow: false, shadow: false,
  };
}

function renderStylePanel() {
  if (!project) return;
  const sel  = document.getElementById('style-active-select');
  const meta = document.getElementById('style-active-meta');
  if (!sel) return;
  const all  = getAllStylesForProject();
  const active = project.activeStyleId || '';
  sel.innerHTML = [
    '<option value="">— Default (Minimal)  —</option>',
    ...['preset', 'global', 'project'].flatMap(scope => {
      const group = all.filter(s => s.scope === scope);
      if (!group.length) return [];
      const label = { preset: 'Presets', global: 'Global', project: 'Project' }[scope];
      return [
        `<optgroup label="${label}">`,
        ...group.map(s => `<option value="${esc(s.id)}"${s.id === active ? ' selected' : ''}>${esc(s.name)}</option>`),
        '</optgroup>',
      ];
    }),
  ].join('');
  const cur = findStyle(active);
  if (meta) {
    if (cur) {
      meta.textContent = `${cur.scope === 'preset' ? 'Preset' : cur.scope === 'global' ? 'Global' : 'Project'} · font ${cur.font} · accent ${cur.accent}`;
    } else {
      meta.textContent = 'No style set — overlays use the default Minimal look.';
    }
  }
}

function readStyleForm() {
  const form = document.getElementById('style-form');
  const fd   = new FormData(form);
  const surfaceAlpha = parseInt(fd.get('surfaceAlpha') || '88', 10) / 100;
  const borderAlpha  = parseInt(fd.get('borderAlpha')  || '10', 10) / 100;
  return {
    name:         (fd.get('name') || '').trim() || 'Untitled',
    font:         fd.get('font') || 'system-ui',
    accent:       fd.get('accent')  || '#60a5fa',
    text:         fd.get('text')    || '#e8edf5',
    surface:      buildRgba(fd.get('surfaceColor') || '#090b10', surfaceAlpha),
    border:       buildRgba(fd.get('borderColor')  || '#ffffff', borderAlpha),
    borderRadius: parseInt(fd.get('borderRadius') || '18', 10),
    borderWidth:  parseInt(fd.get('borderWidth')  || '1',  10),
    padding:      parseInt(fd.get('padding')      || '16', 10),
    glow:         !!fd.get('glow'),
    shadow:       !!fd.get('shadow'),
  };
}

function applyStyleToPreview(s) {
  const root = document.getElementById('style-preview');
  if (!root) return;
  root.style.setProperty('--ov-font',         s.font && s.font !== 'system-ui' ? `'${s.font}', system-ui, sans-serif` : 'system-ui, sans-serif');
  root.style.setProperty('--ov-accent',       s.accent);
  root.style.setProperty('--ov-text',         s.text);
  root.style.setProperty('--ov-surface',      s.surface);
  root.style.setProperty('--ov-border',       s.border);
  root.style.setProperty('--ov-radius',       `${s.borderRadius}px`);
  root.style.setProperty('--ov-border-width', `${s.borderWidth}px`);
  root.style.setProperty('--ov-padding',      `${s.padding}px`);
  root.style.setProperty('--ov-glow',         s.glow   ? `0 0 24px ${s.accent}` : 'none');
  root.style.setProperty('--ov-text-shadow',  s.shadow ? '0 1px 3px rgba(0,0,0,0.6)' : 'none');
  // Lazy load preview font
  if (s.font && s.font !== 'system-ui') {
    const id = `pf-${s.font.replace(/\s/g, '-')}`;
    if (!document.getElementById(id)) {
      const slug = ({
        'Inter':           'Inter:wght@400;700',
        'Space Grotesk':   'Space+Grotesk:wght@400;700',
        'Roboto Slab':     'Roboto+Slab:wght@400;700',
        'JetBrains Mono':  'JetBrains+Mono:wght@400;700',
      })[s.font];
      if (slug) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${slug}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }
}

function updateStylePreviewFromForm() {
  const s = readStyleForm();
  applyStyleToPreview(s);
  // Update slider labels
  const form = document.getElementById('style-form');
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText('style-radius-val',  `${s.borderRadius}px`);
  setText('style-bw-val',      `${s.borderWidth}px`);
  setText('style-pad-val',     `${s.padding}px`);
  setText('style-surface-val', `${form.elements.surfaceAlpha.value}%`);
  setText('style-border-val',  `${form.elements.borderAlpha.value}%`);
  // Sync hex inputs ↔ color pickers
  if (form.elements.accentHex) form.elements.accentHex.value = s.accent;
  if (form.elements.textHex)   form.elements.textHex.value   = s.text;
}

function openStyleEditor(style, scope) {
  editingStyleId    = style.id;
  editingStyleScope = scope;
  const form = document.getElementById('style-form');
  const surf = parseColorValue(style.surface);
  const bord = parseColorValue(style.border);
  form.elements.name.value         = style.name;
  form.elements.font.value         = style.font || 'system-ui';
  form.elements.accent.value       = style.accent;
  form.elements.text.value         = style.text;
  form.elements.surfaceColor.value = surf.hex;
  form.elements.surfaceAlpha.value = Math.round(surf.alpha * 100);
  form.elements.borderColor.value  = bord.hex;
  form.elements.borderAlpha.value  = Math.round(bord.alpha * 100);
  form.elements.borderRadius.value = style.borderRadius;
  form.elements.borderWidth.value  = style.borderWidth;
  form.elements.padding.value      = style.padding;
  form.elements.glow.checked       = !!style.glow;
  form.elements.shadow.checked     = !!style.shadow;

  document.getElementById('style-modal-title').textContent =
    scope === 'preset'  ? `Preview Preset: ${style.name}` :
    scope === 'global'  ? `Edit Global Style: ${style.name}` :
                          `Edit Style: ${style.name}`;

  // Presets are read-only — disable save/delete, leave "Save as global" as a clone path
  const saveBtn   = form.querySelector('button[type="submit"]');
  const deleteBtn = document.getElementById('style-delete-btn');
  saveBtn.disabled   = scope === 'preset';
  deleteBtn.classList.toggle('hidden', scope === 'preset');

  updateStylePreviewFromForm();
  openModal('style-modal');
}

async function saveProjectStyle(style) {
  (project.styles ??= []);
  const idx = project.styles.findIndex(s => s.id === style.id);
  if (idx >= 0) project.styles[idx] = style;
  else          project.styles.push(style);
  await saveProject();
}

async function saveGlobalStyle(style) {
  const exists = globalStyles.find(s => s.id === style.id);
  if (exists) await api('PUT', `/styles/${style.id}`, style);
  else        await api('POST', '/styles', style);
  globalStyles = await api('GET', '/styles').catch(() => globalStyles);
}

async function deleteStyleAnywhere(id) {
  if (project?.styles?.some(s => s.id === id)) {
    project.styles = project.styles.filter(s => s.id !== id);
    if (project.activeStyleId === id) project.activeStyleId = null;
    await saveProject();
  } else if (globalStyles.some(s => s.id === id)) {
    await api('DELETE', `/styles/${id}`);
    globalStyles = globalStyles.filter(s => s.id !== id);
    if (project && project.activeStyleId === id) {
      project.activeStyleId = null;
      await saveProject();
    }
  }
}

/* ── Setup view meta ─────────────────────────────────────────────── */
function renderSetupMeta() {
  if (!project) return;
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText('setup-name',     project.name);
  setText('setup-desc',     project.description || '—');
  setText('setup-focus',    project.focus       || '—');
  setText('setup-platform', project.platform    || '—');

  const obs = OBS.getSettings();
  setText('setup-obs-status', OBS.status);
  setText('setup-obs-pc',     obs.streamingPcIp || '—');
  setText('setup-obs-brb',    obs.brbScene      || '—');
  setText('setup-obs-text',   obs.textSource    || '—');
}

/* ── Modal helpers ───────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function setWizardStep(n) {
  currentWizardStep = n;

  [1, 2, 3].forEach(i =>
    document.getElementById(`seg-panel-${i}`).classList.toggle('hidden', i !== n)
  );

  document.querySelectorAll('.wizard-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.toggle('active', s === n);
    dot.classList.toggle('done',   s < n);
  });

  const backBtn = document.getElementById('wizard-back-btn');
  const skipBtn = document.getElementById('wizard-skip-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  backBtn.classList.toggle('hidden', n === 1);
  skipBtn.classList.toggle('hidden', n === 1);
  nextBtn.textContent = n === 3 ? 'Add segment' : 'Next →';

  if (n === 2 && capabilities.aiTips) {
    const title   = document.getElementById('segment-form').elements.title.value.trim();
    const tipsEl  = document.getElementById('segment-form').elements.tips;
    if (title && !tipsEl.value.trim()) triggerGenerateTips();
    else document.getElementById('generate-tips-btn').classList.remove('hidden');
  }

  if (n === 3 && capabilities.aiTips) {
    const title = document.getElementById('segment-form').elements.title.value.trim();
    if (title) triggerSuggestTasks();
    else document.getElementById('suggest-tasks-btn').classList.remove('hidden');
  }
}

async function populateObsSceneField(currentValue) {
  const wrap = document.getElementById('obs-scene-wrap');
  if (!wrap) return;

  if (OBS.status !== 'connected') {
    wrap.innerHTML = `<input name="obsScene" type="text" placeholder="OBS scene name (optional)" value="${currentValue.replace(/"/g, '&quot;')}" />`;
    return;
  }

  const scenes = await OBS.getScenes();
  if (!scenes.length) {
    wrap.innerHTML = `<input name="obsScene" type="text" placeholder="OBS scene name (optional)" value="${currentValue.replace(/"/g, '&quot;')}" />`;
    return;
  }

  const options = ['<option value="">— none —</option>',
    ...scenes.map(s => `<option value="${s.replace(/"/g, '&quot;')}"${s === currentValue ? ' selected' : ''}>${s}</option>`)
  ].join('');
  wrap.innerHTML = `<select name="obsScene">${options}</select>`;
}

async function openSegmentModal(seg = null) {
  editingSegmentKey = seg ? seg.key : null;
  wizardMode        = !seg;
  currentWizardStep = 1;

  document.getElementById('segment-modal-title').textContent = seg ? 'Edit Segment' : 'Add Segment';

  const form = document.getElementById('segment-form');
  form.elements.title.value       = seg?.title       ?? '';
  form.elements.description.value = seg?.description ?? '';
  form.elements.duration.value    = seg?.duration    ?? '';
  await populateObsSceneField(seg?.obsScene ?? '');
  form.elements.tips.value        = (seg?.tips || []).join('\n');

  document.getElementById('task-suggestions').classList.add('hidden');
  document.getElementById('task-suggestion-list').innerHTML = '';

  if (wizardMode) {
    document.getElementById('wizard-progress').classList.remove('hidden');
    document.getElementById('wizard-nav').classList.remove('hidden');
    document.getElementById('segment-submit-btn').classList.add('hidden');
    document.getElementById('generate-tips-btn').classList.add('hidden');
    document.getElementById('suggest-tasks-btn').classList.add('hidden');
    setWizardStep(1);
  } else {
    document.getElementById('wizard-progress').classList.add('hidden');
    document.getElementById('wizard-nav').classList.add('hidden');
    document.getElementById('segment-submit-btn').classList.remove('hidden');
    [1, 2, 3].forEach(i =>
      document.getElementById(`seg-panel-${i}`).classList.remove('hidden')
    );
    document.getElementById('generate-tips-btn').classList.toggle('hidden', !capabilities.aiTips);
    document.getElementById('suggest-tasks-btn').classList.toggle('hidden', !capabilities.aiTips);
  }

  openModal('segment-modal');
}

function closeSegmentModal() {
  editingSegmentKey = null;
  wizardMode        = false;
  currentWizardStep = 1;
  document.getElementById('segment-form').reset();
  document.getElementById('task-suggestions').classList.add('hidden');
  document.getElementById('task-suggestion-list').innerHTML = '';
  closeModal('segment-modal');
}

/* ── Events ──────────────────────────────────────────────────────── */
function bindEvents() {

  /* Generic close buttons */
  document.querySelectorAll('.close-modal').forEach(btn =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      if (id === 'segment-modal') closeSegmentModal();
      else closeModal(id);
    })
  );
  document.querySelectorAll('.modal-backdrop').forEach(el =>
    el.addEventListener('click', () => {
      const modal = el.closest('.modal');
      if (modal.id === 'segment-modal') closeSegmentModal();
      else modal.classList.add('hidden');
    })
  );

  /* Project switcher */
  document.getElementById('switch-project-btn').addEventListener('click', () => {
    renderProjectModal();
    openModal('project-modal');
  });
  document.getElementById('create-first-project').addEventListener('click', () => {
    renderProjectModal();
    openModal('project-modal');
  });

  /* Project list actions */
  document.getElementById('project-list-modal').addEventListener('click', async e => {
    const switchBtn = e.target.closest('.project-switch');
    const deleteBtn = e.target.closest('.project-delete');
    if (switchBtn) {
      await switchProject(switchBtn.dataset.id);
      closeModal('project-modal');
      render();
      Router.replaceView(Router.current);
    }
    if (deleteBtn) {
      const id     = deleteBtn.dataset.id;
      const target = projects.find(p => p.id === id);
      if (!confirm(`Delete "${target?.name ?? 'this project'}"? This cannot be undone.`)) return;
      await api('DELETE', `/projects/${id}`);
      projects = projects.filter(p => p.id !== id);
      if (project?.id === id) {
        stopTimerTick();
        stopCountdownTick();
        project = null;
        localStorage.removeItem(LOCAL_KEY);
        if (projects.length) await switchProject(projects[0].id);
      }
      renderProjectModal();
      render();
    }
  });

  /* New project */
  document.getElementById('new-project-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const p = await api('POST', '/projects', data);
    projects.push({ id: p.id, name: p.name, description: p.description });
    stopTimerTick();
    stopCountdownTick();
    project = p;
    localStorage.setItem(LOCAL_KEY, p.id);
    filter = 'all';
    api('PUT', '/active', { projectId: p.id }).catch(() => {});
    e.target.reset();
    closeModal('project-modal');
    render();
    Router.replaceView(Router.current);
  });

  /* Edit project — open */
  document.getElementById('edit-project-btn').addEventListener('click', () => {
    const form = document.getElementById('edit-project-form');
    form.elements.name.value        = project.name;
    form.elements.description.value = project.description || '';
    form.elements.focus.value       = project.focus       || '';
    form.elements.platform.value    = project.platform    || '';
    const s = project.social || {};
    form.elements.social_twitch.value   = s.twitch   || '';
    form.elements.social_youtube.value  = s.youtube  || '';
    form.elements.social_github.value   = s.github   || '';
    form.elements.social_discord.value  = s.discord  || '';
    form.elements.social_twitter.value  = s.twitter  || '';
    form.elements.social_website.value  = s.website  || '';
    openModal('edit-modal');
  });

  /* Edit project — save */
  document.getElementById('edit-project-form').addEventListener('submit', async e => {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const social = {};
    ['twitch', 'youtube', 'github', 'discord', 'twitter', 'website'].forEach(k => {
      const v = (raw[`social_${k}`] || '').trim();
      if (v) social[k] = v;
      delete raw[`social_${k}`];
    });
    raw.social = social;
    Object.assign(project, raw);
    await saveProject();
    const summary = projects.find(p => p.id === project.id);
    if (summary) { summary.name = project.name; summary.description = project.description; }
    closeModal('edit-modal');
    render();
  });

  /* Add segment */
  document.getElementById('add-segment-btn').addEventListener('click', () => openSegmentModal());

  /* Segment form: add or edit */
  document.getElementById('segment-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd       = new FormData(e.target);
    const title    = fd.get('title').trim();
    const desc     = fd.get('description').trim();
    const tips     = (fd.get('tips') || '').split('\n').map(t => t.trim()).filter(Boolean);
    const durRaw   = fd.get('duration');
    const duration = durRaw ? parseInt(durRaw, 10) || null : null;
    const obsScene = (fd.get('obsScene') || '').trim() || null;
    if (editingSegmentKey) {
      const seg = (project.segments || []).find(s => s.key === editingSegmentKey);
      if (seg) { seg.title = title; seg.description = desc; seg.tips = tips; seg.duration = duration; seg.obsScene = obsScene; }
    } else {
      (project.segments ??= []).push({
        key: Date.now().toString(), title, description: desc, tips, duration, obsScene, done: false,
      });
    }
    await saveProject();
    closeSegmentModal();
    renderSegments();
  });

  /* Segment list: toggle, edit, delete */
  document.getElementById('segment-list').addEventListener('click', async e => {
    const btn = e.target.closest('[data-key]');
    if (!btn) return;
    const key = btn.dataset.key;
    if (e.target.closest('.segment-toggle')) {
      const seg = (project.segments || []).find(s => s.key === key);
      if (seg) {
        seg.done   = !seg.done;
        seg.doneAt = seg.done ? new Date().toISOString() : null;
        await saveProject();
        renderSegments();
        updateStickyBar();
        if (seg.done) {
          if (activeSegmentKey === seg.key) activeSegmentKey = null;
          if (OBS.status === 'connected') {
            const nextSeg = (project.segments || []).find(s => !s.done);
            if (nextSeg?.obsScene) OBS.switchToScene(nextSeg.obsScene);
            if (nextSeg) {
              activeSegmentKey = nextSeg.key;
              OBS.pushTextSource(nextSeg.title);
            }
          }
        } else {
          activeSegmentKey = null;
        }
      }
    }
    if (e.target.closest('.segment-edit')) {
      const seg = (project.segments || []).find(s => s.key === key);
      if (seg) openSegmentModal(seg);
    }
    if (e.target.closest('.segment-delete')) {
      if (!confirm('Remove this segment?')) return;
      project.segments = project.segments.filter(s => s.key !== key);
      await saveProject();
      renderSegments();
    }

    if (e.target.closest('.segment-highlight')) {
      const seg = (project.segments || []).find(s => s.key === key);
      if (!seg) return;
      const ts = new Date().toISOString();
      (project.highlights ??= []).push({ ts, segmentKey: key, segmentTitle: seg.title });
      await saveProject();
      OBS.saveReplayBuffer();
      showToast('★ Highlight logged' + (OBS.replayBufferActive ? ' + replay saved' : ''));
    }

    const nudgeBtn = e.target.closest('.seg-nudge-btn');
    if (nudgeBtn && nudgeBtn.dataset.action === 'tips') {
      const seg = (project.segments || []).find(s => s.key === nudgeBtn.dataset.key);
      if (!seg) return;
      nudgeBtn.textContent = 'Generating…';
      nudgeBtn.disabled = true;
      try {
        const res = await api('POST', '/generate-tips', {
          title:              seg.title,
          projectName:        project.name,
          projectDescription: project.description || '',
        });
        seg.tips = res.tips;
        await saveProject();
        renderSegments();
        showToast(`${res.tips.length} tips added`);
      } catch {
        nudgeBtn.textContent = '✦ Generate tips';
        nudgeBtn.disabled = false;
        showToast('Could not generate tips — check AI provider config');
      }
    }
  });

  /* Segment drag-to-reorder */
  (function () {
    const list = document.getElementById('segment-list');
    let dragging = null;

    list.addEventListener('dragstart', e => {
      const card = e.target.closest('.segment-card[draggable]');
      if (!card) return;
      dragging = card;
      setTimeout(() => card.classList.add('dragging'), 0);
      e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragover', e => {
      e.preventDefault();
      const card = e.target.closest('.segment-card');
      if (!card || card === dragging) return;
      list.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
      card.classList.add('drag-over');
    });

    list.addEventListener('dragleave', e => {
      if (!list.contains(e.relatedTarget))
        list.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
    });

    list.addEventListener('drop', async e => {
      e.preventDefault();
      const target = e.target.closest('.segment-card');
      if (!target || !dragging || target === dragging) return;
      const fromIdx = project.segments.findIndex(s => s.key === dragging.dataset.key);
      const toIdx   = project.segments.findIndex(s => s.key === target.dataset.key);
      const [moved] = project.segments.splice(fromIdx, 1);
      project.segments.splice(toIdx, 0, moved);
      await saveProject();
      renderSegments();
    });

    list.addEventListener('dragend', () => {
      list.querySelectorAll('.segment-card').forEach(c => c.classList.remove('dragging', 'drag-over'));
      dragging = null;
    });
  })();

  /* Generate tips button */
  document.getElementById('generate-tips-btn').addEventListener('click', triggerGenerateTips);

  /* Suggest tasks button */
  document.getElementById('suggest-tasks-btn').addEventListener('click', triggerSuggestTasks);

  /* Add selected suggested tasks (edit mode explicit button) */
  document.getElementById('add-suggested-tasks-btn').addEventListener('click', async () => {
    const n = await commitSuggestedTasks();
    if (n > 0) {
      await saveProject();
      renderTasks();
      document.getElementById('task-suggestions').classList.add('hidden');
      document.getElementById('task-suggestion-list').innerHTML = '';
      showToast(`${n} task${n !== 1 ? 's' : ''} added`);
    }
  });

  /* Wizard navigation */
  document.getElementById('wizard-next-btn').addEventListener('click', async () => {
    if (currentWizardStep === 1) {
      const title = document.getElementById('segment-form').elements.title.value.trim();
      if (!title) { document.getElementById('segment-form').elements.title.focus(); return; }
      setWizardStep(2);
    } else if (currentWizardStep === 2) {
      setWizardStep(3);
    } else {
      await commitSuggestedTasks();
      document.getElementById('segment-form').requestSubmit();
    }
  });

  document.getElementById('wizard-back-btn').addEventListener('click', () => {
    if (currentWizardStep > 1) setWizardStep(currentWizardStep - 1);
  });

  document.getElementById('wizard-skip-btn').addEventListener('click', async () => {
    if (currentWizardStep === 2) {
      setWizardStep(3);
    } else if (currentWizardStep === 3) {
      document.getElementById('segment-form').requestSubmit();
    }
  });

  /* Add selected AI-generated segments */
  function collectSelectedPlanSegments() {
    const list     = document.getElementById('segment-plan-list');
    const segments = JSON.parse(list.dataset.segments || '[]');
    const boxes    = list.querySelectorAll('input[type="checkbox"]');
    const selected = [];
    boxes.forEach((box, i) => { if (box.checked) selected.push(segments[i]); });
    return selected;
  }

  async function commitPlanSegments(selected) {
    (project.segments ??= []);
    const now = Date.now();
    selected.forEach((s, i) => {
      project.segments.push({
        key:         `${now + i}`,
        title:       s.title,
        description: s.description || '',
        duration:    s.duration    || null,
        done:        false,
        tips:        [],
      });
    });
    await saveProject();
    closeModal('segment-plan-modal');
    renderSegments();
  }

  document.getElementById('add-plan-segments-btn').addEventListener('click', async () => {
    const selected = collectSelectedPlanSegments();
    if (!selected.length) { closeModal('segment-plan-modal'); return; }
    await commitPlanSegments(selected);
  });

  document.getElementById('add-enrich-segments-btn').addEventListener('click', async () => {
    const selected = collectSelectedPlanSegments();
    if (!selected.length) { closeModal('segment-plan-modal'); return; }
    await commitPlanSegments(selected);
    openEnrichModal();
  });

  /* Generate write-up */
  document.getElementById('writeup-btn').addEventListener('click', async () => {
    const btn  = document.getElementById('writeup-btn');
    const orig = btn.textContent;
    btn.textContent = '✦ Generating…';
    btn.disabled = true;
    try {
      const completed = (project.segments || [])
        .filter(s => s.done)
        .map(s => ({ title: s.title, description: s.description || '' }));
      const streamDuration = project.liveStartedAt
        ? Math.floor((Date.now() - new Date(project.liveStartedAt).getTime()) / 1000)
        : null;
      const res = await api('POST', '/generate-writeup', {
        projectName:       project.name,
        description:       project.description  || '',
        focus:             project.focus         || '',
        platform:          project.platform      || '',
        completedSegments: completed,
        totalSegments:     (project.segments || []).length,
        streamDuration,
      });
      document.getElementById('writeup-output').value = res.writeup;
      openModal('writeup-modal');
    } catch {
      showToast('Could not generate write-up — check AI provider config');
    } finally {
      btn.textContent = orig;
      btn.disabled = false;
    }
  });

  /* Enrich done */
  document.getElementById('enrich-done-btn').addEventListener('click', () => closeModal('enrich-modal'));

  /* Copy write-up to clipboard */
  document.getElementById('copy-writeup-btn').addEventListener('click', async () => {
    const text = document.getElementById('writeup-output').value;
    const btn  = document.getElementById('copy-writeup-btn');
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy to clipboard'; }, 2000);
    } catch { /* clipboard denied */ }
  });

  /* Copy YouTube chapter timestamps */
  document.getElementById('chapters-btn').addEventListener('click', async () => {
    const text = buildChaptersText(project);
    const btn  = document.getElementById('chapters-btn');
    const orig = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    } catch {
      showToast('Could not copy to clipboard');
    }
  });

  /* Tasks: add */
  document.getElementById('add-task-button').addEventListener('click', addTask);
  document.getElementById('new-task').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTask(); }
  });

  /* Tasks: check + delete */
  document.getElementById('task-list').addEventListener('click', async e => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.matches('input[type="checkbox"]')) {
      const task = (project.tasks || []).find(t => t.id === id);
      if (task) {
        task.completed  = e.target.checked;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        await saveProject();
        renderTasks();
      }
    }
    if (e.target.matches('.delete-task')) {
      project.tasks = project.tasks.filter(t => t.id !== id);
      await saveProject();
      renderTasks();
    }
  });

  /* Clear completed */
  document.getElementById('clear-completed').addEventListener('click', async () => {
    project.tasks = (project.tasks || []).filter(t => !t.completed);
    await saveProject();
    renderTasks();
  });

  /* Filter buttons */
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.id.replace('filter-', '');
      document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn));
      renderTasks();
    });
  });

  /* Go Live / End Stream */
  document.getElementById('go-live-btn').addEventListener('click', async () => {
    if (project.liveStartedAt) {
      project.liveStartedAt = null;
      stopTimerTick();
    } else {
      project.liveStartedAt = new Date().toISOString();
      project.streamStartedAt = project.liveStartedAt;
      startTimerTick();
    }
    await saveProject();
    renderTimer();
    renderSegments();
    updateStickyBar();
  });

  /* Set countdown */
  document.getElementById('set-countdown-btn').addEventListener('click', () => {
    const form = document.getElementById('countdown-form');
    form.elements.countdownLabel.value = project.countdownLabel || '';
    if (project.countdownTo) {
      const d   = new Date(project.countdownTo);
      const pad = n => String(n).padStart(2, '0');
      form.elements.countdownTo.value =
        `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } else {
      form.elements.countdownTo.value = '';
    }
    openModal('countdown-modal');
  });

  document.getElementById('countdown-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    project.countdownLabel = fd.get('countdownLabel').trim() || null;
    project.countdownTo    = new Date(fd.get('countdownTo')).toISOString();
    await saveProject();
    closeModal('countdown-modal');
    renderCountdown();
  });

  document.getElementById('clear-countdown-btn').addEventListener('click', async () => {
    project.countdownTo    = null;
    project.countdownLabel = null;
    stopCountdownTick();
    await saveProject();
    renderCountdown();
  });

  /* Notes (debounced auto-save) */
  document.getElementById('notes-textarea').addEventListener('input', e => {
    project.notes = e.target.value;
    const indicator = document.getElementById('notes-indicator');
    indicator.textContent = 'Saving…';
    clearTimeout(notesDebounce);
    notesDebounce = setTimeout(async () => {
      await saveProject();
      indicator.textContent = 'Saved';
      setTimeout(() => { indicator.textContent = ''; }, 2000);
    }, 800);
  });

  /* Overlay URL mode toggle (Universal ↔ Pinned) */
  document.getElementById('overlay-mode-btn').addEventListener('click', function () {
    overlayUniversal = !overlayUniversal;
    renderOverlayLinks();
  });

  /* Overlay URL copy */
  document.getElementById('overlay-grid').addEventListener('click', async e => {
    const btn = e.target.closest('.copy-overlay-url');
    if (!btn) return;
    try {
      await navigator.clipboard.writeText(btn.dataset.url);
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    } catch { /* clipboard denied */ }
  });

  /* Overlay widget param chips */
  document.getElementById('overlay-grid').addEventListener('click', e => {
    const chip = e.target.closest('.oc-chip');
    if (!chip) return;
    const { view, param, value } = chip.dataset;
    setOverlayPref(view, param, value);
    updateCardUrl(view);
  });

  /* Overlay number + text inputs (interval, show, countdownMinutes, countdownLabel, …) */
  document.getElementById('overlay-grid').addEventListener('change', e => {
    const input = e.target.closest('.oc-number, .oc-text');
    if (!input) return;
    const { view, param } = input.dataset;
    setOverlayPref(view, param, input.value);
    updateCardUrl(view);
  });

  /* OBS settings button */
  document.getElementById('obs-settings-btn').addEventListener('click', () => {
    const s    = OBS.getSettings();
    const form = document.getElementById('obs-settings-form');
    form.elements.password.value      = s.password      || '';
    form.elements.streamingPcIp.value = s.streamingPcIp || '';
    form.elements.brbScene.value      = s.brbScene      || '';
    form.elements.ignoredScenes.value = s.ignoredScenes || '';
    form.elements.textSource.value    = s.textSource    || '';
    document.getElementById('obs-enable-toggle').checked = !!s.enabled;
    openModal('obs-modal');
  });

  /* OBS settings form submit */
  document.getElementById('obs-settings-form').addEventListener('submit', e => {
    e.preventDefault();
    const form    = e.target;
    const enabled = document.getElementById('obs-enable-toggle').checked;
    OBS.saveSettings({
      password:      form.elements.password.value.trim(),
      streamingPcIp: form.elements.streamingPcIp.value.trim(),
      brbScene:      form.elements.brbScene.value.trim(),
      ignoredScenes: form.elements.ignoredScenes.value.trim(),
      textSource:    form.elements.textSource.value.trim(),
      enabled,
    });
    closeModal('obs-modal');
    if (enabled) OBS.enable(); else OBS.disable();
    renderSetupMeta();
  });

  /* Setup view — open OBS modal */
  document.getElementById('setup-obs-btn')?.addEventListener('click', () => {
    document.getElementById('obs-settings-btn').click();
  });

  /* ── Style system ──────────────────────────────────────────────── */
  /* Active style dropdown */
  document.getElementById('style-active-select')?.addEventListener('change', async e => {
    if (!project) return;
    const id = e.target.value || null;
    project.activeStyleId = id;
    await saveProject();
    renderStylePanel();
    showToast(id ? 'Active style set' : 'Active style cleared');
  });

  /* Edit active style */
  document.getElementById('style-edit-btn')?.addEventListener('click', () => {
    const id   = project?.activeStyleId || '';
    const cur  = findStyle(id);
    if (cur) {
      openStyleEditor(cur, cur.scope);
    } else {
      // Nothing active — open the editor with a blank project-scoped draft
      openStyleEditor(defaultStyleBlank(), 'project');
    }
  });

  /* New style — blank project-scoped draft */
  document.getElementById('style-new-btn')?.addEventListener('click', () => {
    openStyleEditor(defaultStyleBlank(), 'project');
  });

  /* Live preview on any input change */
  document.getElementById('style-form')?.addEventListener('input', e => {
    // Sync hex text inputs back into color pickers
    const form = e.currentTarget;
    if (e.target.name === 'accentHex' && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
      form.elements.accent.value = e.target.value;
    }
    if (e.target.name === 'textHex' && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
      form.elements.text.value = e.target.value;
    }
    updateStylePreviewFromForm();
  });

  /* Save style (form submit) */
  document.getElementById('style-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (editingStyleScope === 'preset') return;
    const data = readStyleForm();
    const style = { id: editingStyleId, ...data };
    if (editingStyleScope === 'global') {
      await saveGlobalStyle({ ...style, global: true });
    } else {
      await saveProjectStyle(style);
      // Auto-activate if no active style was set
      if (!project.activeStyleId) {
        project.activeStyleId = style.id;
        await saveProject();
      }
    }
    closeModal('style-modal');
    renderStylePanel();
    showToast('Style saved');
  });

  /* Save as global — clones the current form data into a global style */
  document.getElementById('style-save-global-btn')?.addEventListener('click', async () => {
    const data = readStyleForm();
    const newId = `global-${Date.now()}`;
    await saveGlobalStyle({ id: newId, ...data, global: true });
    renderStylePanel();
    showToast(`Saved "${data.name}" as global`);
  });

  /* Delete style */
  document.getElementById('style-delete-btn')?.addEventListener('click', async () => {
    if (editingStyleScope === 'preset') return;
    if (!confirm('Delete this style? Overlays using it will fall back to the default look.')) return;
    await deleteStyleAnywhere(editingStyleId);
    closeModal('style-modal');
    renderStylePanel();
    showToast('Style deleted');
  });

  /* Setup view — reset project progress (for testing) */
  document.getElementById('reset-progress-btn')?.addEventListener('click', async () => {
    if (!project) return;
    if (!confirm('Reset all segments to not-done, uncheck all tasks, clear the live timer and highlights?\n\nProject details, segments, tasks, and notes are preserved.')) return;
    (project.segments || []).forEach(s => { s.done = false; s.doneAt = null; });
    (project.tasks    || []).forEach(t => { t.completed = false; t.completedAt = null; });
    project.liveStartedAt          = null;
    project.streamStartedAt        = null;
    project.obsTimerPausedDuration = 0;
    project.obsBrbPausedAt         = null;
    project.highlights             = [];
    activeSegmentKey               = null;
    stopTimerTick();
    await saveProject();
    render();
    showToast('Progress reset');
  });

  /* Live view — mark current segment done */
  document.getElementById('live-mark-done-btn')?.addEventListener('click', async () => {
    const segs    = project?.segments || [];
    const current = segs.find(s => !s.done);
    if (!current) return;
    current.done   = true;
    current.doneAt = new Date().toISOString();
    if (activeSegmentKey === current.key) activeSegmentKey = null;
    if (OBS.status === 'connected') {
      const nextSeg = (project.segments || []).find(s => !s.done);
      if (nextSeg?.obsScene) OBS.switchToScene(nextSeg.obsScene);
      if (nextSeg) {
        activeSegmentKey = nextSeg.key;
        OBS.pushTextSource(nextSeg.title);
      }
    }
    await saveProject();
    renderSegments();
    renderLive();
    updateStickyBar();
  });

  /* Live view — log highlight + save replay buffer */
  document.getElementById('live-highlight-btn')?.addEventListener('click', async () => {
    const seg = (project?.segments || []).find(s => !s.done);
    if (!seg) return;
    const ts = new Date().toISOString();
    (project.highlights ??= []).push({ ts, segmentKey: seg.key, segmentTitle: seg.title });
    await saveProject();
    OBS.saveReplayBuffer();
    showToast('★ Highlight logged' + (OBS.replayBufferActive ? ' + replay saved' : ''));
  });

  /* Live view — scene picker (manual switch) */
  document.getElementById('live-scene-wrap')?.addEventListener('change', e => {
    const sel = e.target.closest('#live-scene-select');
    if (!sel) return;
    OBS.switchToScene(sel.value);
  });

  /* Live view — quick task toggle */
  document.getElementById('live-tasks-list')?.addEventListener('click', async e => {
    const row = e.target.closest('.live-task-row');
    if (!row) return;
    if (!e.target.matches('input[type="checkbox"]')) return;
    const id   = row.dataset.id;
    const task = (project.tasks || []).find(t => t.id === id);
    if (!task) return;
    task.completed   = e.target.checked;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    await saveProject();
    renderTasks();
    renderLiveTasks();
    updateStickyBar();
  });
}

/* ── OBS status display ──────────────────────────────────────────── */
function renderOBSStatus() {
  const badge = document.getElementById('obs-settings-btn');
  if (badge) {
    badge.dataset.status = OBS.status;
    const labelEl = badge.querySelector('.obs-status-label');
    if (labelEl) labelEl.textContent = OBS.status === 'connected' ? 'OBS ●' : 'OBS';
  }
  const detail = document.getElementById('obs-connection-detail');
  if (detail) {
    detail.textContent =
      OBS.status === 'connected'  ? 'Connected' :
      OBS.status === 'connecting' ? 'Connecting…' : 'Disconnected';
  }
  const setupStatus = document.getElementById('setup-obs-status');
  if (setupStatus) setupStatus.textContent = OBS.status;
  // Refresh the live scene picker when status changes
  if (project) populateLiveSceneSelect();
}

async function addTask() {
  const input = document.getElementById('new-task');
  const text  = input.value.trim();
  if (!text || !project) return;
  (project.tasks ??= []).unshift({ id: Date.now().toString(), text, completed: false, completedAt: null });
  input.value = '';
  await saveProject();
  renderTasks();
}

function openEnrichModal() {
  const segs = project.segments || [];
  const list = document.getElementById('enrich-list');
  list.innerHTML = segs.map(s =>
    `<div class="enrich-row" data-key="${esc(s.key)}">
      <span class="enrich-row-title">${esc(s.title)}</span>
      <span class="enrich-row-status">Generating…</span>
    </div>`
  ).join('');
  openModal('enrich-modal');

  Promise.all(segs.map(async s => {
    const row = list.querySelector(`.enrich-row[data-key="${CSS.escape(s.key)}"] .enrich-row-status`);
    try {
      const res = await api('POST', '/generate-tips', {
        title:              s.title,
        projectName:        project.name,
        projectDescription: project.description || '',
      });
      s.tips = res.tips;
      if (row) { row.textContent = `${res.tips.length} tips added ✓`; row.className = 'enrich-row-status ok'; }
    } catch {
      if (row) { row.textContent = 'Failed'; row.className = 'enrich-row-status err'; }
    }
  })).then(() => saveProject());
}

async function generatePlan() {
  const btn  = document.getElementById('generate-plan-btn');
  if (btn) { btn.textContent = '✦ Generating…'; btn.disabled = true; }
  try {
    const res = await api('POST', '/generate-segments', {
      projectName:        project.name,
      projectDescription: project.description || '',
      focus:              project.focus    || '',
      platform:           project.platform || '',
    });
    const list = document.getElementById('segment-plan-list');
    list.innerHTML = res.segments.map((s, i) =>
      `<label class="segment-plan-row">
        <input type="checkbox" checked data-idx="${i}" />
        <div class="segment-plan-info">
          <strong>${esc(s.title)}</strong>
          ${s.description ? `<span>${esc(s.description)}</span>` : ''}
          ${s.duration    ? `<span class="segment-plan-dur">${s.duration} min</span>` : ''}
        </div>
      </label>`
    ).join('');
    list.dataset.segments = JSON.stringify(res.segments);
    document.getElementById('add-enrich-segments-btn').classList.toggle('hidden', !capabilities.aiTips);
    openModal('segment-plan-modal');
  } catch {
    showToast('Could not generate plan — check AI provider config');
  } finally {
    if (btn) { btn.textContent = '✦ Generate segment plan'; btn.disabled = false; }
  }
}

async function triggerGenerateTips() {
  const form  = document.getElementById('segment-form');
  const title = form.elements.title.value.trim();
  if (!title) return;
  const btn  = document.getElementById('generate-tips-btn');
  btn.classList.remove('hidden');
  const orig = btn.textContent;
  btn.textContent = 'Generating…';
  btn.disabled = true;
  try {
    const res = await api('POST', '/generate-tips', {
      title,
      projectName:        project.name,
      projectDescription: project.description || '',
    });
    form.elements.tips.value = res.tips.join('\n');
  } catch {
    showToast('Could not generate tips — check AI provider config');
  } finally {
    btn.textContent = orig;
    btn.disabled = false;
  }
}

async function triggerSuggestTasks() {
  const form  = document.getElementById('segment-form');
  const title = form.elements.title.value.trim();
  const desc  = form.elements.description.value.trim();
  if (!title) return;
  const btn  = document.getElementById('suggest-tasks-btn');
  btn.classList.remove('hidden');
  const orig = btn.textContent;
  btn.textContent = 'Suggesting…';
  btn.disabled = true;
  try {
    const res = await api('POST', '/suggest-tasks', {
      segmentTitle:       title,
      segmentDescription: desc,
      projectName:        project.name,
      projectDescription: project.description || '',
      focus:              project.focus    || '',
      platform:           project.platform || '',
    });
    const list = document.getElementById('task-suggestion-list');
    list.innerHTML = res.tasks.map((t, i) =>
      `<label class="task-suggestion-row">
        <input type="checkbox" checked data-idx="${i}" />
        <span>${esc(t)}</span>
      </label>`
    ).join('');
    list.dataset.tasks = JSON.stringify(res.tasks);
    document.getElementById('task-suggestions').classList.remove('hidden');
  } catch {
    showToast('Could not suggest tasks — check AI provider config');
  } finally {
    btn.textContent = orig;
    btn.disabled = false;
  }
}

async function commitSuggestedTasks() {
  const suggestEl = document.getElementById('task-suggestions');
  if (suggestEl.classList.contains('hidden')) return 0;
  const list     = document.getElementById('task-suggestion-list');
  const tasks    = JSON.parse(list.dataset.tasks || '[]');
  const boxes    = list.querySelectorAll('input[type="checkbox"]');
  const selected = [];
  boxes.forEach((box, i) => { if (box.checked) selected.push(tasks[i]); });
  if (!selected.length) return 0;
  (project.tasks ??= []);
  const now = Date.now();
  selected.forEach((text, i) => {
    project.tasks.unshift({ id: `${now + i}`, text, completed: false, completedAt: null });
  });
  return selected.length;
}

/* ── Theme ───────────────────────────────────────────────────────── */
const THEMES = ['teal', 'purple', 'orange', 'blue', 'red'];

function applyTheme(name) {
  if (!THEMES.includes(name)) name = 'teal';
  THEMES.forEach(t => document.body.classList.remove('theme-' + t));
  document.body.classList.add('theme-' + name);
  document.querySelectorAll('.theme-dot').forEach(d =>
    d.classList.toggle('active', d.dataset.theme === name)
  );
  localStorage.setItem('theme', name);
}

/* ── OBS WebSocket connection manager ────────────────────────────── */
const OBS_SETTINGS_KEY = 'obs-settings';

const OBS = (() => {
  if (typeof OBSWebSocket === 'undefined') {
    console.warn('obs-websocket.js not loaded — OBS integration disabled');
    return { get status() { return 'unavailable'; }, get replayBufferActive() { return false; },
             enable() {}, disable() {}, connect() {}, switchToScene() {}, saveReplayBuffer() {},
             getSettings() { return {}; }, saveSettings() {} };
  }

  let ws                 = null;
  let _status            = 'disconnected';
  let reconnectTimer     = null;
  let reconnectDelay     = 2000;
  const MAX_DELAY        = 30000;
  let statsInterval      = null;
  let enabled            = false;
  let replayBufferActive = false;

  function getSettings() {
    try { return JSON.parse(localStorage.getItem(OBS_SETTINGS_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveSettings(s) { localStorage.setItem(OBS_SETTINGS_KEY, JSON.stringify(s)); }

  function buildWsUrl() { return `wss://${location.hostname}/obs-ws`; }

  function setStatus(s) { _status = s; renderOBSStatus(); }

  async function connect() {
    if (!enabled) return;
    if (ws) { try { ws.disconnect(); } catch {} }
    setStatus('connecting');
    const { password } = getSettings();
    ws = new OBSWebSocket();
    ws.on('Identified',               onIdentified);
    ws.on('ConnectionClosed',         onDisconnected);
    ws.on('ConnectionError',          onDisconnected);
    ws.on('StreamStateChanged',       onStreamStateChanged);
    ws.on('CurrentProgramSceneChanged', onSceneChanged);
    ws.on('ReplayBufferStateChanged', ev => {
      replayBufferActive = ev.outputState === 'OBS_WEBSOCKET_OUTPUT_STARTED'
                        || ev.outputState === 'OBS_WEBSOCKET_OUTPUT_ACTIVE';
    });
    try { await ws.connect(buildWsUrl(), password || undefined); }
    catch (e) { onDisconnected(e); }
  }

  async function onIdentified() {
    setStatus('connected');
    reconnectDelay = 2000;
    clearTimeout(reconnectTimer);
    try {
      const r = await ws.call('GetStreamStatus');
      if (r.outputActive && project && !project.liveStartedAt) {
        project.liveStartedAt = new Date().toISOString();
        project.streamStartedAt = project.liveStartedAt;
        await saveProject();
        startTimerTick(); renderTimer(); renderSegments(); updateStickyBar();
        showToast('OBS is live — timer started');
      }
    } catch {}
    startStatsPolling();
    populateLiveSceneSelect();
    renderLive();
    renderSetupMeta();
  }

  function onDisconnected() {
    setStatus('disconnected');
    stopStatsPolling();
    if (!enabled) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
      connect();
    }, reconnectDelay);
  }

  async function onStreamStateChanged(data) {
    if (!project) return;
    if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STARTED') {
      if (!project.liveStartedAt) {
        project.liveStartedAt = new Date().toISOString();
        project.streamStartedAt = project.liveStartedAt;
        await saveProject();
        startTimerTick(); renderTimer(); renderSegments(); updateStickyBar();
        showToast('OBS stream started — timer running');
      }
    }
    if (data.outputState === 'OBS_WEBSOCKET_OUTPUT_STOPPED') {
      showToast("OBS stream stopped — click End Stream if you're done");
      const btn = document.getElementById('go-live-btn');
      if (btn) { btn.classList.add('obs-stream-stopped'); setTimeout(() => btn.classList.remove('obs-stream-stopped'), 4000); }
    }
  }

  function onSceneChanged(data) {
    if (!project) return;
    const { sceneName } = data;
    const settings = getSettings();

    if (settings.brbScene && sceneName === settings.brbScene) { handleBrbStart(); return; }
    if (settings.brbScene && project.obsBrbPausedAt)          { handleBrbEnd(); }

    const ignored = (settings.ignoredScenes || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (ignored.includes(sceneName)) return;

    const match = (project.segments || []).find(s => !s.done && s.obsScene === sceneName);
    if (match) {
      activeSegmentKey = match.key;
      renderSegments();
      pushTextSource(match.title);
      document.querySelector(`.segment-card[data-key="${CSS.escape(match.key)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Sync Live view scene dropdown to the new current scene
    const liveSel = document.getElementById('live-scene-select');
    if (liveSel) liveSel.value = sceneName;
  }

  async function handleBrbStart() {
    if (!project?.liveStartedAt || project.obsBrbPausedAt) return;
    project.obsBrbPausedAt = new Date().toISOString();
    await saveProject(); renderTimer();
    showToast('BRB scene — timer paused');
  }

  async function handleBrbEnd() {
    if (!project?.obsBrbPausedAt) return;
    const secs = Math.floor((Date.now() - new Date(project.obsBrbPausedAt).getTime()) / 1000);
    project.obsTimerPausedDuration = (project.obsTimerPausedDuration || 0) + secs;
    project.obsBrbPausedAt = null;
    await saveProject(); renderTimer();
    showToast('Back from BRB — timer resumed');
  }

  async function pushTextSource(text) {
    const { textSource } = getSettings();
    if (_status !== 'connected' || !textSource || !text) return;
    try {
      await ws.call('SetInputSettings', {
        inputName: textSource,
        inputSettings: { text },
      });
    } catch (e) { console.warn('OBS SetInputSettings failed:', e); }
  }

  async function switchToScene(sceneName) {
    if (_status !== 'connected' || !sceneName) return;
    try { await ws.call('SetCurrentProgramScene', { sceneName }); }
    catch (e) { console.warn('OBS SetCurrentProgramScene failed:', e); }
  }

  async function saveReplayBuffer() {
    if (_status !== 'connected') return;
    try {
      const r = await ws.call('GetReplayBufferStatus');
      if (!r.outputActive) return;
      await ws.call('SaveReplayBuffer');
      showToast('Replay buffer saved');
    } catch (e) { console.warn('OBS SaveReplayBuffer failed:', e); }
  }

  async function pollStats() {
    if (_status !== 'connected' || !project) return;
    try {
      const stats = await ws.call('GetStats');
      let kbps = 0;
      try {
        const out = await ws.call('GetOutputStatus', { outputName: 'simple_stream' });
        if (out?.outputTotalBytes) kbps = Math.round((out.outputTotalBytes * 8) / 1000);
      } catch {}
      const data = {
        kbps,
        droppedFramesPct: stats.outputTotalFrames > 0
          ? +((stats.outputSkippedFrames / stats.outputTotalFrames) * 100).toFixed(2) : 0,
        renderLagMs: stats.renderTotalFrames > 0
          ? +((stats.renderSkippedFrames / stats.renderTotalFrames) * 16.67).toFixed(1) : 0,
        fps:    +stats.activeFps.toFixed(2),
        cpuPct: +stats.cpuUsage.toFixed(1),
      };
      await api('PUT', `/projects/${project.id}/obs-stats`, data);
      project.obsStats = { ...data, updatedAt: new Date().toISOString() };
      renderLiveHealth();
    } catch {}
  }

  function startStatsPolling() {
    stopStatsPolling();
    pollStats();
    statsInterval = setInterval(pollStats, 5000);
  }
  function stopStatsPolling() { clearInterval(statsInterval); statsInterval = null; }

  function enable()  { enabled = true; connect(); }
  function disable() {
    enabled = false;
    clearTimeout(reconnectTimer); stopStatsPolling();
    if (ws) { try { ws.disconnect(); } catch {} ws = null; }
    setStatus('disconnected');
  }

  async function getScenes() {
    if (_status !== 'connected') return [];
    try {
      const { scenes } = await ws.call('GetSceneList');
      return (scenes || []).map(s => s.sceneName).reverse();
    } catch { return []; }
  }

  async function getCurrentScene() {
    if (_status !== 'connected') return '';
    try {
      const r = await ws.call('GetCurrentProgramScene');
      return r.currentProgramSceneName || r.sceneName || '';
    } catch { return ''; }
  }

  return {
    get status()            { return _status; },
    get replayBufferActive(){ return replayBufferActive; },
    enable, disable, connect, switchToScene, saveReplayBuffer, getSettings, saveSettings, getScenes, getCurrentScene, pushTextSource,
  };
})();

/* Init theme before first paint */
applyTheme(localStorage.getItem('theme') || 'teal');

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('theme-picker')?.addEventListener('click', e => {
    const dot = e.target.closest('.theme-dot');
    if (dot?.dataset.theme) applyTheme(dot.dataset.theme);
  });
  populateSocialIcons();
  init();
});
