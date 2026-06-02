# Frontend Implementation Guide - UX/Business Changes

## Overview
The following UX and business logic changes have been implemented in the backend. The frontend must be updated to match these changes.

---

## 1. Field Name Changes: "Personne de Contact" → "Personne de Référence"

### Where to Update:
- **All user profile forms**
- **All user edit/update pages**
- **All registration forms** (especially for "personne_morale" and "visitor" accounts)
- **Admin user management pages**
- **User profile display pages**

### Changes:
```
OLD: "Personne de contact"
NEW: "Personne de référence"

OLD: "Nom du contact"
NEW: "Nom de la personne de référence"

OLD: "Email du contact"
NEW: "Email de la personne de référence"
```

### Affected Form Fields:
- `contact_person_name` → `reference_person_name`
- `contact_person_email` → `reference_person_email`

---

## 2. Remove "Year Started" Field

### Where to Remove:
- Registration form (all account types)
- Profile edit form
- User admin panel
- Profile display pages

### Account Types Affected:
- ✅ personne_physique (Individual Artists)
- ✅ personne_morale (Organizations)
- ✅ partenaire (Partners)
- ✅ visitor (Visitors - both individual and organization)

**Action**: Delete all UI elements related to "Year Started" / "Année de début"

---

## 3. Update Registration Form Fields by Account Type

### A. Personne Physique (Individual Artists/Professionals)
**Required Fields:**
- Email ✓
- Password ✓
- First Name ✓
- Last Name ✓
- Country ✓
- Subregion ✓
- Gender ✓
- Sector ✓
- Domain ✓

**Optional Fields:**
- Bio/Description
- Additional Info
- Website
- Phone
- Address
- Reference Person Name (NOT SHOWN)
- Reference Person Email (NOT SHOWN)

---

### B. Personne Morale (Organizations)
**Required Fields:**
- Email ✓
- Password ✓
- First Name ✓ (contact person from organization)
- Last Name ✓ (contact person from organization)
- Organization Name ✓
- Employees Count ✓
- Country ✓
- Subregion ✓
- Gender ✓
- Sector ✓
- Domain ✓

**Optional Fields:**
- Bio/Mission (Max 500 words - add word counter) ⚠️
- Additional Info
- Website
- Phone
- Address
- Reference Person Name (optional)
- Reference Person Email (optional)

**NEW VALIDATION:**
```javascript
// Add to mission/bio field
const wordCount = text.split(/\s+/).length;
if (wordCount > 500) {
  showError("La mission ne peut pas dépasser 500 mots");
  disableSubmit = true;
}
```

---

### C. Visitor - Individual
**Required Fields:**
- Email ✓
- First Name ✓
- Last Name ✓

**Hidden/Not Used:**
- ❌ Organization Name
- ❌ Reference Person Name
- ❌ Reference Person Email
- ❌ Country (optional)
- ❌ Subregion (optional)
- ❌ Gender (optional)
- ❌ Sector (optional)
- ❌ Domain (optional)

**Notes:**
- Keep form simple and minimal
- No reference person fields needed

---

### D. Visitor - Organization
**Required Fields:**
- Email ✓
- Organization Name ✓
- Reference Person Name ✓ (the contact person)
- Reference Person Email (optional but recommended)

**Hidden/Not Used:**
- ❌ First Name
- ❌ Last Name
- ❌ Country
- ❌ Subregion
- ❌ Gender
- ❌ Sector
- ❌ Domain

**Notes:**
- Different form layout from individual visitors
- Focus on organization and reference contact
- No need for artist profile fields

---

## 4. Update Welcome/Onboarding Messages

### Replace:
```
OLD: "Rejoignez ArtConnectAfrica"
NEW: "Bienvenu à ArtConnectAfrica"
```

### Where:
- Registration page header/title
- Welcome email
- Welcome screen after registration
- Onboarding flow

---

## 5. Remove Stats Access Mention for Organizations

### Where to Remove:
- Registration page description
- Terms & Conditions (if mentioned)
- Plan comparison page (if applicable)
- Marketing materials about personne_morale accounts

### What to Remove:
```
OLD: "As an organization, you will have access to detailed statistics..."
     "En tant qu'organisation, vous aurez accès aux statistiques détaillées..."

DELETE THIS
```

---

## 6. Dynamic Form Display Logic

### Pseudo-code for Registration Form:

