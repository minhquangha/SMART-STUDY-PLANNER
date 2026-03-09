import {Router} from "express";
import {authMiddlewares}  from "@/middlewares/authmiddlewares.js";
const router: Router = Router();

router.get("/profile", authMiddlewares, (req, res) => {
    // Logic to get user profile
    res.json({ message: "User profile data" });
});


export default router;