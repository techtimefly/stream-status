FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir flask gunicorn

COPY app.py .
COPY index.html style.css script.js obs-websocket.js \
     overlay.html overlay.css overlay.js ./

ENV DATA_DIR=/data/projects

EXPOSE 5000

CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:5000", "app:app"]
