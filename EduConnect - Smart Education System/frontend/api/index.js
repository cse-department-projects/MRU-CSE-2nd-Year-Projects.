const TURSO_URL = process.env.TURSO_DATABASE_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "openai/gpt-oss-120b";

// Helper to query Turso HTTP pipeline
async function query(sql, args = []) {
  const namedArgs = args.map(arg => {
    if (arg === null || arg === undefined) return { type: "null" };
    if (typeof arg === "number") {
      return Number.isInteger(arg) ? { type: "integer", value: String(arg) } : { type: "float", value: arg };
    }
    return { type: "text", value: String(arg) };
  });

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql, args: namedArgs } },
        { type: "close" }
      ]
    })
  });

  const json = await res.json();
  const execResult = json.results ? json.results[0] : null;
  if (!execResult || execResult.type === "error") {
    throw new Error(execResult?.error?.message || "Database query failed");
  }

  const result = execResult.response.result;
  const cols = result.cols.map(c => toCamelCase(c.name));
  const rows = result.rows.map(row => {
    const obj = {};
    row.forEach((cell, i) => {
      const col = cols[i];
      let val = cell.value;
      if (cell.type === "integer") val = Number(cell.value);
      else if (cell.type === "float") val = Number(cell.value);
      else if (cell.type === "null") val = null;
      obj[col] = val;
    });
    return obj;
  });

  return { rows, affectedRowCount: result.affected_row_count, lastInsertRowid: result.last_insert_rowid };
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function calculateGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

