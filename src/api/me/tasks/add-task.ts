import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import { sendError,sendSuccess} from '@/utils/apiresponse.js';
import {
	createNotification,
	getTaskLink,
} from '@/services/notificationService.js';
interface CreateTaskRequest extends Request {
	user?: {
		userId: string;
		email?: string;
		role: 'user' | 'admin';
	};
	body: {
		title: string;
		description?: string;
		dueDate?: Date;
		priority?: 'low' | 'medium' | 'high';
		status?: 'pending' | 'in progress' | 'completed';
	};
}


const createTask = async (req: CreateTaskRequest, res: Response) => {
	// Logic to create a new task for the authenticated user
	if (!req.user) {
		return sendError(res, 'Unauthorized', 401);
	}
	const { title, description, dueDate, priority, status } = req.body;
	const userId = req.user?.userId;
	const newTask = new Task({
		title,
		description: description ?? '',
		dueDate,
		priority,
		status,
		userId,
	});
	await newTask.save();
	await createNotification({
		userId,
		type: 'task_created',
		title: 'Task moi',
		message: `"${newTask.title}" da duoc them vao ke hoach hoc tap.`,
		link: getTaskLink(newTask.title),
	}).catch((error) => {
		console.error('Error creating task notification:', error);
	});
	sendSuccess(res, { message: 'Task created' });
};

export { createTask };
