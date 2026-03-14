import { api } from "@/lib/api.ts";

interface LoginData {
  email: string
  password: string
}
interface RegisterData {
    email: string,
    password: string,
}

export const login = (data: LoginData) => {
    const response  = api.post("/auth/login", data)
    return response
  }

export const register = (data: RegisterData) => {
    return api.post("/auth/register", data)
  }