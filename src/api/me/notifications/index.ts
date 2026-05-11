import { Router } from "express";
import type { Request, Response } from "express";
import Notification from "@/models/notification.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import {
  getSerializedNotification,
  subscribeToNotifications,
} from "@/services/notificationService.js";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId, readAt: null }),
    ]);

    return sendSuccess(res, {
      notifications: notifications.map(getSerializedNotification),
      unreadCount,
    });
  } catch (error) {
    console.error("Error listing notifications:", error);
    return sendError(res, "Internal server error", 500);
  }
});

router.get("/stream", (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const cleanup = subscribeToNotifications(userId, res);

  req.on("close", cleanup);
});

router.patch("/read-all", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return sendSuccess(res, { message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return sendError(res, "Internal server error", 500);
  }
});

router.patch("/:id/read", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    return sendSuccess(res, getSerializedNotification(notification));
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return sendError(res, "Internal server error", 500);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId,
    }).lean();

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    return sendSuccess(res, { message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return sendError(res, "Internal server error", 500);
  }
});

export default router;
