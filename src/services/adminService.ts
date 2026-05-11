import { api } from "@/services/api"

export interface AdminLoginData {
  username: string
  password: string
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role: "user" | "admin"
  createdAt: string
  updatedAt?: string
  studyPreferences?: string[]
  streak?: number
  totalStudyTime?: number
  taskCount: number
}

export interface AdminUsersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUsersData {
  users: AdminUser[]
  pagination: AdminUsersPagination
}

export interface AdminUsersParams {
  search?: string
  page?: number
  limit?: number
}

export const adminLogin = async (data: AdminLoginData) => {
  const response = await api.post<{ message: string }>(
    "/admin-login",
    data
  )

  return response.data
}

export const adminLogout = async () => {
  const response = await api.post<{
    success: boolean
    data: { message: string }
  }>("/admin-logout")

  return response.data.data
}

export const getAdminSession = async () => {
  const response = await api.get<{
    success: boolean
    data: { authenticated: boolean }
  }>("/admin/session")

  return response.data.data
}

export const getAdminUsers = async (params: AdminUsersParams) => {
  const response = await api.get<{ success: boolean; data: AdminUsersData }>(
    "/admin/users",
    { params }
  )

  return response.data.data
}

export const deleteAdminUser = async (id: string) => {
  const response = await api.delete<{
    success: boolean
    data: { message: string; deletedTaskCount: number }
  }>(`/admin/users/${id}`)

  return response.data.data
}
