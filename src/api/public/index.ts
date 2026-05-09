import { Router } from "express";
import adminLogin from "@/api/public/auth/admin-login.js";
import login from "@/api/public/auth/login.js";
import register from "@/api/public/auth/register.js";
const router: Router = Router();
router.post("/admin-login",adminLogin)
router.post("/login",login)
router.post("/register",register)
export default router;