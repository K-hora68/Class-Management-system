import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP in that window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in 15 minutes." },
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many signups from this connection. Try again later." },
});
