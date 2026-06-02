FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better Docker layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for persistent data (database and uploads)
RUN mkdir -p /app/data /app/uploads/avatars /app/uploads/documents /app/uploads/images /app/uploads/portfolio /app/uploads/posts

# Health check for Northflank
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=3)"

# Expose port (must match the port in server:app)
EXPOSE 8000

# Production server with gunicorn (WSGI) + uvicorn workers (ASGI)
# Optimized for Northflank:
# - --workers: Auto-detect based on CPU cores
# - --worker-class: Use uvicorn for async FastAPI
# - --timeout: 120s for long-running requests
# - --access-logfile: Log to stdout for Northflank
CMD ["gunicorn", \
     "--workers=4", \
     "--worker-class=uvicorn.workers.UvicornWorker", \
     "--bind=0.0.0.0:8000", \
     "--timeout=120", \
     "--access-logfile=-", \
     "--error-logfile=-", \
     "--log-level=info", \
     "server:app"]
