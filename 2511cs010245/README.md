# Vehicle Management & Tracking System (VMTS)

Full-stack project: **React frontend → REST API → Java Spring Boot → MySQL**.

```text
/            React + TanStack Router frontend
/backend     Spring Boot 3.3 (Java 17) REST API + MySQL
```

## Running the project

### 1. Database

Create the schema once (tables are generated automatically by Hibernate):

```sql
CREATE DATABASE vmts_db;
```

### 2. Backend (port 8081)

```bash
cd backend
# copy .env.example and export the values, or set them in your IDE run config
mvn spring-boot:run
```

No MySQL installed yet? Run against an in-memory database instead:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

Environment variables (see `backend/.env.example`): `SERVER_PORT`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MINUTES`,
`CORS_ALLOWED_ORIGINS`, `SEED_DEMO_DATA`.

On the first start with an empty database the demo fleet (7 vehicles, 7 drivers,
12 service records, locations, audit history) and both accounts are inserted automatically.

### 3. Frontend (port 8080)

```bash
npm install
npm run dev
```

Point the app at the API with a `.env` file (see `.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:8081
```

### Demo accounts

| Role   | Email            | Password   |
| ------ | ---------------- | ---------- |
| Admin  | admin@vmts.com   | admin123   |
| Driver | driver@vmts.com  | driver123  |

### REST API

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |
| GET | `/api/health` | public |
| GET/POST/PUT/DELETE | `/api/vehicles`, `/api/vehicles/{id}` | admin |
| GET | `/api/vehicles/{id}/services` | admin |
| GET/POST/PUT/DELETE | `/api/drivers`, `/api/drivers/{id}` | admin |
| GET/POST/PUT/DELETE | `/api/services`, `/api/services/{id}` | admin |
| GET/PUT | `/api/locations`, `/api/locations/{vehicleId}` | authenticated |
| GET | `/api/audit-logs` | admin |
| GET | `/api/dashboard/stats` | admin |
| GET | `/api/driver/vehicle`, `/api/driver/services` | driver |
| PUT | `/api/driver/vehicle/status` | driver |
| POST | `/api/driver/vehicle/start` | driver |

Authentication is stateless JWT: the token is returned by `/api/auth/login` and sent
as `Authorization: Bearer <token>` on every later request.

---

# Original frontend specification (kept for reference)

Build a **frontend-only React application** for a college project called **Vehicle Management & Tracking System (VMTS)**.

## 1. Project Context

This is a **college-level Vehicle Management & Tracking System** intended to manage:

* Vehicles
* Drivers
* Administrators
* Maintenance/service records
* Vehicle location information
* Driver vehicle activity
* Audit records

The application is an **internal management and tracking application**, not a commercial SaaS product and not a marketing website.

The primary goal at this stage is to create a **complete, polished, realistic frontend UI and user flow** that can be shown to a college project coordinator for validation.

### IMPORTANT DEVELOPMENT ORDER

The project will be developed in this exact order:

**Frontend UI → Coordinator Validation → UI Corrections → UI Approval/Frozen Design → Spring Boot Backend → MySQL Database → REST API Integration**

Therefore:

### DO NOT BUILD THE BACKEND OR DATABASE AT THIS STAGE.

Do not create Spring Boot code.

Do not create MySQL schemas.

Do not create a Node/Express backend.

Do not connect Supabase, Firebase, or any external database.

Do not implement real authentication.

Do not create real API calls.

Use **realistic mock data/local JavaScript data** so that all screens and user flows can be demonstrated.

The frontend must, however, be structured cleanly so that the mock data can later be replaced with REST API calls from a **Java Spring Boot backend** without redesigning the UI.

---

# 2. Technology

Use:

* React
* JavaScript
* HTML
* CSS
* React Router
* Component-based architecture
* Local/mock data

Use a clean, modern React project structure.

Avoid unnecessary libraries and dependencies.

The eventual backend will be:

**Java + Spring Boot**

The eventual database will be:

**MySQL**

The eventual communication layer will be:

**RESTful APIs**

Design the frontend with this future architecture in mind.

---

# 3. Design Philosophy

The UI must be:

* Minimal
* Professional
* Formal
* User-oriented
* Practical
* Accessible
* Responsive
* Easy to understand
* Easy to navigate
* Information-focused
* Appropriate for a vehicle management and tracking application

The application should feel like a **real internal fleet/vehicle management and tracking system used by an organization**, not a student dashboard template.

## VERY IMPORTANT

**Do NOT over-design the application.**

The purpose is management, tracking, and usability — not visual decoration.

Avoid:

* Excessive gradients
* Glassmorphism
* Neon colors
* Excessive shadows
* Excessive rounded cards
* Huge decorative illustrations
* 3D vehicle graphics
* Unnecessary animations
* Excessive motion
* Marketing-style hero sections
* Landing-page aesthetics
* Oversized typography
* Decorative elements that don't provide functional value
* Excessive charts
* Fake AI features
* Unnecessary widgets
* Excessive colors

The design should prioritize:

**Clarity → Hierarchy → Usability → Accessibility → Efficiency**

Think of the visual language of a professional **administrative/fleet-management system**.

---

# 4. Visual Style

Use a restrained professional visual system.

### Colors

Prefer:

* White/light neutral backgrounds
* Dark charcoal/navy text
* One restrained primary accent color
* Subtle borders
* Neutral secondary surfaces
* Clear semantic colors for status

Use colors consistently.

For example:

* Green → Active / Completed / Healthy
* Amber → Due Soon / Warning
* Red → Overdue / Error / Critical
* Neutral → Inactive / Draft

Do not use bright colors merely for decoration.

### Typography

Use a clean, highly readable sans-serif font.

Prioritize:

* Readability
* Clear hierarchy
* Consistent font sizes
* Comfortable line height

Do not use decorative fonts.

### Components

Use consistent:

* Buttons
* Inputs
* Selects
* Tables
* Cards
* Badges
* Modals
* Alerts
* Navigation
* Form layouts

Keep border radius moderate and professional.

---

# 5. Application Layout

Use a professional administrative layout.

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ VMTS / Vehicle Management & Tracking System     User ▼     │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│ Dashboard      │                                            │
│ Vehicles       │              Main Content                   │
│ Drivers        │                                            │
│ Services       │                                            │
│ Locations      │                                            │
│ Audit Trail    │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

### Sidebar

Navigation:

* Dashboard
* Vehicles
* Drivers
* Services
* Locations
* Audit Trail

For drivers, show a simplified navigation appropriate to their role.

### Header

Include:

* VMTS branding
* Current page
* User name
* User role
* Logout action

Keep the header clean.

---

# 6. User Roles

There are two primary roles.

## ADMIN

Admins can:

* View dashboard
* View drivers
* Create drivers
* Edit drivers
* Delete drivers
* View vehicles
* Create vehicles
* Edit vehicles
* Delete vehicles
* View service records
* View service due-date alerts
* View vehicle locations
* View audit trail

## DRIVER

Drivers can:

* Log in
* View their driver dashboard
* View assigned vehicle
* Update vehicle-related inputs
* Enter vehicle start timestamp
* View basic vehicle information
* View basic vehicle status

Drivers should **NOT** see administrative CRUD functionality.

---

# 7. Required Pages

Create the following pages.

## 7.1 Admin Login

Create a formal login page.

Fields:

* Email
* Password

Actions:

* Login
* Show/hide password

Include:

* VMTS branding
* Clear error state
* Basic validation
* Accessible labels

Use mock authentication.

Example credentials:

```text
Admin:
admin@vmts.com
Password:
admin123

