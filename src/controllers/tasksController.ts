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
	// Logic to get all tasks for the authenticated user
	const userId = req.user?.userId;
	const tasks = await Task.find({ userId: userId });
	const responseTasks = tasks.map((task) => ({
        id: task._id,
		title: task.title,
		description: task.description,
		status: task.status,
		createdAt: task.createdAt,
	}));
	res.json(responseTasks);
};

const createTask = async (req: CreateTaskRequest, res: Response) => {
	// Logic to create a new task for the authenticated user
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const { title, description, dueDate } = req.body;
	const userId = req.user?.userId;
	const newTask = new Task({
		title,
		description,
		dueDate,
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

export { getTasks, createTask ,updateTask, deleteTask};
