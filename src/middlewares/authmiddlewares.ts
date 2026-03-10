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
    try {
        console.log("Token received:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}