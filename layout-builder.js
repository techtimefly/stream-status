/* ═══════════════════════════════════════════════════════════════════
   Layout Builder — Phase 2 (freeform) + Phase 3 (drop-zones)
   Depends on: script.js globals → project, api, saveProject, showToast, esc
   ═══════════════════════════════════════════════════════════════════ */

/* ── Widget catalogue ───────────────────────────────────────────── */
const LB_WIDGETS = [
  { view: 'timer',      label: 'Stream timer',    color: '#2563eb', defW: 260, defH: 80  },
  { view: 'segments',   label: 'Segment list',    color: '#7c3aed', defW: 340, defH: 320 },
  { view: 'current',    label: 'Current segment', color: '#0891b2', defW: 480, defH: 130 },
  { view: 'progress',   label: 'Progress bar',    color: '#059669', defW: 480, defH: 60  },
  { view: 'countdown',  label: 'Countdown',       color: '#d97706', defW: 300, defH: 90  },
  { view: 'lowerthird', label: 'Lower thirds',    color: '#1d4ed8', defW: 620, defH: 110 },
  { view: 'tasks',      label: 'Task list',       color: '#be185d', defW: 340, defH: 280 },
  { view: 'social',     label: 'Social / CTA',    color: '#0369a1', defW: 320, defH: 200 },
  { view: 'transition', label: 'Just did / next', color: '#374151', defW: 560, defH: 100 },
  { view: 'done',       label: 'Recently done',   color: '#1e3a5f', defW: 340, defH: 220 },
  { view: 'health',     label: 'Stream health',   color: '#991b1b', defW: 340, defH: 170 },
];

/* ── Canvas size presets ────────────────────────────────────────── */
const LB_CANVAS_SIZES = [
  { label: '1920×1080 (1080p)', w: 1920, h: 1080 },
  { label: '1280×720 (720p)',   w: 1280, h: 720  },
  { label: '2560×1440 (1440p)', w: 2560, h: 1440 },
];

/* ── Zone templates (Phase 3) ───────────────────────────────────── */
const LB_ZONE_TEMPLATES = [
  {
    id: 'bottom-bar',
    name: 'Bottom bar',
    icon: '▬',
    desc: 'Single strip along the bottom edge',
    zones: [
      { id: 'zone-bottom', label: 'Bottom bar', x: 0, y: 900, w: 1920, h: 180,
        direction: 'row', gap: 20, align: 'center' },
    ],
    defaults: { 'zone-bottom': ['timer', 'current', 'lowerthird'] },
  },
  {
    id: 'top-bar',
    name: 'Top bar',
    icon: '▬',
    desc: 'Single strip along the top edge',
    zones: [
      { id: 'zone-top', label: 'Top bar', x: 0, y: 0, w: 1920, h: 100,
        direction: 'row', gap: 20, align: 'center' },
    ],
    defaults: { 'zone-top': ['timer', 'progress'] },
  },
  {
    id: 'top-bottom',
    name: 'Top + bottom',
    icon: '⬛',
    desc: 'Info bar at top, lower third at bottom',
    zones: [
      { id: 'zone-top',    label: 'Top bar',     x: 0, y: 0,   w: 1920, h: 80,
        direction: 'row', gap: 16, align: 'center' },
      { id: 'zone-bottom', label: 'Lower third', x: 0, y: 940, w: 1920, h: 140,
        direction: 'row', gap: 16, align: 'center' },
    ],
    defaults: { 'zone-top': ['timer', 'progress'], 'zone-bottom': ['lowerthird'] },
  },
  {
    id: 'left-sidebar',
    name: 'Left sidebar',
    icon: '▐',
    desc: 'Vertical panel on the left edge',
    zones: [
      { id: 'zone-left', label: 'Left sidebar', x: 0, y: 0, w: 360, h: 1080,
        direction: 'column', gap: 16, align: 'stretch' },
    ],
    defaults: { 'zone-left': ['timer', 'segments', 'tasks'] },
  },
  {
    id: 'corner-hud',
    name: 'Corner HUD',
    icon: '⊡',
    desc: 'Small widgets in the screen corners',
    zones: [
      { id: 'zone-tl', label: 'Top-left',     x: 20,   y: 20,  w: 280, h: 90,
        direction: 'row', gap: 8, align: 'center' },
      { id: 'zone-tr', label: 'Top-right',    x: 1620, y: 20,  w: 280, h: 90,
        direction: 'row', gap: 8, align: 'center' },
      { id: 'zone-bl', label: 'Bottom-left',  x: 20,   y: 970, w: 280, h: 90,
        direction: 'row', gap: 8, align: 'center' },
      { id: 'zone-br', label: 'Bottom-right', x: 1620, y: 970, w: 280, h: 90,
        direction: 'row', gap: 8, align: 'center' },
    ],
    defaults: {
      'zone-tl': ['timer'],   'zone-tr': ['health'],
      'zone-bl': ['current'], 'zone-br': ['countdown'],
    },
  },
  {
    id: 'full-hud',
    name: 'Full HUD',
    icon: '▦',
    desc: 'Top bar + left panel + lower third',
    zones: [
      { id: 'zone-top',    label: 'Top bar',     x: 0,  y: 0,   w: 1920, h: 60,
        direction: 'row',    gap: 16, align: 'center' },
      { id: 'zone-left',   label: 'Left panel',  x: 0,  y: 60,  w: 320,  h: 860,
        direction: 'column', gap: 12, align: 'stretch' },
      { id: 'zone-bottom', label: 'Lower third', x: 0,  y: 920, w: 1920, h: 160,
        direction: 'row',    gap: 16, align: 'center' },
    ],
    defaults: {
      'zone-top':    ['timer', 'progress'],
      'zone-left':   ['segments'],
      'zone-bottom': ['lowerthird'],
    },
  },
];

