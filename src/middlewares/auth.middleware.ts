import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { User } from "../types/user";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as User;
    next();
  } catch (err) {
    return res.redirect("/auth/login");
  }
};