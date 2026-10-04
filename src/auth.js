import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET must be set in .env (at least 32 characters).");
}

export function signToken(user) {
  return jwt.sign({ role: user.role }, secret, {
    subject: String(user.id),
    expiresIn: "8h",
    algorithm: "HS256",
  });
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please log in." });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}