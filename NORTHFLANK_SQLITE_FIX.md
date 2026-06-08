# 🔴 FIX: SQLite Table Error on Northflank

## Problème

```
sqlite3.OperationalError: table posts already exists
```

**Cause:** `DATABASE_URL` n'est **PAS défini** sur Northflank → L'app utilise SQLite au lieu de PostgreSQL

---

## ✅ Solution (5 mins)

### **Étape 1: Ajouter PostgreSQL sur Northflank**

1. Ouvrez **Northflank Dashboard**
2. Allez dans: **Services → artconnect-africa-api**
3. Cliquez sur l'onglet **"Addons"**
4. Cliquez sur **"+ Add Addon"**
5. Cherchez **"PostgreSQL"**
6. Sélectionnez la région **"Europe - West"**
7. Cliquez **"Create"** et attendez 1-2 minutes

### **Étape 2: Copier la Connection String**

1. Retournez à **Addons** (vous devez voir PostgreSQL maintenant)
2. Cliquez sur **"PostgreSQL"**
3. Cherchez l'onglet **"Connection"** ou **"Details"**
4. Copiez la **"Connection String"** complète
   - Format: `postgresql://username:password@host:5432/database`

### **Étape 3: Définir DATABASE_URL**

1. Allez dans: **Services → artconnect-africa-api → Environment**
2. Cliquez **"+ Add Variable"**
3. Remplissez:
   - **Name:** `DATABASE_URL`
   - **Value:** Collez la connection string
   - **Type:** `Secret` (important!)
4. Cliquez **"Add"** puis **"Update"**

### **Étape 4: Redéployer**

Choisissez UNE option:

**Option A: Via Northflank Dashboard**
- Services → artconnect-africa-api → **"Redeploy"** (bouton en haut)

**Option B: Via Git (auto)**
```bash
git push origin main
```

### **Étape 5: Attendre & Vérifier**

1. Attendez 2-3 minutes pour le déploiement
2. Allez dans: **Services → artconnect-africa-api → Logs**
3. Cherchez ces messages (✅ bon signe):
   ```
   ✅ Database initialized successfully
   [INFO] Application startup complete.
   [INFO] Waiting for application startup.
   ```

4. Test rapide:
   ```bash
   curl https://your-service.code.run/health
   ```

---

## 🆘 Troubleshooting

### **Les logs disent toujours "sqlite3.OperationalError"**

❌ **DATABASE_URL n'a pas été appliqué correctement**

**Vérification:**
```bash
# Dans Northflank Logs, cherchez ce message:
# "🟘 Using PostgreSQL: postgresql://..."

# Au lieu de:
# "⚠️  DATABASE_URL not set - Using SQLite"
```

**Solution:**
- Vérifiez que vous avez mis `DATABASE_URL` en **Type: Secret**
- Redéployer avec le bouton **"Force Redeploy"**

### **"could not connect to server"**

❌ **PostgreSQL n'est pas prêt ou la connection string est incorrecte**

**Solution:**
1. Vérifiez que PostgreSQL Addon montre le status **"Running"**
2. Attendez 3-5 minutes après création
3. Copiez la connection string à nouveau (elle change parfois)

### **"password authentication failed"**

❌ **Erreur dans la connection string**

**Solution:**
- Assurez-vous que vous copiez la STRING ENTIÈRE du Addon PostgreSQL
- Vérifiez qu'elle contient: `postgresql://user:password@host:port/db`

---

## 🧪 Test Local (Optionnel)

### Vérifier l'état de la BD localement

```bash
cd backend
python diagnose_db.py
```

Vous verrez:
```
🔍 DATABASE DIAGNOSTIC REPORT
=========================================
📍 DATABASE CONFIGURATION:
⚠️  DATABASE_URL is NOT SET
   Using: SQLite (Local Development)

🔌 CONNECTION TEST:
✅ Database connection: SUCCESS

📋 EXISTING TABLES:
✅ users (15 columns)
✅ posts (8 columns)
...
```

---

## 📊 Résumé des Changements du Code

✅ **database.py**
- Affiche des logs pour savoir quel type de BD est utilisé
- Gère les erreurs de tables existantes

✅ **server.py**
- `@app.on_event("startup")` initialise la BD UNE SEULE FOIS
- Évite les conflits d'accès

✅ **requirements.txt**
- `psycopg2-binary>=2.9.9` (driver PostgreSQL)

✅ **Nouveau fichier: diagnose_db.py**
- Script de diagnostic pour vérifier l'état de la BD

---

## ✅ Après Fix

Vos logs devraient montrer:
```
[2026-06-08T14:20:00Z] 🟘 Using PostgreSQL: postgresql://...
[2026-06-08T14:20:01Z] ✅ Database initialized successfully
[2026-06-08T14:20:02Z] [INFO] Application startup complete
```

**Voilà! ✨ Votre app fonctionne sur PostgreSQL!**
