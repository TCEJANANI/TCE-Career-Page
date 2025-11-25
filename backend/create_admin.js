// create_admin.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

(async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "career_user",
    password: "career123",  // <-- put your MySQL password
    database: "career_portal",
  });

  const email = "admin@tce.edu";         // <-- choose your admin email
  const password = "StrongAdminPass123"; // <-- choose a strong password
  const name = "TCE Admin";

  const hash = await bcrypt.hash(password, 10);

  try {
    await connection.execute(
      "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)",
      [email, hash, name]
    );
    console.log("✅ Admin created successfully:", email);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    await connection.end();
  }
})();
