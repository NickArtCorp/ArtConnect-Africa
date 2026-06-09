# 🚀 Render Deployment - Quick Start (5 Minutes)

## ⚡ Quick Steps

### **1️⃣ Push Code to GitHub**
```bash
git add .
git commit -m "Ready for Render"
git push origin main
```

**No git?** Use GitHub web UI:
- Go to: https://github.com/NickCorp/ArtConnect-Africa/edit/main/backend/database.py
- Paste your code → Commit

---

### **2️⃣ Create Render Account**
- Sign up: https://render.com (connect GitHub)

---

### **3️⃣ Deploy Backend (5 minutes)**

1. **Go to:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Select:** `NickCorp/ArtConnect-Africa`
4. **Set:**
   - Name: `artconnect-api`
   - Root Directory: `backend`
   - Runtime: `Docker`
5. **Click:** "Create Web Service"
6. **Wait** 5-10 min for build (watch logs)

---

### **4️⃣ Create Database (2 minutes)**

1. **Click:** "New +" → "PostgreSQL"
2. **Set:**
   - Name: `artconnect-postgres`
   - Database: `artconnect_db`
   - User: `artconnect_user`
3. **Click:** "Create Database"
4. **Copy:** Internal connection string

---

### **5️⃣ Connect Database to API (1 minute)**

1. **Go to:** `artconnect-api` service
2. **Click:** "Environment"
3. **Add variable:**
   ```
   DATABASE_URL = postgresql://user:pass@host:5432/artconnect_db?sslmode=require
   ```
4. **Click:** "Save"
5. **Wait** 2 min for auto-redeploy

---

### **6️⃣ Test It Works**

```bash
# Check API is running
curl https://artconnect-api-xxx.onrender.com/health

# Expected response:
# {"status":"healthy","service":"ArtConnect-Africa API",...}
```

---

## ✅ Expected Log Messages

After deployment, you should see in logs:

```
✅ Using PostgreSQL: postgresql://...
✅ Database initialized (PostgreSQL)
[INFO] Application startup complete ✨
```

---

## ❌ If Something Breaks

1. **Check logs:** Dashboard → Logs tab
2. **Look for:** "error" or "ERROR"
3. **Common fixes:**
   - DATABASE_URL not set → Copy from PostgreSQL service
   - Port issue → Already fixed in Dockerfile
   - Build failed → Check requirements.txt syntax

---

## 💰 Cost

- **Free tier:** $0/month (spins down after 15 min inactivity)
- **Paid tier:** $7/month (always running) + $15/month database

Start free, upgrade anytime!

---

**Done! Your API is live 🎉**

Next: Deploy frontend (React) or add more features.

For detailed guide, see: [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)
