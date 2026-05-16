import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import { sendError, sendSuccess } from '@/utils/apiresponse.js';
interface DeleteTaskRequest extends Request {
	user?: {
		userId: string;
		email?: string;
		role: 'user' | 'admin';
	};
	params: {
		id: string;
	};
}

const deleteTask = async (req: DeleteTaskRequest, res: Response) => {
	// Logic to delete a specific task by ID for the authenticated user
	try {
		if (!req.user) {
			return sendError(res, 'Unauthorized', 401);
		}

		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			userId: req.user.userId,
		});

		if (!task) {
			return sendError(res, 'Task not found', 404);
		}

		return sendSuccess(res, { message: `Task with ID ${req.params.id} deleted` });
	} catch (error) {
		return sendError(res, 'Server error', 500);
	}
};

export { deleteTask };
