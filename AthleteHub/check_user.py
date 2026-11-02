import pymysql

conn = pymysql.connect(host='localhost', user='root', password='connect', database='athletehub', charset='utf8mb4')
with conn.cursor() as cur:
    cur.execute("SELECT id, full_name, email, role_id, status, is_verified, organization_id, password_hash FROM users WHERE id=635 OR email='MRU_ORG@gmail.com'")
    rows = cur.fetchall()
    print("Found rows:", len(rows))
    for r in rows:
        print(f"ID: {r[0]}, Name: {r[1]}, Email: {r[2]}, RoleID: {r[3]}, Status: {r[4]}, Verified: {r[5]}, OrgID: {r[6]}, Hash: {r[7][:25]}")
conn.close()
