import { Router } from "express";
import tasksRouter from "./tasks/index.js";

const router: Router = Router();
router.get("/profile",(req,res)=>{
    res.json({ message: "Get user profile data" });
})

router.use("/tasks", tasksRouter);

export default router;