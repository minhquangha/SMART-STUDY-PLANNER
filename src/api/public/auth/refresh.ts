import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Session from "@/models/session.js";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";
import { REFRESH_COOKIE_NAME, setAuthCookie } from "@/utils/authCookies.js";

const ACCESS_TOKEN_TTL = "2h";

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    return sendError(res, "No refresh token provided", 401);
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return sendError(res, "JWT_SECRET is not configured", 500);
  }

  const session = await Session.findOne({ refreshToken });

  const expiredAt = session?.expiredAt;

  if (!session || !expiredAt || expiredAt.getTime() <= Date.now()) {
    if (session) {
      await Session.deleteOne({ _id: session._id });
    }

    return sendError(res, "Invalid refresh token", 401);
  }

  const user = await User.findById(session.userId).select("email role").lean();

  if (!user) {
    await Session.deleteOne({ _id: session._id });
    return sendError(res, "Invalid refresh token", 401);
  }

  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  setAuthCookie(res, accessToken);

  return sendSuccess(res, {
    authenticated: true,
    user: {
      userId: String(user._id),
      email: user.email,
      role: user.role === "admin" ? "admin" : "user",
    },
  });
};

export default refresh;
