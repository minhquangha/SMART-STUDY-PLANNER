import type { Request, Response } from "express";
import { clearAdminCookie } from "@/utils/authCookies.js";
import { sendSuccess } from "@/utils/apiresponse.js";

const adminLogout = (_req: Request, res: Response) => {
  clearAdminCookie(res);
  return sendSuccess(res, { message: "Admin logout successful" });
};

export default adminLogout;
