# ArtConnect Africa - Email Approval System (EmailJS)

## Overview
This system implements an email-based user approval workflow:
1. **User Registration** → Pending approval email sent
2. **Admin Dashboard** → Admin reviews and approves/rejects
3. **Approval** → Email sent with access code
4. **Rejection** → Email sent with rejection reason

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Add to `.env`:
```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_TEMPLATE_ID_PENDING=your_pending_template_id
EMAILJS_TEMPLATE_ID_APPROVED=your_approved_template_id
EMAILJS_TEMPLATE_ID_REJECTED=your_rejected_template_id
ADMIN_EMAIL=admin@artconnect.com
```

### 3. Set Up EmailJS Templates
Create three email templates in your EmailJS account:

#### Pending Approval Template
- **To Email**: `{{to_email}}`
- **Subject**: `{{subject}}`
- **Content**: 
  ```
  Dear {{to_name}},
  
  Thank you for registering on ArtConnect Africa! 
  {{message}}
  
  Best regards,
  ArtConnect Africa Team
  ```

#### Approval Template
- **To Email**: `{{to_email}}`
- **Subject**: `{{subject}}`
- **Content**:
  ```
  Dear {{to_name}},
  
  Congratulations! {{message}}
  
  Your Access Code: {{access_code}}
  
  Best regards,
  ArtConnect Africa Team
  ```

#### Rejection Template
- **To Email**: `{{to_email}}`
- **Subject**: `{{subject}}`
- **Content**:
  ```
  Dear {{to_name}},
  
  {{message}}
  
  Best regards,
  ArtConnect Africa Team
  ```

## API Endpoints

### Get Pending Approvals
```http
GET /api/admin/pending-approvals
```
Returns array of users pending approval.

### Approve User
```http
POST /api/admin/approve-user
Content-Type: application/json

{
  "user_id": "uuid",
  "status": "approved",
  "access_code": "optional_code"  // Generated if not provided
}
```

### Reject User
```http
POST /api/admin/approve-user
Content-Type: application/json

{
  "user_id": "uuid",
  "status": "rejected",
  "rejection_reason": "Profile information doesn't match requirements"
}
```

### Update Approval Status
```http
PUT /api/admin/update-approval/{user_id}
Content-Type: application/json

{
  "status": "approved" | "rejected",
  "rejection_reason": "optional",
  "access_code": "optional"
}
```

## Login Flow

When a user tries to login:
- If `approval_status == "pending"` → HTTP 403: "Account pending approval"
- If `approval_status == "rejected"` → HTTP 403: "Account rejected"
- If `approval_status == "approved"` → Login successful

## Database Changes

Added columns to `users` table:
- `approval_status` (String): "pending" | "approved" | "rejected"
- `rejection_reason` (Text): Reason for rejection (if applicable)
- `relay_contact` (String): Country relay contact (for future use)

## Frontend Implementation (EmailJS)

No additional configuration needed! The email sending is fully handled by the backend.

The frontend simply needs to:
1. Call `/auth/register` endpoint for user registration
2. Display appropriate messages based on HTTP status codes
3. For admin: Call the approval endpoints to manage pending users

## Email Service Module

Located in `backend/email_service.py`:
- `send_pending_approval_email()` - Sent on registration
- `send_approval_email()` - Sent when admin approves
- `send_rejection_email()` - Sent when admin rejects
- `send_admin_notification()` - Notifies admin of new applications

## Testing Locally

Without EmailJS credentials, emails won't be sent but the system will log warnings. You can test the API endpoints without email configuration.

To test with real emails:
1. Sign up for EmailJS (https://www.emailjs.com/)
2. Create a free email service
3. Create email templates (as described above)
4. Add credentials to `.env`
5. Restart the backend server
