#!/usr/bin/env bash
set -e

VENV=".venv"
DATA_DIR="${DATA_DIR:-/var/lib/stream-status/projects}"
BIND="${BIND:-0.0.0.0:5000}"
WORKERS="${WORKERS:-2}"

# Bootstrap venv on first run
if [ ! -d "$VENV" ]; then
    echo "Creating virtualenv..."
    python3 -m venv "$VENV"
fi

# Install / sync dependencies
"$VENV/bin/pip" install --quiet flask gunicorn

# Create data directory if needed
mkdir -p "$DATA_DIR"

# Load .env if present
if [ -f .env ]; then
    set -a && source .env && set +a
fi

echo "Starting Stream Status on http://$BIND"
exec "$VENV/bin/gunicorn" --workers "$WORKERS" --bind "$BIND" app:app
