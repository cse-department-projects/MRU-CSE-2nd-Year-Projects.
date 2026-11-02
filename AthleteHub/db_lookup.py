import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="connect",
        database="athletehub",
        auth_plugin="mysql_native_password"
    )
    cursor = conn.cursor()
    
    print("=== Roles ===")
    cursor.execute("SELECT id, name FROM roles")
    for r in cursor.fetchall():
        print(f"Role ID: {r[0]}, Name: {r[1]}")
        
    print("\n=== Users ===")
    cursor.execute("SELECT id, email, role_id, full_name, status, password_hash FROM users")
    for u in cursor.fetchall():
        print(f"User ID: {u[0]}, Email: {u[1]}, Role ID: {u[2]}, Name: {u[3]}, Status: {u[4]}, HashPrefix: {u[5][:20] if u[5] else 'NONE'}")
        
    print("\n=== Organizations ===")
    cursor.execute("SELECT id, name, organization_code, status FROM organizations")
    for o in cursor.fetchall():
        print(f"Org ID: {o[0]}, Name: {o[1]}, Code: {o[2]}, Status: {o[3]}")

    print("\n=== Organization Types ===")
    cursor.execute("SELECT id, name FROM organization_types LIMIT 5")
    for ot in cursor.fetchall():
        print(f"Type ID: {ot[0]}, Name: {ot[1]}")
        
    print("\n=== Sports ===")
    cursor.execute("SELECT id, name FROM sports LIMIT 5")
    for s in cursor.fetchall():
        print(f"Sport ID: {s[0]}, Name: {s[1]}")

    print("\n=== Countries ===")
    cursor.execute("SELECT id, name, code FROM countries LIMIT 5")
    for c in cursor.fetchall():
        print(f"Country ID: {c[0]}, Name: {c[1]}, Code: {c[2]}")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
