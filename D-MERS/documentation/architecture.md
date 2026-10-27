# D-MERS Architecture & Database Documentation

## System Architecture

```
[ JavaFX Desktop Client (Light Theme UI) ]
   ├── Views & Dashboards (Landing, ProfileSetup, Citizen, RescueTeam, Volunteer, Admin)
   ├── Controllers & Custom Components (HeaderBar, Sidebar, StatCard, StatusBadge)
   └── Smart Decision Engines (PriorityEngine, VolunteerMatchingService)
                │
                ▼
[ Java Service & DAO Layer ]
   ├── AuthService, DisasterService, RescueService, ShelterService, ExportService
   └── UserDAO, DisasterReportDAO, RescueRequestDAO, ShelterDAO, TimelineDAO, etc.
                │
                ▼
[ Data Access Layer & Fallback Controller ]
   ├── Primary: Supabase REST API & PostgreSQL Connection (JDBC Driver)
   └── Fallback: Embedded SQLite Database (Auto-initialized out-of-the-box)
```

## Database Tables & Schema Summary

1. `users`: Stores account credentials (salted SHA-256 hashes), email, phone, location, profile completion flag, and role (`ADMIN`, `CITIZEN`, `RESCUE_TEAM`, `VOLUNTEER`).
2. `disaster_reports`: Stores disaster type, location, severity, affected people count, immediate help count, priority score, description, photo path, and status.
3. `rescue_requests`: Stores emergency location, emergency type, people trapped, medical assistance requirement flag, priority score (0-100), status workflow (`PENDING`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`), and assigned team.
4. `rescue_teams`: Stores team name, leader name, contact number, specialization, and active status.
5. `volunteers`: Stores phone, email, primary skill, availability status (`AVAILABLE`, `BUSY`, `UNAVAILABLE`), and location.
6. `volunteer_tasks`: Stores task title, description, location, required skill, assigned volunteer, and status (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`).
7. `shelters`: Stores shelter name, location, max capacity, current occupancy, available spaces (computed), facilities flags (food, water, medical), and contact phone.
8. `missing_persons`: Stores reported missing person details, age, gender, last seen location, date, description, photo path, and status (`MISSING`, `FOUND`).
9. `emergency_alerts`: Stores title, message, disaster type, severity, and active flag for live broadcast.
10. `emergency_timeline`: Stores chronological event history logs (`CREATED`, `PRIORITY_CALCULATED`, `TEAM_ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`) for every rescue request.
11. `notifications`: In-app notification center logs with unread badge counter.
12. `emergency_contacts`: Official emergency helpline numbers (Police, Fire, Ambulance, Disaster Mgmt HQ).
