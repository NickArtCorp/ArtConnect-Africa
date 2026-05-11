#!/usr/bin/env python3
"""
Script pour creer ou mettre a jour l'admin user
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

def setup_admin_user():
    """Cree ou met a jour l'admin user"""
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        admin_email = "info@kolaconsulting.net"
        admin_password = "artconnect"
        
        # Verifier si l'admin existe deja
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if admin:
            print(f"[INFO] Admin user existe deja: {admin.email}")
            update_confirmation = input("Voulez-vous mettre a jour le mot de passe? (OUI/NON): ").strip().upper()
            
            if update_confirmation == "OUI":
                admin.password = hash_password(admin_password)
                db.commit()
                print(f"[OK] Mot de passe mis a jour pour {admin.email}")
            else:
                print(f"[INFO] Pas de changement.")
        else:
            # Creer l'admin user
            admin_id = str(uuid.uuid4())
            new_admin = User(
                id=admin_id,
                email=admin_email,
                password=hash_password(admin_password),
                first_name="ArtConnectAfrica",
                last_name="Admin",
                country="Senegal",
                subregion="West Africa",
                gender="Male",
                sector="Administration",
                domain="Management",
                year_started=2020,
                bio="Admin account for ArtConnect Africa",
                avatar="",
                role="admin",
                is_verified=True,
                approval_status="approved"  # Admin is already approved
            )
            
            db.add(new_admin)
            db.commit()
            print("[OK] Admin user cree avec succes!")
            print(f"    Email: {admin_email}")
            print(f"    Nom: ArtConnectAfrica Admin")
            print(f"    Mot de passe: {admin_password}")
            print(f"    Role: admin")
            print(f"    Statut: approved")
        
    except Exception as e:
        db.rollback()
        print(f"[ERREUR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("CREATION/MISE A JOUR DE L'ADMIN USER")
    print("=" * 60)
    print("\n")
    setup_admin_user()
    print("\n" + "=" * 60)
