#!/usr/bin/env python3
"""
Migration script to add 'phone' and 'address' columns to the users table.
This script adds support for phone numbers and addresses for all user types.
"""

import sqlite3
from pathlib import Path

# Setup paths
ROOT_DIR = Path(__file__).parent
DATABASE_URL = f"sqlite:///{ROOT_DIR}/artconnect.db"
DB_PATH = str(ROOT_DIR / "artconnect.db")

def migrate():
    """Add phone and address columns to users table if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get the current table schema
        cursor.execute("PRAGMA table_info(users)")
        columns = {row[1]: row for row in cursor.fetchall()}
        
        # Check if columns already exist
        needs_phone = 'phone' not in columns
        needs_address = 'address' not in columns
        
        if needs_phone:
            print("Adding 'phone' column...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20) NULL DEFAULT NULL
            """)
            print("✓ 'phone' column added successfully")
        else:
            print("• 'phone' column already exists")
        
        if needs_address:
            print("Adding 'address' column...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN address TEXT NULL DEFAULT NULL
            """)
            print("✓ 'address' column added successfully")
        else:
            print("• 'address' column already exists")
        
        if needs_phone or needs_address:
            conn.commit()
            print("\n✓ Migration completed successfully!")
        else:
            print("\n• No migration needed - columns already exist")
        
    except sqlite3.OperationalError as e:
        print(f"✗ Migration error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting migration: adding phone and address columns...\n")
    migrate()
    print("\nMigration script finished.")
