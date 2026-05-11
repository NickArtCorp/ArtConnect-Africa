# Partner Code Authentication - Testing Guide

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Admin account created and approved
- Test partner account (or will create one)

## Test Scenarios

### Test 1: Create a Partner Account

**Objective:** Verify that partner account creation generates a unique code

**Steps:**

1. Navigate to registration page: `http://localhost:3000/register`

2. Fill in partner registration form:
   ```
   First Name: Test
   Last Name: Partner
   Email: test.partner@example.com
   Password: TestPass123!
   Country: [Choose one]
   City: [Enter city]
   Sub-region: [Choose one]
   Gender: [Choose one]
   Sector: Art/Culture
   Domain: Visual Arts
   Organization Name: Test Partner Co.
   Account Type: Partner (Partenaire)
   ```

3. Submit registration

4. **Expected Result:**
   - Account created with status "pending"
   - Partner code automatically generated
   - Pending approval email sent
   - Redirect to dashboard or login page

5. **Verify Code Generated:**
   ```bash
   # Check database
   sqlite3 artconnect.db "SELECT id, email, partner_code FROM users WHERE email = 'test.partner@example.com';"
   ```

   Should show a non-null `partner_code` like: `AbC123xYz_4567`

---

### Test 2: Admin Approves Partner

**Objective:** Verify approval workflow

**Steps:**

1. Login as admin: `admin@artconnect.africa` / `admin123`

2. Navigate to admin approval page

3. Find "Test Partner" in pending approvals list

4. Click "Approve"

5. **Expected Result:**
   - Status changes to "approved"
   - Approval email sent to partner
   - Partner code remains unchanged

---

### Test 3: Partner Logs In with Code

**Objective:** Verify partner login functionality

**Steps:**

1. Navigate to login page: `http://localhost:3000/login`

2. Click "Partner Code" toggle button
   - Form should change
   - Show single code input field
   - Hide email/password fields

3. Enter partner code:
   ```
   AbC123xYz_4567
   ```

4. Click "Access Platform"

5. **Expected Result:**
   - If paid: Redirect to `/statistics`
   - If not paid: Redirect to `/checkout`
   - Token stored in localStorage
   - User info displayed in header

6. **Verify Authentication:**
   ```bash
   # Check browser console
   localStorage.getItem('aca_token')
   # Should return a token string
   ```

---

### Test 4: Invalid Partner Code

**Objective:** Verify error handling for invalid codes

**Steps:**

1. Navigate to login page and switch to "Partner Code"

2. Enter invalid code: `InvalidCode123`

3. Click "Access Platform"

4. **Expected Result:**
   - Error message: "Invalid partner code"
   - Form remains visible
   - Not authenticated
   - No token stored

---

### Test 5: Unapproved Partner Cannot Login

**Objective:** Verify approval status validation

**Steps:**

1. Create another partner account but DON'T approve it

2. Try to login with that partner's code

3. **Expected Result:**
   - Error message: "Your account is pending approval. Please wait for admin confirmation."
   - Cannot access platform

---

### Test 6: Rejected Partner Cannot Login

**Objective:** Verify rejected partners are blocked

**Steps:**

1. Admin rejects a partner account

2. Try to login with that partner's code

3. **Expected Result:**
   - Error message: "Your account has been rejected. Please contact support for more information."
   - Cannot access platform

---

### Test 7: Get Partner Code API

**Objective:** Verify partner can retrieve their code

**Steps:**

1. Login as partner with code (from Test 3)

2. Call API endpoint:
   ```bash
   curl -X GET "http://localhost:8000/api/partners/me/code" \
     -H "Authorization: Bearer YOUR_PARTNER_TOKEN"
   ```

3. **Expected Result:**
   ```json
   {
     "partner_code": "AbC123xYz_4567",
     "message": "This is your unique access code. Keep it confidential."
   }
   ```

---

### Test 8: Regenerate Partner Code

**Objective:** Verify code regeneration functionality

**Steps:**

1. Login as partner (from Test 3)

2. Retrieve current code via API (Test 7)
   - Note: `AbC123xYz_4567`

3. Call regenerate endpoint:
   ```bash
   curl -X POST "http://localhost:8000/api/partners/me/regenerate-code" \
     -H "Authorization: Bearer YOUR_PARTNER_TOKEN"
   ```

4. **Expected Result:**
   ```json
   {
     "success": true,
     "partner_code": "NewCode_7890xYz",
     "message": "Your partner code has been regenerated. Use this new code for future logins."
   }
   ```

5. **Verify:**
   - New code is different from old code
   - Old code no longer works
   - Can login with new code

6. Test login with old code:
   ```bash
   curl -X POST "http://localhost:8000/api/auth/partner-login" \
     -H "Content-Type: application/json" \
     -d '{"partner_code": "AbC123xYz_4567"}'
   ```
   - Should return: `{"detail":"Invalid partner code"}`

---

### Test 9: Case Insensitivity

**Objective:** Verify code input is case-insensitive

**Steps:**

1. Navigate to login, switch to Partner Code

2. Get a partner code (e.g., `AbC123xYz_4567`)

3. Enter different cases:
   - `abc123xyz_4567`
   - `ABC123XYZ_4567`
   - `AbC123xYz_4567`

