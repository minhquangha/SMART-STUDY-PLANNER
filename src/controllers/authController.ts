import type { Request, Response } from "express";
import { User } from "@/models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
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
  },

  login: async (req: Request<{},{},LoginRequestBody>, res: Response) => {
    // Login logic here
    const { email, password }: LoginRequestBody = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return sendError(res, "Invalid email", 400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        console.log(isPasswordValid)
        return sendError(res, "Invalid password", 400  );
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "2h" });
    sendSuccess(res, { token });
  }
};
export default authController;