# Brevo Email Configuration Guide

## Step 1: Sign Up for Brevo

1. Go to https://www.brevo.com/
2. Click **Sign Up** and create a free account
3. Verify your email address

## Step 2: Get Your SMTP Credentials

1. Log in to your Brevo account
2. Go to **Settings** → **SMTP & API**
3. Click on **SMTP** tab
4. You'll see:
   - **SMTP Server:** `smtp-relay.brevo.com`
   - **SMTP Port:** `587`
   - **SMTP User:** (Your Brevo account email)
   - **SMTP Password:** (Your API key - click "Generate" if not shown)

## Step 3: Verify Your Sender Email

1. In Brevo dashboard, go to **Senders & Contacts**
2. Add your sender email: `noreply@artconnect.africa`
3. Click the link in the verification email Brevo sends you

## Step 4: Update .env File

Replace the Brevo placeholders in `backend/.env`:

```env
BREVO_SMTP_USER=your-brevo-email@gmail.com
BREVO_SMTP_KEY=xsmtpXXXXXXXXXXXXXXXXXX
BREVO_SENDER_EMAIL=noreply@artconnect.africa
ADMIN_EMAIL=admin@artconnect.africa
```

Example:
```env
BREVO_SMTP_USER=john@gmail.com
BREVO_SMTP_KEY=xsmtp5f3a8d9e2c1b4f6a9e8d7c6b5a4f3e2d1c0b9
BREVO_SENDER_EMAIL=noreply@artconnect.africa
ADMIN_EMAIL=admin@artconnect.africa
```

## Step 5: Restart Backend Server

After updating `.env`, restart your FastAPI server:

```bash
cd backend
python -m uvicorn server:app --reload
```

## Step 6: Test Email Sending

When you register a new user, you should receive an email in the admin account. Check:
- **Spam folder** (in case emails end up there)
- **Brevo dashboard** → **Contacts** → **Logs** to see email history
- **Brevo dashboard** → **Statistics** to view delivery rates

## Free Tier Limits

- ✅ **300 emails/day** (plenty for user approvals)
- ✅ **Unlimited templates** (no need for template IDs anymore)
- ✅ **Unlimited sender addresses**
- ✅ **No credit card required**

## If You Don't See Emails

1. Check **Brevo Logs** for delivery errors
2. Check spam/junk folder
3. Verify sender email is verified in Brevo
4. Verify `.env` values are correct (no extra spaces)
5. Check backend logs for confirmation: `Email sent successfully to...`

## Email Templates Sent Automatically

The system now sends Professional HTML emails on:
1. **Registration** → "Inscription en attente d'approbation"
2. **Approval** → "Votre profil a été approuvé"
3. **Rejection** → "Statut de votre demande d'inscription"
4. **Admin Notification** → "Nouvelle demande d'approbation utilisateur"
