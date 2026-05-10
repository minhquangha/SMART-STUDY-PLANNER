import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { User } from '@/models/user.js';
import Task from '@/models/tasks.js';
import { sendError, sendSuccess } from '@/utils/apiresponse.js';

const router: Router = Router();

const parsePositiveInteger = (
  value: unknown,
  defaultValue: number,
  maxValue?: number
) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return defaultValue;
  }

  return maxValue ? Math.min(parsed, maxValue) : parsed;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/users', async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((user) => user._id);
    const taskCounts = await Task.aggregate<{
      _id: mongoose.Types.ObjectId;
      count: number;
    }>([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const taskCountByUserId = new Map(
      taskCounts.map((item) => [String(item._id), item.count])
    );

    const usersWithTaskCount = users.map((user) => ({
      ...user,
      taskCount: taskCountByUserId.get(String(user._id)) ?? 0,
    }));

    return sendSuccess(res, {
      users: usersWithTaskCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return sendError(res, 'Server error', 500);
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid user id', 400);
    }

    const user = await User.findById(id).select('_id');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const deletedTasks = await Task.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    return sendSuccess(res, {
      message: 'User deleted',
      deletedTaskCount: deletedTasks.deletedCount ?? 0,
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return sendError(res, 'Server error', 500);
  }
});

export default router;
