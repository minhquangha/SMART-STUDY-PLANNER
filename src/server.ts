import express from 'express'
import type { Application} from 'express'
import { globalErrorHandler } from '@/middlewares/global_error.js'
import authRoutes from '@/routes/auth.js'
const app:Application = express()
const port = 3000

app.use(express.json())
app.use("/",authRoutes);

app.use(globalErrorHandler);

export default app