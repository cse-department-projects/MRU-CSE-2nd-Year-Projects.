# Road Safety & Hospital Notification System

**Department of Computer Science & Engineering**  
*Academic Project Presentation & Source Code*

---

## 📌 Project Overview
The **Road Safety and Hospital Notification System** is a full-stack web application built using **HTML5, CSS3, JavaScript, Java 21, Spring Boot, and MySQL**. It minimizes emergency medical response times during road accidents and promotes road safety awareness across 8 categories.

### Key Features:
1. **One-Touch Emergency SOS**:
   - Captures user's live GPS coordinates via HTML5 Geolocation API.
   - Calculates distance to nearby hospitals using the **Haversine Distance Formula**.
   - Generates a **1-Click Mobile SMS link (`sms:`)** pre-filled with live Google Maps link and victim info.
   - Dispatches real-time emergency alert to the **Java REST API**.

2. **Hospital Emergency Response Dashboard**:
   - View incoming emergency accident alerts in real-time.
   - One-click **Accept SOS**, **Dispatch Ambulance 🚑**, and **Mark Resolved** workflow.

3. **Road Safety & Precautions Module (8 Categories / 25 Guidelines)**:
   - Mandatory Signs, Cautionary Signs, Informational Signs, Night & Weather Precautions, Speed Limits & Penalties, Vehicle Maintenance, Pedestrian Guidelines, First Aid & Golden Hour.

---

## 🚀 How to Run the Application
1. Run command in project root:
   ```bash
   mvn clean spring-boot:run
   ```
2. Access in browser:
   - **Web Application**: `http://localhost:8080`
   - **H2 Console**: `http://localhost:8080/h2-console`
