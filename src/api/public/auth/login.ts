import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import { setAuthCookie } from "@/utils/authCookies.js";

interface LoginRequestBody {
  identifier?: string;
  email?: string;
  name?: string;
  password: string;
}

const loginSchema = z.object({
  identifier: z.string().trim().min(3).optional(),
  email: z.string().trim().min(3).optional(),
  name: z.string().trim().min(3).optional(),
  password: z.string().min(1),
});

const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, "Thông tin đăng nhập không hợp lệ", 400);
  }

  const { password } = parsed.data;
  const identifier = (parsed.data.identifier || parsed.data.email || parsed.data.name || "").trim();

  if (!identifier) {
    return sendError(res, "Thông tin đăng nhập không hợp lệ", 400);
  }

  const normalizedIdentifier = identifier.toLowerCase();
  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { name: identifier },
    ],
  }).collation({ locale: "en", strength: 2 });

  if (!user) {
    return sendError(res, "Sai mật khẩu hoặc tên đăng nhập", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return sendError(res, "Sai mật khẩu hoặc tên đăng nhập", 401);
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" },
  );

  setAuthCookie(res, token);

  sendSuccess(res, { message: "Login successful" });
};

export default login;
