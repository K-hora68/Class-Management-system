import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = Router();

// Compared against when the email doesn't exist, so response time
// doesn't reveal which emails are registered
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

router.post("/", async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Send login details as JSON." });
  }

  const email =
    typeof body.studentEmail === "string"
      ? body.studentEmail.trim().toLowerCase()
      : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, u.password_hash, u.status, sp.reg_number
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
        WHERE u.email = ?
        LIMIT 1`,
      [email],
    );

    const user = rows[0];
    const passwordOk = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH,
    );

    if (!user || !passwordOk || user.status !== "active") {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    await pool.execute(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [user.id],
    );

    return res.json({
      message: "Login successful.",
      student: {
        id: String(user.id),
        studentName: user.full_name,
        studentEmail: user.email,
        studentRegNumber: user.reg_number,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;