/* ── Editor state ───────────────────────────────────────────────── */
let lbEditing    = null;   // Layout object being edited (deep copy)
let lbSelected   = null;   // Selected widget id (freeform) or zone id (zones)
let lbDragView   = null;   // View name being dragged from palette
let lbScale      = 1;      // Canvas display scale

/* ── Init ───────────────────────────────────────────────────────── */
function initLayoutBuilder() {
  const toggleBtn  = document.getElementById('toggle-layouts');
  const newBtn     = document.getElementById('new-layout-btn');
  const wrap       = document.getElementById('layout-builder-wrap');

  toggleBtn?.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    wrap.classList.toggle('hidden', expanded);
    this.textContent = expanded ? 'Show' : 'Hide';
    this.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) renderLayoutList();
  });

  newBtn?.addEventListener('click', () => openLayoutEditor(null));
}

/* ═══════════════════════════════════════════════════════════════════
   LAYOUT LIST
   ═══════════════════════════════════════════════════════════════════ */
function renderLayoutList() {
  const el = document.getElementById('layout-list');
  if (!el || !project) return;
  const layouts = project.layouts || [];

  if (!layouts.length) {
    el.innerHTML = `<p class="lb-empty">No layouts yet — click <em>+ New layout</em> to create one.</p>`;
    return;
  }

  el.innerHTML = layouts.map(l => {
    const wCount = l.mode === 'zones'
      ? (l.zones || []).reduce((n, z) => n + (z.widgets || []).length, 0)
      : (l.widgets || []).length;
    const url = lbBuildUrl(l.id);
    return `
      <div class="lb-row" data-lid="${esc(l.id)}">
        <div class="lb-row-info">
          <span class="lb-row-name">${esc(l.name)}</span>
          <span class="lb-mode-badge lb-mode-${l.mode}">${l.mode}</span>
          <span class="lb-row-meta">${l.canvasW}×${l.canvasH} · ${wCount} widget${wCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="lb-row-actions">
          <button class="btn-ghost btn-sm lb-edit-btn"     data-lid="${esc(l.id)}">Edit</button>
          <button class="btn-ghost btn-sm lb-copy-url-btn" data-url="${esc(url)}">Copy URL</button>
          <a      class="btn-ghost btn-sm"                 href="${esc(url)}" target="_blank" rel="noopener">Preview</a>
          <button class="icon-btn lb-delete-btn"           data-lid="${esc(l.id)}" title="Delete layout">&#x2715;</button>
        </div>
      </div>`;
  }).join('');

  // Bind once per render (event delegation)
  el.addEventListener('click', lbListClick);
}

async function lbListClick(e) {
  const editBtn   = e.target.closest('.lb-edit-btn');
  const deleteBtn = e.target.closest('.lb-delete-btn');
  const copyBtn   = e.target.closest('.lb-copy-url-btn');

  if (editBtn) {
    const l = (project.layouts || []).find(l => l.id === editBtn.dataset.lid);
    if (l) openLayoutEditor(JSON.parse(JSON.stringify(l)));
  }

  if (deleteBtn) {
    const lid = deleteBtn.dataset.lid;
    const l   = (project.layouts || []).find(l => l.id === lid);
    if (!confirm(`Delete layout "${l?.name || lid}"? This cannot be undone.`)) return;
    project.layouts = (project.layouts || []).filter(l => l.id !== lid);
    await saveProject();
    renderLayoutList();
    showToast('Layout deleted');
  }

  if (copyBtn) {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.url);
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    } catch { /* denied */ }
  }
}