// Request Body Parser
async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (_) {}
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body)); } catch (_) { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;
  if (pathname.startsWith("/api")) {
    pathname = pathname.substring(4);
  }
  const parts = pathname.split("/").filter(Boolean);
  const resource = parts[0] || "";
  const subResource = parts[1] || "";
  const id = parts[2] || parts[1] || "";

  try {
    // -------------------------------------------------------------
    // HEALTH
    // -------------------------------------------------------------
    if (resource === "health") {
      return res.status(200).json({ status: "UP", engine: "Turso / LibSQL SQLite" });
    }

    // -------------------------------------------------------------
    // AI CHAT (GROQ POWERED)
    // -------------------------------------------------------------
    if (resource === "ai") {
      if (subResource === "chat" && req.method === "POST") {
        const body = await parseBody(req);
        const userPrompt = body.prompt || body.message || "Hello";
        const systemPrompt = "You are the EduConnect AI Study Coach, an expert academic mentor for engineering students. " +
          "Student Context: Name: Keshvi, Roll: MRU001, Dept: CSE 2nd Year, Attendance: 85.8%, Weaker Area: Operating Systems (77%), Strongest: DBMS (88%). " +
          "Provide structured, clear, and encouraging study tips, explanations, revision roadmaps, and conceptual breakdowns.";

        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: 800
            })
          });

          const groqData = await groqRes.json();
          const aiMessage = groqData.choices?.[0]?.message?.content || "Keep up your regular revision schedule!";
          return res.status(200).json({ response: aiMessage, model: GROQ_MODEL });
        } catch (err) {
          return res.status(200).json({
            response: "Study Coach Tip: Focus on reviewing your Operating Systems process synchronization notes and complete your DBMS normalization assignment before the upcoming deadline.",
            fallback: true
          });
        }
      }
    }

    // -------------------------------------------------------------
    // STUDENTS
    // -------------------------------------------------------------
    if (resource === "students") {
      if (req.method === "GET") {
        if (subResource && !isNaN(Number(subResource))) {
          const { rows } = await query("SELECT * FROM student WHERE id = ?", [Number(subResource)]);
          if (rows.length === 0) return res.status(404).json({ message: "Student not found" });
          return res.status(200).json(rows[0]);
        }
        const { rows } = await query("SELECT * FROM student ORDER BY id ASC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO student (name, email, roll_number, department, year) VALUES (?, ?, ?, ?, ?) RETURNING *",
          [body.name, body.email, body.rollNumber, body.department, body.year || 1]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const { rows } = await query(
          "UPDATE student SET name = ?, email = ?, roll_number = ?, department = ?, year = ? WHERE id = ? RETURNING *",
          [body.name, body.email, body.rollNumber, body.department, body.year, Number(subResource)]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Student not found" });
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM student WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    // -------------------------------------------------------------
    // ATTENDANCE
    // -------------------------------------------------------------
    if (resource === "attendance") {
      if (subResource === "student" && id) {
        const { rows } = await query("SELECT * FROM attendance WHERE student_id = ?", [Number(id)]);
        return res.status(200).json(rows);
      }
      if (subResource === "sessions") {
        const { rows } = await query("SELECT * FROM attendance_session ORDER BY date DESC, id DESC");
        return res.status(200).json(rows);
      }
      if (subResource === "session") {
        if (req.method === "GET") {
          const subject = url.searchParams.get("subject");
          const date = url.searchParams.get("date");
          const { rows } = await query("SELECT * FROM attendance_session WHERE subject = ? AND date = ?", [subject, date]);
          if (rows.length === 0) return res.status(404).json({ message: "Session not found" });
          const session = rows[0];
          const recordsRes = await query("SELECT * FROM attendance_record WHERE session_id = ?", [session.id]);
          return res.status(200).json({ session, records: recordsRes.rows });
        }
        if (req.method === "POST") {
          const body = await parseBody(req);
          const { subject, date, records } = body;
          const { rows } = await query(
            "INSERT INTO attendance_session (subject, date, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now')) ON CONFLICT(subject, date) DO UPDATE SET updated_at = datetime('now') RETURNING *",
            [subject, date]
          );
          const session = rows[0];
          if (Array.isArray(records)) {
            for (const r of records) {
              await query(
                "INSERT INTO attendance_record (session_id, student_id, status, recorded_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(session_id, student_id) DO UPDATE SET status = excluded.status, recorded_at = datetime('now')",
                [session.id, r.studentId, r.status]
              );
            }
          }
          return res.status(200).json(session);
        }
      }
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM attendance");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO attendance (student_id, subject, attended_classes, total_classes) VALUES (?, ?, ?, ?) RETURNING *",
          [body.studentId, body.subject, body.attendedClasses, body.totalClasses]
        );
        return res.status(201).json(rows[0]);
      }
    }

    // -------------------------------------------------------------
    // ASSIGNMENTS
    // -------------------------------------------------------------
    if (resource === "assignments") {
      if (subResource === "student" && id) {
        const { rows } = await query("SELECT * FROM assignment WHERE student_id = ? ORDER BY id ASC", [Number(id)]);
        return res.status(200).json(rows);
      }
      if (parts[2] === "submit") {
        const assignId = Number(subResource);
        const studentId = Number(url.searchParams.get("studentId") || 1);
        await query("UPDATE assignment SET status = 'submitted' WHERE id = ?", [assignId]);
        const { rows } = await query(
          "INSERT INTO assignment_submission (assignment_id, student_id, file_name, stored_file_name, submitted_at) VALUES (?, ?, 'submission.pdf', 'stored.pdf', datetime('now')) RETURNING *",
          [assignId, studentId]
        );
        return res.status(200).json(rows[0] || { status: "submitted" });
      }
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM assignment ORDER BY id ASC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO assignment (title, subject, description, due_date, status, student_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
          [body.title, body.subject, body.description || "", body.dueDate, body.status || "pending", body.studentId || 1]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const { rows } = await query(
          "UPDATE assignment SET title = ?, subject = ?, description = ?, due_date = ?, status = ? WHERE id = ? RETURNING *",
          [body.title, body.subject, body.description, body.dueDate, body.status, Number(subResource)]
        );
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM assignment WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    // -------------------------------------------------------------
    // STUDY MATERIALS
    // -------------------------------------------------------------
    if (resource === "materials") {
      if (subResource === "student" && id) {
        const { rows } = await query("SELECT * FROM material WHERE student_id = ? OR student_id IS NULL ORDER BY id DESC", [Number(id)]);
        return res.status(200).json(rows);
      }
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM material ORDER BY id DESC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO material (title, subject, type, description, updated_date, resource_info, student_id) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *",
          [body.title, body.subject, body.type, body.description || "", body.updatedDate || new Date().toISOString().split("T")[0], body.resourceInfo || "", body.studentId || 1]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const { rows } = await query(
          "UPDATE material SET title = ?, subject = ?, type = ?, description = ?, resource_info = ? WHERE id = ? RETURNING *",
          [body.title, body.subject, body.type, body.description, body.resourceInfo, Number(subResource)]
        );
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM material WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    // -------------------------------------------------------------
    // RESULTS & GRADEBOOK
    // -------------------------------------------------------------
    if (resource === "results") {
      if (subResource === "student" && id) {
        const { rows } = await query("SELECT * FROM result WHERE student_id = ? ORDER BY id ASC", [Number(id)]);
        return res.status(200).json(rows);
      }
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM result ORDER BY id ASC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const internalMax = body.internalMax || 30;
        const assignMax = body.assignmentMax || 20;
        const quizMax = body.quizMax || 50;
        const totalObt = (body.internalMarks || 0) + (body.assignmentMarks || 0) + (body.quizMarks || 0);
        const totalMax = internalMax + assignMax + quizMax;
        const pct = totalMax > 0 ? Math.round(((totalObt / totalMax) * 100) * 10) / 10 : 0;
        const grade = body.grade || calculateGrade(pct);

        if (body.id) {
          const { rows } = await query(
            "UPDATE result SET subject = ?, internal_marks = ?, internal_max = ?, assignment_marks = ?, assignment_max = ?, quiz_marks = ?, quiz_max = ?, percentage = ?, grade = ? WHERE id = ? RETURNING *",
            [body.subject, body.internalMarks, internalMax, body.assignmentMarks, assignMax, body.quizMarks, quizMax, pct, grade, body.id]
          );
          return res.status(200).json(rows[0]);
        }

        const existing = await query("SELECT * FROM result WHERE student_id = ? AND subject = ?", [body.studentId, body.subject]);
        if (existing.rows.length > 0) {
          const existingId = existing.rows[0].id;
          const { rows } = await query(
            "UPDATE result SET internal_marks = ?, internal_max = ?, assignment_marks = ?, assignment_max = ?, quiz_marks = ?, quiz_max = ?, percentage = ?, grade = ? WHERE id = ? RETURNING *",
            [body.internalMarks, internalMax, body.assignmentMarks, assignMax, body.quizMarks, quizMax, pct, grade, existingId]
          );
          return res.status(200).json(rows[0]);
        }

        const { rows } = await query(
          "INSERT INTO result (student_id, subject, internal_marks, internal_max, assignment_marks, assignment_max, quiz_marks, quiz_max, percentage, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
          [body.studentId, body.subject, body.internalMarks, internalMax, body.assignmentMarks, assignMax, body.quizMarks, quizMax, pct, grade]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const internalMax = body.internalMax || 30;
        const assignMax = body.assignmentMax || 20;
        const quizMax = body.quizMax || 50;
        const totalObt = (body.internalMarks || 0) + (body.assignmentMarks || 0) + (body.quizMarks || 0);
        const totalMax = internalMax + assignMax + quizMax;
        const pct = totalMax > 0 ? Math.round(((totalObt / totalMax) * 100) * 10) / 10 : 0;
        const grade = calculateGrade(pct);
        const { rows } = await query(
          "UPDATE result SET subject = ?, internal_marks = ?, internal_max = ?, assignment_marks = ?, assignment_max = ?, quiz_marks = ?, quiz_max = ?, percentage = ?, grade = ? WHERE id = ? RETURNING *",
          [body.subject, body.internalMarks, internalMax, body.assignmentMarks, assignMax, body.quizMarks, quizMax, pct, grade, Number(subResource)]
        );
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM result WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    // -------------------------------------------------------------
    // QUIZZES
    // -------------------------------------------------------------
    if (resource === "quizzes") {
      const { rows } = await query("SELECT * FROM quiz");
      return res.status(200).json(rows);
    }

    // -------------------------------------------------------------
    // STUDY COACH
    // -------------------------------------------------------------
    if (resource === "study-coach" && subResource === "student" && id) {
      const studentId = Number(id);
      const [attRes, resRes, assignRes] = await Promise.all([
        query("SELECT * FROM attendance WHERE student_id = ?", [studentId]),
        query("SELECT * FROM result WHERE student_id = ?", [studentId]),
        query("SELECT * FROM assignment WHERE student_id = ?", [studentId])
      ]);

      const attendanceList = attRes.rows;
      const resultList = resRes.rows;
      const assignmentList = assignRes.rows;

      let totalAttended = 0, totalClasses = 0;
      attendanceList.forEach(a => {
        totalAttended += Number(a.attendedClasses || 0);
        totalClasses += Number(a.totalClasses || 0);
      });
      const overallAttendance = totalClasses > 0 ? Math.round((totalAttended * 100.0) / totalClasses) : 0;

      let totalScore = 0, highestScore = -1, lowestScore = 999;
      let strongestSubject = "None", needsAttention = "None";

      resultList.forEach(r => {
        const p = Number(r.percentage || 0);
        totalScore += p;
        if (p > highestScore) {
          highestScore = p;
          strongestSubject = r.subject;
        }
        if (p < lowestScore) {
          lowestScore = p;
          needsAttention = r.subject;
        }
      });
      const overallScore = resultList.length > 0 ? Math.round((totalScore / resultList.length) * 10.0) / 10.0 : 0;

      let pendingAssignments = 0;
      assignmentList.forEach(a => {
        if ((a.status || "").toLowerCase() === "pending") pendingAssignments++;
      });

      let recommendation = "Maintain current momentum and review upcoming course materials regularly.";
      if (overallAttendance < 75) {
        recommendation = `Attendance is below 75% (${overallAttendance}%). Attend all upcoming lectures to avoid academic penalty.`;
      } else if (lowestScore < 60 && needsAttention !== "None") {
        recommendation = `Focus additional practice hours on ${needsAttention} to improve baseline scores.`;
      } else if (pendingAssignments > 2) {
        recommendation = `You have ${pendingAssignments} pending assignments due soon. Complete them to maintain submission records.`;
      }

      const studyPlan = [
        { day: "Monday", task: `Review notes for ${needsAttention !== "None" ? needsAttention : "Core Subjects"} (1.5 hrs)` },
        { day: "Wednesday", task: `Practice lab code and submit pending tasks (${strongestSubject})` },
        { day: "Friday", task: "Solve weekly quizzes and review lecture recordings" },
        { day: "Weekend", task: "Self-assessment and prepare questions for faculty consultation" }
      ];

      return res.status(200).json({
        overallScore,
        overallAttendance,
        strongestSubject,
        needsAttention,
        lowestScore: lowestScore === 999 ? 0 : lowestScore,
        pendingAssignments,
        recommendation,
        studyPlan
      });
    }

    // -------------------------------------------------------------
    // FACULTY
    // -------------------------------------------------------------
    if (resource === "faculty") {
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM faculty ORDER BY id ASC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO faculty (name, email, department, designation, phone) VALUES (?, ?, ?, ?, ?) RETURNING *",
          [body.name, body.email, body.department, body.designation, body.phone || ""]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const { rows } = await query(
          "UPDATE faculty SET name = ?, email = ?, department = ?, designation = ?, phone = ? WHERE id = ? RETURNING *",
          [body.name, body.email, body.department, body.designation, body.phone, Number(subResource)]
        );
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM faculty WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    // -------------------------------------------------------------
    // COURSES
    // -------------------------------------------------------------
    if (resource === "courses") {
      if (req.method === "GET") {
        const { rows } = await query("SELECT * FROM course ORDER BY id ASC");
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        const { rows } = await query(
          "INSERT INTO course (course_code, course_name, department, credits, semester, faculty_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
          [body.courseCode, body.courseName, body.department, body.credits || 3, body.semester || 1, body.facultyId || null]
        );
        return res.status(201).json(rows[0]);
      }
      if (req.method === "PUT" && subResource) {
        const body = await parseBody(req);
        const { rows } = await query(
          "UPDATE course SET course_code = ?, course_name = ?, department = ?, credits = ?, semester = ?, faculty_id = ? WHERE id = ? RETURNING *",
          [body.courseCode, body.courseName, body.department, body.credits, body.semester, body.facultyId, Number(subResource)]
        );
        return res.status(200).json(rows[0]);
      }
      if (req.method === "DELETE" && subResource) {
        await query("DELETE FROM course WHERE id = ?", [Number(subResource)]);
        return res.status(204).end();
      }
    }

    return res.status(404).json({ error: "Endpoint not found" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
