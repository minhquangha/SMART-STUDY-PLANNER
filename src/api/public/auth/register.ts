import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "@/models/user.js";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải từ 3 đến 30 ký tự")
    .max(30, "Tên đăng nhập phải từ 3 đến 30 ký tự")
    .regex(/^[A-Za-z0-9_]+$/, "Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới"),
  email: z.string().trim().email("Email không đúng định dạng"),
  password: z
    .string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/,
      "Mật khẩu cần có chữ, số và ký tự đặc biệt",
    ),
});

const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.issues[0]?.message || "Thông tin đăng ký không hợp lệ",
      400,
    );
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const userExists = await User.findOne({
    $or: [
      { name },
      { email },
    ],
  }).collation({ locale: "en", strength: 2 });

  if (userExists) {
    return sendError(res, "Email hoặc tên đăng nhập đã tồn tại", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  sendSuccess(res, { message: "Đăng ký thành công" }, 201);
};

export default register;
