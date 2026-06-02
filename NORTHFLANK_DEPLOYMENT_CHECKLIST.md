# ✅ Northflank Deployment Checklist

## 🎯 Pre-Deployment Verification

Before deploying to Northflank, verify that all these items are in place:

### 1. Code Repository
- [ ] All code is committed to GitHub/GitLab
- [ ] Main branch is up-to-date
- [ ] No sensitive data in commits (.env files, API keys, etc.)
- [ ] `.gitignore` properly configured

### 2. Backend Configuration
- [ ] `backend/Dockerfile` ✅ Optimized for Northflank
- [ ] `backend/requirements.txt` ✅ All dependencies listed
- [ ] `backend/.dockerignore` ✅ Excludes unnecessary files
- [ ] `backend/server.py` ✅ Contains `app = FastAPI(...)`
- [ ] Health endpoints implemented ✅ `/health` and `/ready`
- [ ] Port 8000 exposed in Dockerfile

### 3. Environment Variables
- [ ] `SECRET_KEY` - JWT secret (>32 characters)
- [ ] `DATABASE_URL` - SQLite path or MongoDB connection string
- [ ] `BREVO_API_KEY` - Email service API key
- [ ] `ALLOWED_ORIGINS` - CORS origins for frontend
- [ ] `ENVIRONMENT` - Set to "production"
- [ ] Any other required API keys (Google OAuth, AWS S3, etc.)

### 4. Northflank Account Setup
- [ ] Create Northflank account (https://northflank.com)
- [ ] Create a Team for this project
- [ ] Connect GitHub/GitLab account to Northflank
- [ ] Grant permissions to repository access

---

## 🚀 Deployment Steps

### Step 1: Create Service in Northflank
```
1. Go to Northflank Dashboard
2. Click "Create Service" → "Dockerfile"
3. Select "GitHub" / "GitLab"
4. Choose "ArtConnect-Africa" repository
```

### Step 2: Configure Build Settings
```
Name:               artconnect-backend
Dockerfile Path:    backend/Dockerfile
Build Context:      .
Branch:             main
```

### Step 3: Configure Service Settings
```
Port:               8000
Replica Count:      1 (start low, scale up later)
Resource Tier:      Starter (scale up if needed)
```

### Step 4: Add Environment Variables
In Northflank Dashboard → Service → Settings → Environment Variables:

```yaml
# Configuration
ENVIRONMENT: production
LOG_LEVEL: info

# Secrets (use "Secret" type for sensitive data)
SECRET_KEY: [your-secret-key-here]
DATABASE_URL: sqlite:///./data/artconnect.db
BREVO_API_KEY: [your-brevo-api-key]
ALLOWED_ORIGINS: https://artconnect-frontend-xxxxx.northflank.app
```

### Step 5: Configure Health Checks
In Service → Settings → Health Checks:

```
Liveness Probe:
  - Endpoint: GET /health
  - Timeout: 5s
  - Interval: 30s
  - Retries: 3

Readiness Probe:
  - Endpoint: GET /ready
  - Timeout: 5s
  - Interval: 10s
  - Retries: 3
```

### Step 6: Deploy
```
Click "Deploy" button and wait for build to complete (~2-5 minutes)
```

### Step 7: Verify Deployment
```bash
# Test health endpoint
curl https://[your-service].northflank.app/health

# Expected response:
# {"status": "healthy", "service": "ArtConnect-Africa API", ...}

# Check logs in Northflank Dashboard
```

---

## 🔧 Post-Deployment Configuration

### Custom Domain Setup
1. In Service → Domains
2. Add your custom domain (e.g., api.artconnect.com)
3. Update DNS records as instructed
4. SSL/TLS is automatic (Let's Encrypt)

### Auto-Deployment (CI/CD)
1. In Service → Settings → Git Integration
2. Enable "Auto Deploy on Push"
3. Select branch (main)
4. Save changes

Now every git push will automatically trigger a new deployment.

### Scaling (if needed)
1. In Service → Replicas
2. Increase count to 2-3 for load balancing
3. Or enable Auto-scaling with min/max replicas

---

## 📋 Important Files Locations

```
ArtConnect-Africa/
├── backend/
│   ├── Dockerfile ..................... ✅ Docker configuration
│   ├── requirements.txt ............... ✅ Python dependencies
│   ├── .dockerignore .................. ✅ Exclude unnecessary files
│   ├── server.py ...................... ✅ FastAPI app entry point
│   ├── database.py .................... Database models & connection
│   ├── auth_utils.py .................. Authentication utilities
│   └── email_service.py ............... Email service (Brevo)
├── NORTHFLANK_DEPLOYMENT_GUIDE.md .... ✅ Full deployment guide
└── README.md .......................... Project information
```

---

## 🐛 Troubleshooting

### Build Fails: "Dockerfile not found"
- **Cause:** Dockerfile path is incorrect in Northflank settings
- **Fix:** Set path to `backend/Dockerfile`

### Build Fails: "python: no module named pip"
- **Cause:** Python image missing pip
- **Fix:** Use `python:3.12-slim` with proper base image

### Service won't start: "Port 8000 already in use"
- **Cause:** Port conflict
- **Fix:** Change CMD in Dockerfile to use different port, or check replica config

### Health check failing: "GET /health returned 404"
- **Cause:** Health endpoints not implemented
- **Fix:** ✅ Already added to server.py

### Database connection error
- **Cause:** Wrong DATABASE_URL or no /data directory
- **Fix:** Check DATABASE_URL in environment variables, ensure directory exists

### CORS errors from frontend
- **Cause:** Frontend domain not in ALLOWED_ORIGINS
- **Fix:** Update ALLOWED_ORIGINS to include frontend URL

---

## 📊 Monitoring & Maintenance

### Check Logs
```
In Northflank Dashboard:
Service → Logs → View real-time logs
```

### Monitor Performance
```
In Northflank Dashboard:
Service → Metrics → CPU, Memory, Network usage
```

### Update Application
```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# If auto-deploy enabled: Automatically deploys!
# If not: Click "Deploy" in Northflank Dashboard
```

### Restart Service (if needed)
```
In Northflank Dashboard:
Service → Actions → Restart
```

---

## 🎓 Learning Resources

- **Northflank Docs:** https://docs.northflank.com
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Docker Best Practices:** https://docs.docker.com/develop/guidelines/
- **Gunicorn Config:** https://docs.gunicorn.org/en/stable/settings.html
- **Uvicorn Options:** https://www.uvicorn.org/settings/

---

## ✨ Next Steps After Deployment

1. ✅ Deploy backend (this checklist)
2. Deploy frontend to Northflank or Vercel
3. Connect frontend to backend API endpoint
4. Set up custom domain for API
5. Enable auto-deployment via Git webhooks
6. Configure backups for database
7. Set up monitoring and alerts
8. Document API endpoints in Postman/Swagger

---

## 📞 Support

**Need help?**
- Northflank Support: support@northflank.com
- Northflank Docs: https://docs.northflank.com
- FastAPI Discord: https://discord.gg/VQjSZaeJmf

---

**Status:** ✅ Ready for Deployment
**Last Updated:** June 2026
**Next Action:** Follow deployment steps above
