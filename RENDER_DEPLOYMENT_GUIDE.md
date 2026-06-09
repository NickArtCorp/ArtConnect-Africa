# 🚀 Render Deployment Guide for ArtConnect-Africa

## Overview
Render is a modern cloud platform that deploys Docker containers automatically from GitHub. This guide covers full-stack deployment.

---

## 📋 Prerequisites

### 1. **GitHub Repository** ✅
- Push all code to: `https://github.com/NickCorp/ArtConnect-Africa`
- Render will automatically deploy when you push changes

### 2. **Render Account**
- Create free account at: https://render.com
- Connect your GitHub account

### 3. **Environment Variables Ready**
We'll configure these in Render dashboard (not in code)

---

## 🛠️ Setup Instructions

### **Step 1: Push Code to GitHub**

Make sure all changes are committed:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

**Via GitHub Web UI (if no local git):**
1. Go to: https://github.com/NickCorp/ArtConnect-Africa
2. Click pencil icon on each file to edit directly
3. Paste your local changes
4. Commit with message

---

### **Step 2: Deploy Backend on Render**

#### **2a. Create Web Service**

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Choose: `NickCorp/ArtConnect-Africa`
5. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `artconnect-api` |
| **Root Directory** | `backend` |
| **Environment** | `Docker` |
| **Region** | `Frankfurt (EU-Central-1)` or your region |
| **Branch** | `main` |

6. Click **"Create Web Service"** → Wait 5-10 minutes for build

---

#### **2b. Add PostgreSQL Database**

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `artconnect-postgres` |
| **Database** | `artconnect_db` |
| **User** | `artconnect_user` |
| **Region** | `Same as API (Frankfurt)` |
| **Plan** | `Free Tier` (0.5GB) or `Standard` (10GB) |

3. Click **"Create Database"**
4. **Copy the internal connection string** - you'll need this next

---

#### **2c. Add Environment Variables**

1. Go to your Web Service: `artconnect-api`
2. Click **"Environment"** in left sidebar
3. Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/artconnect_db?sslmode=require` | Copy from PostgreSQL service |
| `SECRET_KEY` | Generate random: `$(openssl rand -hex 32)` | Used for JWT tokens |
| `CORS_ORIGINS` | `https://artconnect-africa-web.onrender.com` | Frontend URL (add later) |
| `JWT_ALGORITHM` | `HS256` | JWT encryption |
| `TOKEN_EXPIRE_MINUTES` | `1440` | 24 hours |
| `PYTHON_VERSION` | `3.12` | Explicit Python version |
| `PORT` | `10000` | Render's default (auto-set) |

**For Database URL**, Render provides it in the PostgreSQL service page:
- Find **"Internal Database URL"** on the postgres service
- Format: `postgresql://user:password@internal.uuid.postgres.render.com:5432/dbname`
- Copy and paste as `DATABASE_URL`

4. Click **"Save"** - your API will redeploy automatically

---

### **Step 3: Deploy Frontend on Render (Optional)**

If you have a React frontend at `frontend/`:

1. Click **"New +"** → **"Static Site"**
2. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `artconnect-web` |
| **Repository** | `NickCorp/ArtConnect-Africa` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

3. After deployment completes, get the URL (e.g., `https://artconnect-africa-web.onrender.com`)
4. Go back to **Backend** → **Environment** → Update `CORS_ORIGINS` with this URL

---

## ✅ Verification Checklist

### **Backend Health Check**

After deployment, test these endpoints:

```bash
# Health check
curl https://artconnect-api-xxx.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "service": "ArtConnect-Africa API",
  "timestamp": "2026-06-09T14:30:00Z"
}
```

### **Database Connection Check**

In Render dashboard:
1. Go to `artconnect-api` → **"Logs"**
2. Look for these messages:

```
✅ Using PostgreSQL: postgresql://...
✅ Database initialized (PostgreSQL)
[INFO] Application startup complete ✨
```

**If you see SQLite messages:**
- PostgreSQL env var not set correctly
- Check `DATABASE_URL` in Environment section
- Redeploy with: **"Manual Deploy"** button

### **CORS Test**

From your frontend, test API call:
```javascript
fetch('https://artconnect-api-xxx.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ API working:', data))
```

---

## 🔄 Automatic Deployments