4. **Expected Result:**
   - All should authenticate successfully
   - Frontend auto-converts to uppercase

---

### Test 10: UI Toggle Functionality

**Objective:** Verify login mode toggle works properly

**Steps:**

1. Navigate to login page

2. Default should be "User Login" mode
   - Show email field
   - Show password field
   - Hide code field

3. Click "Partner Code" toggle
   - Hide email field
   - Hide password field
   - Show code field
   - Show partner code help text
   - Show register link hidden

4. Click "User Login" toggle
   - Return to previous state

5. **Expected Result:**
   - Smooth transitions between modes
   - Form fields appear/disappear correctly
   - Previous errors cleared on toggle

---

### Test 11: Database Constraints

**Objective:** Verify unique partner_code constraint

**Steps:**

1. Try to manually create two partners with same code (via direct DB):
   ```sql
   INSERT INTO users (id, email, password, partner_code, role, approval_status) 
   VALUES ('id1', 'user1@test.com', 'hash', 'SAMECODE', 'partenaire', 'approved');
   
   INSERT INTO users (id, email, password, partner_code, role, approval_status) 
   VALUES ('id2', 'user2@test.com', 'hash', 'SAMECODE', 'partenaire', 'approved');
   ```

2. **Expected Result:**
   - Second insert fails with UNIQUE constraint error
   - Database prevents duplicate codes

---

### Test 12: Logout and Re-Login

**Objective:** Verify logout clears auth and re-login works

**Steps:**

1. Login as partner with code

2. Navigate to dashboard (verify authenticated)

3. Click logout

4. Verify redirected to home or login page

5. Check localStorage:
   ```bash
   localStorage.getItem('aca_token')
   # Should be null
   ```

6. Try to access `/dashboard`
   - Should redirect to login

7. Login again with same partner code
   - Should work normally

---

## Automated Test Cases (Jest/Vitest)

```javascript
// Tests for PartnerLogin component
describe('PartnerLogin', () => {
  
  it('should render partner code input field', () => {
    // Test that Partner Code toggle is visible
    // Test that code input field appears when selected
  });

  it('should accept partner code', async () => {
    // Enter valid partner code
    // Submit form
    // Verify successful login
  });

  it('should handle invalid partner code', async () => {
    // Enter invalid code
    // Submit form
    // Verify error message
  });

  it('should redirect to statistics if partner has paid', async () => {
    // Login with paid partner code
    // Verify redirect to /statistics
  });

  it('should redirect to checkout if partner has not paid', async () => {
    // Login with unpaid partner code
    // Verify redirect to /checkout
  });

  it('should toggle between login modes', () => {
    // Click User Login button
    // Verify email/password fields shown
    // Click Partner Code button
    // Verify code input field shown
  });

});
```

---

## API Integration Tests

```bash
#!/bin/bash

# Test partner registration
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Partner",
    "email": "api.test@example.com",
    "password": "TestPass123!",
    "country": "Cameroon",
    "city": "Yaoundé",
    "subregion": "Central Africa",
    "gender": "Male",
    "sector": "Arts",
    "domain": "Visual Arts",
    "role": "partenaire"
  }')

PARTNER_CODE=$(echo $REGISTER_RESPONSE | jq -r '.user.partner_code')
echo "Partner Code: $PARTNER_CODE"

# Test partner login
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/auth/partner-login" \
  -H "Content-Type: application/json" \
  -d "{\"partner_code\": \"$PARTNER_CODE\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Auth Token: $TOKEN"

# Test get partner code
curl -s -X GET "http://localhost:8000/api/partners/me/code" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## Performance Testing

### Load Test - Multiple Partner Logins

```bash
#!/bin/bash

# Generate 100 login requests
for i in {1..100}; do
  curl -X POST "http://localhost:8000/api/auth/partner-login" \
    -H "Content-Type: application/json" \
    -d "{\"partner_code\": \"code_${i}\"}" &
done

wait
echo "100 login requests completed"
```

---

## Troubleshooting Failed Tests

### "Invalid partner code" on valid code
- **Check:** Code exists in database
- **Check:** Code matches exactly (case-insensitive should handle this)
- **Check:** User role is 'partenaire'

### "Pending approval" error
- **Check:** Admin has approved the partner account
- **Check:** Approval status in database is "approved"

### Code not generated on registration
- **Check:** Role is exactly 'partenaire'
- **Check:** secrets module is available
- **Check:** Database migration ran successfully

### Token not persisting
- **Check:** localStorage is enabled in browser
- **Check:** No errors in browser console
- **Check:** Token key is 'aca_token'

### Can't toggle between login modes
- **Check:** React state is updating correctly
- **Check:** clearError() is being called
- **Check:** No console errors

---

## Success Criteria

✅ Partner creates account and receives code automatically
✅ Admin can approve partner accounts
✅ Partner can login with code (not email/password)
✅ Approval status prevents unapproved partner access
✅ Invalid codes rejected with proper error message
✅ Partner can retrieve their code via API
✅ Partner can regenerate their code
✅ Old code no longer works after regeneration
✅ UI toggle switches between login modes smoothly
✅ Redirect to statistics/checkout works post-login
✅ Logout clears authentication state
✅ Database uniqueness constraint enforced
✅ Code case-insensitivity works
