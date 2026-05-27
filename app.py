import json
import os
import uuid
import urllib.request
from datetime import datetime, timezone
from flask import Flask, jsonify, request, abort

DATA_DIR    = '/var/lib/stream-status/projects'
ACTIVE_FILE = '/var/lib/stream-status/active.json'
os.makedirs(DATA_DIR, exist_ok=True)

app = Flask(__name__)


def _safe_id(project_id: str) -> str:
    return os.path.basename(project_id).replace('..', '')


def _path(project_id: str) -> str:
    return os.path.join(DATA_DIR, f'{_safe_id(project_id)}.json')


def _read(project_id: str) -> dict:
    p = _path(project_id)
    if not os.path.exists(p):
        abort(404)
    with open(p) as f:
        return json.load(f)


def _write(data: dict) -> None:
    with open(_path(data['id']), 'w') as f:
        json.dump(data, f, indent=2)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _generate_ai(prompt: str, max_tokens: int = 1000) -> str:
    """Call the configured AI provider. Returns raw text. Raises RuntimeError if no provider."""
    if os.environ.get('ANTHROPIC_API_KEY'):
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
            msg = client.messages.create(
                model='claude-haiku-4-5-20251001',
                max_tokens=max_tokens,
                messages=[{'role': 'user', 'content': prompt}],
            )
            return msg.content[0].text.strip()
        except Exception:
            pass

    if os.environ.get('OLLAMA_BASE_URL'):
        base_url = os.environ['OLLAMA_BASE_URL'].rstrip('/')
        model = os.environ.get('OLLAMA_MODEL', 'gemma4')
        payload = json.dumps({
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'stream': False,
        }).encode()
        req = urllib.request.Request(
            f'{base_url}/v1/chat/completions',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
        return data['choices'][0]['message']['content'].strip()

    raise RuntimeError('no AI provider configured')


def _tips_prompt(title: str, context: str) -> str:
    return (
        f'Generate 8 concise, interesting facts or tips about "{title}" '
        f'for rotating lower-third text on a live technical stream about: {context}.\n\n'
        'Rules:\n'
        '- Each tip must be 1–2 short sentences\n'
        '- Facts must be accurate and educational\n'
        '- Assume a technical homelab/networking audience\n'
        '- Return ONLY a valid JSON array of 8 strings, no explanation, no markdown'
    )


@app.route('/api/projects', methods=['GET'])
def list_projects():
    result = []
    for fname in sorted(os.listdir(DATA_DIR)):
        if not fname.endswith('.json'):
            continue
        try:
            with open(os.path.join(DATA_DIR, fname)) as f:
                p = json.load(f)
            result.append({k: p.get(k, '') for k in ('id', 'name', 'description', 'createdAt', 'updatedAt')})
        except Exception:
            continue
    return jsonify(result)


@app.route('/api/projects', methods=['POST'])
def create_project():
    body = request.get_json(silent=True) or {}
    name = body.get('name', '').strip()
    if not name:
        abort(400)
    project = {
        'id': str(uuid.uuid4()),
        'name': name,
        'description': body.get('description', '').strip(),
        'focus': body.get('focus', '').strip(),
        'platform': body.get('platform', '').strip(),
        'segments': body.get('segments', []),
        'tasks': [],
        'createdAt': _now(),
        'updatedAt': _now(),
    }
    _write(project)
    return jsonify(project), 201


@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    return jsonify(_read(project_id))


@app.route('/api/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    existing = _read(project_id)
    body = request.get_json(silent=True)
    if not body:
        abort(400)
    body['id'] = project_id
    body['createdAt'] = existing.get('createdAt', _now())
    body['updatedAt'] = _now()
    _write(body)
    return jsonify(body)


@app.route('/api/projects/<project_id>/layouts', methods=['GET'])
def list_layouts(project_id):
    return jsonify(_read(project_id).get('layouts', []))


@app.route('/api/projects/<project_id>/layouts', methods=['POST'])
def create_layout(project_id):
    body = request.get_json(silent=True)
    if not body or not body.get('id'):
        abort(400)
    project = _read(project_id)
    project.setdefault('layouts', [])
    # Remove existing layout with same id (upsert)
    project['layouts'] = [l for l in project['layouts'] if l.get('id') != body['id']]
    project['layouts'].append(body)
    project['updatedAt'] = _now()
    _write(project)
    return jsonify(body), 201


@app.route('/api/projects/<project_id>/layouts/<layout_id>', methods=['GET'])
def get_layout(project_id, layout_id):
    layouts = _read(project_id).get('layouts', [])
    layout  = next((l for l in layouts if l.get('id') == layout_id), None)
    if not layout:
        abort(404)
    return jsonify(layout)


@app.route('/api/projects/<project_id>/layouts/<layout_id>', methods=['PUT'])
def update_layout(project_id, layout_id):
    body    = request.get_json(silent=True)
    if not body:
        abort(400)
    project = _read(project_id)
    project.setdefault('layouts', [])
    idx = next((i for i, l in enumerate(project['layouts']) if l.get('id') == layout_id), None)
    body['id'] = layout_id
    if idx is not None:
        project['layouts'][idx] = body
    else:
        project['layouts'].append(body)
    project['updatedAt'] = _now()
    _write(project)
    return jsonify(body)


@app.route('/api/projects/<project_id>/layouts/<layout_id>', methods=['DELETE'])
def delete_layout(project_id, layout_id):
    project = _read(project_id)
    project['layouts'] = [l for l in project.get('layouts', []) if l.get('id') != layout_id]
    project['updatedAt'] = _now()
    _write(project)
    return '', 204


@app.route('/api/projects/<project_id>/obs-stats', methods=['PUT'])
def update_obs_stats(project_id):
    existing = _read(project_id)
    body = request.get_json(silent=True)
    if not body:
        abort(400)
    existing['obsStats'] = {
        'updatedAt':        _now(),
        'kbps':             body.get('kbps', 0),
        'droppedFramesPct': body.get('droppedFramesPct', 0),
        'renderLagMs':      body.get('renderLagMs', 0),
        'fps':              body.get('fps', 0),
        'cpuPct':           body.get('cpuPct', 0),
    }
    existing['updatedAt'] = _now()
    _write(existing)
    return jsonify(existing['obsStats'])


@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    p = _path(project_id)
    if not os.path.exists(p):
        abort(404)
    os.remove(p)
    return '', 204


@app.route('/api/active', methods=['GET'])
def get_active():
    pid = None
    if os.path.exists(ACTIVE_FILE):
        try:
            with open(ACTIVE_FILE) as f:
                pid = json.load(f).get('projectId')
        except Exception:
            pass
    if pid and os.path.exists(_path(pid)):
        return jsonify({'projectId': pid})
    # Fall back to the first project on disk
    for fname in sorted(os.listdir(DATA_DIR)):
        if fname.endswith('.json'):
            return jsonify({'projectId': fname[:-5]})
    return jsonify({'projectId': None})


@app.route('/api/active', methods=['PUT'])
def set_active():
    body = request.get_json(silent=True) or {}
    pid  = body.get('projectId', '').strip()
    if not pid or not os.path.exists(_path(pid)):
        abort(400)
    with open(ACTIVE_FILE, 'w') as f:
        json.dump({'projectId': pid}, f)
    return jsonify({'projectId': pid})


@app.route('/api/capabilities', methods=['GET'])
def capabilities():
    has_anthropic = False
    try:
        import anthropic  # noqa: F401
        has_anthropic = bool(os.environ.get('ANTHROPIC_API_KEY'))
    except ImportError:
        pass
    has_ollama = bool(os.environ.get('OLLAMA_BASE_URL'))
    provider = 'anthropic' if has_anthropic else ('ollama' if has_ollama else None)
    return jsonify({'aiTips': has_anthropic or has_ollama, 'provider': provider})


@app.route('/api/generate-tips', methods=['POST'])
def generate_tips():
    body   = request.get_json(silent=True) or {}
    title  = body.get('title', '').strip()
    p_name = body.get('projectName', '').strip()
    p_desc = body.get('projectDescription', '').strip()
    if not title:
        abort(400)
    context = p_name + (f' — {p_desc}' if p_desc else '')
    try:
        raw  = _generate_ai(_tips_prompt(title, context), max_tokens=800)
        tips = json.loads(raw)
        if not isinstance(tips, list):
            raise ValueError
    except RuntimeError:
        abort(503)
    except Exception:
        abort(500)
    return jsonify({'tips': [str(t) for t in tips[:10]]})


@app.route('/api/generate-segments', methods=['POST'])
def generate_segments():
    body     = request.get_json(silent=True) or {}
    p_name   = body.get('projectName', '').strip()
    p_desc   = body.get('projectDescription', '').strip()
    focus    = body.get('focus', '').strip()
    platform = body.get('platform', '').strip()
    if not p_name:
        abort(400)

    parts = [p_name]
    if p_desc:   parts.append(p_desc)
    if focus:    parts.append(f'focus: {focus}')
    if platform: parts.append(f'platform: {platform}')
    context = ' — '.join(parts)

    prompt = (
        f'Generate a segment plan (5–7 segments) for a live technical homelab stream about: {context}.\n\n'
        'Rules:\n'
        '- Each segment is a distinct phase (e.g. Intro, main topic sections, Wrap-up)\n'
        '- "title": short name, 4–6 words max\n'
        '- "description": one sentence explaining what will be covered\n'
        '- "duration": estimated integer minutes, realistic for the topic depth\n'
        '- Assume a technical homelab/networking audience\n'
        '- Return ONLY a valid JSON array of objects, no explanation, no markdown\n'
        '- Example: [{"title": "Intro & goals", "description": "Overview of what we\'re building.", "duration": 10}]'
    )
    try:
        raw      = _generate_ai(prompt, max_tokens=1000)
        segments = json.loads(raw)
        if not isinstance(segments, list):
            raise ValueError
    except RuntimeError:
        abort(503)
    except Exception:
        abort(500)

    cleaned = []
    for s in segments[:10]:
        if not s.get('title'):
            continue
        dur = s.get('duration')
        try:
            dur = int(dur)
        except (TypeError, ValueError):
            dur = None
        cleaned.append({
            'title':       str(s['title']),
            'description': str(s.get('description', '')),
            'duration':    dur,
        })
    return jsonify({'segments': cleaned})


@app.route('/api/suggest-tasks', methods=['POST'])
def suggest_tasks():
    body      = request.get_json(silent=True) or {}
    seg_title = body.get('segmentTitle', '').strip()
    seg_desc  = body.get('segmentDescription', '').strip()
    p_name    = body.get('projectName', '').strip()
    p_desc    = body.get('projectDescription', '').strip()
    focus     = body.get('focus', '').strip()
    platform  = body.get('platform', '').strip()
    if not seg_title:
        abort(400)

    proj_parts = [p for p in [p_name, f'focus: {focus}' if focus else '', f'platform: {platform}' if platform else ''] if p]
    proj_ctx   = ' — '.join(proj_parts) if proj_parts else 'a homelab project'
    seg_ctx    = seg_title + (f': {seg_desc}' if seg_desc else '')

    prompt = (
        f'Generate 5–6 specific, actionable tasks for a live stream segment called "{seg_ctx}" '
        f'as part of a technical stream about: {proj_ctx}.\n\n'
        'Rules:\n'
        '- Each task is a concrete action (e.g. "Create VLAN 20 interface on OPNsense")\n'
        '- Tasks should be completable during the stream segment\n'
        '- Be specific to the segment topic, not generic\n'
        '- Assume a technical homelab/networking audience\n'
        '- Return ONLY a valid JSON array of strings, no explanation, no markdown'
    )
    try:
        raw   = _generate_ai(prompt, max_tokens=600)
        tasks = json.loads(raw)
        if not isinstance(tasks, list):
            raise ValueError
    except RuntimeError:
        abort(503)
    except Exception:
        abort(500)

    return jsonify({'tasks': [str(t) for t in tasks[:10]]})


@app.route('/api/generate-writeup', methods=['POST'])
def generate_writeup():
    body            = request.get_json(silent=True) or {}
    p_name          = body.get('projectName', '').strip()
    p_desc          = body.get('projectDescription', '').strip()
    focus           = body.get('focus', '').strip()
    platform        = body.get('platform', '').strip()
    completed       = body.get('completedSegments', [])
    total_segs      = body.get('totalSegments', len(completed))
    stream_duration = body.get('streamDuration')
    if not p_name:
        abort(400)

    parts = [p_name]
    if p_desc:   parts.append(p_desc)
    if focus:    parts.append(f'focus: {focus}')
    if platform: parts.append(f'platform: {platform}')

    seg_lines = '\n'.join(
        f'- {s["title"]}' + (f': {s["description"]}' if s.get('description') else '')
        for s in completed if s.get('title')
    )

    dur_str = ''
    if stream_duration:
        try:
            mins    = int(stream_duration) // 60
            hours   = mins // 60
            mins_r  = mins % 60
            dur_str = f'{hours}h {mins_r}m' if hours else f'{mins_r}m'
        except (TypeError, ValueError):
            pass

    prompt = (
        f'Write a YouTube video description for a homelab live stream.\n\n'
        f'Stream topic: {" — ".join(parts)}\n'
        + (f'Duration: {dur_str}\n' if dur_str else '')
        + (f'Segments covered ({len(completed)}/{total_segs}):\n{seg_lines}\n' if seg_lines else '')
        + '\nWrite a compelling 3–4 paragraph description:\n'
        '1. Engaging opening sentence about what was built/explored\n'
        '2. Brief summary of what was covered (from the segments)\n'
        '3. Who this is for / what viewers will learn\n'
        '4. Short call to action (subscribe, links in description)\n\n'
        'Tone: informal, technical but approachable. Plain text only, no markdown.'
    )
    try:
        writeup = _generate_ai(prompt, max_tokens=600)
    except RuntimeError:
        abort(503)
    except Exception:
        abort(500)

    return jsonify({'writeup': writeup})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
