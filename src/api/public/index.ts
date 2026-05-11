import { Router } from "express";
import adminLogout from "@/api/public/auth/admin-logout.js";
import adminLogin from "@/api/public/auth/admin-login.js";
import login from "@/api/public/auth/login.js";
import logout from "@/api/public/auth/logout.js";
import register from "@/api/public/auth/register.js";
const router: Router = Router();
router.post("/admin-login",adminLogin)
router.post("/admin-logout",adminLogout)
router.post("/login",login)
router.post("/logout",logout)
router.post("/register",register)
export default router;
