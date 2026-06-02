# Backend Changes Summary - ArtConnect-Africa

## Overview
Updated the ArtConnect-Africa backend (`server.py`) to align with new UX/business requirements for user registration and profiles.

## Changes Made

### 1. ✅ Replaced "personne de contact" with "personne de référence"
- Updated `UserCreate` model: `contact_person_name` → `reference_person_name`
- Updated `UserCreate` model: `contact_person_email` → `reference_person_email`
- Updated `UserUpdate` model: same field name changes
- Updated User creation logic in `register()` endpoint to use the new field names

### 2. ✅ Mission limit for "personne morale" (500 words)
- Added validation in registration for `personne_morale` accounts
- Bio (mission) field is now validated to not exceed 500 words
- Validation error: "Mission (bio) cannot exceed 500 words"

### 3. ✅ Removed "year_started" from all account types
- Removed `year_started` field from `UserCreate` Pydantic model
- Removed `year_started` field from `UserUpdate` Pydantic model
- Removed assignment of `year_started` in User object creation during registration
- All account types: personne_physique, personne_morale, partenaire, visitor

### 4. ✅ Updated registration requirements by account type

#### For "personne_physique" (Individual Artists/Professionals):
- **Required fields**: first_name, last_name, country, subregion, gender, sector, domain
- **Optional fields**: reference_person_name, reference_person_email (not used for individual artists)

#### For "personne_morale" (Organizations):
- **Required fields**: first_name, last_name, organization_name, employees_count, country, subregion, gender, sector, domain
- **Optional fields**: reference_person_name, reference_person_email
- **Validation**: bio (mission) cannot exceed 500 words

#### For "partenaire" (Partners):
- **Required fields**: first_name, last_name, country, subregion, gender, sector, domain
- Same as personne_physique (partners are professionals)

#### For "visitor" (Visitors):
- **Type: organisation**
  - **Required fields**: email, organization_name, reference_person_name
  - **Optional fields**: reference_person_email
  - **NOT required**: first_name, last_name
  
- **Type: individual**
  - **Required fields**: email, first_name, last_name
  - **NOT included**: reference_person_name, reference_person_email, organization_name

### 5. ✅ Updated registration validation logic
- Added specific validation rules based on `visitor_type` for visitor accounts
- For visitor organizations: enforces organization_name and reference_person_name
- For visitor individuals: enforces first_name and last_name
- Improved error messages for clarity

### 6. ✅ Updated email notifications
- Modified pending approval email sending to handle all account types
- For visitors (organisation type): uses organization_name as the user identifier
- For others: uses first_name and last_name as before
- Handles cases where first/last name might be None

## Database Schema Notes
No database migration needed for these changes:
- `contact_person_name` → `reference_person_name` (field rename, same column in DB)
- `contact_person_email` → `reference_person_email` (field rename, same column in DB)
- `year_started` column remains in database but is no longer populated

## API Endpoints Affected
1. `POST /api/auth/register` - Updated validation and field handling
2. All User-related endpoints - Pydantic models updated
3. Admin endpoints - Accept the updated UserCreate model

## Frontend Integration Required
Frontend must be updated to:
1. Change all UI labels from "personne de contact" to "personne de référence"
2. Remove "Rejoignez ArtConnectAfrica" messaging (replace with "Bienvenu à ArtConnectAfrica")
3. Update registration forms:
   - Remove "year_started" field from all forms
   - For visitor organizations: hide first_name/last_name fields
   - For visitor individuals: hide reference_person fields
   - Add 500-word validation indicator for personne_morale mission/bio field
4. Remove any mentions about "personnes morales have access to stats"

## Testing Recommendations
1. Test registration with all account types
2. Verify 500-word validation for personne_morale bio
3. Test visitor registration (both individual and organization types)
4. Verify database doesn't store year_started for new registrations
5. Test email notifications with different account types
6. Verify field validation catches missing required fields by account type

## Files Modified
- `c:\Users\LENOVO\ArtConnect-Africa\backend\server.py`
  - Lines: 505-530 (UserCreate model)
  - Lines: 533-548 (UserUpdate model)
  - Lines: 553-585 (register endpoint validation)
  - Lines: 607-670 (User object creation)
  - Lines: 639-665 (Email notifications)

---
**Date**: May 22, 2026
**Status**: ✅ Complete
