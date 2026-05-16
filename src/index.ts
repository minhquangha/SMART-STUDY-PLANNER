import dotenv from 'dotenv';
import { connectDB } from "@/config/db.js";
import express from 'express'
import type { Application} from 'express'
import { globalErrorHandler } from '@/middlewares/global_error.js'
import publicRoutes from '@/api/public/index.js'
import meRoute from '@/api/me/index.js'
import adminRoutes from '@/api/admin/index.js'
import usersRoutes from '@/api/users/index.js'
import{ authMiddlewares} from '@/middlewares/authmiddlewares.js'
import { requireRole } from '@/middlewares/admin.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { startDeadlineReminder } from '@/services/notificationService.js'
dotenv.config();
connectDB();
const app:Application = express()
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())
app.use("/",publicRoutes);
app.use("/me",authMiddlewares,meRoute);
app.use("/api/users", usersRoutes);
app.use("/admin", authMiddlewares, requireRole("admin"), adminRoutes);
app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  startDeadlineReminder();
});
