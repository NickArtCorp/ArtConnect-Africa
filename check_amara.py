import sqlite3
import os

db_path = 'backend/artconnect.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT email, role, profile_tag FROM users WHERE email='amara.diallo@artconnect.africa'")
    res = cursor.fetchone()
    print(res)
    conn.close()
