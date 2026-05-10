import { Router } from "express";
import { authMiddlewares } from "@/middlewares/authmiddlewares.js";
import { getTasks} from "@/api/me/tasks/get-task.js";
import { createTask } from "@/api/me/tasks/add-task.js";
import { updateTask } from "@/api/me/tasks/update-task.js";
import { deleteTask } from "@/api/me/tasks/delete-task.js";
import { getTodayTasks } from "@/api/me/tasks/get-task-today.js";
import genTasks from "@/api/me/gen-tasks.js";
const router: Router = Router();
router.get("/", authMiddlewares, getTasks);
router.get("/today", authMiddlewares, getTodayTasks);
router.post("/generate", authMiddlewares, genTasks);
router.post("/", authMiddlewares, createTask);
router.put("/:id", authMiddlewares, updateTask);
router.delete("/:id", authMiddlewares, deleteTask);


export default router;
