import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?:{
        userId: string;
        email?: string;
        role: "user" | "admin";
      };
    }
  }
}
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email?: string;
  role?: "user" | "admin";
}

// export interface AuthRequest extends Express.Request {
//   user: {
//     userId: string;
//     email: string;
//   };
// }
