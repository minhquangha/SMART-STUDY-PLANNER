import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
interface LoginRequestBody {
    email: string;
    password: string;
}

const login = async (req: Request<{},{},LoginRequestBody>, res: Response) => {
    // Login logic here
    const { email, password }: LoginRequestBody = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return sendError(res, "Invalid email", 400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('alo1')
    if (!isPasswordValid) {
        console.log(isPasswordValid)
        console.log('looxi day ak')
        return sendError(res, "Invalid password", 400  );
    }
    console.log("alo2")
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "2h" });
    sendSuccess(res, { token });
  };

export default login;