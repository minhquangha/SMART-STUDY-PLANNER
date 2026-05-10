import { Router } from "express";
import tasksRouter from "./tasks/index.js";
import { getProfile, addStudyTime } from "./profile/profile.js";
import { getStatusOverview } from "./status/overview.js";

const router: Router = Router();
router.get("/profile", getProfile);
router.patch("/profile/study-time", addStudyTime);
router.get("/status/overview", getStatusOverview);
router.use("/tasks", tasksRouter);

export default router;
