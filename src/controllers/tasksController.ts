import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
interface CreateTaskRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
	body: {
		title: string;
		description?: string;
		dueDate?: Date;
		priority?: 'low' | 'medium' | 'high';
	};
}

interface DeleteTaskRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
	params: {
		id: string;
	};
}
const getTasks = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const {task}  = req.query;
	const sortMap : Record<string, any> = {
		'deadline': { dueDate: 1 },
		'priority': { priority: -1 },
		'status': { status: -1 },
		'recommended': { dueDate: 1, priority: -1, status: -1 },
		'recent': { createdAt: -1 },
	};
	const sortOption = sortMap[task as string] || { createdAt: -1};

	// Logic to get all tasks for the authenticated user
	const userId = req.user?.userId;
	const tasks = await Task.find({ userId: userId }).sort(sortOption);
	res.json(tasks);
};

const getTasksToday = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const today =  new Date();
	today.setHours(23, 59, 59, 999);
	const tasksToday =  await Task.find({
		dueDate: { $lte: today },
		userId: req.user?.userId,
		status: { $in: ['pending', 'in progress'] },
	}).sort({ dueDate: 1 ,priority: -1});
	res.json(tasksToday);
}

const createTask = async (req: CreateTaskRequest, res: Response) => {
	// Logic to create a new task for the authenticated user
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const { title, description, dueDate, priority } = req.body;
	const userId = req.user?.userId;
	const newTask = new Task({
		title,
		description,
		dueDate,
		priority,
		userId,
	});
	await newTask.save();
	res.json({ message: 'Task created' });
};

const updateTask = async (req: Request, res: Response) => {
	try {
		await Task.findByIdAndUpdate(req.params.id, req.body);
		return res.json({ message: `Task with ID ${req.params.id} updated` });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Server error' });
	}
};
const deleteTask = async (req: DeleteTaskRequest, res: Response) => {
	// Logic to delete a specific task by ID for the authenticated user
	try {
		await Task.findByIdAndDelete(req.params.id);
		return res.json({ message: `Task with ID ${req.params.id} deleted` });
	} catch (error) {
		return res.status(500).json({ message: 'Server error' });
	}
};

export { getTasks, createTask ,updateTask, deleteTask, getTasksToday};
