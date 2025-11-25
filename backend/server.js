const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PDFDocument, StandardFonts } = require("pdf-lib");


const JWT_SECRET = "supersecretkey"; // ⚠️ move this to .env in production

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploads folder

// ================================
// 🔹 MySQL connection
// ================================
const db = mysql.createConnection({
  host: "localhost",
  user: "career_user",
  password: "career123", // change if needed
  database: "career_portal"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// ================================
// 🔹 Multer setup
// ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// ================================
// 🔹 Helpers
// ================================
const safeValue = (val, fallback = "NIL") =>
  val && val.trim() !== "" ? val : fallback;
const safeNumber = (val, fallback = 0) =>
  val && !isNaN(val) ? Number(val) : fallback;

// 🔹 Rank recalculation
function updateRanks(callback) {
  const sql = `
    UPDATE applications a
    JOIN (
      SELECT id,
             (COALESCE(ugPercentage,0) * 0.4 + COALESCE(pgPercentage,0) * 0.6) AS score_calc,
             RANK() OVER (ORDER BY (COALESCE(ugPercentage,0) * 0.4 + COALESCE(pgPercentage,0) * 0.6) DESC) AS rnk
      FROM applications
    ) s ON a.id = s.id
    SET a.score = ROUND(s.score_calc,2), a.app_rank = s.rnk;
  `;
  db.query(sql, err => {
    if (err) console.error("Rank update error:", err);
    if (callback) callback(err);
  });
}

// ================================
// 📌 Application submission
// ================================
app.post("/api/applications", upload.single("file"), (req, res) => {
  try {
    const {
      email, name, phone, department, mastersInstitute, specialization,
      phdInstitute, phdTopic, phdStatus, currentInstitution,
      jobTitle, expAcademics, expIndustry, journals, projects,
      placementIncharge, applicantType, ugPercentage, pgPercentage
    } = req.body;

    // check duplicate email
    db.query("SELECT applicationId FROM applications WHERE email = ?", [email], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      if (results.length > 0) {
        return res.status(400).json({
          message: "Email already registered",
          applicationId: results[0].applicationId
        });
      }

      const resumeFileName = req.file ? req.file.filename : "";
      const resumeFilePath = req.file ? `/uploads/${req.file.filename}` : "";

      const sql = `
        INSERT INTO applications
        (email, name, phone, department, mastersInstitute, specialization,
        phdInstitute, phdTopic, phdStatus, currentInstitution, jobTitle,
        expAcademics, expIndustry, journals, projects, placementIncharge,
        fileName, filePath, applicantType, ugPercentage, pgPercentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        email || "",
        name || "",
        phone || "",
        department || "",
        safeValue(mastersInstitute),
        safeValue(specialization),
        safeValue(phdInstitute),
        safeValue(phdTopic),
        safeValue(phdStatus),
        safeValue(currentInstitution),
        safeValue(jobTitle),
        safeNumber(expAcademics),
        safeNumber(expIndustry),
        safeNumber(journals),
        safeNumber(projects),
        placementIncharge === "Yes" ? "Yes" : "No",
        resumeFileName,
        resumeFilePath,
        applicantType || "Fresher",
        safeNumber(ugPercentage),
        safeNumber(pgPercentage)
      ];

      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        const insertId = result.insertId;
        const applicationId = `TCE${new Date().getFullYear()}${String(insertId).padStart(4, "0")}`;

        db.query("UPDATE applications SET applicationId = ? WHERE id = ?", [applicationId, insertId]);

        updateRanks();

        res.json({
          message: "Application submitted successfully",
          applicationId,
          resumeUrl: resumeFilePath
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ================================
// 📌 Get distinct years
// ================================
app.get("/api/applications/years", (req, res) => {
  const sql = "SELECT DISTINCT YEAR(created_at) as year FROM applications ORDER BY year ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ years: results.map(r => r.year) });
  });
});

// ================================
// 📌 Fetch applications with filters
// ================================
app.get("/api/applications", (req, res) => {
  let {
    year, month, search, department, specialization, phdStatus,
    placementIncharge, applicantType, page = 1, pageSize = 10
  } = req.query;

  page = parseInt(page);
  pageSize = parseInt(pageSize);

  let conditions = [];
  let values = [];

  if (year) { conditions.push("YEAR(created_at) = ?"); values.push(year); }
  if (month) { conditions.push("MONTH(created_at) = ?"); values.push(month); }
  if (search) { conditions.push("(name LIKE ? OR email LIKE ?)"); values.push(`%${search}%`, `%${search}%`); }
  if (department) { conditions.push("department = ?"); values.push(department); }
  if (specialization) { conditions.push("specialization = ?"); values.push(specialization); }
  if (phdStatus) { conditions.push("phdStatus = ?"); values.push(phdStatus); }
  if (placementIncharge) { conditions.push("placementIncharge = ?"); values.push(placementIncharge); }
  if (applicantType) { conditions.push("applicantType = ?"); values.push(applicantType); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const sqlCount = `SELECT COUNT(*) as count FROM applications ${where}`;
  const sqlData = `SELECT * FROM applications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;

  db.query(sqlCount, values, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Database error" });
    const total = countResult[0].count;
    const offset = (page - 1) * pageSize;
    db.query(sqlData, [...values, pageSize, offset], (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ total, rows });
    });
  });
});

// ✅ Fetch application by email
app.get("/api/applications/by-email/:email", (req, res) => {
  const { email } = req.params;
  db.query("SELECT * FROM applications WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "No application found" });
    res.json(results[0]); // return all fields
  });
});


