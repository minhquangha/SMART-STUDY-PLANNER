import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import { sendError, sendSuccess } from '@/utils/apiresponse.js';

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

		const task = await Task.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user.userId },
			update,
			{ new: true, runValidators: true }
		);

		if (!task) {
			return sendError(res, 'Task not found', 404);
		}

		return sendSuccess(res, task);
	} catch (error) {
		console.error(error);
		return sendError(res, 'Server error', 500);
	}
};

export { updateTask };
