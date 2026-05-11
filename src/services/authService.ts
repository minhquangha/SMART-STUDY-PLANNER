import { api } from "@/services/api"

interface LoginData {
  identifier: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export const login = (data: LoginData) => {
  return api.post("/login", data)
}

export const register = (data: RegisterData) => {
  return api.post("/register", data)
}

export const logout = () => {
  return api.post("/logout")
}

export const getSession = () => {
  return api.get("/me/session")
}
