import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import Session from "@/models/session.js";
import crypto from 'crypto'
import {
  REFRESH_COOKIE_MAX_AGE,
  setAuthCookie,
  setRefreshCookie,
} from "@/utils/authCookies.js";
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
const ACCESS_TOKEN_TTL =  "2h"

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

  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");
  await Session.create({
    userId:user._id,
    refreshToken:refreshToken,
    expiredAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE)
  })

  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  sendSuccess(res, {
    message: "Login successful",
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: accessToken
  });
};

export default login;
