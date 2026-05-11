# Partner Code Authentication - Usage Guide

## For Partners

### Logging In with Your Partner Code

1. **Go to Login Page**
   - Navigate to `https://artconnect-africa.com/login`

2. **Switch to Partner Code Mode**
   - Click the "Partner Code" toggle button at the top of the login form
   - The form will change to show a single code input field

3. **Enter Your Partner Code**
   - Type or paste your unique partner code
   - The code is case-insensitive (will be auto-converted to uppercase)
   - Example: `AbC123xYz_4567`

4. **Click "Access Platform"**
   - You'll be authenticated
   - If code is valid, you're routed to your dashboard:
     - If you've paid: redirected to `/statistics`
     - If you haven't paid: redirected to `/checkout`

### Retrieving Your Partner Code

If you've lost or forgotten your partner code:

**Option 1: Via API**
```bash
curl -X GET "https://api.artconnect-africa.com/api/partners/me/code" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 2: Contact Support**
- Email: support@artconnect-africa.com
- We can help you retrieve or regenerate your code

### Regenerating Your Partner Code

If your code has been compromised or you want a new one:

**Via API:**
```bash
curl -X POST "https://api.artconnect-africa.com/api/partners/me/regenerate-code" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "partner_code": "NewCode123xYz_7890",
  "message": "Your partner code has been regenerated. Use this new code for future logins."
}
```

---

## For Administrators

### Viewing Partner Codes

To retrieve all partner codes in the system:

```bash
# Database query
SELECT id, first_name, last_name, email, partner_code, approval_status 
FROM users 
WHERE role = 'partenaire' 
ORDER BY created_at DESC;
```

Or via Python:
```python
from sqlalchemy import Session
from models import User

def get_all_partners(db: Session):
    return db.query(
        User.id, 
        User.first_name, 
        User.last_name, 
        User.email, 
        User.partner_code, 
        User.approval_status
    ).filter(User.role == 'partenaire').all()
```

### Creating a Partner Account

**Via Frontend Registration:**
1. User registers with role = "partenaire"
2. System automatically generates unique code
3. Code appears in their user profile
4. Account set to pending approval

**Code Generation Details:**
- Generated using: `secrets.token_urlsafe(16)`
- Base64-encoded, URL-safe format
- ~24 characters long
- Unique across all partners (database constraint)

### Approving Partner Accounts

Once a partner account is created and pending:

```bash
curl -X POST "https://api.artconnect-africa.com/api/admin/approve-user" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "partner-uuid",
    "status": "approved"
  }'
```

**Effect:**
- `approval_status` changes to "approved"
- Partner can now login with their code
- Welcome email sent to partner

### Resetting a Partner's Code

If a partner has lost their code or needs it reset:

**Option 1: Partner Self-Service**
- Direct them to call: `POST /api/partners/me/regenerate-code`
- Requires being authenticated

**Option 2: Admin Reset**

Create an admin endpoint (not yet implemented) or manually:

```python
from sqlalchemy import Session
from models import User
import secrets

def reset_partner_code(partner_id: str, db: Session):
    partner = db.query(User).filter(User.id == partner_id).first()
    if partner and partner.role == 'partenaire':
        partner.partner_code = secrets.token_urlsafe(16)
        db.commit()
        return partner.partner_code
    return None
```

### Disabling a Partner's Access

To revoke a partner's code without deleting the account:

```python
def disable_partner_code(partner_id: str, db: Session):
    partner = db.query(User).filter(User.id == partner_id).first()
    if partner:
        partner.partner_code = None
        db.commit()
        return True
    return False
```

The partner will no longer be able to login with any code, but the account still exists.

### Handling Rejected Partners

If a partner account is rejected:

```bash
curl -X POST "https://api.artconnect-africa.com/api/admin/approve-user" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "partner-uuid",
    "status": "rejected",
    "rejection_reason": "Doesn'"'"'t meet partnership criteria"
  }'
