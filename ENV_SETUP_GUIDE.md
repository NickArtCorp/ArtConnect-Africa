# 🔐 Environment Variables Setup Guide

## Quick Summary

You now have:
- **`.env`** - Your local development file (DO NOT commit to GitHub)
- **`.env.example`** - Template for others to copy from (SAFE to commit)
- **`.gitignore`** - Updated to prevent accidental commits of `.env`

---

## 📋 Configuration by Environment

### **Local Development**

1. **Edit `.env` file** with your local values:

```env
DATABASE_URL=sqlite:///./artconnect.db

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

PORT=8000

SECRET_KEY=your-local-secret-key-change-in-production

BREVO_SMTP_USER=your_brevo_email
BREVO_SMTP_KEY=your_brevo_password
BREVO_SENDER_EMAIL=test@artconnect.africa
ADMIN_EMAIL=admin@artconnect.africa

REACT_APP_BACKEND_URL=http://localhost:8000

ENVIRONMENT=development
```

2. **Run the app**:
```bash
cd backend
python -m uvicorn server:app --reload --port 8000
```

---

### **Render Deployment**

#### **Step 1: Generate Secret Key**

```bash
# On your terminal (Mac/Linux)
openssl rand -hex 32

# On Windows PowerShell
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the generated value - you'll use it in Step 3.

---

#### **Step 2: Get Database URL**

After creating PostgreSQL on Render:

1. Go to: https://dashboard.render.com
2. Click your PostgreSQL service
3. Find **"Internal Database URL"**
4. Copy it - format: `postgresql://user:pass@host:5432/db`

---

#### **Step 3: Set Variables in Render**

1. Go to your **Web Service** (`artconnect-api`)
2. Click **"Environment"** in left sidebar
3. Add these variables:

| Key | Value | Where to Get |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Step 2 above |
| `ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` | Your frontend URL |
| `PORT` | `10000` | Default (Render manages this) |
| `SECRET_KEY` | Random value from Step 1 | Generated above |
| `JWT_ALGORITHM` | `HS256` | Fixed value |
| `TOKEN_EXPIRE_MINUTES` | `1440` | 24 hours |
| `BREVO_SMTP_USER` | Your Brevo email | https://brevo.com Settings |
| `BREVO_SMTP_KEY` | Your Brevo API key | https://brevo.com Settings |
| `BREVO_SENDER_EMAIL` | `noreply@artconnect.africa` | Verified in Brevo |
| `ADMIN_EMAIL` | `your-email@example.com` | Your email |
| `REACT_APP_BACKEND_URL` | `https://artconnect-api-xxx.onrender.com` | Your API URL |
| `ENVIRONMENT` | `production` | For Render |
| `PYTHON_VERSION` | `3.12` | Fixed value |

4. Click **"Save"** - Your app will auto-redeploy

---

## 🚀 Getting Brevo Credentials

### **Create Brevo Account**

1. Sign up: https://brevo.com
2. Go to: **Settings** → **SMTP & API**
3. In **SMTP** section, find:
   - **SMTP Login**: Copy to `BREVO_SMTP_USER`
   - **SMTP Password**: Copy to `BREVO_SMTP_KEY`

4. Go to: **Senders & Signatures**
5. Add your sender email and verify it
6. Use verified email as `BREVO_SENDER_EMAIL`

---

## ✅ Testing Your Configuration

### **Local Test**

```bash
# Test database connection
python -c "from database import engine; engine.connect(); print('✅ Database OK')"

# Test email (if Brevo configured)
python -c "from email_service import EmailService; print('✅ Email service OK')"
```

### **Render Test**

```bash
# Check if API is running
curl https://artconnect-api-xxx.onrender.com/health

# Expected response:
# {"status":"healthy","service":"ArtConnect-Africa API",...}
```

---

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore` (never committed)
- [ ] `.env.example` is committed (safe template)
- [ ] `SECRET_KEY` is random (use `openssl rand -hex 32`)
- [ ] Database URL includes `?sslmode=require` (encrypted)
- [ ] No credentials hardcoded in Python files
- [ ] Brevo API key from authorized account
- [ ] CORS only allows your frontend domain

---

## 📝 Quick Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host/db` |
| `ALLOWED_ORIGINS` | CORS domains | `https://frontend.onrender.com` |
| `PORT` | Server port | `10000` (Render) or `8000` (local) |
| `SECRET_KEY` | JWT encryption | Random 64-char hex string |
| `JWT_ALGORITHM` | Token signing | `HS256` |
| `TOKEN_EXPIRE_MINUTES` | Session duration | `1440` (24 hours) |
| `BREVO_SMTP_USER` | Email login | Your Brevo email |
| `BREVO_SMTP_KEY` | Email password | Your Brevo API key |
| `BREVO_SENDER_EMAIL` | From address | `noreply@artconnect.africa` |
| `ADMIN_EMAIL` | Notifications | `admin@artconnect.africa` |
| `ENVIRONMENT` | Deployment stage | `development` or `production` |

---

## 🛠️ Troubleshooting

### **"DATABASE_URL not set" error**

**Solution:** 
- Local: Add `DATABASE_URL` to `.env`
- Render: Check Environment variables are saved

### **"BREVO credentials not configured" warning**

**Solution:**
- Add `BREVO_SMTP_USER` and `BREVO_SMTP_KEY` to `.env`
- Emails will be skipped if not configured (app still works)

### **CORS errors when calling API**

**Solution:**
- Update `ALLOWED_ORIGINS` to include your frontend domain
- Format: `https://domain.onrender.com` (no trailing slash)
- Multiple origins: `domain1.com,domain2.com`

### **401 Unauthorized errors**

**Solution:**
- Ensure `SECRET_KEY` is set in environment
- JWT tokens won't validate without matching secret

---

## 📚 Next Steps

1. ✅ Fill in `.env` with your local values
2. ✅ Test locally: `python -m uvicorn server:app --reload`
3. ✅ Push to GitHub (`.env` won't be committed)
4. ✅ Deploy to Render
5. ✅ Add environment variables in Render dashboard
6. ✅ Test API health endpoint
7. ✅ Configure frontend CORS

---

**All set! Your environment is configured securely.** 🎉
