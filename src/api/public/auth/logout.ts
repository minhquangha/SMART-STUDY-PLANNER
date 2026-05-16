import type { Request, Response } from "express";
import {
  clearAuthCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "@/utils/authCookies.js";
import { sendSuccess } from "@/utils/apiresponse.js";
import Session from "@/models/session.js";

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }

  clearAuthCookie(res);
  clearRefreshCookie(res);
  return sendSuccess(res, { message: "Logout successful" });
};

export default logout;
