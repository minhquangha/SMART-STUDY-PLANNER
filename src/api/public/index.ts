import { Router } from "express";
import login from "@/api/public/auth/login.js";
import logout from "@/api/public/auth/logout.js";
import refresh from "@/api/public/auth/refresh.js";
import register from "@/api/public/auth/register.js";
const router: Router = Router();
router.post("/login",login)
router.post("/logout",logout)
router.post("/refresh",refresh)
router.post("/register",register)
export default router;
