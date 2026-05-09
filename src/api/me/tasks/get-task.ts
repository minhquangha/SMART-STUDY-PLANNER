import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import {sendSuccess } from '@/utils/apiresponse.js';




const getTasks = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const status = req.query.status as string;
	const priority = req.query.priority as string;
	const search = req.query.search as string;
	const sort = req.query.sort as string;
	const filter = {
		userId: req.user.userId,
		...(status ? { status } : {}),
		...(priority ? { priority } : {}),
		...(search ? { title: { $regex: search, $options: 'i' } } : {}),
	}
	const page  =  Number(req.query.page) || 1;
	const limit =  Number(req.query.limit) || 10;
	const skip  =  (page - 1) * limit;
	const sortMap : Record<string, any> = {
		'deadline': { dueDate: 1 },
		'priority': { priority: -1 },
		'status': { status: -1 },
		'recommended': { dueDate: 1, priority: -1, status: -1 },
		'recent': { createdAt: -1 },
	};
	const sortOption = sortMap[sort] ?? { createdAt: -1};

	const tasks = await Task.find(filter).sort(sortOption).skip(skip).limit(limit);
	sendSuccess(res, tasks);
};

export { getTasks };