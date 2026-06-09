# ✅ Render Environment Variables Checklist

**Use this checklist when setting up environment variables in Render dashboard.**

---

## 📋 Before You Start

- [ ] Render account created at https://render.com
- [ ] GitHub repository pushed with latest code
- [ ] Web Service (`artconnect-api`) created
- [ ] PostgreSQL database service created

---

## 🔧 Variables to Configure

### **1. Database Connection**
- [ ] **Key:** `DATABASE_URL`
- [ ] **Where to get:** PostgreSQL service → "Internal Database URL" section
- [ ] **Value format:** `postgresql://user:password@host:5432/dbname?sslmode=require`
- [ ] **Example:** `postgresql://artconnect_user:mG7x9k2@c.postgres.onrender.com:5432/artdb?sslmode=require`

### **2. Server Configuration**
- [ ] **Key:** `PORT`
- [ ] **Value:** `10000` (Render standard)
- [ ] **Note:** Render sets this automatically, but good to add explicitly

### **3. CORS Origins**
- [ ] **Key:** `ALLOWED_ORIGINS`
- [ ] **Value:** Your frontend URL (get after deploying frontend)
- [ ] **Examples:**
  - Frontend on Render: `https://artconnect-web.onrender.com`
  - Multiple: `https://domain1.onrender.com,https://domain2.com`
- [ ] **Default for testing:** `http://localhost:3000,http://localhost:5173`

### **4. JWT Secret (Critical!)**
- [ ] **Key:** `SECRET_KEY`
- [ ] **Where to get:** Generate with:
  ```bash
  # Mac/Linux
  openssl rand -hex 32
  
  # Windows PowerShell
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] **⚠️ IMPORTANT:** Use different secret for production!
- [ ] **Value:** Paste 64-character hex string (example: `a7f3b9c2e4d6f8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7`)

### **5. JWT Configuration**
- [ ] **Key:** `JWT_ALGORITHM`
- [ ] **Value:** `HS256`

- [ ] **Key:** `TOKEN_EXPIRE_MINUTES`
- [ ] **Value:** `1440` (24 hours)

### **6. Email Service (Brevo)**

**Get these from Brevo (https://brevo.com):**

- [ ] **Key:** `BREVO_SMTP_USER`
- [ ] **Where to get:** Brevo → Settings → SMTP & API → Copy SMTP Login
- [ ] **Value:** Your Brevo SMTP login email

- [ ] **Key:** `BREVO_SMTP_KEY`
- [ ] **Where to get:** Brevo → Settings → SMTP & API → Copy SMTP Password
- [ ] **Value:** Your Brevo SMTP password (looks like random string)

- [ ] **Key:** `BREVO_SENDER_EMAIL`
- [ ] **Value:** `noreply@artconnect.africa` (or your verified sender)
- [ ] **Note:** Must be verified in Brevo first!

- [ ] **Key:** `ADMIN_EMAIL`
- [ ] **Value:** Your email address
- [ ] **Example:** `admin@artconnect.africa`

### **7. Testing & Frontend URLs**
- [ ] **Key:** `REACT_APP_BACKEND_URL`
- [ ] **Value:** Your API URL
- [ ] **Example:** `https://artconnect-api-xyz.onrender.com`

### **8. Environment Type**
- [ ] **Key:** `ENVIRONMENT`
- [ ] **Value:** `production`

- [ ] **Key:** `PYTHON_VERSION`
- [ ] **Value:** `3.12`

---

## 🎯 Step-by-Step in Render Dashboard

### **For Each Variable Above:**

1. Go to: https://dashboard.render.com
2. Click: **Web Service** → `artconnect-api`
3. Click: **Environment** (in left sidebar)
4. Click: **Add Environment Variable**
5. **Enter:**
   - Key: (from checklist above)
   - Value: (your actual value)
6. Click: **Save**
7. App will **auto-redeploy** in 2-3 minutes

---

## 📊 Quick Copy-Paste Template

```
DATABASE_URL = postgresql://user:pass@host:5432/db?sslmode=require
PORT = 10000
ALLOWED_ORIGINS = https://artconnect-web.onrender.com
SECRET_KEY = a7f3b9c2e4d6f8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7
JWT_ALGORITHM = HS256
TOKEN_EXPIRE_MINUTES = 1440
BREVO_SMTP_USER = your_brevo_email@domain.com
BREVO_SMTP_KEY = your_brevo_password
BREVO_SENDER_EMAIL = noreply@artconnect.africa
ADMIN_EMAIL = admin@artconnect.africa
REACT_APP_BACKEND_URL = https://artconnect-api-xyz.onrender.com
ENVIRONMENT = production
PYTHON_VERSION = 3.12
```

---

## ✅ After Setting All Variables

- [ ] All 14+ variables are set
- [ ] App has redeployed (check Logs)
- [ ] Logs show: `✅ Using PostgreSQL: postgresql://...`
- [ ] Logs show: `✅ Database initialized`
- [ ] Logs show: `[INFO] Application startup complete ✨`
- [ ] Health check returns: `{"status":"healthy",...}`

---

## 🧪 Test Command

After deployment, test with:

```bash
curl https://artconnect-api-xyz.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ArtConnect-Africa API",
  "timestamp": "2026-06-09T..."
}
```

---

## 🚨 Common Issues

| Issue | Fix |
|-------|-----|
| **Database URL not found** | Copy exact value from PostgreSQL service → Internal Database URL |
| **CORS errors** | Update ALLOWED_ORIGINS with correct frontend URL (no trailing slash) |
| **502 Bad Gateway** | Check logs for errors, verify DATABASE_URL is correct |
| **Email not sending** | Verify BREVO_SMTP_USER and BREVO_SMTP_KEY are correct |
| **Startup timeout** | Ensure DATABASE_URL is reachable, check PostgreSQL service status |

---

## 📞 Support

**Check logs if something fails:**
1. Render Dashboard → Web Service → **Logs** tab
2. Look for error messages
3. Search for "ERROR" or "error"

**Common log messages:**
- ✅ `✅ Using PostgreSQL` = Correct database detected
- ❌ `⚠️ DATABASE_URL not set` = Variable not configured yet
- ❌ `connection refused` = DATABASE_URL is invalid or unreachable

---

**You're all set! Environment variables are the final step before deployment. 🎉**
