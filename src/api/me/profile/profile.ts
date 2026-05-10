import type { Request, Response } from "express";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";

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

    return sendSuccess(res, {
      totalStudyMinutes: user.totalStudyTime ?? 0,
    });
  } catch (error) {
    console.error("Error updating study time:", error);
    return sendError(res, "Internal server error", 500);
  }
};
