import type { Request, Response } from "express";
import Task from "@/models/tasks.js";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";

type TaskStatus = "pending" | "in progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface TaskLike {
  _id: unknown;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | string;
  userId: unknown;
  createdAt: Date | string;
}

const priorityRank: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const getWeekStart = (date: Date) => {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
};

const pad = (value: number) => String(value).padStart(2, "0");

const toDateKey = (value: Date | string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseMonth = (month: unknown) => {
  if (typeof month === "string" && /^\d{4}-\d{2}$/.test(month)) {
    const [yearValue, monthValue] = month.split("-");
    const year = Number(yearValue);
    const monthIndex = Number(monthValue) - 1;

    if (monthIndex >= 0 && monthIndex <= 11) {
      return new Date(year, monthIndex, 1);
    }
  }

  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

const getPercent = (completed: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
};

const getFocusLabel = (value: number) => {
  if (value >= 80) {
    return "Rất tốt";
  }

  if (value >= 50) {
    return "Đang ổn";
  }

  return "Cần tập trung";
};

const getDateDiff = (fromKey: string, toKey: string) => {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
};

const getBestStreak = (dateKeys: string[]) => {
  let best = 0;
  let current = 0;
  let previous: string | null = null;

  dateKeys.forEach((key) => {
    current = previous && getDateDiff(previous, key) === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = key;
  });

  return best;
};

const getCurrentStreak = (dateSet: Set<string>, todayKey: string) => {
  if (!dateSet.has(todayKey)) {
    return 0;
  }

  let current = 0;
  let cursor = startOfDay(new Date());

  while (dateSet.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return current;
};

const getStatusOverview = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return sendError(res, "Unauthorized", 401);
  }

  try {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const weekStart = getWeekStart(today);
    const weekEnd = addDays(weekStart, 7);
    const monthStart = parseMonth(req.query.month);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

    const [user, todayTasks, weekTasks, monthTasks, completedTasks, openTasks] =
      await Promise.all([
        User.findById(userId).select("name email totalStudyTime").lean(),
        Task.find({
          userId,
          dueDate: { $gte: today, $lt: tomorrow },
        })
          .sort({ dueDate: 1, priority: -1 })
          .lean(),
        Task.find({
          userId,
          dueDate: { $gte: weekStart, $lt: weekEnd },
        }).lean(),
        Task.find({
          userId,
          dueDate: { $gte: monthStart, $lt: monthEnd },
        }).lean(),
        Task.find({
          userId,
          status: "completed",
        })
          .select("dueDate")
          .lean(),
        Task.find({
          userId,
          status: { $ne: "completed" },
        }).lean(),
      ]);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const todayItems = todayTasks as TaskLike[];
    const weekItems = weekTasks as TaskLike[];
    const monthItems = monthTasks as TaskLike[];
    const openItems = openTasks as TaskLike[];
    const completedDateKeys = Array.from(
      new Set(
        (completedTasks as Array<{ dueDate: Date | string }>).map((task) =>
          toDateKey(task.dueDate)
        )
      )
    ).sort();

    const todayCompleted = todayItems.filter(
      (task) => task.status === "completed"
    ).length;
    const weekCompleted = weekItems.filter(
      (task) => task.status === "completed"
    ).length;
    const focusScore = getPercent(weekCompleted, weekItems.length);

    const weeklyActivity = Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(weekStart, index);
      const dateKey = toDateKey(date);
      const dayTasks = weekItems.filter((task) => toDateKey(task.dueDate) === dateKey);

      return {
        date: dateKey,
        label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
        total: dayTasks.length,
        completed: dayTasks.filter((task) => task.status === "completed").length,
      };
    });

    const monthTaskMap = monthItems.reduce<
      Record<string, { total: number; completed: number }>
    >((acc, task) => {
      const key = toDateKey(task.dueDate);
      const current = acc[key] ?? { total: 0, completed: 0 };
      current.total += 1;
      current.completed += task.status === "completed" ? 1 : 0;
      acc[key] = current;
      return acc;
    }, {});

    const monthDays = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    ).getDate();
    const todayKey = toDateKey(today);
    const days = Array.from({ length: monthDays }).map((_, index) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1);
      const dateKey = toDateKey(date);
      const counts = monthTaskMap[dateKey] ?? { total: 0, completed: 0 };

      return {
        date: dateKey,
        day: index + 1,
        total: counts.total,
        completed: counts.completed,
        isToday: dateKey === todayKey,
      };
    });

    const recommendedTask =
      openItems.sort((a, b) => {
        const priorityDiff = priorityRank[b.priority] - priorityRank[a.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })[0] ?? null;

    const completedDateSet = new Set(completedDateKeys);
    const displayName =
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : "Học sinh";

    return sendSuccess(res, {
      user: {
        displayName,
        email: user.email,
      },
      metrics: {
        totalStudyMinutes: user.totalStudyTime ?? 0,
        completion: {
          completed: todayCompleted,
          total: todayItems.length,
          percent: getPercent(todayCompleted, todayItems.length),
        },
        streak: {
          current: getCurrentStreak(completedDateSet, todayKey),
          best: getBestStreak(completedDateKeys),
        },
        focusScore: {
          value: focusScore,
          label: getFocusLabel(focusScore),
        },
      },
      todayTasks: todayItems,
      weeklyActivity,
      calendar: {
        month: `${monthStart.getFullYear()}-${pad(monthStart.getMonth() + 1)}`,
        days,
      },
      recommendedTask,
    });
  } catch (error) {
    console.error("Error fetching status overview:", error);
    return sendError(res, "Internal server error", 500);
  }
};

export { getStatusOverview };