// 📌 Update existing application by ID
app.put("/api/applications/:id", upload.single("file"), (req, res) => {
  const { id } = req.params;
  const u = req.body;

  const resumeFileName = req.file ? req.file.filename : null;
  const resumeFilePath = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    UPDATE applications SET
      name=?, phone=?, department=?, mastersInstitute=?, specialization=?, 
      phdInstitute=?, phdTopic=?, phdStatus=?, currentInstitution=?, jobTitle=?,
      expAcademics=?, expIndustry=?, journals=?, projects=?, placementIncharge=?,
      applicantType=?, ugPercentage=?, pgPercentage=?,
      fileName = COALESCE(?, fileName),
      filePath = COALESCE(?, filePath),
      updated_at = NOW()
    WHERE id=?
  `;

  const values = [
    safeValue(u.name),
    safeValue(u.phone),
    safeValue(u.department),
    safeValue(u.mastersInstitute),
    safeValue(u.specialization),
    safeValue(u.phdInstitute),
    safeValue(u.phdTopic),
    safeValue(u.phdStatus),
    safeValue(u.currentInstitution),
    safeValue(u.jobTitle),
    safeNumber(u.expAcademics),
    safeNumber(u.expIndustry),
    safeNumber(u.journals),
    safeNumber(u.projects),
    u.placementIncharge === "Yes" ? "Yes" : "No",
    u.applicantType || "Fresher",
    safeNumber(u.ugPercentage),
    safeNumber(u.pgPercentage),
    resumeFileName,
    resumeFilePath,
    id
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("Update failed:", err);
      return res.status(500).json({ message: "Update failed", error: err });
    }
    updateRanks();
    res.json({ message: "Application updated successfully" });
  });
});


app.use("/api/applications", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.url.startsWith("/by-email")) {
    return next(); // applicants can still submit/update
  }
  verifyAdmin(req, res, next); // protect all other GET/EXPORT
});


// ================================
// 📌 View/download resume
// ================================
app.get("/api/applications/:id/resume", (req, res) => {
  const { id } = req.params;
  db.query("SELECT filePath, fileName FROM applications WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Resume not found" });
    const resumePath = path.join(__dirname, results[0].filePath);
    res.download(resumePath, results[0].fileName);
  });
});

// ================================
// 📌 Export ZIP of resumes (filtered)
// ================================
function verifyAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.admin = decoded;
    next();
  });
}


// 📦 Export filtered resumes as ZIP
app.get("/api/applications/export-zip", verifyAdmin, (req, res) => {
  const {
    year,
    month,
    department,
    specialization,
    phdStatus,
    placementIncharge,
    applicantType,
  } = req.query;

  let conditions = [];
  let values = [];

  if (year) { conditions.push("YEAR(created_at) = ?"); values.push(year); }
  if (month) { conditions.push("MONTH(created_at) = ?"); values.push(month); }
  if (department) { conditions.push("department = ?"); values.push(department); }
  if (specialization) { conditions.push("specialization = ?"); values.push(specialization); }
  if (phdStatus) { conditions.push("phdStatus = ?"); values.push(phdStatus); }
  if (placementIncharge) { conditions.push("placementIncharge = ?"); values.push(placementIncharge); }
  if (applicantType) { conditions.push("applicantType = ?"); values.push(applicantType); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const sql = `SELECT applicationId, name, filePath, fileName FROM applications ${where} ORDER BY created_at DESC`;

  db.query(sql, values, (err, rows) => {
    if (err) {
      console.error("❌ ZIP export error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "No resumes found" });
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const exportName = `TCE_Resumes_${timestamp}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${exportName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("❌ Archiver error:", err);
      res.status(500).end();
    });

    archive.pipe(res);

    rows.forEach((row) => {
      if (row.filePath) {
        const resumePath = path.join(__dirname, row.filePath.replace(/^\//, ""));
        if (fs.existsSync(resumePath)) {
          archive.file(resumePath, {
            name: `${row.applicationId}_${row.name}_${row.fileName}`,
          });
        }
      }
    });

    archive.finalize();
  });
});

