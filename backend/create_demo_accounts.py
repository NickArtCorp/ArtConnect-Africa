#!/usr/bin/env python3
"""
Script to create demo accounts for testing
Run once to populate the database with test users
"""

import sys
from pathlib import Path
from datetime import datetime
import uuid
import hashlib

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from server import User, SessionLocal, engine, Base

def hash_password(password: str) -> str:
    """Hash password using SHA256 (matches server.py)"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_demo_accounts():
    """Create demo user accounts"""
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@artconnect.africa").first()
        if admin:
            print("✓ Admin account already exists")
            return
        
        # Create Admin Account
        admin_id = str(uuid.uuid4())
        admin_user = User(
            id=admin_id,
            email="admin@artconnect.africa",
            password=hash_password("admin123"),
            first_name="Admin",
            last_name="Account",
            country="Senegal",
            subregion="West Africa",
            gender="Male",
            sector="Administration",
            domain="Management",
            year_started=2024,
            bio="ArtConnect Africa Administrator",
            avatar="https://api.dicebear.com/7.x/initials/svg?seed=Admin%20Account",
            role="admin",
            is_verified=True,
            is_featured=False,
            approval_status="approved",  # Admin is approved by default
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        print("✓ Admin account created successfully")
        print(f"  Email: admin@artconnect.africa")
        print(f"  Password: admin123")
        print(f"  Access: http://localhost:3000/admin/approvals")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error creating demo accounts: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_accounts()
