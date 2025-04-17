import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "missing token" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (_) {
    return res.status(401).json({ error: "invalid token" });
  }
}