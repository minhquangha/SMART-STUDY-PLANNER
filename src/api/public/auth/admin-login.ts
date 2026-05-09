import {Admin} from "@/models/admin.js";
import z from "zod";
import jwt from "jsonwebtoken";
import type { Request,Response } from "express";
const loginSchema = {
    username: z.string().min(3).max(30),
    password: z.string().min(6).max(30),
}
const adminLogin = async (req:Request, res: Response) => {
    const { username, password } = req.body;
    const { error } = z.object(loginSchema).safeParse({ username, password });
    if (error) {
        return res.status(400).json({ error: error});
    }
    const admin =  await Admin.findOne({ username });
    if (!admin) {
        return res.status(401).json({ error: "Admin not found" });
    }
    if (admin.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
    }
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ id: admin._id }, secretKey, { expiresIn: "1h" });
    return res.status(200).json({ message: "Admin login successful",token });
}

export default adminLogin;