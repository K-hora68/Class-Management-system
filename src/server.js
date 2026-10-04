import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import signupRouter from "./routes/signup.js";
import loginRouter from "./routes/login.js";
import meRouter from "./routes/me.js";
import { loginLimiter, signupLimiter } from "./rateLimit.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`,
    );
  });

  next();
});

app.use("/api/auth/signup", signupLimiter, signupRouter);
app.use("/api/auth/login", loginLimiter, loginRouter);
app.use("/api/me", meRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  console.error("Request failed:", error.code || error.name || "UnknownError");
  return res.status(500).json({ error: "Something went wrong on the server." });
});

try {
  await pool.query("SELECT 1");

  app.listen(port, () => {
    console.log(`Class system API listening on port ${port}`);
  });
} catch (error) {
  console.error("Could not connect to MySQL:", error.code || error.name);
  process.exit(1);
}