app.get("/api/applications/export", verifyAdmin, (req, res) => {
  try {
    console.log("📦 Export request received:", req.query);

    let { year, month, search, department, specialization, phdStatus, placementIncharge } = req.query;

    let conditions = [];
    let values = [];

    if (year) { conditions.push("YEAR(created_at) = ?"); values.push(year); }
    if (month) { conditions.push("MONTH(created_at) = ?"); values.push(month); }
    if (search) { conditions.push("(name LIKE ? OR email LIKE ?)"); values.push(`%${search}%`, `%${search}%`); }
    if (department) { conditions.push("department = ?"); values.push(department); }
    if (specialization) { conditions.push("specialization = ?"); values.push(specialization); }
    if (phdStatus) { conditions.push("phdStatus = ?"); values.push(phdStatus); }
    if (placementIncharge) { conditions.push("placementIncharge = ?"); values.push(placementIncharge); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const sql = `SELECT filePath, fileName, applicationId FROM applications ${where}`;

    db.query(sql, values, (err, rows) => {
      if (err) {
        console.error("❌ DB error on export:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("✅ Exporting rows:", rows.length);

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
      const fileLabel = `${year || "AllYears"}${month ? "_" + month : ""}${department ? "_" + department : ""}`;
      const exportName = `TCE_Resumes_${fileLabel || "All"}_${timestamp}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${exportName}"`);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (err) => {
        console.error("❌ Archiver error:", err);
        res.status(500).end();
      });

      archive.pipe(res);

      rows.forEach(row => {
        if (row.filePath) {
          const fixedPath = path.join(__dirname, row.filePath.replace(/^\//, ""));
          if (fs.existsSync(fixedPath)) {
            archive.file(fixedPath, { name: `${row.applicationId || Date.now()}_${row.fileName}` });
          }
        }
      });

      archive.finalize();
    });
  } catch (err) {
    console.error("❌ Export route error:", err);
    res.status(500).json({ message: "Export failed", error: err });
  }
});



// ================================
// 📌 Admin login
// ================================
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, name: admin.name, email: admin.email });
  });
});

// ================================
// 🚀 Start server
// ================================
app.listen(5007, () => console.log("🚀 Backend running on http://localhost:5007"));
