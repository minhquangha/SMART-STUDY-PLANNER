import type { Request, Response, NextFunction } from "express";
import { Admin } from "@/models/admin.js";
import { sendError } from "@/utils/apiresponse.js";
import jwt from "jsonwebtoken";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return sendError(res, "No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return sendError(res, "Admin not found", 404);
        }
        req.admin = admin;
        next();
    } catch (err) {
        return sendError(res, "Invalid token", 401);
    }
};
export default adminMiddleware;