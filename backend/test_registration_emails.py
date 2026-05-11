#!/usr/bin/env python3
"""
Script de test pour vérifier que l'inscription envoie les emails
"""

import requests
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "TestPassword123!"

print("=" * 60)
print("TEST: INSCRIPTION + ENVOI D'EMAILS")
print("=" * 60)

print(f"\n📧 Email de test: {TEST_EMAIL}")
print(f"🔐 Mot de passe: {TEST_PASSWORD}")

# Étape 1: Essayer de s'inscrire
print("\n1️⃣  INSCRIPTION...")
register_data = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "first_name": "Test",
    "last_name": "User",
    "role": "artist",
    "country": "Senegal",
    "subregion": "West Africa",
    "gender": "Male",
    "sector": "Art",
    "domain": "Painting",
    "year_started": 2020,
    "profile_tag": "artist"
}

try:
    response = requests.post(
        f"{BACKEND_URL}/api/auth/register",
        json=register_data,
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ INSCRIPTION RÉUSSIE")
        print(f"   ID utilisateur: {result['user']['id']}")
        print(f"   Email: {result['user']['email']}")
        print(f"   Statut approbation: {result['user'].get('approval_status', 'N/A')}")
        
        print("\n✉️  Les emails devraient avoir été envoyés:")
        print(f"   ✓ À l'utilisateur ({TEST_EMAIL}): Inscription en attente d'approbation")
        print(f"   ✓ À l'admin (info@kolaconsulting.net): Nouvel utilisateur à approuver")
        
        print("\n📋 Prochaines étapes:")
        print(f"   1. Vérifiez votre email {TEST_EMAIL} (boîte INBOX ou SPAM)")
        print(f"   2. Vérifiez info@kolaconsulting.net pour le notification admin")
        print(f"   3. Allez sur https://www.brevo.com → Contacts → Journaux")
        print(f"   4. Vous devriez voir 2 emails envoyés avec succès")
        
    else:
        print(f"❌ ERREUR: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ ERREUR: Impossible de se connecter au serveur backend")
    print(f"   Vérifiez que le serveur tourne sur {BACKEND_URL}")
except Exception as e:
    print(f"❌ ERREUR: {e}")

print("\n" + "=" * 60)
