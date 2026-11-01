# EduConnect – Smart Education System
**Course:** AD External Exam Project (CSE 2nd Year)  
**Student Name:** Dabhi Keshviben (Keshvi)  
**Roll Number:** 2511CS010031  
**Department:** Computer Science and Engineering (CSE)  
**University:** Malla Reddy University (MRU)  
**College Email:** 2511cs010031@mallareddyuniversity.ac.in  
**Live Frontend Deployment:** [https://educonnect-keshvi.vercel.app](https://educonnect-keshvi.vercel.app)

---

## 1. Project Overview
**EduConnect** is a full-stack Smart Education Management System designed to integrate students, faculty, and administration onto a unified digital campus platform. It streamlines academic workflows by providing dedicated dashboards for Students, Teachers, and Administrators, as well as an integrated **AI Study Coach** powered by Groq LLM.

### Key Highlights
- **Role-Based Access:** Dedicated interfaces for Students, Teachers, and Admin.
- **Attendance Tracking:** Real-time subject-wise percentage and attendance status.
- **Assignment Management:** PDF upload submission with validation (<10MB, PDF signature check).
- **Study Materials & Results:** Organized repository for learning assets and semester grade cards.
- **AI Study Coach:** Personalized AI academic assistant powered by Groq API (openai/gpt-oss-120b).
- **Cloud Database & Live Deployment:** Backed by Turso SQLite Cloud & deployed on Vercel at https://educonnect-keshvi.vercel.app.

---

## 2. Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API, responsive modern UI)
- **Backend:** Java 17, Spring Boot, Spring Web, Spring Data JPA, Hibernate
- **Database:** SQLite (local zero-config) & Turso LibSQL (cloud production)
- **AI Integration:** Groq Cloud API (openai/gpt-oss-120b)
- **Hosting:** Vercel (https://educonnect-keshvi.vercel.app)
- **Build Tool:** Maven

---

## 3. Demo Credentials

### Student Login
- **Role:** Student
- **Student ID:** 1
- **Roll Number:** MRU001 / 2511CS010031
- **Name:** Keshvi
- **Email:** keshvi@example.com

### Teacher Login
- **Role:** Teacher
- **Teacher ID:** 1
- **Name:** Dr. Rajesh Sharma
- **Department:** CSE

### Admin Login
- **Role:** Administrator
- **Admin ID:** 1

---

## 4. How to Run Locally

### Prerequisites
- Java 17 or higher (java -version)
- Python 3.x (python --version)

### Step 1: Run the Backend (Spring Boot)
Open a terminal in the backend directory:
`ash
cd backend
mvnw.cmd spring-boot:run
`
Backend will start on port 8080: http://localhost:8080/api

### Step 2: Run the Frontend
Open another terminal in the frontend directory:
`ash
cd frontend
python -m http.server 5500
`
Frontend will be available at:
- **Home / Login:** http://localhost:5500/index.html
- **Student Dashboard:** http://localhost:5500/student-dashboard.html
- **AI Study Coach:** http://localhost:5500/study-coach.html
- **Teacher Dashboard:** http://localhost:5500/teacher-dashboard.html
- **Admin Dashboard:** http://localhost:5500/admin-dashboard.html

---

## 5. Live Cloud Deployment
The project is also hosted live on Vercel with serverless cloud database integration:
🔗 **[https://educonnect-keshvi.vercel.app](https://educonnect-keshvi.vercel.app)**
