FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create directories for uploads
RUN mkdir -p /app/uploads/avatars \
             /app/uploads/documents \
             /app/uploads/images \
             /app/uploads/portfolio \
             /app/uploads/posts

# Expose port (This is just documentation for Docker, not strictly enforced)
EXPOSE 10000

# Health check (This is fine, but ensure curl is installed if you keep it)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# THE FIX:
# Use the config file (-c) which handles the PORT correctly.
# Ensure your file is named server.py because of "server:app" at the end.
CMD ["gunicorn", "-c", "gunicorn_conf.py", "server:app"]