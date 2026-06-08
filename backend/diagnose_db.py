#!/usr/bin/env python3
"""
Database Diagnostic Script
Helps identify database connection and table issues
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

def diagnose():
    from database import DATABASE_URL, engine
    from sqlalchemy import inspect, text
    
    print("\n" + "="*60)
    print("🔍 DATABASE DIAGNOSTIC REPORT")
    print("="*60 + "\n")
    
    # 1. Check DATABASE_URL
    print("📍 DATABASE CONFIGURATION:")
    print("-" * 60)
    if DATABASE_URL:
        # Hide credentials
        masked_url = DATABASE_URL.replace(DATABASE_URL.split("@")[0].split("://")[1] if "@" in DATABASE_URL else "", "***:***")
        print(f"✅ DATABASE_URL is SET")
        print(f"   Type: PostgreSQL")
        print(f"   URL (masked): {masked_url[:60]}...")
    else:
        print(f"⚠️  DATABASE_URL is NOT SET")
        print(f"   Using: SQLite (Local Development)")
        print(f"   File: {Path(__file__).parent}/artconnect.db")
    
    print("\n")
    
    # 2. Try to connect
    print("🔌 CONNECTION TEST:")
    print("-" * 60)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"✅ Database connection: SUCCESS")
    except Exception as e:
        print(f"❌ Database connection: FAILED")
        print(f"   Error: {str(e)}")
        return False
    
    print("\n")
    
    # 3. Check existing tables
    print("📋 EXISTING TABLES:")
    print("-" * 60)
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            "users", "posts", "likes", "comments", "messages", 
            "projects", "visitor_views", "statistics_cache", "news"
        ]
        
        for table in expected_tables:
            if table in tables:
                column_count = len(inspector.get_columns(table))
                print(f"✅ {table:<20} ({column_count} columns)")
            else:
                print(f"❌ {table:<20} (missing)")
        
        print(f"\nTotal tables found: {len(tables)}")
        
    except Exception as e:
        print(f"❌ Could not inspect tables: {str(e)}")
        return False
    
    print("\n")
    
    # 4. Recommendations
    print("💡 RECOMMENDATIONS:")
    print("-" * 60)
    
    if not DATABASE_URL:
        print("⚠️  PRODUCTION ISSUE DETECTED:")
        print("   → DATABASE_URL is not set on Northflank")
        print("   → Your app is using SQLite instead of PostgreSQL")
        print("")
        print("   FIX:")
        print("   1. Go to Northflank Dashboard → Your Service")
        print("   2. Add PostgreSQL Addon (if not already done)")
        print("   3. Copy the Connection String")
        print("   4. Set environment variable DATABASE_URL")
        print("   5. Redeploy the application")
    else:
        print("✅ DATABASE_URL is properly configured")
        print("   → PostgreSQL connection should work")
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    try:
        success = diagnose()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Diagnostic failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
