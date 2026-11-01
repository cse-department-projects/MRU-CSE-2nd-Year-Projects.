-- EduConnect SQLite / Turso Schema & Seed Export
-- Generated automatically

CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        attended_classes INTEGER NOT NULL,
        total_classes INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS attendance_session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(subject, date)
    );

CREATE TABLE IF NOT EXISTS attendance_record (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        recorded_at TEXT,
        UNIQUE(session_id, student_id)
    );

CREATE TABLE IF NOT EXISTS assignment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'pending',
        student_id INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS assignment_submission (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        file_name TEXT,
        stored_file_name TEXT,
        file_path TEXT,
        submitted_at TEXT
    );

CREATE TABLE IF NOT EXISTS material (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        updated_date TEXT,
        resource_info TEXT,
        student_id INTEGER
    );

CREATE TABLE IF NOT EXISTS result (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        internal_marks INTEGER DEFAULT 0,
        internal_max INTEGER DEFAULT 30,
        assignment_marks INTEGER DEFAULT 0,
        assignment_max INTEGER DEFAULT 20,
        quiz_marks INTEGER DEFAULT 0,
        quiz_max INTEGER DEFAULT 50,
        percentage REAL DEFAULT 0,
        grade TEXT
    );

CREATE TABLE IF NOT EXISTS quiz (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        total_questions INTEGER DEFAULT 10,
        duration_minutes INTEGER DEFAULT 30,
        total_marks REAL DEFAULT 100,
        active INTEGER DEFAULT 1
    );

CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        phone TEXT
    );

CREATE TABLE IF NOT EXISTS course (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        department TEXT NOT NULL,
        credits INTEGER DEFAULT 3,
        semester INTEGER DEFAULT 1,
        faculty_id INTEGER
    );

INSERT INTO student (id, name, email, roll_number, department, year)
       VALUES (1, 'Keshvi', 'keshvi@example.com', 'MRU001', 'CSE', 2)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, roll_number=excluded.roll_number, department=excluded.department, year=excluded.year;

DELETE FROM attendance WHERE student_id = 1;

INSERT INTO attendance (student_id, subject, attended_classes, total_classes) VALUES (1, 'Database Management Systems', 27, 30);

INSERT INTO attendance (student_id, subject, attended_classes, total_classes) VALUES (1, 'Java Programming', 26, 30);

INSERT INTO attendance (student_id, subject, attended_classes, total_classes) VALUES (1, 'Cloud Computing', 25, 30);

INSERT INTO attendance (student_id, subject, attended_classes, total_classes) VALUES (1, 'Operating Systems', 25, 30);

DELETE FROM result WHERE student_id = 1;

INSERT INTO result (student_id, subject, internal_marks, internal_max, assignment_marks, assignment_max, quiz_marks, quiz_max, percentage, grade)
       VALUES (1, 'Database Management Systems', 26, 30, 18, 20, 44, 50, 88.0, 'A+');

INSERT INTO result (student_id, subject, internal_marks, internal_max, assignment_marks, assignment_max, quiz_marks, quiz_max, percentage, grade)
       VALUES (1, 'Java Programming', 25, 30, 17, 20, 42, 50, 84.0, 'A');

INSERT INTO result (student_id, subject, internal_marks, internal_max, assignment_marks, assignment_max, quiz_marks, quiz_max, percentage, grade)
       VALUES (1, 'Cloud Computing', 24, 30, 18, 20, 40, 50, 82.0, 'A');

INSERT INTO result (student_id, subject, internal_marks, internal_max, assignment_marks, assignment_max, quiz_marks, quiz_max, percentage, grade)
       VALUES (1, 'Operating Systems', 23, 30, 16, 20, 38, 50, 77.0, 'B+');

DELETE FROM assignment WHERE student_id = 1;

INSERT INTO assignment (id, title, subject, description, due_date, status, student_id)
       VALUES (1, 'DBMS Normalization', 'Database Management Systems', 'Submit 1NF, 2NF, 3NF and BCNF normalization documentation for the university database schema.', '2026-11-10 00:00:00.000', 'pending', 1);

INSERT INTO assignment (id, title, subject, description, due_date, status, student_id)
       VALUES (2, 'Java OOPs Implementation', 'Java Programming', 'Design an inheritance hierarchy with Polymorphism and Interface abstraction.', '2026-10-25 00:00:00.000', 'completed', 1);

