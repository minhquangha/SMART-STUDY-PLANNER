import { api } from "@/lib/api.ts"

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
  const response = await api.post<{ message: string; token: string }>(
    "/admin-login",
    data
  )

  return response.data
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
