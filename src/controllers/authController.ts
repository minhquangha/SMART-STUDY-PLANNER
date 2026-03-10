import type { Request, Response } from "express";
import { User } from "@/models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    console.log(req.body);
    const { email, password }: RegisterRequestBody = req.body;
    console.log(email, password);
    const userExits =  await User.findOne({ email });
    if (userExits) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("check1");
    const user =  new User({ email: email, password: hashedPassword });
    console.log(user);
    await user.save();
    // we need to redirect to login page
    res.status(201).json({ message: "User registered successfully" });
  },

  login: async (req: Request<{},{},LoginRequestBody>, res: Response) => {
    // Login logic here
    const { email, password }: LoginRequestBody = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email " });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        console.log(isPasswordValid)
        return res.status(400).json({ message: "Invalid  password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "2h" });
    console.log("Generated token:", token);
    res.json({ token,user: { email: user.email } });
  }
};
export default authController;