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
    console.log("login data", data)
    const response  = api.post("/login", data)
    console.log(response)
    return response
  }

export const register = (data: RegisterData) => {
    return api.post("/register", data)
  }