**Render auto-deploys when you:**
- Push to main branch on GitHub
- Commits are detected automatically
- Build starts within 30 seconds
- Deployment completes in 2-5 minutes

**Monitor deployment:**
1. Go to Web Service
2. Click **"Logs"** tab
3. Watch for: `[INFO] Application startup complete ✨`

---

## 📊 Database Scaling

### **Free Tier (0.5GB)**
- Great for: Testing, development
- Limitations: Will suspend after 90 days of inactivity
- Auto-wake up when accessed

### **Standard Plan (10GB+)**
- Great for: Production
- Always running, no suspension
- Cost: ~$15/month

**Upgrade anytime:**
1. Go to PostgreSQL service
2. Click **"Settings"**
3. Change plan → Click **"Upgrade"**

---

## 🚨 Troubleshooting

### **❌ "table posts already exists"**
**Solution:** Database already has tables from previous deployment
- Drop and recreate: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
  (Only for development - will lose data!)

### **❌ "CONNECTION_REFUSED to PostgreSQL"**
**Solution:** DATABASE_URL not set correctly
1. Go to Backend → Environment
2. Copy the **Internal Database URL** from PostgreSQL service
3. Paste as `DATABASE_URL`
4. Click "Save"
5. Check logs in 2 minutes

### **❌ CORS errors from frontend**
**Solution:** Add frontend URL to CORS_ORIGINS
1. Backend → Environment
2. Update: `CORS_ORIGINS=https://your-frontend.onrender.com`
3. Save and redeploy

### **❌ Build fails with "Python version error"**
**Solution:** Add `PYTHON_VERSION=3.12` in Environment

### **❌ Port issues or 502 Bad Gateway**
**Solution:** Ensure Dockerfile uses `PORT` env var
- Already done in current Dockerfile ✅
- Restart with: **"Manual Deploy"** button

---

## 📈 Performance Tips

### **1. Use Environment-Specific Settings**
```python
if DATABASE_URL.startswith('postgres'):
    # Production optimizations
    POOL_SIZE = 10
    MAX_OVERFLOW = 20
else:
    # SQLite (local)
    POOL_SIZE = 1
```

### **2. Enable Caching**
- Redis available on Render (add as service)
- Cache responses for 60 seconds
- Reduce database queries

### **3. Monitor Logs**
- Render dashboard → Logs
- Watch for slow queries
- Optimize N+1 problems

### **4. Set Up Alerts**
- Render → Settings → Notifications
- Alert on deploy failure
- Alert on service down

---

## 💰 Cost Estimation

| Service | Free Tier | Paid | Notes |
|---------|-----------|------|-------|
| **Static Site (Frontend)** | ✅ Free | $7/mo | Unlimited bandwidth |
| **Web Service (Backend)** | ⚠️ Free (spins down) | $7/mo | Always running |
| **PostgreSQL** | ✅ Free (suspend) | $15/mo | 0.5GB → 10GB |
| **Redis** (Optional) | ❌ No | $10/mo | Caching layer |

**Budget estimate:**
- Development: $0 (free tier)
- Production: ~$30/month (all paid tiers)

---

## 🔐 Security Checklist

- [x] Database URL is secure (SSL mode enabled)
- [x] JWT SECRET_KEY is random
- [x] CORS only allows frontend domain
- [x] Environment variables NOT in git
- [x] PostgreSQL password auto-generated
- [x] API requires authentication (via JWT)

---

## 📞 Next Steps

1. **Push code to GitHub** ✅
2. **Create Render account** → https://render.com
3. **Deploy backend** (follow Step 2a)
4. **Create PostgreSQL** (follow Step 2b)
5. **Set environment variables** (follow Step 2c)
6. **Test health endpoint**
7. **Deploy frontend** (if you have React app)

---

## 🎯 Quick Reference

| Action | Command/Link |
|--------|------|
| **Redeploy** | Dashboard → Manual Deploy button |
| **View Logs** | Dashboard → Logs tab |
| **Change PORT** | Already supports dynamic PORT ✅ |
| **Update Env Vars** | Dashboard → Environment |
| **Drop Database** | PostgreSQL service → delete and recreate |
| **Upgrade PostgreSQL** | PostgreSQL service → Settings → Plan |

---

**Ready? Let's deploy! 🚀**

Questions? Check logs first:
```
Dashboard → Web Service → Logs → Filter by "error"
```
