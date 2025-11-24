import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id_user: number;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ success: false, message: "Token manquant" });
  }

  const token = header.split(" ")[1];


  if (!token) {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }


  try {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id_user: decoded.id_user,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    const errorMessage = err instanceof jwt.TokenExpiredError
      ? "Token expiré"
      : "Token invalide";
    return res.status(401).json({ success: false, message: errorMessage });
  }
};
