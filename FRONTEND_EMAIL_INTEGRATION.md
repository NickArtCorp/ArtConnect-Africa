# Email Approval System - Frontend Integration

## Overview
The frontend has been updated to work with the email approval system. Key changes:

1. **User Registration** → Status changes to "pending" automatically
2. **Login Validation** → Users cannot login until approved
3. **Admin Panel** → New admin approval interface for managing registrations

## User Registration Flow

### What Users See:
1. User fills out registration form
2. On successful registration:
   - Email sent: "Your registration is pending approval"
   - User receives confirmation message on screen
   - Redirect to login page (cannot access platform yet)

3. When admin approves:
   - User receives email with access code
   - User can now login successfully

4. When admin rejects:
   - User receives email with rejection reason
   - Cannot login

## Login Flow

### Error Messages:
- **"Your account is pending approval"** (HTTP 403)
  - User has registered but admin hasn't reviewed yet
  - Tell user to wait for email confirmation

- **"Your account has been rejected"** (HTTP 403)
  - User's application was rejected
  - Tell user to contact support with rejection details from their email

## Admin Approval Panel

### Access:
- **URL**: `/admin/approvals`
- **Requires**: Admin/authenticated user
- **Protected**: Yes (requires valid token)

### Features:
1. **Pending Users List** (Left column)
   - Shows count of pending approvals
   - Lists all awaiting approval
   - Click to select user

2. **User Details** (Right column)
   - Personal information
   - Bio and additional info
   - Verification details

3. **Actions**:
   - **Approve**: 
     - Generates access code automatically
     - Sends approval email with code
     - User can now login
   
   - **Reject**:
     - Requires rejection reason
     - Sends rejection email
     - User receives explanation

## Register Component Updates

The Register component (`frontend/src/pages/Register.jsx`) now:
1. Shows pending approval message after registration
2. Disables login button until user is approved
3. Shows appropriate error messages on login attempts

## Login Component Updates

The Login component now handles:
- `HTTP 403`: "Pending approval" → Show waiting message
- `HTTP 403`: "Rejected" → Show rejection message
- Provide link to contact admin for rejected users

## Installation

No additional npm packages needed! The frontend uses:
- Built-in browser fetch API
- Existing UI components from shadcn/ui
- Existing Zustand store for auth

## Environment Variables

Optionally set in `.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

Default: `http://localhost:8000/api`

## Key Files Modified

1. **App.js**
   - Added AdminApproval route at `/admin/approvals`
   - Added import for AdminApproval component

2. **pages/AdminApproval.jsx** (NEW)
   - New admin panel for managing approvals
   - Shows pending users list
   - Allows approve/reject with reason

3. **pages/Register.jsx**
   - Needs to show "pending approval" message
   - Disable platform access until approved

4. **pages/Login.jsx**
   - Show "pending approval" or "rejected" messages
   - Explain steps to resolve

## User State Management

The auth store (`store.js`) tracks:
- `user.approval_status`: "pending" | "approved" | "rejected"
- `user.access_code`: Generated on approval
- `user.rejection_reason`: Set when rejected

## Email Templates

When setting up EmailJS templates, use these variables:
- `{{to_email}}` - User's email
- `{{to_name}}` - User's name
- `{{user_name}}` - User's first name
- `{{subject}}` - Email subject
- `{{message}}` - Email body message
- `{{access_code}}` - Approval code (only in approved email)

## Security Notes

1. `approval_status` is automatically set to "pending" on registration
2. Login checks approval status before granting token
3. Access code is generated securely
4. Admin endpoints require authentication token
5. Only admins should have email sending permissions

## Testing

### Test Approval Flow:
1. Register a test account
2. Check inbox for pending email
3. Go to `/admin/approvals` (as admin)
4. Click test account, review details
5. Click "Approve" or "Reject"
6. Verify email is sent
7. Try to login:
   - Pending: Should see "pending approval" error
   - Approved: Should login successfully
   - Rejected: Should see "rejected" error

## Troubleshooting

### Admin panel shows no users
- Verify user is authenticated (has token)
- Check browser console for errors
- Ensure backend is running
- Check API_BASE_URL is correct

### Emails not sending
- Check `.env` has EmailJS credentials
- Verify email templates exist in EmailJS account
- Check template IDs match `.env`
- Verify email addresses are valid

### Cannot access admin panel
- Verify you have admin credentials
- Check token is valid
- Try logging out and back in
- Clear browser cache

## Future Enhancements

1. Add relay contact assignment per country
2. Add bulk approval/rejection
3. Add detailed audit trail
4. Add verification document upload
5. Add country relay communication
6. Add auto-reject based on keywords
