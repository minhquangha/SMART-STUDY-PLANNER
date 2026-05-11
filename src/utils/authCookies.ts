import type { CookieOptions, Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";
export const ADMIN_COOKIE_NAME = "admin_token";

export const AUTH_COOKIE_MAX_AGE = 2 * 60 * 60 * 1000;
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 1000;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
};

export const setAdminCookie = (res: Response, token: string) => {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
};

export const clearAdminCookie = (res: Response) => {
  res.clearCookie(ADMIN_COOKIE_NAME, baseCookieOptions);
};
