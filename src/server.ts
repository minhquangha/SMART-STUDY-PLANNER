import express from 'express'
import type { Application} from 'express'
import { globalErrorHandler } from '@/middlewares/global_error.js'
import authRoutes from '@/routes/auth.js'
import userRoutes from '@/routes/user.js'
import taskRoutes from '@/routes/tasks.js'
const app:Application = express()

app.use(express.json())
app.use("/",authRoutes);
app.use("/user", userRoutes);
app.use("/tasks", taskRoutes);

app.use(globalErrorHandler);

export default app