INSERT INTO assignment (id, title, subject, description, due_date, status, student_id)
       VALUES (3, 'Cloud Security Basics', 'Cloud Computing', 'Explain IAM policies, VPC security groups, and encryption at rest and in transit.', '2026-11-15 00:00:00.000', 'pending', 1);

INSERT INTO assignment (id, title, subject, description, due_date, status, student_id)
       VALUES (4, 'SPV Loader Design', 'Operating Systems', 'Document Single Program Variable loader architecture with relocation dictionary.', '2026-11-05 00:00:00.000', 'submitted', 1);

INSERT INTO assignment (id, title, subject, description, due_date, status, student_id)
       VALUES (5, 'Design Thinking Report', 'Professional Communication', 'Prepare empathy map and journey canvas for modern education systems.', '2026-11-20 00:00:00.000', 'pending', 1);

DELETE FROM material WHERE student_id = 1;

INSERT INTO material (id, title, subject, type, description, updated_date, resource_info, student_id)
       VALUES (1, 'Normalization & Schema Design Notes', 'Database Management Systems', 'Notes', 'Comprehensive notes on Boyce-Codd Normal Form and multi-valued dependencies.', '2026-10-28 00:00:00.000', 'https://example.com/materials/dbms-notes.pdf', 1);

INSERT INTO material (id, title, subject, type, description, updated_date, resource_info, student_id)
       VALUES (2, 'Java Concurrency & Multithreading Guide', 'Java Programming', 'PDF', 'Thread lifecycle, executors, synchronized blocks, and atomic variables.', '2026-10-20 00:00:00.000', 'https://example.com/materials/java-concurrency.pdf', 1);

INSERT INTO material (id, title, subject, type, description, updated_date, resource_info, student_id)
       VALUES (3, 'Cloud Architecture Patterns Reference', 'Cloud Computing', 'Book', 'High availability, fault tolerance, and microservices in modern cloud providers.', '2026-10-15 00:00:00.000', 'https://example.com/materials/cloud-patterns.pdf', 1);

INSERT INTO material (id, title, subject, type, description, updated_date, resource_info, student_id)
       VALUES (4, 'Process Scheduling & Deadlocks Tutorial', 'Operating Systems', 'Video', 'Round robin, multi-level queue scheduling, and banker deadlock avoidance.', '2026-10-12 00:00:00.000', 'https://example.com/materials/os-scheduling-video', 1);

DELETE FROM quiz;

INSERT INTO quiz (id, title, subject, description, total_questions, duration_minutes, total_marks, active)
       VALUES (1, 'DBMS Indexing & B-Trees Quiz', 'Database Management Systems', 'Assessment on primary, secondary, and clustered index access paths.', 15, 25, 30, 1);

INSERT INTO quiz (id, title, subject, description, total_questions, duration_minutes, total_marks, active)
       VALUES (2, 'Java Generics and Collections Quiz', 'Java Programming', 'Assessment covering ArrayList, HashMap, and Comparable implementations.', 20, 30, 40, 1);

DELETE FROM faculty;

INSERT INTO faculty (id, name, email, department, designation, phone)
       VALUES (1, 'Dr. Ananya Sharma', 'ananya.sharma@educonnect.edu', 'CSE', 'Associate Professor', '+91 9876543210');

INSERT INTO faculty (id, name, email, department, designation, phone)
       VALUES (2, 'Prof. Rajesh Verma', 'rajesh.verma@educonnect.edu', 'CSE', 'Assistant Professor', '+91 9876543211');

INSERT INTO faculty (id, name, email, department, designation, phone)
       VALUES (3, 'Dr. Meera Nambiar', 'meera.nambiar@educonnect.edu', 'CSE', 'Professor & HOD', '+91 9876543212');

DELETE FROM course;

INSERT INTO course (id, course_code, course_name, department, credits, semester, faculty_id)
       VALUES (1, 'CS201', 'Database Management Systems', 'CSE', 4, 3, 1);

INSERT INTO course (id, course_code, course_name, department, credits, semester, faculty_id)
       VALUES (2, 'CS202', 'Java Object-Oriented Programming', 'CSE', 4, 3, 2);

INSERT INTO course (id, course_code, course_name, department, credits, semester, faculty_id)
       VALUES (3, 'CS203', 'Cloud Computing Architecture', 'CSE', 3, 3, 1);

INSERT INTO course (id, course_code, course_name, department, credits, semester, faculty_id)
       VALUES (4, 'CS204', 'Operating Systems & System Programming', 'CSE', 4, 3, 3);

