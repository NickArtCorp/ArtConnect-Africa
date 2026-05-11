import hashlib
import secrets
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import User, get_db

security = HTTPBearer(auto_error=False)
active_tokens = {}

ROLES = ['admin', 'personne_physique', 'personne_morale', 'partenaire', 'visitor']

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def sanitize_user(user: dict) -> dict:
    """Remove sensitive fields from user data"""
    safe_fields = ['id', 'first_name', 'last_name', 'country', 'city', 'subregion', 'gender', 
                   'sector', 'domain', 'year_started', 'bio', 'additional_info', 
                   'website', 'avatar', 'role', 'is_featured', 'is_verified', 'created_at',
                   'organization_name', 'visitor_type', 'portfolio', 'has_paid', 'access_code', 'partner_code', 'paid_at', 'profile_tag',
                   'contact_person_name', 'contact_person_email']
    return {k: v for k, v in user.items() if k in safe_fields}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = active_tokens[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert to dict for compatibility
    user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    if 'password' in user_dict:
        del user_dict['password']
    return user_dict

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        return None
    token = credentials.credentials
    if token not in active_tokens:
        return None
    user_id = active_tokens[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    if 'password' in user_dict:
        del user_dict['password']
    return user_dict

def require_paid_partner(user: dict = Depends(get_current_user)):
    """Check if user is a paid partner or admin"""
    if user.get('role') == 'admin':
        return user
    if user.get('role') == 'partenaire' and user.get('has_paid'):
        return user
    raise HTTPException(status_code=403, detail="Access restricted to paid partners or administrators")
