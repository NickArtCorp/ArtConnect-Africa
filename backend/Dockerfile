FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads/avatars \
             /app/uploads/documents \
             /app/uploads/images \
             /app/uploads/portfolio \
             /app/uploads/posts

EXPOSE 10000

# THIS IS WHERE THE HEALTHCHECK GOES (In the Dockerfile)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

CMD ["gunicorn", "-c", "gunicorn_conf.py", "server:app"]