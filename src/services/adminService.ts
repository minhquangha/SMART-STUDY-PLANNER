import { api } from "@/services/api"

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

export const getAdminSession = async () => {
  const response = await api.get<{
    success: boolean
    data: {
      authenticated: boolean
      user: {
        userId: string
        email?: string
        role: "user" | "admin"
      }
    }
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

export const updateAdminUserRole = async (
  id: string,
  role: "user" | "admin"
) => {
  const response = await api.patch<{
    success: boolean
    data: AdminUser
  }>(`/admin/users/${id}/role`, { role })

  return response.data.data
}
