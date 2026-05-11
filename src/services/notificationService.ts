import type { Response } from "express";
import Notification from "@/models/notification.js";
import Task from "@/models/tasks.js";

export type NotificationType =
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "focus_session"
  | "deadline_today"
  | "deadline_overdue";

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  dedupeKey?: string;
};

type NotificationOutput = {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string;
  readAt: string | null;
  createdAt: string;
};

type TaskReminderCandidate = {
  _id: unknown;
  title: string;
  dueDate: Date | string;
  userId: unknown;
};

const clients = new Map<string, Set<Response>>();
let reminderTimer: ReturnType<typeof setInterval> | null = null;

const pad = (value: number) => String(value).padStart(2, "0");

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

const toDateKey = (value: Date | string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const serializeNotification = (notification: any): NotificationOutput => ({
  _id: String(notification._id),
  userId: String(notification.userId),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link ?? "",
  readAt: notification.readAt ? new Date(notification.readAt).toISOString() : null,
  createdAt: new Date(notification.createdAt).toISOString(),
});

const writeSse = (res: Response, event: string, data: unknown) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const publishNotification = (notification: NotificationOutput) => {
  const userClients = clients.get(notification.userId);
  if (!userClients) {
    return;
  }

  userClients.forEach((res) => {
    writeSse(res, "notification", notification);
  });
};

const isDuplicateKeyError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
};

export const subscribeToNotifications = (userId: string, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const userClients = clients.get(userId) ?? new Set<Response>();
  userClients.add(res);
  clients.set(userId, userClients);

  writeSse(res, "connected", { ok: true });

  const heartbeat = setInterval(() => {
    writeSse(res, "ping", { time: new Date().toISOString() });
  }, 25_000);

  return () => {
    clearInterval(heartbeat);
    userClients.delete(res);

    if (userClients.size === 0) {
      clients.delete(userId);
    }
  };
};

export const createNotification = async (input: NotificationInput) => {
  try {
    const notification = await Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? "",
      ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
    });
    const serialized = serializeNotification(notification);
    publishNotification(serialized);
    return serialized;
  } catch (error) {
    if (input.dedupeKey && isDuplicateKeyError(error)) {
      return null;
    }

    throw error;
  }
};

export const getSerializedNotification = serializeNotification;

export const getTaskLink = (title: string) => {
  return `/dashboard/tasks?search=${encodeURIComponent(title)}`;
};

const createDeadlineNotifications = async () => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const todayKey = toDateKey(today);
  const tasks = (await Task.find({
    status: { $ne: "completed" },
    dueDate: { $lt: tomorrow },
  })
    .select("title dueDate userId")
    .lean()) as TaskReminderCandidate[];

  await Promise.all(
    tasks.map((task) => {
      const dueDate = new Date(task.dueDate);
      const dueDateKey = toDateKey(dueDate);
      const isOverdue = dueDate < today;
      const type: NotificationType = isOverdue
        ? "deadline_overdue"
        : "deadline_today";
      const title = isOverdue ? "Task qua han" : "Task den han hom nay";
      const message = isOverdue
        ? `"${task.title}" da qua han. Hay cap nhat tien do hoc tap.`
        : `"${task.title}" can hoan thanh trong hom nay.`;

      return createNotification({
        userId: String(task.userId),
        type,
        title,
        message,
        link: `/dashboard/tasks?date=${encodeURIComponent(dueDateKey)}`,
        dedupeKey: `${type}:${String(task._id)}:${todayKey}`,
      }).catch((error) => {
        console.error("Error creating deadline notification:", error);
        return null;
      });
    })
  );
};

export const startDeadlineReminder = (intervalMs = 60_000) => {
  if (reminderTimer) {
    return;
  }

  void createDeadlineNotifications().catch((error) => {
    console.error("Error running deadline reminder:", error);
  });

  reminderTimer = setInterval(() => {
    void createDeadlineNotifications().catch((error) => {
      console.error("Error running deadline reminder:", error);
    });
  }, intervalMs);
};
