
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Path to database
DB_PATH = Path('backend/artconnect.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

def list_users():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, role, approval_status FROM users"))
        users = result.fetchall()
        
        if not users:
            print("No users found in database!")
            return
        
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"Email: {user[0]}, Role: {user[1]}, Status: {user[2]}")

if __name__ == "__main__":
    list_users()
