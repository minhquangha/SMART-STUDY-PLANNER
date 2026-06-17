import { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { sendError } from "@/utils/apiresponse.js";

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
export const uploadAvatarMiddleware = (
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