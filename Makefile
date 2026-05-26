.PHONY: install run service logs

VENV := .venv

install:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --quiet flask gunicorn
	@echo "Done. Run 'make run' to start."

run:
	@[ -d $(VENV) ] || $(MAKE) install
	@mkdir -p $${DATA_DIR:-/var/lib/stream-status/projects}
	$(VENV)/bin/gunicorn --workers 2 --bind 0.0.0.0:5000 app:app

service:
	cp deploy/stream-status-api.service /etc/systemd/system/
	systemctl daemon-reload
	systemctl enable --now stream-status-api
	@echo "Service running. Use 'make logs' to follow."

logs:
	journalctl -u stream-status-api -f
