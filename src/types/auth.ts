import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?:{
        userId: string;
        email?: string;
      };
      admin?: unknown;
    }
  }
}
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email?: string;
}

// export interface AuthRequest extends Express.Request {
//   user: {
//     userId: string;
//     email: string;
//   };
// }
