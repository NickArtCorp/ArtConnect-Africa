#!/usr/bin/env python3
"""
Reset database and recreate with fresh admin account
"""

import sys
from pathlib import Path
from datetime import datetime
import uuid
import hashlib
import os

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from server import User, SessionLocal, engine, Base

def hash_password(password: str) -> str:
    """Hash password using SHA256 (matches server.py)"""
    return hashlib.sha256(password.encode()).hexdigest()

def reset_database():
    """Reset database and create admin account"""
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("[OK] Dropped all tables")
    
    # Create all tables fresh
    Base.metadata.create_all(bind=engine)
    print("[OK] Created all tables")
    
    db = SessionLocal()
    
    try:
        # 1. Official Admin
        official_admin_id = str(uuid.uuid4())
        official_admin = User(
            id=official_admin_id,
            email="info@kolaconsulting.net",
            password=hash_password("artconnect"),
            first_name="Kola",
            last_name="Consulting",
            country="Senegal",
            subregion="West Africa",
            gender="Male",
            sector="Administration",
            domain="Management",
            year_started=2020,
            bio="Official admin account for Kola Consulting",
            avatar="",
            role="admin",
            is_verified=True,
            approval_status="approved"
        )
        db.add(official_admin)

        # 2. Demo Admin
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
            year_started=2020,
            bio="Admin account for platform management",
            avatar="",
            role="admin",
            is_verified=True,
            approval_status="approved"
        )
        db.add(admin_user)

        # 3. Artist Amara
        amara_id = str(uuid.uuid4())
        amara_user = User(
            id=amara_id,
            email="amara.diallo@artconnect.africa",
            password=hash_password("password123"),
            first_name="Amara",
            last_name="Diallo",
            role="artist",
            country="Senegal",
            subregion="West Africa",
            gender="Female",
            sector="Visual Arts",
            domain="Painting",
            year_started=2015,
            bio="Contemporary visual artist exploring themes of identity and tradition in West Africa.",
            approval_status="approved",
            is_verified=True,
            is_featured=True
        )
        db.add(amara_user)

        # 4. Institution MC
        mc_id = str(uuid.uuid4())
        mc_user = User(
            id=mc_id,
            email="mc@artconnect.africa",
            password=hash_password("institution123"),
            first_name="Ministry",
            last_name="Culture",
            role="institution",
            country="Senegal",
            subregion="West Africa",
            sector="Administration",
            approval_status="approved",
            is_verified=True,
            has_paid=True,
            access_code="DEMO-ACCESS-2024"
        )
        db.add(mc_user)
        
        db.commit()
        print("[OK] Demo accounts created:")
        print("     - info@kolaconsulting.net / artconnect (Official)")
        print("     - admin@artconnect.africa / admin123 (Demo)")
        print("     - amara.diallo@artconnect.africa / password123")
        print("     - mc@artconnect.africa / institution123")
        
    except Exception as e:
        db.rollback()
        print("[ERROR] {}".format(e))
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