Driver:
driver@vmts.com
Password:
driver123
```

These are mock credentials only.

Do not implement real security at this stage.

---

# 8. Admin Dashboard

This is the most important page.

Create a professional dashboard showing an overview of the **Vehicle Management & Tracking System**.

Include compact summary cards:

### Total Vehicles

```text
42
```

### Active Drivers

```text
28
```

### Services Due Soon

```text
5
```

### Overdue Services

```text
2
```

Keep these cards compact.

Do not make them unnecessarily large.

---

## Service Due Alerts

Include a clear table:

| Vehicle    | Service          | Due Date     | Status    |
| ---------- | ---------------- | ------------ | --------- |
| TS09AB1234 | Oil Change       | Aug 10, 2026 | Due Soon  |
| TS09CD4567 | General Service  | Aug 14, 2026 | Scheduled |
| TS09EF7890 | Brake Inspection | Aug 05, 2026 | Overdue   |

Use professional status badges.

The dashboard should make important problems immediately visible.

---

## Recent Activity

Include a small recent activity section.

Example:

```text
Admin created vehicle
5 minutes ago

Driver updated vehicle
18 minutes ago

Admin updated driver
32 minutes ago
```

This prepares the UI for the future audit-trail functionality.

---

# 9. Vehicles Page

Create a professional vehicle-management page.

Include:

* Page title
* Search
* Filters
* Add Vehicle button
* Vehicle table

Table columns:

* Registration Number
* Model
* Manufacturer
* Year
* Assigned Driver
* Status
* Last Updated
* Actions

Actions:

* View
* Edit
* Delete

Use a confirmation modal before deletion.

---

# 10. Vehicle Details Page

Show detailed information about one vehicle.

### Vehicle Information

* Registration number
* Manufacturer
* Model
* Year
* Vehicle status

### Driver Information

* Driver name
* License number
* Contact information

### Service Information

* Last service date
* Next service date
* Service status

### Location

Show:

* Current latitude
* Current longitude
* Last updated timestamp

Include a professional map area.

The map does not need real GPS functionality at this stage.

---

# 11. Add/Edit Vehicle

Create a professional form.

Fields:

* Registration Number
* Manufacturer
* Model
* Year
* Assigned Driver
* Status

Validation:

* Registration number required
* Manufacturer required
* Model required
* Year must be valid
* Driver selection should be valid
* Status required

Show clear validation messages.

---

# 12. Drivers Page

Create a driver-management page.

Include:

* Search
* Status filter
* Add Driver button
* Driver table

Columns:

* Driver Name
* License Number
* Phone
* Email
* Assigned Vehicle
* Status
* Created Date
* Actions

Actions:

* View
* Edit
* Delete

Use confirmation before deletion.

---

# 13. Driver Details

Show:

### Personal Information

* Name
* Email
* Phone

### License Information

* License number
* License status

### Vehicle Assignment

* Assigned vehicle
* Registration number
* Vehicle status

### Account Information

* Account status
* Created date
* Last activity

Keep the layout clean and readable.

---

# 14. Add/Edit Driver

Fields:

* Name
* Email
* Phone
* License Number
* Assigned Vehicle
* Status
* Password for new driver

Basic validation:

* Name required
* Valid email
* Phone required
* License number required
* Status required

Do not implement actual password security at this stage.

---

# 15. Services / Maintenance Page

Create a service-management page.

Include:

* Search
* Vehicle filter
* Service status filter
* Add Service button
* Service table

Columns:

* Vehicle
* Service Type
* Service Date
* Next Service Date
* Description
* Status
* Actions

Service statuses:

* Scheduled
* Completed
* Due Soon
* Overdue

Make overdue services visually obvious but still professional.

---

# 16. Service Details

Show:

* Vehicle
* Service type
* Service date
* Next service date
* Description
* Status
* Created date
* Last updated

Include edit functionality.

---

# 17. Location Tracking Page

Create a **basic vehicle location tracking interface**.

Location tracking is a core part of the project name and should feel like a proper module, while remaining an MVP simulation.

Show:

* Vehicle selector
* Current coordinates
* Last updated timestamp
* Map area
* Vehicle marker
* Vehicle status

Example coordinates:

```text
Latitude: 17.3850
Longitude: 78.4867
```

Use simulated/mock coordinates.

If a lightweight map library is convenient, use one.

Otherwise create a professional map placeholder.

Example:

```text
┌────────────────────────────────────────────┐
│ Vehicle Location                            │
│                                             │
│              [ MAP AREA ]                   │
│                                             │
│                  ● Vehicle                  │
│                                             │
└────────────────────────────────────────────┘