function lbBuildUrl(layoutId) {
  let url = `${location.origin}/overlay.html?view=layout&layout=${encodeURIComponent(layoutId)}`;
  if (project?.id) url += `&project=${encodeURIComponent(project.id)}`;
  return url;
}

/* ═══════════════════════════════════════════════════════════════════
   EDITOR — open / close
   ═══════════════════════════════════════════════════════════════════ */
function openLayoutEditor(existing) {
  lbEditing  = existing || {
    id:       `layout-${Date.now()}`,
    name:     'New Layout',
    mode:     'freeform',
    canvasW:  1920,
    canvasH:  1080,
    widgets:  [],
    zones:    [],
    template: null,
  };
  lbSelected = null;

  // Hide list, show editor
  document.getElementById('layout-list').classList.add('hidden');
  document.getElementById('new-layout-btn').classList.add('hidden');

  const wrap = document.getElementById('layout-builder-wrap');
  const editorHtml = lbBuildEditorHtml();
  const editorEl   = document.createElement('div');
  editorEl.id      = 'lb-editor';
  editorEl.className = 'lb-editor';
  editorEl.innerHTML = editorHtml;
  wrap.appendChild(editorEl);

  lbBindEditorEvents();
  lbRenderCanvas();
  lbRenderInspector();

  // Auto-apply first zone template if switching to zones mode with no zones
  if (lbEditing.mode === 'zones' && !lbEditing.zones?.length) {
    lbApplyTemplate(LB_ZONE_TEMPLATES[0].id);
  }
}

function closeLayoutEditor() {
  lbEditing  = null;
  lbSelected = null;
  lbDragView = null;
  document.getElementById('lb-editor')?.remove();
  document.getElementById('layout-list').classList.remove('hidden');
  document.getElementById('new-layout-btn').classList.remove('hidden');
  renderLayoutList();
}

/* ═══════════════════════════════════════════════════════════════════
   EDITOR — HTML builders
   ═══════════════════════════════════════════════════════════════════ */
function lbBuildEditorHtml() {
  const sizeOpts = LB_CANVAS_SIZES.map(s => {
    const sel = lbEditing.canvasW === s.w && lbEditing.canvasH === s.h ? ' selected' : '';
    return `<option value="${s.w}x${s.h}"${sel}>${s.label}</option>`;
  }).join('');

  const paletteItems = LB_WIDGETS.map(w =>
    `<div class="lb-palette-item" draggable="true" data-view="${w.view}">
       <span class="lb-palette-dot" style="background:${w.color}"></span>
       ${w.label}
     </div>`
  ).join('');

  const templateBar = lbEditing.mode === 'zones' ? lbBuildTemplateBarHtml() : '';

  return `
    <div class="lb-editor-header">
      <button class="btn-ghost btn-sm" id="lb-back-btn">&#8592; Back</button>
      <input id="lb-name-input" class="lb-name-input" type="text"
             value="${esc(lbEditing.name)}" placeholder="Layout name" />
      <select id="lb-size-select" class="lb-size-select">${sizeOpts}</select>
      <div class="lb-mode-toggle" id="lb-mode-toggle">
        <button class="lb-mode-btn${lbEditing.mode === 'freeform' ? ' active' : ''}" data-mode="freeform">Freeform</button>
        <button class="lb-mode-btn${lbEditing.mode === 'zones'    ? ' active' : ''}" data-mode="zones">Zones</button>
      </div>
      <button id="lb-save-btn" class="btn-primary btn-sm">Save layout</button>
    </div>
    <div class="lb-editor-body">
      <div class="lb-palette" id="lb-palette">
        <p class="lb-palette-label">Widgets</p>
        <p class="lb-palette-hint">Drag onto canvas</p>
        ${paletteItems}
      </div>
      <div class="lb-canvas-wrap" id="lb-canvas-wrap">
        ${templateBar}
        <div class="lb-canvas-scroll">
          <div class="lb-canvas" id="lb-canvas"></div>
        </div>
      </div>
      <div class="lb-inspector" id="lb-inspector">
        <p class="lb-inspector-empty">Select a widget<br>to edit properties</p>
      </div>
    </div>`;
}

