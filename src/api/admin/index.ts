import { Router } from 'express'
const router: Router = Router();


router.get("/user",(req,res)=>{
    res.json({ message: "Get user data" });
})

export default router;