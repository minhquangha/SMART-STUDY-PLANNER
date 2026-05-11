import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME } from '@/utils/authCookies.js';

export const authMiddlewares = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as { userId?: string; email?: string };
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded.email
            ? { userId: decoded.userId, email: decoded.email }
            : { userId: decoded.userId };
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}
