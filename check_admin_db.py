
import sys
from pathlib import Path
import hashlib
from sqlalchemy import create_engine, text

# Path to database
DB_PATH = Path('backend/artconnect.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def check_admin():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, password, role, approval_status FROM users WHERE email = 'admin@artconnect.africa'"))
        user = result.fetchone()
        
        if not user:
            print("Admin user not found!")
            return
        
        email, db_password, role, approval_status = user
        print(f"User: {email}")
        print(f"Role: {role}")
        print(f"Approval Status: {approval_status}")
        print(f"Password in DB: {db_password}")
        
        expected_password = hash_password('artconnect')
        print(f"Expected hash for 'artconnect': {expected_password}")
        
        if db_password == expected_password:
            print("Password hash matches!")
        else:
            print("Password hash DOES NOT match!")

if __name__ == "__main__":
    check_admin()
