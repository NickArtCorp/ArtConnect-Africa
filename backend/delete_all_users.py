#!/usr/bin/env python3
"""
Script pour supprimer tous les utilisateurs de la base de données
** ATTENTION: Cette opération est irréversible! **
"""

import sys
from pathlib import Path
from datetime import datetime

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from server import User, SessionLocal, engine, Base

def delete_all_users():
    """Supprime tous les utilisateurs SAUF l'admin"""
    
    db = SessionLocal()
    
    try:
        # Admin email a exclure
        admin_email = "info@kolaconsulting.net"
        
        # Compter les utilisateurs a supprimer (exclut l'admin)
        user_count = db.query(User).filter(User.email != admin_email).count()
        
        if user_count == 0:
            print("[INFO] Aucun utilisateur a supprimer (l'admin est conserve).")
            return
        
        print(f"[ATTENTION] Vous etes sur le point de supprimer {user_count} utilisateur(s).")
        print(f"[INFO] L'admin ({admin_email}) sera conserve.")
        confirmation = input("Tapez 'OUI' pour confirmer la suppression: ").strip().upper()
        
        if confirmation != "OUI":
            print("[ANNULE] Suppression annulee.")
            return
        
        # Supprimer tous les utilisateurs SAUF l'admin
        db.query(User).filter(User.email != admin_email).delete()
        db.commit()
        
        print(f"[OK] {user_count} utilisateur(s) ont ete supprimes avec succes.")
        
        # Verifier les utilisateurs restants
        remaining = db.query(User).count()
        admin_user = db.query(User).filter(User.email == admin_email).first()
        
        print(f"[INFO] Utilisateurs restants: {remaining}")
        if admin_user:
            print(f"[INFO] Admin conserve: {admin_user.email} - {admin_user.first_name} {admin_user.last_name}")
        
    except Exception as e:
        db.rollback()
        print(f"[ERREUR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("SUPPRESSION DE TOUS LES UTILISATEURS")
    print("=" * 60)
    print("\n")
    delete_all_users()
    print("\n" + "=" * 60)
