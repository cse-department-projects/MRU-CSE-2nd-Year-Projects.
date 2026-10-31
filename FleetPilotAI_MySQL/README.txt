FleetPilot AI - Agentic AI Fleet Management System (Java + MySQL + HTML + CSS + JS)

SETUP (one time)
1. JDK 17+ installed (java -version)
2. MySQL running (XAMPP or MySQL Server)
3. Download mysql-connector-j-8.4.0.jar and put it inside the "lib" folder:
   https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar
4. Open db.properties and set your MySQL user and password
   (the database "fleetpilot" and its tables are created automatically)

RUN
  Windows: double-click run.bat
  or in terminal (inside this folder):  java -cp "lib/*" FleetPilot.java
Open http://localhost:8080   Login: admin / admin123

If MySQL is not connected, the app still runs in memory mode (sidebar shows the status).
