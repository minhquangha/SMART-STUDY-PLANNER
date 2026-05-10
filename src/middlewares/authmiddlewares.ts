import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export const authMiddlewares = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>"
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
