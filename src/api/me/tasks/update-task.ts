import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import { sendError, sendSuccess } from '@/utils/apiresponse.js';
import {
	createNotification,
	getTaskLink,
} from '@/services/notificationService.js';

type TaskUpdateBody = {
	title?: string;
	description?: string;
	status?: 'pending' | 'in progress' | 'completed';
	priority?: 'low' | 'medium' | 'high';
	dueDate?: string | Date;
};

const allowedFields: Array<keyof TaskUpdateBody> = [
	'title',
	'description',
	'status',
	'priority',
	'dueDate',
];

const updateTask = async (
	req: Request<{ id: string }, {}, TaskUpdateBody>,
	res: Response
) => {
	try {
		if (!req.user) {
			return sendError(res, 'Unauthorized', 401);
		}

		const update = allowedFields.reduce<Partial<TaskUpdateBody>>((acc, field) => {
			if (req.body[field] !== undefined) {
				acc[field] = req.body[field] as never;
			}
			return acc;
		}, {});

		const existingTask = await Task.findOne({
			_id: req.params.id,
			userId: req.user.userId,
		});

		if (!existingTask) {
			return sendError(res, 'Task not found', 404);
		}

		const task = await Task.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user.userId },
			update,
			{ new: true, runValidators: true }
		);

		if (!task) {
			return sendError(res, 'Task not found', 404);
		}

		const wasCompleted = existingTask.status === 'completed';
		const isCompleted = task.status === 'completed';
		const dueDateChanged =
			update.dueDate !== undefined &&
			new Date(existingTask.dueDate).getTime() !==
				new Date(task.dueDate).getTime();
		const priorityChanged =
			update.priority !== undefined && existingTask.priority !== task.priority;
		const statusChanged =
			update.status !== undefined && existingTask.status !== task.status;

		if (!wasCompleted && isCompleted) {
			await createNotification({
				userId: req.user.userId,
				type: 'task_completed',
				title: 'Task hoan thanh',
				message: `"${task.title}" da duoc danh dau hoan thanh.`,
				link: getTaskLink(task.title),
			}).catch((error) => {
				console.error('Error creating task completion notification:', error);
			});
		} else if (dueDateChanged || priorityChanged || statusChanged) {
			await createNotification({
				userId: req.user.userId,
				type: 'task_updated',
				title: 'Task da cap nhat',
				message: `"${task.title}" vua duoc cap nhat trong ke hoach hoc tap.`,
				link: getTaskLink(task.title),
			}).catch((error) => {
				console.error('Error creating task update notification:', error);
			});
		}

		return sendSuccess(res, task);
	} catch (error) {
		console.error(error);
		return sendError(res, 'Server error', 500);
	}
};

export { updateTask };
