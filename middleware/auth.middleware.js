import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Немає токена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 ЗБЕРІГАЄМО ЯК req.user
    req.user = { id: decoded.id };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Невалідний токен" });
  }
}
