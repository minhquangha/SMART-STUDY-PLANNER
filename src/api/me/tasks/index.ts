import { Router } from "express";
import { authMiddlewares } from "@/middlewares/authmiddlewares.js";
import { getTasks} from "@/api/me/tasks/get-task.js";
import { createTask } from "@/api/me/tasks/add-task.js";
import { updateTask } from "@/api/me/tasks/update-task.js";
import { deleteTask } from "@/api/me/tasks/delete-task.js";
const router: Router = Router();
router.get("/", authMiddlewares, getTasks);
router.post("/", authMiddlewares, createTask);
router.put("/:id", authMiddlewares, updateTask);
router.delete("/:id", authMiddlewares, deleteTask);


export default router;
