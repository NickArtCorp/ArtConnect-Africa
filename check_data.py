import sqlite3
import os

db_path = 'backend/artconnect.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT country, COUNT(*) FROM users GROUP BY country")
    results = cursor.fetchall()
    print("Countries in DB:")
    for res in results:
        print(res)
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role IN ('personne_physique', 'personne_morale')")
    count = cursor.fetchone()[0]
    print(f"Total artists/professionals: {count}")
    
    conn.close()
