#!/usr/bin/env python3
"""
Create a new admin account with specified credentials
Removes all existing admin accounts first
"""

import sys
from pathlib import Path
import uuid
import hashlib

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from server import User, SessionLocal
from database import init_db

def hash_password(password: str) -> str:
    """Hash password using SHA256 (matches server.py)"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_new_admin():
    """Create new admin account and remove existing admins"""
    
    # Ensure tables exist
    init_db()
    
    db = SessionLocal()
    
    try:
        new_admin_email = "info@kolaconsulting.net"
        new_admin_password = "artconnect"
        
        # Find and delete all existing admin accounts
        existing_admins = db.query(User).filter(User.role == "admin").all()
        
        if existing_admins:
            print(f"[INFO] Found {len(existing_admins)} existing admin account(s)")
            for admin in existing_admins:
                print(f"  - Removing: {admin.email}")
                db.delete(admin)
            db.commit()
            print("[OK] Existing admin accounts removed")
        
        # Create new admin account
        admin_id = str(uuid.uuid4())
        new_admin = User(
            id=admin_id,
            email=new_admin_email,
            password=hash_password(new_admin_password),
            first_name="Kola",
            last_name="Consulting",
            country="Senegal",
            subregion="West Africa",
            gender="Male",
            sector="Administration",
            domain="Management",
            year_started=2020,
            bio="ArtConnect Africa Administrator",
            avatar="https://api.dicebear.com/7.x/initials/svg?seed=Admin",
            role="admin",
            is_verified=True,
            approval_status="approved"
        )
        
        db.add(new_admin)
        db.commit()
        
        print("\n" + "="*60)
        print("[OK] New admin account created successfully!")
        print("="*60)
        print(f"  Email:    {new_admin_email}")
        print(f"  Password: {new_admin_password}")
        print(f"  Role:     admin")
        print(f"  Status:   approved")
        print("="*60 + "\n")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("CREATE NEW ADMIN ACCOUNT")
    print("="*60 + "\n")
    create_new_admin()