function lbBuildTemplateBarHtml() {
  return `
    <div class="lb-template-bar" id="lb-template-bar">
      <span class="lb-template-label">Template:</span>
      ${LB_ZONE_TEMPLATES.map(t =>
        `<button class="lb-template-btn${lbEditing.template === t.id ? ' active' : ''}"
                 data-tpl="${t.id}" title="${esc(t.desc)}">${t.icon} ${t.name}</button>`
      ).join('')}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   EDITOR — event binding
   ═══════════════════════════════════════════════════════════════════ */
function lbBindEditorEvents() {
  // Back / cancel
  document.getElementById('lb-back-btn').addEventListener('click', closeLayoutEditor);

  // Name
  document.getElementById('lb-name-input').addEventListener('input', e => {
    lbEditing.name = e.target.value;
  });

  // Canvas size
  document.getElementById('lb-size-select').addEventListener('change', e => {
    const [w, h]     = e.target.value.split('x').map(Number);
    lbEditing.canvasW = w; lbEditing.canvasH = h;
    // Scale zone template coords proportionally
    if (lbEditing.mode === 'zones' && lbEditing.template) {
      lbApplyTemplate(lbEditing.template);
    } else {
      lbRenderCanvas();
    }
  });

  // Mode toggle
  document.getElementById('lb-mode-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.lb-mode-btn');
    if (!btn) return;
    lbEditing.mode = btn.dataset.mode;
    document.querySelectorAll('.lb-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
    // Switch template bar
    const existing = document.getElementById('lb-template-bar');
    if (existing) existing.remove();
    const wrap = document.getElementById('lb-canvas-wrap');
    if (lbEditing.mode === 'zones') {
      wrap.insertAdjacentHTML('afterbegin', lbBuildTemplateBarHtml());
      document.getElementById('lb-template-bar').addEventListener('click', lbTemplateBarClick);
      if (!lbEditing.zones?.length) lbApplyTemplate(LB_ZONE_TEMPLATES[0].id);
    }
    lbSelected = null;
    lbRenderCanvas();
    lbRenderInspector();
  });

  // Template bar (zones mode)
  document.getElementById('lb-template-bar')?.addEventListener('click', lbTemplateBarClick);

  // Save
  document.getElementById('lb-save-btn').addEventListener('click', lbSave);

  // Palette drag
  document.querySelectorAll('.lb-palette-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      lbDragView = item.dataset.view;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', lbDragView);
    });
    item.addEventListener('dragend', () => { lbDragView = null; });
  });

  // Canvas drop target (freeform)
  const canvas = document.getElementById('lb-canvas');
  canvas.addEventListener('dragover',  e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  canvas.addEventListener('drop',      lbCanvasDrop);
  canvas.addEventListener('click',     lbCanvasClick);
  canvas.addEventListener('mousemove', lbCanvasMousemove);
  canvas.addEventListener('mouseup',   lbCanvasMouseup);
}

function lbTemplateBarClick(e) {
  const btn = e.target.closest('.lb-template-btn');
  if (!btn) return;
  lbApplyTemplate(btn.dataset.tpl);
  document.querySelectorAll('.lb-template-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tpl === btn.dataset.tpl)
  );
}

function lbCanvasDrop(e) {
  e.preventDefault();
  if (!lbDragView || lbEditing.mode !== 'freeform') return;
  const canvas = document.getElementById('lb-canvas');
  const rect   = canvas.getBoundingClientRect();
  const x      = Math.round((e.clientX - rect.left) / lbScale);
  const y      = Math.round((e.clientY - rect.top)  / lbScale);
  lbAddFreeformWidget(lbDragView, x, y);
  lbDragView = null;
}

function lbCanvasClick(e) {
  if (e.target.id === 'lb-canvas' || e.target.classList.contains('lb-canvas')) {
    lbSelected = null;
    lbRenderCanvas();
    lbRenderInspector();
  }
}

/* Mouse tracking for drag/resize */
let _lbMouseState = null; // { type:'move'|'resize', id, handle?, startX, startY, orig }

function lbCanvasMousemove(e) {
  if (!_lbMouseState) return;
  const dx = (e.clientX - _lbMouseState.startX) / lbScale;
  const dy = (e.clientY - _lbMouseState.startY) / lbScale;
  const w  = (lbEditing.widgets || []).find(w => w.id === _lbMouseState.id);
  if (!w) return;

  if (_lbMouseState.type === 'move') {
    w.x = Math.max(0, Math.min(lbEditing.canvasW - w.w, Math.round(_lbMouseState.orig.x + dx)));
    w.y = Math.max(0, Math.min(lbEditing.canvasH - w.h, Math.round(_lbMouseState.orig.y + dy)));
    const el = document.querySelector(`#lb-canvas [data-wid="${w.id}"]`);
    if (el) { el.style.left = w.x + 'px'; el.style.top = w.y + 'px'; }
    lbInspectorSync();
  } else if (_lbMouseState.type === 'resize') {
    const h = _lbMouseState.handle;
    let { x, y, w: width, h: height } = _lbMouseState.orig;
    const MIN = 60;
    if (h.includes('e')) width  = Math.max(MIN, Math.round(width  + dx));
    if (h.includes('s')) height = Math.max(MIN, Math.round(height + dy));
    if (h.includes('w')) { x = Math.round(x + dx); width  = Math.max(MIN, Math.round(width  - dx)); }
    if (h.includes('n')) { y = Math.round(y + dy); height = Math.max(MIN, Math.round(height - dy)); }
    x = Math.max(0, x); y = Math.max(0, y);
    width  = Math.min(lbEditing.canvasW - x, width);
    height = Math.min(lbEditing.canvasH - y, height);
    Object.assign(w, { x, y, w: width, h: height });
    const el = document.querySelector(`#lb-canvas [data-wid="${w.id}"]`);
    if (el) {
      el.style.left = x + 'px'; el.style.top    = y + 'px';
      el.style.width = width + 'px'; el.style.height = height + 'px';
      const sizeEl = el.querySelector('.lb-wbox-size');
      if (sizeEl) sizeEl.textContent = `${width}×${height}`;
    }
    lbInspectorSync();
  }
}

