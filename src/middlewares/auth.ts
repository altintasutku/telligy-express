import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../env.mjs";

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(
    req.headers.authorization!,
    env.SUPABASE_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (decoded as any)?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.userId = userId;
      req.user = decoded as any;

      next();
    }
  );
};
