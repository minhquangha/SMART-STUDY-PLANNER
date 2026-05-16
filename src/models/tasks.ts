import mongoose from 'mongoose';
const tasksSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'in progress', 'completed'],
		default: 'pending',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	priority: {
		type: String,
		enum: ['low', 'medium', 'high'],
		default: 'medium',
	},
	dueDate: {
		type: Date,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
},{timestamps:true});
const Task = mongoose.model('Task', tasksSchema);
export default Task;
