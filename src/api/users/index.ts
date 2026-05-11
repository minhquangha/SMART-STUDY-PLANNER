import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { User } from "@/models/user.js";
import { authMiddlewares } from "@/middlewares/authmiddlewares.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import {
  deleteCloudinaryAsset,
  uploadAvatarBuffer,
} from "@/services/cloudinaryService.js";

const router: Router = Router();

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: AVATAR_MAX_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_AVATAR_TYPES.has(file.mimetype)) {
      callback(new Error("Only JPEG and PNG images are allowed"));
      return;
    }

    callback(null, true);
  },
});

const uploadAvatarMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("avatar")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "Avatar file must be 2 MB or smaller", 400);
    }

    return sendError(
      res,
      error instanceof Error ? error.message : "Invalid avatar upload",
      400
    );
  });
};

router.post(
  "/avatar",
  authMiddlewares,
  uploadAvatarMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }

      if (!req.file) {
        return sendError(res, "Avatar file is required", 400);
      }

      const user = await User.findById(userId).select("avatar");

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      const previousPublicId =
        typeof user.avatar === "object" && user.avatar?.publicId
          ? user.avatar.publicId
          : "";

      const uploadedAvatar = await uploadAvatarBuffer(req.file.buffer);
      const avatar = {
        url: uploadedAvatar.secure_url,
        publicId: uploadedAvatar.public_id,
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { avatar, updatedAt: new Date() } },
        { new: true, runValidators: true }
      )
        .select("avatar")
        .lean();

      if (!updatedUser) {
        if (avatar.publicId) {
          await deleteCloudinaryAsset(avatar.publicId).catch((error) => {
            console.error("Error deleting uploaded avatar after DB failure:", error);
          });
        }

        return sendError(res, "User not found", 404);
      }

      if (previousPublicId) {
        await deleteCloudinaryAsset(previousPublicId).catch((error) => {
          console.error("Error deleting previous avatar:", error);
        });
      }

      return sendSuccess(res, {
        avatarUrl: avatar.url,
        avatar,
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return sendError(
        res,
        error instanceof Error ? error.message : "Avatar upload failed",
        500
      );
    }
  }
);

export default router;
