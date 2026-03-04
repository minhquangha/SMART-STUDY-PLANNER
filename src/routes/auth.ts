import { Router } from "express";
import authController from "@/controllers/authController.js";
const router:Router = Router();
router.post("/register",authController.register);
export default router;