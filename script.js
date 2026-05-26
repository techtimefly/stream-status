const STORAGE_KEY = 'home-network-stream-status';
const segments = [
  { key: 'preflight', title: 'Pre-flight checks', description: 'Verify Proxmox IPs, snapshot LXCs, and confirm OPNsense DNS/firewall state.' },
  { key: 'infrastructure', title: 'Infrastructure setup', description: 'Build VLAN bridges, deploy Pi-hole and nginx on Proxmox, and validate traffic lanes.' },
  { key: 'auth', title: 'Auth layer rollout', description: 'Deploy lldap and Authelia, explain why auth belongs on the infra VLAN.' },
  { key: 'dmz', title: 'DMZ & cleanup', description: 'Prepare external nginx, replace ngrok, and remove old host-based services.' },
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { tasks: [], segments: {} };
  } catch (err) {
    return { tasks: [], segments: {} };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderTasks(state, filter = 'all') {
  const taskList = document.getElementById('task-list');
  const visible = state.tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  taskList.innerHTML = visible.map((task) => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <label>
        <input type="checkbox" ${task.completed ? 'checked' : ''} />
        <span>${task.text}</span>
      </label>
      <button class="delete-task">Remove</button>
    </div>
  `).join('');
  document.getElementById('task-count').textContent = `${state.tasks.filter((task) => !task.completed).length} open task(s)`;
}

function renderSegments(state) {
  document.querySelectorAll('.segment-card').forEach((card) => {
    const key = card.dataset.segment;
    const done = !!state.segments[key];
    const button = card.querySelector('.segment-toggle');
    card.classList.toggle('completed', done);
    button.textContent = done ? 'Undo' : 'Mark done';
    button.style.background = done ? '#10b981' : '#2563eb';
  });
}

function updateFilterButtons(activeId) {
  document.querySelectorAll('.filter').forEach((button) => {
    button.classList.toggle('active', button.id === activeId);
  });
}

function init() {
  const state = loadState();
  renderTasks(state);
  renderSegments(state);
  let currentFilter = 'all';

  document.getElementById('add-task-button').addEventListener('click', () => {
    const input = document.getElementById('new-task');
    const text = input.value.trim();
    if (!text) return;
    state.tasks.unshift({ id: Date.now().toString(), text, completed: false });
    input.value = '';
    saveState(state);
    renderTasks(state, currentFilter);
  });

  document.getElementById('new-task').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('add-task-button').click();
    }
  });

  document.getElementById('task-list').addEventListener('click', (event) => {
    const taskEl = event.target.closest('.task-item');
    if (!taskEl) return;
    const id = taskEl.dataset.id;
    if (event.target.matches('input[type="checkbox"]')) {
      const task = state.tasks.find((task) => task.id === id);
      if (task) {
        task.completed = event.target.checked;
        saveState(state);
        renderTasks(state, currentFilter);
      }
    }
    if (event.target.matches('.delete-task')) {
      state.tasks = state.tasks.filter((task) => task.id !== id);
      saveState(state);
      renderTasks(state, currentFilter);
    }
  });

  document.getElementById('clear-completed').addEventListener('click', () => {
    state.tasks = state.tasks.filter((task) => !task.completed);
    saveState(state);
    renderTasks(state, currentFilter);
  });

  document.querySelectorAll('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.id.replace('filter-', '');
      updateFilterButtons(button.id);
      renderTasks(state, currentFilter);
    });
  });

  document.querySelectorAll('.segment-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      state.segments[key] = !state.segments[key];
      saveState(state);
      renderSegments(state);
    });
  });
}

window.addEventListener('DOMContentLoaded', init);
