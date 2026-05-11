
import requests
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def test_login(email, password):
    url = "http://localhost:8000/api/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Login attempt for {email}:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    # Test with admin credentials found in reset_db.py
    test_login("admin@artconnect.africa", "admin123")
    
    # Test with artist credentials
    test_login("amara.diallo@artconnect.africa", "password123")
