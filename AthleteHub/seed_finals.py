import pymysql

conn = pymysql.connect(host='localhost', user='root', password='connect', database='athletehub', charset='utf8mb4')
with conn.cursor() as cur:
    # 1. Update Match 1: Semi Final 1 -> Thunderbolts vs Warriors, Winner: Thunderbolts (athlete 3047)
    cur.execute("""
        UPDATE matches 
        SET winner_id = 3047, 
            status = 'COMPLETED',
            remarks = 'Semi-Final 1: Thunderbolts vs Warriors',
            venue = 'Main Indoor Basketball Court'
        WHERE id = 1
    """)

    # 2. Update Match 2: Semi Final 2 -> Red Dragons vs Blue Hawks, Winner: Blue Hawks (athlete 3048)
    cur.execute("""
        UPDATE matches 
        SET winner_id = 3048, 
            status = 'COMPLETED',
            remarks = 'Semi-Final 2: Red Dragons vs Blue Hawks',
            venue = 'Indoor Basketball Court 2'
        WHERE id = 2
    """)

    # 3. Check / Insert Championship Final
    cur.execute("SELECT id FROM matches WHERE tournament_id = 8 AND round = 'Championship Final'")
    final_match = cur.fetchone()
    if not final_match:
        cur.execute("""
            INSERT INTO matches (match_code, tournament_id, match_number, round, participant_one_id, participant_two_id, venue, match_date, start_time, end_time, status, remarks, previous_match_one_id, previous_match_two_id, created_at, updated_at, is_deleted)
            VALUES
            ('MTH000003', 8, 3, 'Championship Final', 3047, 3048, 'Center Stadium Court', '2026-10-22', '16:00:00', '18:00:00', 'SCHEDULED', 'Grand Championship Final: Thunderbolts vs Blue Hawks', 1, 2, NOW(), NOW(), 0)
        """)
        print("Created Championship Final match!")
    else:
        print("Final match exists:", final_match)
    
    conn.commit()

    cur.execute("SELECT id, match_code, round, venue, match_date, start_time, end_time, status, remarks, winner_id FROM matches WHERE tournament_id = 8")
    for m in cur.fetchall():
        print(m)

conn.close()
