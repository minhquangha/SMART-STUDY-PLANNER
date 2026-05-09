import type { Request, Response } from 'express';
import Task from '@/models/tasks.js';


const updateTask = async (req: Request, res: Response) => {
	try {
		await Task.findByIdAndUpdate(req.params.id, req.body);
		return res.json({ message: `Task with ID ${req.params.id} updated` });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Server error' });
	}
};

export { updateTask };