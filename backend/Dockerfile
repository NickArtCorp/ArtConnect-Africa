FROM python:3.12-slim

WORKDIR /app

# Installation des dépendances système nécessaires (et ajout de curl pour le healthcheck)
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copie des dépendances (Profite du cache Docker)
COPY requirements.txt .

# Installation des paquets Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie de tout le code du backend
COPY . .

# Création des dossiers pour les données persistantes et les uploads d'art
RUN mkdir -p /app/data \
             /app/uploads/avatars \
             /app/uploads/documents \
             /app/uploads/images \
             /app/uploads/portfolio \
             /app/uploads/posts

# Health check optimisé avec curl (plus léger et robuste que requests)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Port exposé
EXPOSE 8000

# Lancement du serveur de production Gunicorn + Uvicorn
CMD ["gunicorn", \
     "--workers=1", \
     "--worker-class=uvicorn.workers.UvicornWorker", \
     "--bind=0.0.0.0:8000", \
     "--timeout=120", \
     "--access-logfile=-", \
     "--error-logfile=-", \
     "--log-level=info", \
     "server:app"]