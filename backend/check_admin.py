#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('artconnect.db')
cursor = conn.cursor()

# Check admin user status
cursor.execute('SELECT id, email, role, approval_status FROM users WHERE email = "info@kolaconsulting.net"')
row = cursor.fetchone()

if row:
    print(f'Admin user found:')
    print(f'  Email: {row[1]}')
    print(f'  Role: {row[2]}')
    print(f'  Approval Status: {row[3]}')
    
    # If not approved, update it
    if row[3] != 'approved':
        print(f'\nUpdating approval status to "approved"...')
        cursor.execute('UPDATE users SET approval_status = "approved" WHERE email = "info@kolaconsulting.net"')
        conn.commit()
        print('Done!')
else:
    print('Admin user not found')

conn.close()
