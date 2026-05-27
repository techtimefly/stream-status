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

/* ── State ───────────────────────────────────────────────────────── */
const LOCAL_KEY       = 'stream-status-project-id';
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
let stickyInitialized = false;
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

/* ── Bootstrap ───────────────────────────────────────────────────── */
async function init() {
  try {
    [projects, capabilities] = await Promise.all([
      api('GET', '/projects'),
      api('GET', '/capabilities').catch(() => ({})),
    ]);
    const savedId = localStorage.getItem(LOCAL_KEY);
    const target  = projects.find(p => p.id === savedId)
      ? savedId
      : projects.length ? projects[0].id : null;
    if (target) await switchProject(target);
  } catch (e) {
    console.error('Init error:', e);
  }
  render();
  bindEvents();
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
  initStickyBar();
  updateStickyBar();
}

/* ── Sticky bar ──────────────────────────────────────────────────── */
function initStickyBar() {
  if (stickyInitialized) return;
  stickyInitialized = true;
  const hero = document.querySelector('.hero');
  const bar  = document.getElementById('sticky-bar');
  if (!hero || !bar) return;
  new IntersectionObserver(([entry]) => {
    bar.classList.toggle('visible', !entry.isIntersecting);
  }, { threshold: 0 }).observe(hero);
}

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
  document.getElementById('sticky-segment').textContent = seg?.title || 'All done!';
  const timerEl = document.getElementById('sticky-timer');
  timerEl.textContent = live ? formatElapsedPaused(project.liveStartedAt, project.obsTimerPausedDuration, project.obsBrbPausedAt) : '–';
  timerEl.classList.toggle('live', live);
  document.getElementById('sticky-tasks').textContent = `${open} open task${open !== 1 ? 's' : ''}`;
}

/* ── Active-segment pace tick ────────────────────────────────────── */
function updateActivePace() {
  const el = document.getElementById('active-seg-pace');
  if (!el || !project?.liveStartedAt) return;
  const segs      = project.segments || [];
  const activeIdx = segs.findIndex(s => !s.done);
  if (activeIdx < 0) return;
  const startIso  = segStartIso(segs, activeIdx);
  if (!startIso) return;
  const elapsed   = Math.floor((Date.now() - new Date(startIso)) / 1000);
  const seg       = segs[activeIdx];
  const planned   = seg.duration ? seg.duration * 60 : null;
  const over      = planned && elapsed > planned;
  el.classList.toggle('seg-pace--over', !!over);
  el.textContent  = planned
    ? `${formatSegTime(elapsed)} / ${seg.duration}:00`
    : formatSegTime(elapsed);
}

/* ── Hero ────────────────────────────────────────────────────────── */
function renderHero() {
  document.getElementById('project-title').textContent       = project.name;
  const descEl = document.getElementById('project-description');
  descEl.textContent = project.description || '';
  descEl.classList.toggle('hidden', !project.description);
  document.getElementById('project-focus').textContent       = project.focus    || '–';
  document.getElementById('project-platform').textContent    = project.platform || '–';
  document.title = `${project.name} — Stream Status`;
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

  /* Overlay section show/hide toggle */
  document.getElementById('toggle-overlays').addEventListener('click', function () {
    const grid     = document.getElementById('overlay-grid');
    const expanded = this.getAttribute('aria-expanded') === 'true';
    grid.classList.toggle('hidden', expanded);
    this.textContent = expanded ? 'Show' : 'Hide';
    this.setAttribute('aria-expanded', String(!expanded));
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
  });
}

/* ── OBS status display ──────────────────────────────────────────── */
function renderOBSStatus() {
  const badge = document.getElementById('obs-settings-btn');
  if (!badge) return;
  badge.dataset.status = OBS.status;
  const labelEl = badge.querySelector('.obs-status-label');
  if (labelEl) labelEl.textContent = OBS.status === 'connected' ? 'OBS ●' : 'OBS';
  const detail = document.getElementById('obs-connection-detail');
  if (detail) {
    detail.textContent =
      OBS.status === 'connected'  ? 'Connected' :
      OBS.status === 'connecting' ? 'Connecting…' : 'Disconnected';
  }
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

/* ── Jump nav ────────────────────────────────────────────────────── */
function initJumpNav() {
  const sectionIds = ['section-segments', 'section-tasks', 'section-notes', 'section-overlays', 'section-layouts'];
  const linkMap = {};
  sectionIds.forEach(id => {
    linkMap[id] = document.querySelector(`.jump-link[href="#${id}"]`);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Object.values(linkMap).forEach(l => l?.classList.remove('active'));
        linkMap[entry.target.id]?.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
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

  return {
    get status()            { return _status; },
    get replayBufferActive(){ return replayBufferActive; },
    enable, disable, connect, switchToScene, saveReplayBuffer, getSettings, saveSettings, getScenes, pushTextSource,
  };
})();

/* Init theme before first paint */
applyTheme(localStorage.getItem('theme') || 'teal');

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('theme-picker')?.addEventListener('click', e => {
    const dot = e.target.closest('.theme-dot');
    if (dot?.dataset.theme) applyTheme(dot.dataset.theme);
  });
  initJumpNav();
  init();
});