```javascript
function renderRegistrationForm(userType) {
  const fields = {
    'personne_physique': {
      required: ['email', 'password', 'first_name', 'last_name', 'country', 'subregion', 'gender', 'sector', 'domain'],
      optional: ['bio', 'phone', 'address', 'website']
    },
    'personne_morale': {
      required: ['email', 'password', 'first_name', 'last_name', 'organization_name', 'employees_count', 'country', 'subregion', 'gender', 'sector', 'domain'],
      optional: ['bio', 'phone', 'address', 'website', 'reference_person_name', 'reference_person_email']
    },
    'partenaire': {
      required: ['email', 'password', 'first_name', 'last_name', 'country', 'subregion', 'gender', 'sector', 'domain'],
      optional: ['bio', 'phone', 'address', 'website']
    },
    'visitor': {
      'individual': {
        required: ['email', 'first_name', 'last_name'],
        optional: []
      },
      'organisation': {
        required: ['email', 'organization_name', 'reference_person_name'],
        optional: ['reference_person_email']
      }
    }
  };
  
  // Show only fields in required[] and optional[]
  // Hide all other fields
}
```

---

## 7. Validation Rules to Implement

### For Personne Morale:
```javascript
// Bio/Mission word count validation
if (role === 'personne_morale') {
  const words = bio.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (words > 500) {
    throw new Error('La mission ne peut pas dépasser 500 mots. Vous avez ' + words + ' mots.');
  }
}
```

### For Visitor Organizations:
```javascript
if (role === 'visitor' && visitor_type === 'organisation') {
  validateRequired(['email', 'organization_name', 'reference_person_name']);
  // first_name and last_name are NOT required
}
```

### For Visitor Individuals:
```javascript
if (role === 'visitor' && visitor_type === 'individual') {
  validateRequired(['email', 'first_name', 'last_name']);
  // reference_person fields are NOT included
}
```

---

## 8. API Payload Examples

### Personne Morale Registration:
```json
{
  "email": "info@org.fr",
  "password": "password123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "organization_name": "Art Gallery Paris",
  "employees_count": 5,
  "country": "France",
  "subregion": "West Africa",
  "gender": "Male",
  "sector": "Visual Arts",
  "domain": "Photography",
  "bio": "We are dedicated to showcasing contemporary African art...",
  "role": "personne_morale",
  "reference_person_name": "Marie Martin",
  "reference_person_email": "marie@gallery.fr"
}
```

### Visitor Organization Registration:
```json
{
  "email": "contact@media.com",
  "organization_name": "Media Production Inc",
  "visitor_type": "organisation",
  "role": "visitor",
  "reference_person_name": "Ahmed Hassan",
  "reference_person_email": "ahmed@media.com"
}
```

### Visitor Individual Registration:
```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "visitor_type": "individual",
  "role": "visitor"
}
```

---

## 9. Error Messages to Add

```javascript
const errorMessages = {
  'organization_name_required': 'Le nom de l\'organisation est requis',
  'reference_person_required': 'Le nom de la personne de référence est requis',
  'mission_too_long': 'La mission ne peut pas dépasser 500 mots',
  'first_last_name_required': 'Le nom et le prénom sont requis'
};
```

---

## 10. Testing Checklist

- [ ] Register as personne_physique (no errors, correct fields shown)
- [ ] Register as personne_morale with bio > 500 words (should error)
- [ ] Register as personne_morale with bio ≤ 500 words (should succeed)
- [ ] Register as visitor individual (no first/last name error, reference person hidden)
- [ ] Register as visitor organization (no first/last name needed, reference person required)
- [ ] Profile edit page shows correct fields for each account type
- [ ] Admin panel filters and displays updated field labels
- [ ] Email notifications use correct labels ("personne de référence")
- [ ] "Welcome to ArtConnectAfrica" message appears on all new pages
- [ ] No "year_started" field visible anywhere
- [ ] No mentions of "stats access for organizations"

---

## 11. Database Considerations

**No migration needed** - the fields remain in the database:
- `contact_person_name` and `contact_person_email` are used in the backend
- New registrations won't populate these fields with old data
- Existing user data in these columns is preserved

---

## 12. Deployment Notes

1. **Backend is ready** - All changes deployed to `server.py`
2. **API is backward compatible** - Old field names still accepted by User model
3. **Frontend changes needed** - Update UI forms, labels, and validation
4. **Database migration not required** - Existing data preserved
5. **Testing required** - Comprehensive testing of all registration flows

---

**Backend Implementation Date**: May 22, 2026
**Status**: ✅ Backend Complete, 🔄 Frontend Pending

