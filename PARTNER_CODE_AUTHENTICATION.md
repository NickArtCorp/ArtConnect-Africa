# Partner Code Authentication System

## Overview

Partners can now access the Art Connect Africa platform using a unique partner code instead of email and password. Each partner receives a different code during registration, which serves as their exclusive access credential.

## How It Works

### Backend (FastAPI)

#### 1. Database Model Changes
- **New Field**: `partner_code` (String, unique, nullable, indexed)
  - Added to the `User` model in [server.py](backend/server.py#L100)
  - Stores the unique authentication code for partners

#### 2. Partner Code Generation
During partner registration:
```python
if user_data.role == 'partenaire':
    partner_code = secrets.token_urlsafe(16)
```
- Generated using cryptographically secure random tokens
- Unique constraint ensures no two partners share the same code
- Automatically created when role is set to 'partenaire'

#### 3. New Authentication Endpoint
**POST** `/api/auth/partner-login`

Request body:
```json
{
  "partner_code": "YOUR_UNIQUE_CODE"
}
```

Response:
```json
{
  "token": "authentication_token",
  "user": { ...user_details }
}
```

**Validation**:
- Code must exist in database
- User must have role 'partenaire'
- User must be approved (approval_status != 'pending')
- Returns appropriate error messages for invalid codes

### Frontend (React)

#### 1. Updated Authentication Store
New method in `useAuthStore`:
```javascript
partnerLogin: async (partner_code) => {
  // Calls /api/auth/partner-login endpoint
  // Returns { success: true, user } or { success: false, error }
}
```

#### 2. Updated Login Page
The login page now features a toggle between two modes:

**Mode 1: User Login** (default)
- Email and password fields
- Register link
- Demo credentials

**Mode 2: Partner Code**
- Single input field for partner code
- Helper text explaining the code purpose
- Uppercase formatting for readability

Toggle button switches between modes while clearing previous errors.

#### 3. Post-Login Redirect
After successful partner login:
1. Checks if user has paid (via `hydrateFromBackend`)
2. Routes to `/statistics` if paid
3. Routes to `/checkout` if not paid

## User Flow

### For New Partners
1. Register account with role = 'partenaire'
2. Partner code automatically generated
3. Account set to pending approval
4. Once admin approves account, code becomes active
5. Partner receives code via email or communication

### For Existing Partners
1. Navigate to login page
2. Click "Partner Code" toggle
3. Enter their unique partner code
4. Get authenticated and routed to appropriate page

## Security Considerations

### Code Generation
- Uses `secrets.token_urlsafe(16)` for cryptographic security
- Base64-encoded for URL-safe usage
- Unique constraint prevents collisions

### Validation
- Codes stored in database (one per partner)
- Validated on every login attempt
- HTTP error 401 for invalid codes
- HTTP error 403 for inactive partners

### Approval Workflow
- Partners can have codes but remain pending approval
- Approved partners can login successfully
- Rejected partners cannot login even with valid code

## Database Queries

### Find Partner by Code
```python
user = db.query(User).filter(User.partner_code == code).first()
```

### Check if Code Exists
```python
exists = db.query(User).filter(User.partner_code == code).first() is not None
```

### List All Partner Codes (for admin)
```python
partners = db.query(User.id, User.first_name, User.last_name, User.partner_code)
          .filter(User.role == 'partenaire').all()
```

## Admin Functions Needed

### 1. View Partner Codes
Endpoint to retrieve all active partner codes for administrative purposes.

### 2. Regenerate Code
If a partner loses their code or needs a new one:
```python
partner.partner_code = secrets.token_urlsafe(16)
db.commit()
```

### 3. Disable Code
Set code to NULL without deleting user:
```python
partner.partner_code = None
db.commit()
```

## Testing

### Test Login with Code
1. Create a partner account during registration
2. Note the generated code
3. Logout
4. Go to login page
5. Switch to "Partner Code" mode
6. Enter the code
7. Should authenticate successfully

### Test Invalid Code
1. Try entering a non-existent code
2. Should see error: "Invalid partner code"

### Test Unapproved Partner
1. Create partner account
2. Don't approve it
3. Try to login with code
4. Should see error: "Your account is pending approval"

## Migration Notes

- Existing partner accounts won't have a `partner_code` until they re-register
- Database migration adds nullable `partner_code` column
- Backward compatibility maintained: email/password still works for partners

## API Summary

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/auth/partner-login` | `{ partner_code: string }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |

## Frontend Routes

- `/login` - Main login page with toggle (default User Login mode)
- `/pages/PartnerLogin.jsx` - Alternative dedicated partner login page (optional)

## File Changes Summary

### Backend
- [server.py](backend/server.py)
  - Added `partner_code` field to User model (line ~100)
  - Added `PartnerLogin` Pydantic model (line ~582)
  - Added `/api/auth/partner-login` endpoint (line ~746)
  - Generate partner code on registration (line ~704)

### Frontend
- [store.js](frontend/src/store.js)
  - Added `partnerLogin()` method to `useAuthStore` (line ~3290)
  
- [pages/Login.jsx](frontend/src/pages/Login.jsx)
  - Added partner mode toggle
  - Conditional form rendering
  - Support for both login types

- [pages/PartnerLogin.jsx](frontend/src/pages/PartnerLogin.jsx)
  - New dedicated partner login page (alternative UI)
