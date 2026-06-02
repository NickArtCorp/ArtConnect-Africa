# Code Changes Reference - Detailed

## File: server.py

### Change 1: UserCreate Model - Remove year_started, rename contact_person to reference_person

**Location**: Lines 505-530

```python
# BEFORE
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    ...
    year_started: Optional[int] = None
    ...
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None

# AFTER
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None  # Changed to optional
    last_name: Optional[str] = None   # Changed to optional
    ...
    # year_started: REMOVED
    ...
    reference_person_name: Optional[str] = None  # Renamed
    reference_person_email: Optional[EmailStr] = None  # Renamed
```

**Why**: 
- year_started no longer needed for any account type
- first/last_name optional for visitor accounts
- Terminology updated for clarity

---

### Change 2: UserUpdate Model - Same changes as UserCreate

**Location**: Lines 533-548

```python
# BEFORE
class UserUpdate(BaseModel):
    ...
    year_started: Optional[int] = None
    ...
    contact_person_name: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None

# AFTER
class UserUpdate(BaseModel):
    ...
    # year_started: REMOVED
    ...
    reference_person_name: Optional[str] = None  # Renamed
    reference_person_email: Optional[EmailStr] = None  # Renamed
```

---

### Change 3: Registration Validation - Account Type Specific Requirements

**Location**: Lines 553-585

```python
# BEFORE
if user_data.role == 'visitor':
    if not user_data.visitor_type:
        raise HTTPException(status_code=400, detail="visitor_type is required for visitor accounts")
    if user_data.visitor_type == 'organisation' and not user_data.organization_name:
        raise HTTPException(status_code=400, detail="organisation_name is required for organisation visitors")
elif user_data.role in ('personne_physique', 'personne_morale'):
    missing = [f for f in ['country', 'subregion', 'gender', 'sector', 'domain'] if not getattr(user_data, f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")
    user_data.gender = normalize_gender(user_data.gender)
    if not user_data.gender:
        raise HTTPException(status_code=400, detail="Invalid gender. Allowed: Male, Female")
    if user_data.role == 'personne_morale':
        if not user_data.organization_name:
            raise HTTPException(status_code=400, detail="organization_name is required for personne_morale")

# AFTER
if user_data.role == 'visitor':
    if not user_data.visitor_type:
        raise HTTPException(status_code=400, detail="visitor_type is required for visitor accounts")
    # For organisation visitors: require organization_name and reference_person_name
    if user_data.visitor_type == 'organisation':
        if not user_data.organization_name:
            raise HTTPException(status_code=400, detail="organisation_name is required for organisation visitors")
        if not user_data.reference_person_name:  # NEW: Requires reference person
            raise HTTPException(status_code=400, detail="reference_person_name is required for organisation visitors")
    # For individual visitors: require first_name and last_name
    elif user_data.visitor_type == 'individual':
        if not user_data.first_name or not user_data.last_name:
            raise HTTPException(status_code=400, detail="first_name and last_name are required for individual visitors")
elif user_data.role in ('personne_physique', 'personne_morale'):
    # Required fields for artists/professionals
    if not user_data.first_name or not user_data.last_name:  # NEW: explicit check
        raise HTTPException(status_code=400, detail="first_name and last_name are required")
    missing = [f for f in ['country', 'subregion', 'gender', 'sector', 'domain'] if not getattr(user_data, f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")
    user_data.gender = normalize_gender(user_data.gender)
    if not user_data.gender:
        raise HTTPException(status_code=400, detail="Invalid gender. Allowed: Male, Female")
    # For personne_morale, require organization_name and employees_count, limit mission to 500 words
    if user_data.role == 'personne_morale':
        if not user_data.organization_name:
            raise HTTPException(status_code=400, detail="organization_name is required for personne_morale")
        # Validate bio (mission) doesn't exceed 500 words  # NEW: Word limit validation
        if user_data.bio:
            word_count = len(user_data.bio.split())
            if word_count > 500:
                raise HTTPException(status_code=400, detail="Mission (bio) cannot exceed 500 words")
```

**Key Additions**:
1. Organization visitor requires `reference_person_name` (NEW)
2. Individual visitor requires `first_name` and `last_name` (NEW)
3. personne_morale bio validation: max 500 words (NEW)
4. Explicit first_name/last_name check for artists (NEW)

