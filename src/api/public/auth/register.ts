import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
interface RegisterRequestBody {
    email: string;
    password: string;
}
const register =  async (req: Request<{},{},RegisterRequestBody>, res: Response) => {
    console.log(req.body);
    const { email, password }: RegisterRequestBody = req.body;
    console.log(email, password);
    const userExits =  await User.findOne({ email });
    if (userExits) {
        return sendError(res, "User already exists", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user =  new User({ email: email, password: hashedPassword });
    await user.save();
    sendSuccess(res, { message: "User registered successfully" }, 201);
  };
export default register;