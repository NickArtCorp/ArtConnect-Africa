"""
Migration script to add partner_code column to users table
Run this once to update the database schema
"""

import sqlite3
from pathlib import Path

# Path to database
DB_PATH = Path(__file__).parent / 'artconnect.db'

def migrate():
    """Add partner_code column to users table if it doesn't exist"""
    
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'partner_code' in columns:
            print("✓ partner_code column already exists")
            conn.close()
            return True
        
        print("Adding partner_code column to users table...")
        
        # SQLite doesn't support adding UNIQUE constraints via ALTER TABLE
        # So we add the column without the unique constraint first
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN partner_code VARCHAR NULL DEFAULT NULL
        """)
        
        print("✓ partner_code column added")
        
        # Create index for faster lookups
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_partner_code 
            ON users(partner_code) WHERE partner_code IS NOT NULL
        """)
        
        print("✓ Unique index created for partner_code")
        
        conn.commit()
        print("✓ Migration completed successfully")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"✗ Database error: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    print("Starting database migration...")
    print(f"Database path: {DB_PATH}")
    
    if not DB_PATH.exists():
        print(f"✗ Database file not found at {DB_PATH}")
        print("Please make sure the database exists before running this migration")
        exit(1)
    
    if migrate():
        print("\n✓ Migration completed successfully!")
        exit(0)
    else:
        print("\n✗ Migration failed!")
        exit(1)