function lbCanvasMouseup() { _lbMouseState = null; }

/* ═══════════════════════════════════════════════════════════════════
   FREEFORM — canvas rendering & widget ops
   ═══════════════════════════════════════════════════════════════════ */
function lbAddFreeformWidget(view, cx, cy) {
  const def = LB_WIDGETS.find(w => w.view === view) || {};
  const w   = { id: `w-${Date.now()}`, view, x: cx - (def.defW || 200) / 2,
                y: cy - (def.defH || 80) / 2, w: def.defW || 200, h: def.defH || 80, params: {} };
  w.x = Math.max(0, Math.min(lbEditing.canvasW - w.w, Math.round(w.x)));
  w.y = Math.max(0, Math.min(lbEditing.canvasH - w.h, Math.round(w.y)));
  (lbEditing.widgets ??= []).push(w);
  lbSelected = w.id;
  lbRenderCanvas();
  lbRenderInspector();
}

function lbDeleteFreeformWidget(id) {
  lbEditing.widgets = (lbEditing.widgets || []).filter(w => w.id !== id);
  if (lbSelected === id) lbSelected = null;
  lbRenderCanvas();
  lbRenderInspector();
}

function lbRenderFreeformCanvas(canvas) {
  const HANDLE_DIRS = ['nw','n','ne','e','se','s','sw','w'];
  const CURSORS     = ['nwse-resize','ns-resize','nesw-resize','ew-resize',
                        'nwse-resize','ns-resize','nesw-resize','ew-resize'];
  const handlePos   = h => {
    const lx = h.includes('w') ? '0%' : h.includes('e') ? '100%' : '50%';
    const ly = h.includes('n') ? '0%' : h.includes('s') ? '100%' : '50%';
    return `left:${lx};top:${ly};`;
  };

  canvas.innerHTML = (lbEditing.widgets || []).map(w => {
    const def   = LB_WIDGETS.find(d => d.view === w.view) || {};
    const color = def.color || '#334155';
    const sel   = w.id === lbSelected;

    const handles = sel ? HANDLE_DIRS.map((h, i) =>
      `<div class="lb-handle" data-handle="${h}" data-wid="${w.id}"
            style="left:${handlePos(h).match(/left:([^;]+)/)[1]};
                   top:${handlePos(h).match(/top:([^;]+)/)[1]};
                   cursor:${CURSORS[i]}"></div>`
    ).join('') : '';

    const deleteBtn = sel
      ? `<button class="lb-wbox-delete" data-wid="${w.id}" title="Remove widget">✕</button>` : '';

    const opacity  = w.params?.opacity != null ? w.params.opacity / 100 : 1;
    const bgTag    = w.params?.showBg ? `<span class="lb-wbox-bg-tag">BG</span>` : '';

    return `
      <div class="lb-wbox${sel ? ' selected' : ''}" data-wid="${w.id}"
           style="left:${w.x}px;top:${w.y}px;width:${w.w}px;height:${w.h}px;
                  border-color:${color}${sel ? '' : '77'};opacity:${opacity}">
        <span class="lb-wbox-label" style="color:${color}">${def.label || w.view}</span>
        <span class="lb-wbox-size">${w.w}×${w.h}</span>
        ${bgTag}
        ${deleteBtn}
        ${handles}
      </div>`;
  }).join('');

  // Widget click → select + start drag
  canvas.querySelectorAll('.lb-wbox').forEach(el => {
    el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('lb-handle') || e.target.classList.contains('lb-wbox-delete')) return;
      e.preventDefault();
      const id = el.dataset.wid;
      lbSelected = id;
      lbRenderCanvas(); lbRenderInspector();
      const w = (lbEditing.widgets || []).find(w => w.id === id);
      if (!w) return;
      _lbMouseState = { type: 'move', id, startX: e.clientX, startY: e.clientY, orig: { ...w } };
    });
  });

  // Delete buttons
  canvas.querySelectorAll('.lb-wbox-delete').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); lbDeleteFreeformWidget(btn.dataset.wid); });
  });

  // Resize handles
  canvas.querySelectorAll('.lb-handle').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      const id = handle.dataset.wid;
      const w  = (lbEditing.widgets || []).find(w => w.id === id);
      if (!w) return;
      _lbMouseState = { type: 'resize', id, handle: handle.dataset.handle,
                        startX: e.clientX, startY: e.clientY, orig: { ...w } };
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   ZONE MODE (Phase 3) — template + drag-and-drop
   ═══════════════════════════════════════════════════════════════════ */
