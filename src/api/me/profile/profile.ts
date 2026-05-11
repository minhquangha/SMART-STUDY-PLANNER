import type { Request, Response } from "express";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import { createNotification } from "@/services/notificationService.js";

type UpdateProfileBody = {
  name?: unknown;
  bio?: unknown;
  studyPreferences?: unknown;
};

const normalizeOptionalText = (value: unknown, fieldName: string) => {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  return value.trim();
};

const normalizeStudyPreferences = (value: unknown) => {
  if (!Array.isArray(value)) {
    throw new Error("studyPreferences must be an array");
  }

  const preferences = value.map((preference) => {
    if (typeof preference !== "string") {
      throw new Error("studyPreferences must only contain strings");
    }

    return preference.trim();
  });

  return Array.from(new Set(preferences.filter(Boolean)));
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user without password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileBody>,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const update: {
      name?: string;
      bio?: string;
      studyPreferences?: string[];
    } = {};

    try {
      if (req.body.name !== undefined) {
        const name = normalizeOptionalText(req.body.name, "name");

        if (!name) {
          return sendError(res, "Name is required", 400);
        }

        update.name = name;
      }

      if (req.body.bio !== undefined) {
        update.bio = normalizeOptionalText(req.body.bio, "bio");
      }

      if (req.body.studyPreferences !== undefined) {
        update.studyPreferences = normalizeStudyPreferences(
          req.body.studyPreferences
        );
      }
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : "Invalid profile payload",
        400
      );
    }

    if (Object.keys(update).length === 0) {
      return sendError(res, "No profile fields to update", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { ...update, updatedAt: new Date() } },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return sendError(res, "Internal server error", 500);
  }
};

export const addStudyTime = async (
  req: Request<{}, {}, { minutes?: number }>,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const minutes = Number(req.body.minutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 480) {
      return sendError(res, "Minutes must be an integer from 1 to 480", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalStudyTime: minutes }, $set: { updatedAt: new Date() } },
      { new: true }
    )
      .select("totalStudyTime")
      .lean();

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    await createNotification({
      userId,
      type: "focus_session",
      title: "Da luu thoi gian hoc",
      message: `${minutes} phut hoc tap vua duoc cong vao tong thoi gian.`,
      link: "/dashboard",
    }).catch((error) => {
      console.error("Error creating focus notification:", error);
    });

    return sendSuccess(res, {
      totalStudyMinutes: user.totalStudyTime ?? 0,
    });
  } catch (error) {
    console.error("Error updating study time:", error);
    return sendError(res, "Internal server error", 500);
  }
};
