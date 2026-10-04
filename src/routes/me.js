import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, sp.reg_number
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
        WHERE u.id = ? AND u.status = 'active'
        LIMIT 1`,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Please log in." });
    }

    const user = rows[0];
    return res.json({
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