Vehicle:
TS09AB1234

Latitude:
17.3850

Longitude:
78.4867

Last Updated:
08 Aug 2026, 10:30 PM
```

Do not attempt real-time GPS tracking.

The future Spring Boot backend will expose REST endpoints for location data.

---

# 18. Driver Dashboard

Create a separate dashboard for drivers.

Show:

```text
Welcome, Driver

Assigned Vehicle
----------------
Registration: TS09AB1234
Model: Swift
Status: Active
```

Include:

### Vehicle Start

Field:

* Start timestamp

Button:

**Start Vehicle**

After submitting, show:

```text
Vehicle started successfully.
```

Also show:

* Last start time
* Current vehicle status

This should be a simple and clear workflow.

---

# 19. Driver Vehicle Update

Drivers should be able to update relevant vehicle inputs.

For the MVP include:

* Start timestamp
* Vehicle status
* Optional remarks

Do not expose admin-only fields.

The UI should make it obvious which fields the driver is allowed to modify.

---

# 20. Audit Trail Page

Create an audit trail interface.

Display:

| User   | Role   | Action          | Entity  | Timestamp |
| ------ | ------ | --------------- | ------- | --------- |
| Admin  | Admin  | Created         | Vehicle | 10:20 AM  |
| Admin  | Admin  | Updated         | Driver  | 10:25 AM  |
| Driver | Driver | Started Vehicle | Vehicle | 10:31 AM  |

Include:

* Search
* Action filter
* Role filter
* Date filter

This is currently mock data.

The future Spring Boot backend will store these actions in an `audit_logs` table.

---

# 21. CRUD Interaction

All CRUD interfaces should work visually using mock/local data.

Example:

```text
Create Vehicle
      ↓
