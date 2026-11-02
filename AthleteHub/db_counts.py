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
    tables = [
        "roles", "users", "sports", "countries", "organization_types",
        "organizations", "athletes", "coaches", "events", "tournaments"
    ]
    print("Row counts in tables:")
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM `{t}`")
            count = cursor.fetchone()[0]
            print(f"- {t}: {count}")
        except Exception as ex:
            print(f"- {t}: Error: {ex}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
