import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import {sendSuccess } from '@/utils/apiresponse.js';

const getTodayTasks = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tasks = await Task.find({
        userId: req.user.userId,
        dueDate: { $gte: today, $lt: tomorrow },
    });
    sendSuccess(res, tasks);
};

export { getTodayTasks };