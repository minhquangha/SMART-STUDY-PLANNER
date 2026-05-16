import type { CookieOptions, Response } from "express";

export const AUTH_COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refreshToken";

export const AUTH_COOKIE_MAX_AGE = 2 * 60 * 60 * 1000;
export const REFRESH_COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

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

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
};

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
};
