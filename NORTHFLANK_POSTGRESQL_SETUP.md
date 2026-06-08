# PostgreSQL Setup pour Northflank - Guide de Configuration

## 🎯 Problème Résolu

✅ **SQLite → PostgreSQL** - Migration pour production Northflank
✅ **Initialisation Centralisée** - Une seule création de tables au startup
✅ **Variables d'environnement** - Support auto PostgreSQL/SQLite

---

## 📋 Changes Effectuées

### 1. **database.py** - Support PostgreSQL
```python
# Détection automatique de la base de données
DATABASE_URL = os.environ.get('DATABASE_URL', None)

if DATABASE_URL:
    # Production: PostgreSQL
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
else:
    # Local: SQLite
    engine = create_engine(f"sqlite:///{ROOT_DIR}/artconnect.db")
```

### 2. **requirements.txt** - Ajout psycopg2
```
psycopg2-binary>=2.9.9  ← Driver PostgreSQL
```

### 3. **server.py** - Startup Event
```python
@app.on_event("startup")
async def startup_event():
    init_db()  # Une seule fois au démarrage
    _run_migrations()
```

### 4. **Scripts utilitaires** - Utilisation de init_db()
- `create_demo_accounts.py`
- `reset_db.py`
- `setup_admin_user.py`

---

## 🚀 Configuration sur Northflank

### 1. **Ajouter l'Add-on PostgreSQL**

Dans Northflank Dashboard:
1. Allez dans votre projet → Services → Votre service
2. Cliquez sur **"Addons"** → **"PostgreSQL"**
3. Sélectionnez la région **Europe - West**
4. Validez la création

### 2. **Récupérer la Connection String**

Dans Northflank Dashboard:
1. Allez dans **Addons** → **PostgreSQL**
2. Cherchez le onglet **"Connection"**
3. Copiez la **"Connection string"** complète
   - Format: `postgresql://user:password@hostname:5432/artconnect`

### 3. **Ajouter la Variable d'Environnement**

Dans Northflank Dashboard:
1. Services → artconnect-africa-api → **Environment**
2. Cliquez sur **"+ Add Variable"**
3. **Nom:** `DATABASE_URL`
4. **Valeur:** Collez la connection string complète
5. **Type:** `Secret` (si possible)
6. Cliquez **"Update"**

### 4. **Redéployer l'Application**

```bash
# Ou utilisez le bouton "Redeploy" dans Northflank Dashboard
git push origin main  # Trigger un nouveau build
```

---

## ✅ Vérification du Déploiement

### 1. **Vérifier les logs**
Northflank Dashboard → Services → artconnect-africa-api → **Logs**

Vous devez voir:
```
[INFO] Application startup complete.
[INFO] Waiting for application startup.
```

### 2. **Tester les endpoints**
```bash
# Health check
curl https://artconnect-africa-api-xxx.code.run/health

# Response devrait être:
{
  "status": "healthy",
  "service": "ArtConnect-Africa API",
  "timestamp": "2026-06-08T10:07:18Z"
}
```

### 3. **Test de base de données**
```bash
# Readiness check
curl https://artconnect-africa-api-xxx.code.run/ready

# Response devrait être:
{
  "ready": true,
  "database": "connected",
  "timestamp": "2026-06-08T10:07:18Z"
}
```

---

## 🔧 Configuration Locale (pour tester)

### Avec SQLite (Défaut)
```bash
# Assurez-vous que DATABASE_URL est VIDE
unset DATABASE_URL
python -m server
```

### Avec PostgreSQL Local
```bash
# Installez PostgreSQL localement
# Créez une base de données
createdb artconnect

# Configurez la variable
export DATABASE_URL="postgresql://user:password@localhost/artconnect"
python -m server
```

---

## 📊 Performance Tips

### Connection Pool
```python
# PostgreSQL utilise un pool de 5 connexions + 10 overflow
# Optimal pour Northflank (256MB RAM)

pool_size=5
max_overflow=10
pool_recycle=3600  # Recycle après 1h
pool_pre_ping=True  # Vérifier connexion avant utilisation
```

### Database Tuning
```sql
-- Optimiser les indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_partner_code ON users(partner_code);
```

---

## 🆘 Troubleshooting

### Erreur: "FATAL: password authentication failed"
- **Cause:** Connection string incorrecte
- **Solution:** Vérifiez la connection string dans Northflank Environment variables
  ```bash
  # Format correct:
  postgresql://username:password@hostname:5432/database
  ```

### Erreur: "could not connect to database server"
- **Cause:** PostgreSQL n'est pas encore prêt
- **Solution:** Attendre 2-3 minutes après création de l'add-on, puis redéployer

### Erreur: "relation 'users' does not exist"
- **Cause:** Tables non créées au premier démarrage
- **Solution:** Vérifier que init_db() a été appelé avec succès dans les logs

---

## 📝 Prochaines Étapes

1. **Sauvegardes** - Configurez des backups PostgreSQL dans Northflank
2. **Monitoring** - Activez les métriques de base de données
3. **Scaling** - Augmentez les ressources si nécessaire (RAM > 512MB)

---

**Déploiement prêt! ✅**
