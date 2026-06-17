import { Router } from "express";
import tasksRouter from "./tasks/index.js";
import { getProfile, updateProfile, addStudyTime } from "./profile/profile.js";
import { getStatusOverview } from "./status/overview.js";
import notificationsRouter from "./notifications/index.js";
import { updateAvartar } from "@/api/me/profile/avartar.js";
import { uploadAvatarMiddleware } from "@/middlewares/avartar.js";

const router: Router = Router();
router.get("/session", (req, res) => {
  res.json({ authenticated: true, user: req.user });
});
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/profile/study-time", addStudyTime);
router.patch("/profile/avartar",uploadAvatarMiddleware,updateAvartar)
router.get("/status/overview", getStatusOverview);
router.use("/tasks", tasksRouter);
router.use("/notifications", notificationsRouter);

export default router;
