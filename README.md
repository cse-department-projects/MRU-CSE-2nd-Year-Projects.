# 🏡 Smart Village Management System

A standalone desktop-friendly, responsive web application for rural village governance and citizen services. Built with **Java (Spring Boot)**, **HTML5 / CSS3 / JavaScript**, **Bootstrap 5**, and **MySQL**.

---

## 🌟 Key Features & Architecture

### 🔑 Dual Role Authentication
- **Role Selection Toggle**: Choose between **Citizen** or **Admin** role upon logging in.
- **Citizen Portal**: Complete suite of 10 pages for lodging grievances, applying for government schemes, tracking MANDI crop prices, requesting soil tests, checking utility schedules, and receiving urgent SOS notices.
- **Admin Portal**: Complete suite of 10 pages for managing citizen profiles, resolving grievances, approving scheme applications, updating Mandi prices, posting utility notices, broadcasting emergency alerts, and viewing graphical analytics reports.

---

## 📁 Page Map

### 👨‍🌾 Citizen Portal (10 Pages)
1. **Citizen Dashboard** (`/citizen/dashboard`): Stats overview, quick actions, active complaints summary, village news stream.
2. **My Profile** (`/citizen/profile`): View and update Aadhaar, Ration Card, Ward No, occupation, family member count, and contact info.
3. **Government & Rural Services** (`/citizen/services`): Rural scheme catalog (PM Solar Pump, Gramin Awas, Jal Jeevan, Pension, Sanitation) with modal application submission and history tracking.
4. **Report a Problem / Complaint** (`/citizen/complaints/new`): Lodge grievances with category, ward selection, priority urgency, location, and description.
5. **Complaints & Application Status** (`/citizen/status`): Track live status of submitted complaint tickets and scheme applications with official admin comments.
6. **Agriculture & Farming Services** (`/citizen/agriculture`): Live Mandi market MSP crop prices table, trend indicators, and soil health testing request form.
7. **Village News & Announcements** (`/citizen/news`): Searchable Gram Sabha meeting notices, health camp announcements, and category filters.
8. **Utility Services** (`/citizen/utilities`): Water connection status, power outage schedules, waste collection routes, and street maintenance notices.
9. **Emergency Contacts / Help** (`/citizen/emergency`): Direct helpline contacts directory (Sarpanch, Health Center, Police, Fire, Electricity) and active SOS alerts.
10. **Logout** (`/logout`): Secure session invalidation.

### 🛡️ Admin Portal (10 Pages)
1. **Admin Dashboard** (`/admin/dashboard`): Key governance KPIs, interactive Chart.js analytics for complaints and categories, recent activity list.
2. **Citizen Management** (`/admin/citizens`): Comprehensive citizen database, verification status, ward search, add new citizen record.
3. **Complaint Management** (`/admin/complaints`): Master grievance grid, filter by category/ward, assign field officers, update resolution status and remarks.
4. **Service / Application Management** (`/admin/applications`): Review government scheme applications, approve/reject with official sanction notes.
5. **Agriculture Management** (`/admin/agriculture`): Mandi crop price editor (add/update MSP prices), manage soil testing requests and lab reports.
6. **Utilities Management** (`/admin/utilities`): Post water supply schedules, power outage alerts, and waste collection routes.
7. **Village News & Announcements** (`/admin/news`): Publish new announcements and bulletins with priority levels (Normal, High, Urgent).
8. **Reports & Analytics** (`/admin/reports`): Graphical analytics charts, ward-wise performance summary matrix, print-ready report view.
9. **Emergency / Important Notices** (`/admin/emergency`): Broadcast urgent SOS warnings and manage emergency contacts directory.
10. **Logout** (`/logout`): Secure admin logout.

---

## 🔐 Quick Demo Login Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen` | `citizen123` | Ramesh Verma (Farmer, Ward 3) |
| **Citizen** | `sunita` | `pass123` | Sunita Sharma (Teacher, Ward 2) |
| **Admin** | `admin` | `admin123` | Gram Panchayat Administrator |

*(Note: Clicking the "Demo Citizen" or "Demo Admin" buttons on the login page auto-fills these credentials).*

---

## 🗄️ Database Setup (MySQL Integration - Active)

The application is pre-configured and connected directly to **MySQL**:

- **Database**: `smart_village_db`
- **Username**: `root`
- **Password**: `deepthi@379`
- **Port**: `3306`
- **JDBC URL**: `jdbc:mysql://localhost:3306/smart_village_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true`

### 📋 Audit & Step Tracking (Every Action Saved)
Every action taken by a student, citizen, or admin is automatically persisted to MySQL in the `activity_logs` table and displayed on the Admin Dashboard:
- **Citizen Registration**: Captures Full Name, Username, Phone, Email, Ward No, Aadhaar, Ration Card, Occupation, Household Members, Address.
- **Citizen Actions**: Login, Grievance / Complaint submission, Government Scheme applications, Soil Testing requests, Profile updates.
- **Admin Actions**: Citizen registration, Complaint resolution & remarks, Scheme approvals/rejections, Crop price updates, Utility schedules, Emergency alerts.

To view all stored data in MySQL:
```sql
USE smart_village_db;
SELECT * FROM users;
SELECT * FROM activity_logs;
SELECT * FROM complaints;
SELECT * FROM service_applications;
SELECT * FROM soil_test_requests;
```

---

## 🚀 How to Build and Run

### Prerequisites
- JDK 17 or Java 21+
- Apache Maven 3.6+

### Run Application
```bash
# Build the project
mvn clean compile

# Launch Spring Boot server
mvn spring-boot:run
```

Access the application in your browser at:
👉 **[http://localhost:8081](http://localhost:8081)**
