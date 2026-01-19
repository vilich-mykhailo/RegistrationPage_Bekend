import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader); // 👈 ДОДАЙ ДЛЯ ДЕБАГУ

  if (!authHeader) {
    return res.status(401).json({ message: "Немає токена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch (e) {
    console.error("JWT ERROR:", e);
    return res.status(401).json({ message: "Недійсний токен" });
  }
}
