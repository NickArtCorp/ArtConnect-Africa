# Guide Complet : Déploiement sur Northflank 🚀

Northflank est une plateforme PaaS moderne (comme Heroku ou Render) qui gère automatiquement l'infrastructure, le pare-feu, la sécurité et la scalabilité. Ce guide vous explique comment déployer votre backend FastAPI sur Northflank en quelques minutes.

---

## ✅ État de Préparation du Projet

Votre projet ArtConnect-Africa est **déjà optimisé** pour Northflank :

| Élément | État | Fichier |
|---------|------|---------|
| **Dockerfile** | ✅ Prêt | `backend/Dockerfile` |
| **requirements.txt** | ✅ Complet | `backend/requirements.txt` |
| **.dockerignore** | ✅ Configuré | `backend/.dockerignore` |
| **FastAPI App** | ✅ Définie | `backend/server.py` (ligne 91) |
| **Port** | ✅ Configuré | 8000 exposé |

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. ✅ Un compte GitHub ou GitLab avec votre dépôt
2. ✅ Un compte Northflank (https://www.northflank.com) - offre gratuite disponible
3. ✅ Les fichiers essentiels en place (voir ci-dessus)

---

## 🔑 Variables d'Environnement Requises

Votre application utilise des variables d'environnement (voir `backend/server.py` et `backend/database.py`). Vous devez les configurer dans Northflank :

### Exemple de `.env` pour Northflank :

```env
# Base de données (SQLite par défaut ou MongoDB)
DATABASE_URL=sqlite:///./data/artconnect.db
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/artconnect

# Sécurité JWT
SECRET_KEY=votre-clé-secrète-très-longue-et-complexe
ALGORITHM=HS256

# Email (Brevo/Sendinblue)
BREVO_API_KEY=votre-clé-api-brevo
SENDER_EMAIL=noreply@artconnect.com

# OAuth (Google, etc.)
GOOGLE_CLIENT_ID=votre-client-id-google
GOOGLE_CLIENT_SECRET=votre-client-secret-google

# AWS S3 (optionnel pour les uploads)
AWS_ACCESS_KEY_ID=votre-clé-aws
AWS_SECRET_ACCESS_KEY=votre-secret-aws
AWS_S3_BUCKET=artconnect-uploads
AWS_REGION=eu-west-1

# Configuration générale
ENVIRONMENT=production
LOG_LEVEL=info
```

---

## 🎯 Étape 1 : Préparation du Repository GitHub

### 1.1 Vérifier la structure du projet

Assurez-vous que votre dépôt a cette structure à la **racine** :

```
ArtConnect-Africa/
├── backend/
│   ├── Dockerfile          ✅
│   ├── requirements.txt     ✅
│   ├── .dockerignore       ✅
│   ├── server.py           ✅ (Point d'entrée : app = FastAPI(...))
│   ├── database.py
│   ├── auth_utils.py
│   └── ... (autres fichiers)
├── frontend/
│   └── ...
└── .git/
```

### 1.2 Commits essentiels

```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Préparer pour déploiement Northflank"
git push origin main
```

---

## 🚀 Étape 2 : Créer un Service sur Northflank

### 2.1 Se connecter à Northflank

1. Allez sur https://northflank.com
2. Connectez-vous avec votre compte (ou créez-en un)
3. Créez une nouvelle **équipe** (Team) pour votre projet

### 2.2 Créer un Service Dockerfile

Dans le tableau de bord Northflank :

1. Cliquez sur **"Create Service"** → **"Dockerfile"**
2. Connectez votre **GitHub** ou **GitLab** :
   - Autorisez Northflank à accéder à votre compte
   - Sélectionnez votre dépôt `ArtConnect-Africa`

### 2.3 Configurer le Build

**Build Settings:**
- **Name:** `artconnect-backend`
- **Dockerfile location:** `backend/Dockerfile`
- **Branch:** `main` (ou celle que vous utilisez)
- **Build context:** `.` (racine du projet)

**Note:** Si votre Dockerfile est dans `backend/`, Northflank comprendra automatiquement qu'il faut utiliser le contexte approprié.

### 2.4 Configurer le Service

**Service Details:**
- **Name:** `artconnect-backend-api`
- **Port:** `8000` (doit correspondre à votre Dockerfile)
- **Replica:** `1` au début (pour la production, augmentez selon vos besoins)

---

## 🔐 Étape 3 : Configurer les Variables d'Environnement

### 3.1 Dans Northflank Dashboard

1. Allez à **Settings** → **Environment Variables**
2. Ajoutez chaque variable d'environnement depuis l'exemple ci-dessus
3. **Important :** Mettez les secrets (API keys, tokens) en tant que **"Secret"** (pas "Environment")

### 3.2 Structure recommandée

```yaml
# Variables de configuration
ENVIRONMENT: production
LOG_LEVEL: info
API_URL: https://votre-domaine.northflank.app

# Secrets (stockés de manière sécurisée)
SECRET_KEY: [votre-clé-secrète]
BREVO_API_KEY: [votre-clé-brevo]
DATABASE_URL: sqlite:///./data/artconnect.db
```

---

## 🔄 Étape 4 : Configurer la Base de Données

### Option A : SQLite (Recommandé pour commencer)

SQLite fonctionne nativement avec votre code. Pour persister les données :

1. Northflank crée automatiquement un **volume persistant**
2. Assurez-vous que votre `server.py` crée le dossier `/app/data` :
   ```python
   DATA_DIR = Path("/app/data")
   DATA_DIR.mkdir(exist_ok=True)
   DATABASE_URL = f"sqlite:///{DATA_DIR}/artconnect.db"
   ```

### Option B : MongoDB Atlas (Recommandé pour production)

Si vous préférez MongoDB :

1. Créez un cluster gratuit sur https://www.mongodb.com/cloud/atlas
2. Récupérez votre `MONGODB_URL`
3. Ajoutez-la dans Northflank comme variable `MONGODB_URL`
4. Mettez à jour `database.py` pour utiliser MongoDB (motor driver)

---

## ⚙️ Étape 5 : Configurer les Ports et Réseau

### 5.1 Port HTTP

- **Port interne :** `8000` (ce que votre app écoute)
- **Port externe :** Northflank génère automatiquement une URL publique
  - Exemple : `https://artconnect-backend-api-xxxxx.northflank.app`

### 5.2 Variables Northflank Disponibles

Northflank expose automatiquement des variables d'environnement :

```env
# Générées par Northflank
PORT=8000                  # Port du service
NORTHFLANK_SERVICE_NAME=artconnect-backend-api
NORTHFLANK_REPLICAS=1
```

---

## 🔧 Étape 6 : Configurer les Health Checks (Importante)

### 6.1 Ajouter un endpoint de santé

Dans `backend/server.py`, ajoutez :

```python
@app.get("/health")
def health_check():
    """Endpoint de santé pour Northflank"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/ready")
def readiness_check():
    """Endpoint de readiness pour vérifier la DB"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"ready": True}
    except Exception as e:
        return {"ready": False, "error": str(e)}, 503
```

### 6.2 Configurer dans Northflank

Dans **Service Settings** → **Health Checks** :
- **Liveness Probe:** GET `/health` - Timeout: 5s - Interval: 30s
- **Readiness Probe:** GET `/ready` - Timeout: 5s - Interval: 10s

---

## 📦 Étape 7 : Déployer

### 7.1 Premier Déploiement

1. Cliquez sur **"Deploy"** dans Northflank
2. Attendez que le build Docker se termine (2-5 minutes)
3. Une fois complété, votre service sera **live** à une URL publique

### 7.2 Vérifier le Déploiement

```bash
# Tester votre API
curl https://artconnect-backend-api-xxxxx.northflank.app/health

# Résultat attendu :
# {"status": "healthy", "version": "1.0.0", ...}
```

### 7.3 Logs et Débogage

Dans Northflank Dashboard :
- Allez à **Logs** pour voir les logs en temps réel
- Cherchez des erreurs liées à la base de données ou aux imports

---

## 🔄 Étape 8 : Déploiements Automatiques (CI/CD)

### 8.1 Configurer Git Webhooks

Northflank peut déployer automatiquement à chaque `git push` :

1. Dans **Service Settings** → **Git Integration**
2. Activez **"Auto Deploy on Push"**
3. Sélectionnez la branche (`main`, `production`, etc.)

**Résultat :** À chaque commit sur `main`, Northflank :
- Rebuild l'image Docker
- Lance les tests (si configurés)
- Déploie automatiquement

### 8.2 Optionnel : Tests Automatiques

Ajoutez dans votre `Dockerfile` :

```dockerfile
# Lancer les tests avant le déploiement
RUN pytest tests/ --tb=short || exit 1
```

---

## 📊 Étape 9 : Configurer le Domaine Personnalisé

### 9.1 Ajouter un Domaine Custom

1. Allez à **Service** → **Domains**
2. Cliquez **"Add Domain"**
3. Entrez votre domaine : `api.artconnect.com`
4. Suivez les instructions pour pointer votre DNS vers Northflank

### 9.2 SSL/TLS Automatique

Northflank gère automatiquement les certificats SSL/TLS gratuits (Let's Encrypt).

---

## 🐛 Dépannage Commun

### ❌ Erreur : "Build failed - missing requirements"

**Solution :** Vérifiez que `requirements.txt` est bien à côté du `Dockerfile` :
```
backend/
├── Dockerfile
├── requirements.txt
└── server.py
```

### ❌ Erreur : "Port already in use"

**Solution :** Assurez-vous que le port dans le Dockerfile correspond au port dans Northflank (8000).

### ❌ Database connection error

**Solution :**
- Vérifiez la variable `DATABASE_URL` dans Northflank
- Assurez-vous que le dossier `/app/data` existe (voir Dockerfile ligne 18)

### ❌ Module import errors

**Solution :**
- Vérifiez que tous les imports `from database import ...` fonctionnent
- Testez localement : `python -m pytest backend/test_imports.py`

---

## 📈 Optimisations Production

### 1. Augmenter les Répliques (Load Balancing)

Pour gérer plus de trafic :
1. Allez à **Service** → **Settings**
2. Augmentez **Replicas** de 1 à 3 (ou plus)
3. Northflank distribue les requêtes automatiquement

### 2. Augmenter les Ressources

Par défaut, Northflank alloue des ressources économes. Pour plus de puissance :
1. Allez à **Resources**
2. Augmentez **CPU** et **RAM**
3. Redémarrez le service

### 3. Configurer Auto-scaling

Pour une scalabilité automatique :
1. Allez à **Scaling**
2. Activez **Auto Scaling**
3. Configurez le **Min replicas** et **Max replicas**

---

## 🔌 Intégration Frontend

Une fois le backend déployé sur Northflank :

### 1. Mettre à jour les URLs Frontend

Dans votre React app (`frontend/src/config.js` ou `.env`) :

```javascript
// Avant (développement)
const API_URL = "http://localhost:8000";

// Après (production)
const API_URL = "https://artconnect-backend-api-xxxxx.northflank.app";
// Ou avec domaine custom :
// const API_URL = "https://api.artconnect.com";
```

### 2. CORS Configuration

Assurez-vous que votre backend accepte les requêtes du frontend :

Dans `backend/server.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://artconnect.northflank.app", "https://artconnect.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✨ Checklist de Déploiement

Avant de déployer, vérifiez :

- [ ] `backend/Dockerfile` existe et est bien formé
- [ ] `backend/requirements.txt` liste toutes les dépendances
- [ ] `backend/.dockerignore` exclut les fichiers inutiles
- [ ] `backend/server.py` définit `app = FastAPI(...)`
- [ ] Variables d'environnement configurées dans Northflank
- [ ] Base de données (SQLite ou MongoDB) prête
- [ ] Endpoints `/health` et `/ready` implémentés
- [ ] Git repository pushé vers GitHub/GitLab
- [ ] Northflank autorisé à accéder à votre repository
- [ ] Logs vérifiés après le premier déploiement
- [ ] API testée avec curl ou Postman

---

## 📚 Ressources Utiles

- **Documentation Northflank :** https://docs.northflank.com
- **FastAPI Deployment :** https://fastapi.tiangolo.com/deployment/
- **Docker Best Practices :** https://docs.docker.com/develop/guidelines/
- **GitHub Webhooks :** https://docs.github.com/webhooks

---

## 💡 Prochaines Étapes

1. **Déployer le backend** sur Northflank (suivez les étapes 1-7)
2. **Configurer le CI/CD** pour les déploiements automatiques
3. **Connecter le frontend** à l'API en production
4. **Mettre en place le monitoring** (Northflank Dashboard)
5. **Configurer les backups** de la base de données

---

**Questions ? Besoin d'aide ?** Consultez les logs Northflank ou contactez leur support à support@northflank.com

---

*Dernière mise à jour : Juin 2026*
*Prêt pour le déploiement ? 🚀*
