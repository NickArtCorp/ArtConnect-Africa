# ArtConnect-Africa Authentication System Overview

## 1. Authentication/Login System Implementation

### Backend (FastAPI + SQLite)

#### Token Management
- **Type**: In-memory token storage (dictionary-based)
- **Location**: `active_tokens = {}` dictionary in [server.py](backend/server.py#L234)
- **Token Generation**: `generate_token()` creates a `secrets.token_urlsafe(32)` token
- **Token Storage**: Maps token string → user_id for lookup

#### Login Flow
```
POST /api/auth/login
├─ Input: UserLogin (email, password)
├─ Validation: 
│  ├─ Query user by email
│  ├─ Hash provided password with SHA256 and compare
│  └─ Check approval_status (must be "approved", not "pending" or "rejected")
├─ Token Generation: Create new token and store in active_tokens
└─ Response: { token, user } with sanitized user data
```

#### Login Validation Rules
- **Status Check**: Users must be approved before login
  - `approval_status == "pending"` → 403: "Your account is pending approval"
  - `approval_status == "rejected"` → 403: "Your account has been rejected"
  - `approval_status == "approved"` → Allow login

#### Authentication Middleware
- **Security Scheme**: HTTPBearer (Bearer token in Authorization header)
- **Dependency**: `get_current_user()` - validates token exists in `active_tokens`
- **Optional Auth**: `get_optional_user()` - returns None if no token (for public endpoints)

#### Login Endpoint
[server.py lines 744-762](backend/server.py#L744-L762)

#### Logout Endpoint
[server.py lines 768-771](backend/server.py#L768-L771)
- Removes token from `active_tokens` dictionary
- Client removes token from localStorage

### Frontend (React + Zustand)

#### Authentication Store
**Location**: [store.js lines 3263-3360](frontend/src/store.js#L3263-L3360)

**State Management**:
```javascript
{
  user: null,                                    // Current user object
  token: localStorage.getItem('aca_token'),     // Persistent token
  isLoading: false,                             // Loading state
  error: null,                                  // Error messages
}
```

#### Login Flow
1. User enters email/password on [Login.jsx](frontend/src/pages/Login.jsx)
2. `login()` action called with credentials
3. POST to `/api/auth/login`
4. Token and user stored in Zustand + localStorage
5. Redirect based on user role:
   - `partenaire` → Check payment status, go to `/statistics` or `/checkout`
   - Other roles → `/dashboard`

#### Auth Actions
- **`login(email, password)`** - Authenticate user
- **`register(data)`** - Create new user account
- **`logout()`** - Clear auth state and localStorage
- **`fetchUser()`** - Refresh user data from `/api/auth/me`
- **`clearError()`** - Clear error state between login attempts
- **`updateProfile(data)`** - Update user profile
- **`uploadAvatar(file)`** - Upload user avatar

#### Token Persistence
- Stored in `localStorage` as `aca_token`
- Automatically loaded on app startup
- Used in Authorization header: `Bearer {token}`
- Cleared on logout

---

## 2. User Model Structure and Roles/Types

### User Database Schema
[server.py lines 72-107](backend/server.py#L72-L107)

### User Fields

**Core Fields**:
- `id` - UUID primary key
- `email` - Unique identifier, EmailStr
- `password` - SHA256 hashed
- `first_name`, `last_name`
- `created_at` - Timestamp

**Profile Fields**:
- `country` - Location
- `city`
- `subregion` - Geographic region
- `gender` - Male/Female/Non-binary/Prefer not to say
- `sector` - Artistic sector (Painting, Music, Dance, etc.)
- `domain` - Domain/specialty within sector
- `year_started` - When artist started (Integer)
- `bio` - Biography/presentation (up to 3000 chars)
- `additional_info` - Exhibitions, awards, collaborations
- `website` - Website URL
- `avatar` - Profile image URL (from DiceBear API)
- `portfolio` - JSON: {documents: [], images: [], videos: []}

**Organizational Fields** (for institutions):
- `organization_name` - Organization/institution name
- `employees_count` - Number of employees (for personne_morale)
- `visitor_type` - 'individual' | 'organisation' (for visitors)

**Verification Fields**:
- `is_verified` - Boolean flag
- `is_featured` - Featured artist flag
- `created_at` - Registration timestamp

**Role & Status Fields**:
- `role` - User account type (see below)
- `profile_tag` - 'artist' | 'professional' | 'media'
- `approval_status` - 'pending' | 'approved' | 'rejected'
- `rejection_reason` - Text reason if rejected

**Reference Contact** (for institutional verification):
- `contact_person_name` - Optional relay contact
- `contact_person_email` - Optional relay contact email

**Payment Fields** (for partners):
- `has_paid` - Boolean, paid for access
- `access_code` - Unique access code for statistics
- `paid_at` - Payment timestamp (ISO format)

### User Roles

**5 Role Types** [server.py line 238](backend/server.py#L238):

#### 1. **`personne_physique`** (Individual Artist)
- Personal artist account
- Can create posts, messages, projects
- Profile fields: All artist-related
- Access: Full platform access after approval
- Avatar: DiceBear `initials` style

**Registration Requirements**:
- country, subregion, gender, sector, domain (all required)
- profile_tag: 'artist', 'professional', or 'media'

#### 2. **`personne_morale`** (Organization/Institution)
- Institutional account (Ministry, NGO, Gallery, etc.)
- Creates organizational presence
- Can host/sponsor projects and collaborations

**Special Fields**:
- `organization_name` (required)
- `employees_count` (required)

**Registration Requirements**:
- country, subregion, gender, sector, domain (all required)
- organization_name
- employees_count

**Avatar**: DiceBear `buildings` style

#### 3. **`partenaire`** (Partner)
- Paying institutional partner (different from personne_morale)
- Access to detailed statistics and analytics
- Payment/access code required to unlock full features
- Cannot participate in feed, posts, messages
- View-only access to platform data

**Special Features**:
- Payment system: `has_paid`, `access_code`, `paid_at`
- Dependency: `require_paid_partner()` checks role + payment
- Statistics access: `/api/statistics/detailed` (requires paid_partner dependency)

**Avatar**: DiceBear `corporate` style

#### 4. **`visitor`** (Visitor/Guest)
- Non-member browsing account
- Can explore profiles and portfolios
- NO access to: Feed, posts, comments, messages, projects
- Can track visitor views (anonymously or logged-in)

**Visitor Subtypes**:
- `individual` - Person visitor (uses `personas` avatar)
- `organisation` - Organization visitor (uses `shapes` avatar)

**Registration Requirements**:
- visitor_type is required
- organization_name required if organization visitor
- No sector, domain, gender required

**Avatar**: 
- Individual: DiceBear `personas` style
- Organization: DiceBear `shapes` style

#### 5. **`admin`** (Admin - Not Shown in Registration UI)
- Platform administrator
- Approves/rejects user registrations
- Can access all statistics
- Seeded with default account `admin@artconnect.africa`

---

## 3. Partners Handling

### Partner Account Type
- **Role**: `partenaire`
- **Purpose**: Institutional/corporate access to detailed platform analytics

### Partner Registration Flow
1. User selects "Partenaire" on account type selection
2. Registration form for partner (similar to personne_morale)
3. Account created with `approval_status = "pending"`
4. Admin must approve before login allowed

### Partner Payment System

#### Payment Flow
```
1. Partner logs in
2. Check payment status via /api/payments/status
3. If !hasPaid → Redirect to /checkout
4. On checkout page: Click "Complete Payment" (mock)
5. POST /api/payments/mock-checkout
6. Receive access_code and set has_paid=true
7. Redirect to /statistics
```

#### Payment Endpoints

**Mock Checkout (Simulated Payment)**
```
POST /api/payments/mock-checkout
├─ Requires: partenaire role OR admin
├─ Action: Generate UUID access_code, set has_paid=true, save paid_at timestamp
└─ Response: { access_code, paid_at, message }
```

[server.py lines 1665-1685](backend/server.py#L1665-L1685)

**Payment Status**
```
GET /api/payments/status
├─ Requires: Authentication
├─ Returns: { has_paid, access_code, paid_at }
└─ Used by frontend to determine next redirect
```

[server.py lines 1698-1708](backend/server.py#L1698-L1708)

### Partner Access Control

#### require_paid_partner Dependency
[server.py lines 501-530](backend/server.py#L501-L530)

Checks 3 conditions:
1. **Role Check**: `role == "partenaire"` (admins bypass)
2. **Payment Check**: `has_paid == true`
3. **Access Code**: `access_code` field must exist

Returns 403 if any check fails.

#### Protected Statistics Endpoints
- `/api/statistics/detailed` - Detailed analytics (requires `require_paid_partner`)
- `/api/statistics/overview` - Basic stats (public)
- `/api/collaboration-statistics` - Collaboration data (requires `require_paid_partner`)

### Partner Frontend Integration

**Institution Store** [store.js lines 3655-3707](frontend/src/store.js#L3655-L3707)

Tracks partner payment status:
- `hasPaid` - Boolean from backend
- `accessCode` - Access code string
- `paidAt` - Timestamp of payment

**Partner Login Redirect Logic** [Login.jsx lines 34-47](frontend/src/pages/Login.jsx#L34-L47)

```javascript
if (user?.role === 'partenaire') {
  await hydrateFromBackend();  // Get payment status from server
  const hasPaidNow = useInstitutionStore.getState().hasPaid;
  navigate(hasPaidNow ? '/statistics' : '/checkout');
} else {
  navigate('/dashboard');
}
```

### Partner Restrictions
- **Cannot post to feed** - `require_creator_or_admin` excludes partners
- **Cannot comment/like** - Role check excludes partenaire
- **Cannot message** - Only personne_physique, personne_morale, visitors
- **Can only view** - Statistics and collaboration data (if paid)

---

## 4. Main Login-Related Endpoints

### Authentication Endpoints

| Endpoint | Method | Purpose | Auth Required | Notes |
|----------|--------|---------|---|---|
| `/api/auth/register` | POST | Register new user | No | Creates user with approval_status="pending" |
| `/api/auth/login` | POST | Login with credentials | No | Checks approval_status before issuing token |
| `/api/auth/logout` | POST | Logout (remove token) | Yes | Removes token from active_tokens |
| `/api/auth/me` | GET | Get current user | Yes | Validates token, returns user object |

### Approval/Admin Endpoints

| Endpoint | Method | Purpose | Auth | Notes |
|----------|--------|---------|---|---|
| `/api/admin/pending-approvals` | GET | List pending users | Yes (admin) | Returns all users with approval_status="pending" |
| `/api/admin/approve-user` | POST | Approve user registration | Yes (admin) | Sets approval_status="approved", generates access_code, sends email |
| `/api/admin/update-approval/{user_id}` | PUT | Update approval status | Yes (admin) | Can approve or reject with reason |

**Approval Logic**:
- **Approve**: Sets `approval_status="approved"`, `is_verified=true`, generates `access_code`
- **Reject**: Sets `approval_status="rejected"`, stores `rejection_reason`
- **Emails Sent**: Approval email on approve, rejection email on reject

### Payment Endpoints

| Endpoint | Method | Purpose | Auth | Notes |
|----------|--------|---------|---|---|
| `/api/payments/mock-checkout` | POST | Simulate payment | Yes | Only partenaire role, generates access_code |
| `/api/payments/status` | GET | Check payment status | Yes | Returns has_paid, access_code, paid_at |

### Profile/User Endpoints

| Endpoint | Method | Purpose | Auth | Notes |
|----------|--------|---------|---|---|
| `/api/artists/me` | PUT | Update user profile | Yes | Requires creator or admin role |
| `/api/artists/me/avatar` | POST | Upload avatar | Yes | Multipart form upload |

---

## 5. Frontend Login Page Structure

### Login Component
**File**: [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)

### Page Layout
```
<div className="min-h-screen flex items-center justify-center">
  <motion.div> {/* Animated container */}
    {/* Header */}
    <h1>{t.auth.welcomeBack}</h1>
    <p>{t.auth.signInTo}</p>
    
    {/* Form */}
    <form onSubmit={handleSubmit}>
      {/* Error Display */}
      {error && <div className="bg-destructive/10">{error}</div>}
      
      {/* Email Input */}
      <div className="space-y-2">
        <Label>{t.auth.email}</Label>
        <Input type="email" value={email} placeholder="artist@example.com" />
      </div>
      
      {/* Password Input */}
      <div className="space-y-2">
        <Label>{t.auth.password}</Label>
        <Input type="password" value={password} placeholder="••••••••" />
      </div>
      
      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
    
    {/* Register Link */}
    <p>Don't have an account? <Link to="/register">Create one</Link></p>
    
    {/* Demo Credentials */}
    <div className="bg-secondary/50 rounded-lg">
      <p>Demo accounts:</p>
      <p>🎨 amara.diallo@artconnect.africa / password123</p>
      <p>🏛 mc@artconnect.africa / institution123</p>
      <p>🔑 admin@artconnect.africa / admin123</p>
    </div>
  </motion.div>
</div>
```

### Component State
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { login, isLoading, error, clearError } = useAuthStore();
```

### Form Submission Logic
1. **Clear Previous Errors**: `clearError()` before attempting login
2. **Call API**: `await login(email, password)`
3. **Handle Response**: Check for `success: true`
4. **Get User**: Extract user object from response
5. **Check Role**:
   - If `partenaire`: Hydrate institution store, check payment, redirect to `/statistics` or `/checkout`
   - Otherwise: Redirect to `/dashboard`
6. **Error Handling**: Display error message if login fails

### Key Features
- **Loading State**: Shows spinner while authenticating
- **Error Display**: Red box shows API error messages
- **Mobile Responsive**: `md:grid-cols-2` for large screens
- **Animations**: Framer Motion fade-in on page load
- **Multilingual**: Uses `useLanguageStore` for translations
- **Demo Accounts**: Shows example credentials for testing
- **Validation**: HTML5 required/type validation

### Error Handling
```javascript
if (!result?.success) return;  // API error already displayed
```

Error messages shown from backend:
- "Invalid credentials" - Wrong email/password
- "Your account is pending approval..." - approval_status="pending"
- "Your account has been rejected..." - approval_status="rejected"
- "Login failed" - Unexpected error

---

## 6. Role-Based Access Control (RBAC)

### Dependency Injection Pattern

#### `get_current_user()` 
- Required for all authenticated endpoints
- Validates token in `active_tokens`
- Raises 401 if invalid

#### `get_optional_user()`
- Optional authentication
- Returns None if no token
- Used for public endpoints with optional auth (e.g., visit tracking)

#### `require_creator_or_admin(user)`
- Allows: `personne_physique`, `personne_morale`, `admin`
- Denies: `partenaire`, `visitor`
- Endpoints: `/api/posts`, `/api/projects`, feed creation

#### `require_partner_or_admin(user)` (Deprecated)
- Allows: `partenaire`, `admin`
- Endpoints: Deprecated, use `require_paid_partner` instead

#### `require_paid_partner(user)`
- Allows: `partenaire` (if `has_paid=true` AND `access_code` exists) or `admin`
- Endpoints: `/api/statistics/detailed`, `/api/collaboration-statistics`
- Status codes:
  - 403: Not a partner
  - 402: Partner but not paid
  - 403: No access code

#### `require_admin(user)`
- Allows: `admin` only
- Endpoints: `/api/admin/*`, user approval/rejection

### Registration Validations
[server.py lines 656-670](backend/server.py#L656-L670)

Different requirements per role:

**Visitor**:
- `visitor_type` required
- `organization_name` if type='organisation'

**Creator (personne_physique, personne_morale, partenaire)**:
- `country`, `subregion`, `gender`, `sector`, `domain` all required
- `organization_name` if role='personne_morale'

---

## 7. Email Integration

### Email Service
[backend/email_service.py](backend/email_service.py)

### Email Types

#### Pending Approval Email
- **Sent**: After user registration
- **Recipient**: New user
- **Content**: "Your registration is pending admin approval"

#### Approval Email  
- **Sent**: When admin approves user
- **Recipient**: Approved user
- **Content**: Approval confirmation + access code (for institutions)

#### Rejection Email
- **Sent**: When admin rejects user
- **Recipient**: Rejected user
- **Content**: Rejection notice + reason

#### Admin Notification Email
- **Sent**: When user registers
- **Recipient**: Admin email (configured in .env)
- **Content**: User details for admin review:
  - Name, email, role, country, profile_tag
  - Used to flag suspicious registrations

---

## 8. Security Implementation

### Token Security
- **In-Memory Storage**: `active_tokens` dict (production: use Redis/session)
- **Token Format**: `secrets.token_urlsafe(32)` (256-bit random)
- **Bearer Scheme**: HTTP Authorization header
- **Password Hashing**: SHA256 (Note: Should use bcrypt in production)

### Validation Checks
- Email uniqueness enforced at DB level
- Password hashed before storage
- Approval status blocks login before token issued
- Role-based access on every endpoint

### CORS Configuration
[server.py lines 1715-1720](backend/server.py#L1715-L1720)
```python
allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]
```

---

## 9. Key Files Reference

### Backend
- **Main Auth Logic**: [server.py](backend/server.py#L72-L1710)
- **User Model**: [server.py lines 72-107](backend/server.py#L72-L107)
- **Auth Endpoints**: [server.py lines 651-771](backend/server.py#L651-L771)
- **Role Dependencies**: [server.py lines 489-534](backend/server.py#L489-L534)
- **Payment Endpoints**: [server.py lines 1665-1708](backend/server.py#L1665-L1708)
- **Email Service**: [email_service.py](backend/email_service.py)

### Frontend
- **Auth Store**: [store.js lines 3263-3360](frontend/src/store.js#L3263-L3360)
- **Institution Store**: [store.js lines 3655-3707](frontend/src/store.js#L3655-L3707)
- **Login Page**: [Login.jsx](frontend/src/pages/Login.jsx)
- **Register Page**: [Register.jsx](frontend/src/pages/Register.jsx)
- **App Routes**: [App.js](frontend/src/App.js#L25-L139)

---

## 10. Demo Credentials

For testing the authentication system:

| Account Type | Email | Password | Role |
|---|---|---|---|
| Artist | amara.diallo@artconnect.africa | password123 | personne_physique |
| Institution | mc@artconnect.africa | institution123 | personne_morale |
| Admin | admin@artconnect.africa | admin123 | admin |

---

## Summary

**Authentication Method**: Token-based with in-memory storage and Bearer authorization header

**User Roles**: 5 types (personne_physique, personne_morale, partenaire, visitor, admin) with different capabilities

**Partners**: Institutional role with payment-gated statistics access; requires approval + payment

**Access Control**: Role-based dependencies on endpoints; partners restricted from interactive features

**Login Flow**: Email/password → token generation → approval check → role-based redirect

**Frontend**: React Zustand store manages auth state, persistent localStorage token, multilingual support
