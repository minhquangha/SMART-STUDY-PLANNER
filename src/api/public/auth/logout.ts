import type { Request, Response } from "express";
import { clearAuthCookie } from "@/utils/authCookies.js";
import { sendSuccess } from "@/utils/apiresponse.js";

const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return sendSuccess(res, { message: "Logout successful" });
};

export default logout;
