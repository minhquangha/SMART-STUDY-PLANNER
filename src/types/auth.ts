import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?: string;
    }
  }
}
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
}