function lbApplyTemplate(templateId) {
  const tpl = LB_ZONE_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;

  // Scale zone coordinates to current canvas size
  const scaleX = lbEditing.canvasW / 1920;
  const scaleY = lbEditing.canvasH / 1080;

  lbEditing.template = templateId;
  lbEditing.zones    = tpl.zones.map(z => {
    const defaultViews  = (tpl.defaults || {})[z.id] || [];
    const defaultWidgets = defaultViews.map((view, i) =>
      ({ id: `zw-${Date.now()}-${i}-${Math.random().toString(36).slice(2,6)}`, view, params: {} })
    );
    return {
      ...z,
      x: Math.round(z.x * scaleX), y: Math.round(z.y * scaleY),
      w: Math.round(z.w * scaleX), h: Math.round(z.h * scaleY),
      widgets: defaultWidgets,
    };
  });

  lbSelected = null;
  lbRenderCanvas();
  lbRenderInspector();
}

function lbAddZoneWidget(zoneId, view) {
  const zone = (lbEditing.zones || []).find(z => z.id === zoneId);
  if (!zone) return;
  (zone.widgets ??= []).push({
    id: `zw-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    view, params: {},
  });
  lbRenderCanvas();
}

function lbRemoveZoneWidget(zoneId, widgetId) {
  const zone = (lbEditing.zones || []).find(z => z.id === zoneId);
  if (!zone) return;
  zone.widgets = (zone.widgets || []).filter(w => w.id !== widgetId);
  if (lbSelected === widgetId) lbSelected = null;
  lbRenderCanvas();
  lbRenderInspector();
}

function lbRenderZoneCanvas(canvas) {
  canvas.innerHTML = (lbEditing.zones || []).map(zone => {
    const sel      = lbSelected === zone.id;
    const widgets  = (zone.widgets || []).map(zw => {
      const def   = LB_WIDGETS.find(d => d.view === zw.view) || {};
      const color = def.color || '#334155';
      return `
        <div class="lb-zone-chip" data-zone-id="${zone.id}" data-zwid="${zw.id}"
             style="border-color:${color}66;background:${color}22;">
          <span style="color:${color}">${def.label || zw.view}</span>
          <button class="lb-zone-chip-del" data-zone-id="${zone.id}" data-zwid="${zw.id}"
                  title="Remove">✕</button>
        </div>`;
    }).join('');

    const dropHint = !zone.widgets?.length
      ? `<span class="lb-zone-drop-hint">Drop widget here</span>` : '';

    return `
      <div class="lb-zone-box${sel ? ' selected' : ''}" data-zone-id="${zone.id}"
           style="left:${zone.x}px;top:${zone.y}px;width:${zone.w}px;height:${zone.h}px;
                  flex-direction:${zone.direction || 'row'};gap:${zone.gap || 0}px;
                  align-items:${zone.align || 'flex-start'};">
        <div class="lb-zone-label">${esc(zone.label)}</div>
        ${widgets}
        ${dropHint}
      </div>`;
  }).join('');

  // Zone click → select
  canvas.querySelectorAll('.lb-zone-box').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('lb-zone-chip-del')) return;
      lbSelected = el.dataset.zoneId;
      lbRenderCanvas(); lbRenderInspector();
    });

    // Drag-from-palette drop into zone
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', e => {
      if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over');
    });
    el.addEventListener('drop', e => {
      e.preventDefault(); el.classList.remove('drag-over');
      if (!lbDragView) return;
      lbAddZoneWidget(el.dataset.zoneId, lbDragView);
      lbDragView = null;
    });
  });

  // Zone chip delete buttons
  canvas.querySelectorAll('.lb-zone-chip-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      lbRemoveZoneWidget(btn.dataset.zoneId, btn.dataset.zwid);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   CANVAS — shared render + scale
   ═══════════════════════════════════════════════════════════════════ */
function lbRenderCanvas() {
  const wrap   = document.getElementById('lb-canvas-wrap');
  const canvas = document.getElementById('lb-canvas');
  if (!wrap || !canvas) return;

  // Scale to fit the scroll container
  const scrollEl = wrap.querySelector('.lb-canvas-scroll') || wrap;
  const availW   = scrollEl.clientWidth  - 32;
  const availH   = Math.max(320, scrollEl.clientHeight - 32);
  lbScale = Math.min(availW / lbEditing.canvasW, availH / lbEditing.canvasH, 1);
  lbScale = Math.max(0.1, lbScale);

  canvas.style.width         = lbEditing.canvasW + 'px';
  canvas.style.height        = lbEditing.canvasH + 'px';
  canvas.style.transform     = `scale(${lbScale})`;
  canvas.style.transformOrigin = 'top left';

  // Set scroll container height so layout below doesn't overlap
  scrollEl.style.height = Math.ceil(lbEditing.canvasH * lbScale + 20) + 'px';

  if (lbEditing.mode === 'freeform') {
    lbRenderFreeformCanvas(canvas);
  } else {
    lbRenderZoneCanvas(canvas);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   INSPECTOR
   ═══════════════════════════════════════════════════════════════════ */
function lbRenderInspector() {
  const el = document.getElementById('lb-inspector');
  if (!el) return;

  if (!lbSelected) {
    el.innerHTML = `<p class="lb-inspector-empty">Select a widget or zone<br>to edit properties</p>`;
    return;
  }

  if (lbEditing.mode === 'freeform') {
    const w   = (lbEditing.widgets || []).find(w => w.id === lbSelected);
    if (!w) { el.innerHTML = ''; return; }
    const def = LB_WIDGETS.find(d => d.view === w.view) || {};
    el.innerHTML = `
      <div class="lb-insp-group">
        <p class="lb-insp-title" style="color:${def.color||'#60a5fa'}">${def.label || w.view}</p>
        <div class="lb-insp-row">
          <label class="lb-insp-label">X
            <input class="lb-inp" type="number" id="insp-x" value="${w.x}" min="0" />
          </label>
          <label class="lb-insp-label">Y
            <input class="lb-inp" type="number" id="insp-y" value="${w.y}" min="0" />
          </label>
        </div>
        <div class="lb-insp-row">
          <label class="lb-insp-label">W
            <input class="lb-inp" type="number" id="insp-w" value="${w.w}" min="60" />
          </label>
          <label class="lb-insp-label">H
            <input class="lb-inp" type="number" id="insp-h" value="${w.h}" min="40" />
          </label>
        </div>
      </div>
      <div class="lb-insp-group">
        <p class="lb-insp-subtitle">Size preset</p>
        <div class="lb-insp-chips">
          <button class="oc-chip${w.params?.size === 'sm' ? ' active' : ''}" data-sz="sm">sm</button>
          <button class="oc-chip${(!w.params?.size||w.params?.size==='md') ? ' active' : ''}" data-sz="md">md</button>
          <button class="oc-chip${w.params?.size === 'lg' ? ' active' : ''}" data-sz="lg">lg</button>
        </div>
      </div>
      <div class="lb-insp-group">
        <p class="lb-insp-subtitle">Appearance</p>
        <label class="lb-toggle-row">
          <span>Show panel background</span>
          <label class="lb-switch">
            <input type="checkbox" id="insp-showbg"${w.params?.showBg ? ' checked' : ''}>
            <span class="lb-switch-slider"></span>
          </label>
        </label>
        <div class="lb-insp-label">Opacity
          <div class="lb-opacity-row">
            <input class="lb-opacity-range" type="range" id="insp-opacity"
                   min="10" max="100" step="5" value="${w.params?.opacity ?? 100}" />
            <span class="lb-opacity-val" id="insp-opacity-val">${w.params?.opacity ?? 100}%</span>
          </div>
        </div>
      </div>
      <button class="btn-ghost btn-sm lb-insp-delete">&#x2715; Remove widget</button>`;

    // Bind inputs
    ['x','y','w','h'].forEach(prop => {
      document.getElementById(`insp-${prop}`)?.addEventListener('change', e => {
        w[prop] = Math.max(prop === 'w' ? 60 : prop === 'h' ? 40 : 0, parseInt(e.target.value) || 0);
        lbRenderCanvas();
      });
    });
    el.querySelectorAll('[data-sz]').forEach(btn => {
      btn.addEventListener('click', () => {
        (w.params ??= {}).size = btn.dataset.sz;
        el.querySelectorAll('[data-sz]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Appearance: showBg toggle
    document.getElementById('insp-showbg')?.addEventListener('change', e => {
      (w.params ??= {}).showBg = e.target.checked;
      lbRenderCanvas();
    });

    // Appearance: opacity slider
    const opacInp = document.getElementById('insp-opacity');
    const opacVal = document.getElementById('insp-opacity-val');
    opacInp?.addEventListener('input', e => {
      const val = parseInt(e.target.value);
      (w.params ??= {}).opacity = val;
      if (opacVal) opacVal.textContent = val + '%';
      // Live-update the canvas wbox opacity without full re-render
      const wbox = document.querySelector(`#lb-canvas [data-wid="${w.id}"]`);
      if (wbox) wbox.style.opacity = String(val / 100);
    });

    el.querySelector('.lb-insp-delete')?.addEventListener('click', () => lbDeleteFreeformWidget(lbSelected));

  } else {
    // Zone inspector
    const zone = (lbEditing.zones || []).find(z => z.id === lbSelected);
    if (!zone) { el.innerHTML = ''; return; }
    el.innerHTML = `
      <div class="lb-insp-group">
        <p class="lb-insp-title" style="color:#60a5fa">${esc(zone.label)}</p>
        <p class="lb-insp-subtitle">Zone — ${(zone.widgets||[]).length} widget${(zone.widgets||[]).length!==1?'s':''}</p>
        <label class="lb-insp-label">Direction
          <select class="lb-inp" id="insp-dir">
            <option value="row"    ${zone.direction==='row'    ?'selected':''}>Row →</option>
            <option value="column" ${zone.direction==='column' ?'selected':''}>Column ↓</option>
          </select>
        </label>
        <div class="lb-insp-row">
          <label class="lb-insp-label">Gap (px)
            <input class="lb-inp" type="number" id="insp-gap" value="${zone.gap||0}" min="0" max="200" />
          </label>
        </div>
        <label class="lb-insp-label">Align
          <select class="lb-inp" id="insp-align">
            <option value="flex-start" ${zone.align==='flex-start'?'selected':''}>Start</option>
            <option value="center"     ${zone.align==='center'    ?'selected':''}>Center</option>
            <option value="flex-end"   ${zone.align==='flex-end'  ?'selected':''}>End</option>
            <option value="stretch"    ${zone.align==='stretch'   ?'selected':''}>Stretch</option>
          </select>
        </label>
      </div>
      <p class="lb-inspector-empty" style="font-size:0.78rem;padding:0">
        Drag widgets from the palette into this zone.<br>Click ✕ on a chip to remove it.
      </p>`;

    document.getElementById('insp-dir')?.addEventListener('change', e => {
      zone.direction = e.target.value; lbRenderCanvas();
    });
    document.getElementById('insp-gap')?.addEventListener('change', e => {
      zone.gap = parseInt(e.target.value) || 0; lbRenderCanvas();
    });
    document.getElementById('insp-align')?.addEventListener('change', e => {
      zone.align = e.target.value; lbRenderCanvas();
    });
  }
}

/** Update numeric position inputs without full re-render (during drag). */
function lbInspectorSync() {
  if (!lbSelected || lbEditing.mode !== 'freeform') return;
  const w = (lbEditing.widgets || []).find(w => w.id === lbSelected);
  if (!w) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('insp-x', w.x); set('insp-y', w.y); set('insp-w', w.w); set('insp-h', w.h);
}

/* ═══════════════════════════════════════════════════════════════════
   SAVE
   ═══════════════════════════════════════════════════════════════════ */
async function lbSave() {
  if (!project) return;
  const nameEl = document.getElementById('lb-name-input');
  lbEditing.name = (nameEl?.value || '').trim() || 'Untitled Layout';

  (project.layouts ??= []);
  const idx = project.layouts.findIndex(l => l.id === lbEditing.id);
  if (idx >= 0) project.layouts[idx] = lbEditing;
  else          project.layouts.push(lbEditing);

  await saveProject();
  showToast('Layout saved');
  closeLayoutEditor();
}

/* ═══════════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initLayoutBuilder();
});
