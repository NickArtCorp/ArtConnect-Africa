"""
Migration script to add classification fields for professionals and media users:
- activity_sector: sector of activity specifically for professionals and media
- specialty: specific specialty within their field
- profession: job title or profession
"""
from sqlalchemy import Column, String, Integer
from database import engine, Base


def add_classification_columns():
    """
    Add new columns to the users table to support activity sector, specialty and profession
    for different user types (artists, professionals, media)
    """
    # Define the new columns to be added
    from sqlalchemy import text
    
    # Add the new columns to the users table
    with engine.connect() as conn:
        # Add activity_sector column for professionals and media
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN activity_sector VARCHAR"))
            print("Added activity_sector column to users table")
        except Exception as e:
