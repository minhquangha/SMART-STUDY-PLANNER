import dotenv from 'dotenv';
import { connectDB } from "@/config/db.js";
import express from 'express'
import type { Application} from 'express'
import { globalErrorHandler } from '@/middlewares/global_error.js'
import publicRoutes from '@/api/public/index.js'
import meRoute from '@/api/me/index.js'
import{ authMiddlewares} from '@/middlewares/authmiddlewares.js'
import cors from 'cors'
dotenv.config();
connectDB();
const app:Application = express()
app.use(cors())
app.use(express.json())
app.use("/",publicRoutes);
app.use("/me",authMiddlewares,meRoute);
app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});