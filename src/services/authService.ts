import { api } from "@/services/api"

interface LoginData {
  identifier: string
  password: string
}

export interface SessionUser {
  userId: string
  email?: string
  role: "user" | "admin"
}

export interface LoginResponse {
  success: boolean
  data: {
    message: string
    user: {
      id: string
      name: string
      email: string
      role: "user" | "admin"
    }
    accessToken: string
  }
}

export interface SessionResponse {
  authenticated: boolean
  user: SessionUser
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export const login = (data: LoginData) => {
  return api.post<LoginResponse>("/login", data)
}

export const register = (data: RegisterData) => {
  return api.post("/register", data)
}

export const logout = () => {
  return api.post("/logout")
}

export const refreshSession = () => {
  return api.post<{ success: boolean; data: SessionResponse }>("/refresh")
}

export const getSession = () => {
  return api.get<{ authenticated: boolean; user: SessionUser }>("/me/session")
}
