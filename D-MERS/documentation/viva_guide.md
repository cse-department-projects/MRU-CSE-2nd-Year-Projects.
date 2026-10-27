# D-MERS: Viva & Technical Explanation Guide

This guide is specifically designed to help you confidently present the **Disaster Management and Emergency Response System (D-MERS)** to college faculty during your Application Development project evaluation.

---

## 1. Executive Summary & Core Objective

**Q: What is D-MERS and why was it built?**
> **A:** D-MERS is a centralized emergency response platform built in Java 17 and JavaFX. During natural and human-made disasters (floods, earthquakes, fires, cyclones, building collapses), communication delays between victims and rescue agencies lead to loss of lives. D-MERS bridges this gap by unifying Citizens, Rescue Teams, Volunteers, and Administrators onto a single real-time platform following a 6-stage lifecycle: **REPORT → PRIORITIZE → RESPOND → RESCUE → SHELTER → RECOVER**.

---

## 2. Technical Stack Justifications

### Q: Why did you choose Java for this project?
> **A:** Java 17+ provides strong object-oriented principles, type safety, multi-threading capability, and platform independence. Java handles the entire core business logic, validation, custom priority engines, volunteer matching algorithms, and data access objects (DAOs).

### Q: Why did you use JavaFX instead of standard Swing or Web UI?
> **A:** JavaFX provides a modern desktop application framework with CSS styling, resizable layouts, hardware-accelerated graphics, and rich data visualization charts (`PieChart`, `BarChart`, `Canvas`). It allows building a clean Light-themed desktop application with professional UI cards, status badges, and smooth navigation.

### Q: Why did you use Supabase & PostgreSQL?
> **A:** Supabase provides an enterprise-grade PostgreSQL database with REST API capabilities, built-in Authentication, Google OAuth integration, and Row Level Security (RLS). Furthermore, the application includes a seamless SQLite embedded fallback mechanism, ensuring 100% demo uptime even without internet access.

---

## 3. How the 5 Unique / Innovative Features Work

### 1. Smart Rescue Priority Engine (`com.disastermanagement.smart.PriorityEngine`)
* **Concept:** Emergency requests are prioritized dynamically rather than on a simple First-Come-First-Served (FCFS) queue.
* **Calculation Rules (0 to 100 Score):**
  1. **Base Severity:** Critical (+40), High (+30), Medium (+20), Low (+10)
  2. **Affected People:** ≥50 (+20), ≥20 (+15), ≥5 (+10), ≥1 (+5)
  3. **Immediate Assistance Required:** ≥10 (+15), ≥3 (+10), ≥1 (+5)
  4. **Medical Needs:** Trauma/Insulin/Surgery needed (+15)
  5. **Hazard Type Risk:** Fire/Collapse/Earthquake (+10), Flood/Cyclone (+8)
  6. **Elapsed Waiting Time Bonus:** +1 pt per 15 minutes of waiting time
* **Classification:** Score ≥ 80 → **CRITICAL**, ≥ 60 → **HIGH**, ≥ 40 → **MEDIUM**, < 40 → **LOW**.

### 2. Emergency Timeline Tracking System (`com.disastermanagement.model.EmergencyTimeline`)
* **Concept:** Chronological operation history logging for every rescue request.
* **Events Logged:** `CREATED` → `PRIORITY_CALCULATED` → `TEAM_ASSIGNED` → `ACCEPTED` → `IN_PROGRESS` (with field response notes) → `COMPLETED`.
* **Value:** Gives citizens peace of mind and provides admins with operational auditability.

### 3. Smart Volunteer Matching Engine (`com.disastermanagement.smart.VolunteerMatchingService`)
* **Concept:** Rule-based algorithm matching available volunteers to open disaster relief tasks.
* **Formula (0–100% Match):**
  * Skill Compatibility Match: **50%**
  * Availability Status (Available vs Busy): **30%**
  * Location Proximity Match: **20%**
* **Output:** Ranked list of recommended volunteers with match breakdown.

### 4. Shelter Capacity Intelligence (`com.disastermanagement.model.Shelter`)
* **Concept:** Real-time-style shelter capacity telemetry and resource filters.
* **Status Badging:**
  * 🟢 Green (**Available**, <70% occupied)
  * 🟡 Yellow (**Nearly Full**, 70–90% occupied)
  * 🔴 Red (**Full**, >90% occupied)
* **Calculated Capacity:** `Available Spaces = Max Capacity - Current Occupancy`. Instant filtering by Food, Water, and Medical facilities.

### 5. Unified Disaster Monitoring & Spatial Severity Grid (`com.disastermanagement.view.DisasterMapView`)
* **Concept:** Spatial canvas grid rendering live incident markers color-coded by severity level, shelter positions, and active rescue operations.
* **Value:** Gives command center administrators a clear visual overview of disaster density across sectors.

---

## 4. Demo Accounts for Faculty Presentation

| Role | Username / Email | Password | Primary Capabilities |
|---|---|---|---|
| **Citizen** | `citizen@demo.com` | `citizen123` | Report disasters, submit SOS, track timeline, find shelters |
| **Rescue Team** | `rescue@demo.com` | `rescue123` | Dispatch console, accept missions, log progress notes, complete rescues |
| **Volunteer** | `volunteer@demo.com` | `volunteer123` | View Smart Volunteer Matches, accept tasks, update availability |
| **Admin** | `admin@demo.com` | `admin123` | System charts, user management, assign teams, publish alerts, export CSV |
