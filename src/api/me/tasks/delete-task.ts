import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';
import { sendError, sendSuccess } from '@/utils/apiresponse.js';
interface DeleteTaskRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
	params: {
		id: string;
	};
}

const deleteTask = async (req: DeleteTaskRequest, res: Response) => {
	// Logic to delete a specific task by ID for the authenticated user
	try {
		await Task.findByIdAndDelete(req.params.id);
		return sendSuccess(res, { message: `Task with ID ${req.params.id} deleted` });
	} catch (error) {
		return sendError(res, 'Server error', 500);
	}
};

export { deleteTask };