Form
      ↓
Validation
      ↓
Add to mock data
      ↓
Updated vehicle table
```

Similarly:

* Edit
* Delete
* Search
* Filter
* View Details

should work on the frontend.

Do not simply create static screenshots.

Make the prototype genuinely interactive.

---

# 22. Mock Data

Create realistic mock data for:

* Admins
* Drivers
* Vehicles
* Services
* Locations
* Audit logs

Use Indian-style vehicle registration numbers and realistic names/data.

Example vehicle registrations:

```text
TS09AB1234
TS08CD4521
AP09EF7821
TS10GH9034
```

Approximately:

* 5–10 vehicles
* 5–10 drivers
* 8–15 service records
* 10–15 audit records

are sufficient.

Do not overload the prototype with hundreds of records.

---

# 23. Accessibility

Accessibility is important.

Implement:

* Proper labels for inputs
* Keyboard-friendly navigation
* Visible focus states
* Good color contrast
* Meaningful button labels
* Accessible form errors
* Do not rely only on color to communicate status
* Responsive layout
* Reasonable font sizes

---

# 24. Responsive Design

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop is the primary target because this is a management system.

On smaller screens:

* Sidebar should collapse appropriately
* Tables should remain usable
* Forms should stack
* Cards should resize
* Navigation should remain accessible

Do not simply shrink everything.

Adapt the layout properly.

---

# 25. Component Architecture

Create reusable components such as:

```text
Sidebar
Header
PageHeader
SummaryCard
DataTable
StatusBadge
SearchBar
FilterBar
Modal
ConfirmDialog
FormInput
FormSelect
AlertCard
EmptyState
LoadingState
ErrorState
```

Do not duplicate the same UI code unnecessarily.

---

# 26. Suggested React Structure

Use a structure similar to:

```text
src/
│
├── assets/
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── MainLayout.jsx
│   │
│   ├── common/
│   │   ├── DataTable.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Modal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── SummaryCard.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── Vehicles.jsx
│   ├── VehicleDetails.jsx
│   ├── Drivers.jsx
│   ├── DriverDetails.jsx
│   ├── Services.jsx
│   ├── LocationTracking.jsx
│   ├── AuditTrail.jsx
│   └── DriverDashboard.jsx
│
├── data/
│   └── mockData.js
│
├── routes/
│
├── App.jsx
├── main.jsx
└── index.css
```

Keep the code organized and understandable.

---

# 27. Future Backend Compatibility

Although this version is frontend-only, design the data structures as if they will later come from REST APIs.

Future API examples:

```text
POST   /api/auth/login

GET    /api/admins
POST   /api/admins
GET    /api/admins/{id}
PUT    /api/admins/{id}
DELETE /api/admins/{id}

GET    /api/drivers
POST   /api/drivers
GET    /api/drivers/{id}
PUT    /api/drivers/{id}
DELETE /api/drivers/{id}

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/{id}
PUT    /api/vehicles/{id}
DELETE /api/vehicles/{id}

