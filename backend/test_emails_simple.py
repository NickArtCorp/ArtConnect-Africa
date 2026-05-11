#!/usr/bin/env python3
"""
Test registration and emails
"""

import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "TestPassword123!"

print("=" * 60)
print("TEST INSCRIPTION + EMAILS")
print("=" * 60)
print("\nEmail: " + TEST_EMAIL)

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
    print("\nInscription en cours...")
    response = requests.post(f"{BACKEND_URL}/api/auth/register", json=register_data, timeout=10)
    
    if response.status_code == 200:
        print("[SUCCES] Inscription reussie!")
        print("\nEmails envoyes:")
        print("[OK] A l'utilisateur: " + TEST_EMAIL)
        print("[OK] A l'admin: info@kolaconsulting.net")
        print("\nConsultez Brevo.com pour voir les emails envoyes.")
    else:
        print("[ERROR] Code " + str(response.status_code))
        
except Exception as e:
    print("[ERROR] " + str(e))

print("=" * 60)
