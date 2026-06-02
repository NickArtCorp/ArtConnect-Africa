import multiprocessing
import os

# Port sur lequel le serveur va écouter
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Nombre de workers (processus) à lancer
# La formule classique est (2 * nb_cpus) + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Classe de worker pour gérer l'asynchrone (FastAPI)
worker_class = "uvicorn.workers.UvicornWorker"

# Temps d'attente avant de tuer un worker qui ne répond plus
timeout = 120

# Garder les connexions ouvertes pour plus de performance
keepalive = 5

# Logs (optionnel - tu peux les rediriger vers des fichiers sur ton instance Oracle)
accesslog = "-"
errorlog = "-"