---

### Change 4: User Object Creation - Remove year_started, rename contact fields

**Location**: Lines 607-637

```python
# BEFORE
new_user = User(
    ...
    year_started=user_data.year_started if user_data.role != 'visitor' else None,  # REMOVED
    ...
    contact_person_name=user_data.contact_person_name,  # RENAMED
    contact_person_email=user_data.contact_person_email  # RENAMED
)

# AFTER
new_user = User(
    ...
    # year_started: NOT ASSIGNED ANYMORE
    ...
    contact_person_name=user_data.reference_person_name,  # RENAMED
    contact_person_email=user_data.reference_person_email  # RENAMED
)
```

---

### Change 5: Email Notification Logic - Handle all account types

**Location**: Lines 639-665

```python
# BEFORE
email_service.send_pending_approval_email(
    email=user_data.email.lower(),
    first_name=user_data.first_name,
    last_name=user_data.last_name
)

email_service.send_admin_notification(
    user_email=user_data.email,
    user_name=f"{user_data.first_name} {user_data.last_name}",
    ...
)

# AFTER
user_name = user_data.organization_name if user_data.role == 'visitor' and user_data.visitor_type == 'organisation' else f"{user_data.first_name or ''} {user_data.last_name or ''}".strip()  # NEW: Handle organization visitors

email_service.send_pending_approval_email(
    email=user_data.email.lower(),
    first_name=user_data.first_name or user_data.reference_person_name or "User",  # NEW: Fallback logic
    last_name=user_data.last_name or ""  # NEW: Handle None
)

email_service.send_admin_notification(
    user_email=user_data.email,
    user_name=user_name,  # NEW: Uses organization_name for org visitors
    ...
)
```

**Why**: Handles visitor organization accounts that don't have first/last name

---

## Summary of Field Changes

### Pydantic Models (UserCreate, UserUpdate)

| Field | Status | Old Name | New Name | Notes |
|-------|--------|----------|----------|-------|
| year_started | REMOVED | - | - | All account types |
| contact_person_name | RENAMED | contact_person_name | reference_person_name | Terminology update |
| contact_person_email | RENAMED | contact_person_email | reference_person_email | Terminology update |
| first_name | MODIFIED | Required | Optional | Optional for visitors |
| last_name | MODIFIED | Required | Optional | Optional for visitors |

### Validation Changes

| Account Type | Validation | Type | Details |
|-------------|-----------|------|---------|
| personne_physique | first_name + last_name | NEW | Required |
| personne_morale | bio word count | NEW | Max 500 words |
| personne_morale | reference_person (optional) | EXISTING | Optional reference contact |
| visitor (organisation) | organization_name | EXISTING | Required |
| visitor (organisation) | reference_person_name | NEW | Required |
| visitor (individual) | first_name + last_name | NEW | Required |
| visitor (individual) | reference_person | N/A | Not used |

---

## Database Impact

**No migration required**:
- `contact_person_name` and `contact_person_email` columns remain
- No new columns needed
- Backward compatible

**Data handling**:
- Existing users keep their data
- New registrations don't use `year_started`
- New registrations use `reference_person_name`/`reference_person_email`

---

## Testing Commands

```bash
# Verify syntax
python -m py_compile server.py

# Run registration validation tests
pytest tests/test_registration.py -v

# Check specific account type validation
pytest tests/test_visitor_registration.py
pytest tests/test_morale_registration.py
```

---

## Deployment Checklist

- [x] Code changes completed
- [x] Syntax validation passed
- [x] No breaking changes to existing API
- [ ] Frontend updated (PENDING)
- [ ] Comprehensive testing (PENDING)
- [ ] Production deployment (PENDING)
- [ ] Monitor registration endpoints
- [ ] Document changes in release notes

---

## Related Documentation

- `BACKEND_CHANGES_SUMMARY.md` - Detailed backend summary
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Frontend implementation steps
- `IMPLEMENTATION_STATUS.md` - Overall implementation status

---

**Last Updated**: May 22, 2026  
**Backend Status**: ✅ COMPLETE  
**Frontend Status**: ⏳ PENDING

