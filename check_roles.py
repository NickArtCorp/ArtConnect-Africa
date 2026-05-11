import sqlite3
import os

db_path = 'backend/artconnect.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT role FROM users")
    results = cursor.fetchall()
    print("Roles in DB:")
    for res in results:
        print(res)
    conn.close()
