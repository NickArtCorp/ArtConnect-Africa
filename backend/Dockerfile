FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (leverages Docker cache)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create directories for uploads (Render uses ephemeral storage, but keeping for compatibility)
RUN mkdir -p /app/uploads/avatars \
             /app/uploads/documents \
             /app/uploads/images \
             /app/uploads/portfolio \
             /app/uploads/posts

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Expose port (Render will use PORT env var)
EXPOSE 10000

# Run Gunicorn + Uvicorn with config file (supports dynamic PORT env var)
CMD ["gunicorn", "-c", "gunicorn_conf.py", "server:app"]
     "--access-logfile=-", \
     "--error-logfile=-", \
     "--log-level=info", \
     "server:app"]