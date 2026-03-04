import type { Request, Response } from "express";
import { User } from "@/models/user.js";
import bcrypt from "bcryptjs";

interface RegisterRequestBody {
    email: string;
    password: string;
}
interface LoginRequestBody {
    email: string;
    password: string;
}
const authController = {
    register: async (req: Request<{},{},RegisterRequestBody>, res: Response) => {
    // Registration logic here
    // check if user is not exists
    // hash password
    // save user to database
    const { email, password }: RegisterRequestBody = req.body;
    const userExits =  await User.findOne({ email });
    if (userExits) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, hashedPassword });
    await user.save();
    // we need to redirect to login page
    res.status(201).json({ message: "User registered successfully" });
  },

  login: async (req: Request<{},{},LoginRequestBody>, res: Response) => {
    // Login logic here
  }
};
export default authController;