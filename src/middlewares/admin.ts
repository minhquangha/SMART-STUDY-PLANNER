import type { Request, Response, NextFunction } from "express";
import { sendError } from "@/utils/apiresponse.js";

type UserRole = "user" | "admin";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "Forbidden", 403);
    }

    next();
  };

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  return requireRole("admin")(req, res, next);
};

export default adminMiddleware;
