import { Router } from "express";
const router: Router = Router();
import { getTasks,createTask,updateTask,deleteTask,getTasksToday } from "@/controllers/tasksController.js";
import { authMiddlewares } from "@/middlewares/authmiddlewares.js";
router.get("/", authMiddlewares, getTasks);
router.get("/today", authMiddlewares, getTasksToday);
router.post("/", authMiddlewares, createTask);
router.put("/:id", authMiddlewares, updateTask);
router.delete("/:id", authMiddlewares, deleteTask);


export default router;