```

**Effect:**
- `approval_status` = "rejected"
- Partner cannot login even with valid code
- Rejection email sent to partner

### Generating Codes for Bulk Import

If you need to create partners in bulk with pre-generated codes:

```python
import secrets
from datetime import datetime
from models import User

codes = {}
for i in range(100):
    code = secrets.token_urlsafe(16)
    codes[f"partner_{i}"] = code
    print(f"Partner {i}: {code}")

# Then create users with these codes
for partner_id, code in codes.items():
    user = User(
        # ... other fields ...
        partner_code=code,
        role='partenaire'
    )
    db.add(user)
db.commit()
```

---

## API Reference

### Partner Endpoints

#### Get My Partner Code
```
GET /api/partners/me/code
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "partner_code": "AbC123xYz_4567",
  "message": "This is your unique access code. Keep it confidential."
}
```

**Errors:**
- 401: Not authenticated
- 403: User is not a partner

#### Regenerate My Partner Code
```
POST /api/partners/me/regenerate-code
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "partner_code": "NewCode_7890xYz",
  "message": "Your partner code has been regenerated. Use this new code for future logins."
}
```

#### Partner Login
```
POST /api/auth/partner-login
Content-Type: application/json
```

**Request:**
```json
{
  "partner_code": "AbC123xYz_4567"
}
```

**Response (200):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "partenaire",
    "partner_code": "AbC123xYz_4567",
    ...
  }
}
```

**Errors:**
- 401: Invalid partner code
- 403: User is not a partner or account rejected
- 403: Account pending approval

---

## Troubleshooting

### "Invalid partner code" Error

**Causes:**
1. Typo in code
2. Code belongs to non-partner user
3. Code doesn't exist

**Solution:**
- Double-check code spelling
- Ensure you registered as a partner (not individual)
- Contact support if code is correct but still fails

### "Your account is pending approval"

**Cause:** Account created but not yet approved by admin

**Solution:**
- Wait for admin approval email
- Contact support for approval status

### "This code is not valid for partner access"

**Cause:** Code exists but is associated with non-partner account

**Solution:**
- Ensure you're using correct code
- Contact support

### Lost Partner Code

**Solutions:**
1. If logged in: Use `/api/partners/me/code` endpoint
2. If logged out: Use code regeneration after logging in with temporary access
3. Contact support for manual reset

---

## Security Best Practices

### For Partners
- **Keep your code confidential** - treat it like a password
- **Don't share your code** with unauthorized people
- **Regenerate your code** if you suspect it's been compromised
- **Use HTTPS** when accessing the platform
- **Logout** when done, especially on shared computers

### For Administrators
- **Audit code usage** - monitor failed login attempts
- **Rotate codes regularly** - especially for high-risk partners
- **Log code resets** - maintain audit trail
- **Secure code distribution** - send codes via secure channels only
- **Never hardcode codes** in frontend or documentation
- **Implement rate limiting** on `/api/auth/partner-login` to prevent brute force

---

## Monitoring and Logging

### Recommended Monitoring
1. **Failed Login Attempts**
   - Track invalid code attempts
   - Alert on multiple failed attempts

2. **Code Regeneration Activity**
   - Log when partners regenerate codes
   - Monitor unusual activity patterns

3. **Partner Access Logs**
   - Track which partners login and when
   - Identify inactive partners

### Database Monitoring Query
```sql
-- Partners with codes (active partners)
SELECT id, first_name, last_name, partner_code, approval_status, created_at 
FROM users 
WHERE role = 'partenaire' AND partner_code IS NOT NULL 
ORDER BY created_at DESC;

-- Partners without codes (inactive/disabled)
SELECT id, first_name, last_name, approval_status, created_at 
FROM users 
WHERE role = 'partenaire' AND partner_code IS NULL 
ORDER BY created_at DESC;
```
