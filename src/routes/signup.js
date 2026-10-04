import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_COST = 12;

router.post("/", async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Send signup details as JSON." });
  }

  const studentName =
    typeof body.studentName === "string" ? body.studentName.trim() : "";
  const studentEmail =
    typeof body.studentEmail === "string"
      ? body.studentEmail.trim().toLowerCase()
      : "";
  const studentRegNumber =
    typeof body.studentRegNumber === "string"
      ? body.studentRegNumber.trim()
      : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (
    !studentName ||
    !studentEmail ||
    !studentRegNumber ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({ error: "All signup fields are required." });
  }

  if (studentName.length > 120) {
    return res.status(400).json({ error: "Student name is too long." });
  }

  if (studentEmail.length > 254 || !EMAIL_PATTERN.test(studentEmail)) {
    return res.status(400).json({ error: "Enter a valid student email." });
  }

  if (studentRegNumber.length > 50) {
    return res.status(400).json({ error: "Registration number is too long." });
  }

  const passwordBytes = Buffer.byteLength(password, "utf8");

  if (passwordBytes < 12 || passwordBytes > 72) {
    return res.status(400).json({
      error: "Password must be between 12 and 72 bytes (about 12 to 72 characters).",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const userExists = {
    code: "USER_EXISTS",
    redirectTo: "login",
    error: "An account already exists. Please log in.",
  };

  let connection;

  try {
    // Check whether this email or registration number is already registered
    const [existing] = await pool.execute(
      `SELECT u.id
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
        WHERE u.email = ? OR sp.reg_number = ?
        LIMIT 1`,
      [studentEmail, studentRegNumber],
    );

    if (existing.length > 0) {
      return res.status(409).json(userExists);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    // Save to both tables, or neither
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      `INSERT INTO users (role, full_name, email, password_hash)
       VALUES ('student', ?, ?, ?)`,
      [studentName, studentEmail, passwordHash],
    );

    await connection.execute(
      `INSERT INTO student_profiles (user_id, reg_number) VALUES (?, ?)`,
      [userResult.insertId, studentRegNumber],
    );

    await connection.commit();

    return res.status(201).json({
      message: "Student account created.",
      student: {
        id: String(userResult.insertId),
        studentName,
        studentEmail,
        studentRegNumber,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    // Two people signing up at the same moment: the database unique keys catch it
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json(userExists);
    }

    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;