GET    /api/services
POST   /api/services
PUT    /api/services/{id}
DELETE /api/services/{id}

GET    /api/vehicles/{vehicleId}/location
POST   /api/vehicles/{vehicleId}/location

GET    /api/audit-logs
```

Do not implement these APIs now.

Just ensure the frontend architecture can consume them later.

---

# 28. Future Database

The eventual MySQL database is expected to contain approximately:

```text
admins
drivers
vehicles
services
locations
audit_logs
```

Expected relationships:

```text
Driver
   │
   └──── assigned to ──── Vehicle
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Services           Locations
```

The frontend should reflect these relationships logically.

---

# 29. MVP Scope

The MVP must cover these core features:

### 1. Admin Dashboard

Lists and details for:

* Admins
* Drivers
* Vehicles
* Services

with service due-date alerts.

### 2. Driver Login

Driver can log in and update vehicle-related inputs, including start timestamp.

### 3. Vehicle Location Tracking

Basic map/coordinate interface with simulated coordinates.

### 4. Vehicle and Driver CRUD

Create, read, update, delete with basic validation.

### 5. Audit Trail

Display action timestamps and user actions.

---

# 30. What NOT to Build Yet

Do not add:

* Real GPS tracking
* Payment systems
* SMS notifications
* Email services
* Advanced analytics
* AI features
* Predictive maintenance
* Complex role/permission systems
* Enterprise authentication
* Microservices
* Docker infrastructure
* Cloud deployment
* Real-time WebSockets
* Complex reporting
* Fuel optimization algorithms
* Unnecessary third-party integrations

These can be considered future enhancements.

---

# 31. UX Requirements

Every major action should provide feedback.

After creating a vehicle:

```text
Vehicle created successfully.
```

After editing:

```text
Vehicle details updated successfully.
```

Before deletion:

```text
Are you sure you want to delete this vehicle?
This action cannot be undone.
```

For invalid forms:

```text
Registration number is required.
```

For empty data:

```text
No vehicles found.
```

For loading:

```text
Loading vehicles...
```

For errors:

```text
Unable to load vehicle information.
```

Use professional, concise wording.

---

# 32. Navigation / User Flow

## Admin

```text
Login
  ↓
Admin Dashboard
  ├── Vehicles
  │     └── Vehicle Details
  │
  ├── Drivers
  │     └── Driver Details
  │
  ├── Services
  │
  ├── Locations
  │
  └── Audit Trail
```

## Driver

```text
Login
  ↓
Driver Dashboard
  ↓
Assigned Vehicle
  ↓
Update Vehicle Input
  ↓
Start Vehicle
  ↓
Success Confirmation
```

Make these flows intuitive without requiring instructions.

---

# 33. Important UI Principle

A user should be able to understand:

**Where am I?**

**What information am I looking at?**

**What can I do here?**

**What happened?**

**What needs attention?**

within a few seconds.

Do not make users hunt for important actions.

---

# 34. Final Quality Standard

Before considering the frontend complete, verify:

* All pages exist
* Navigation works
* Login flow works with mock credentials
* Admin and Driver experiences are separated
* CRUD interactions work with mock data
* Forms have validation
* Search works
* Filters work
* Delete confirmation works
* Service alerts work
* Location page works with simulated coordinates
* Audit trail is visible
* Responsive behavior works
* Accessibility basics are covered
* Empty/loading/error states exist
* Visual design is consistent
* No unnecessary decorative design
* No backend has been implemented
* No database has been implemented
* No external authentication/database service has been connected

# Most Important Requirement

**Do not optimize this application for visual impressiveness. Optimize it for professional usability.**

It should look like a system that an organization could realistically use to **manage and track its vehicles and drivers**.

The final result should be:

**Minimal + Professional + Formal + Accessible + Responsive + User-oriented + Practical.**

The frontend will be shown to the college project coordinator for validation.

**Do not proceed to backend or database implementation. The current objective is to produce and refine the frontend UI only.**

Once the frontend is complete, stop and wait for UI validation before making architectural changes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://motorcade-monitor.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/05c8175a-e53a-4b6a-9279-2c40fb95838c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
