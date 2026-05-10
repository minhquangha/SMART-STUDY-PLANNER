import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

export default function AdminProtectedRoute({
  children,
}: {
  children: ReactNode
}) {
  const token = localStorage.getItem("adminToken")

  if (!token) {
    return <Navigate to="/admin-login" replace />
  }

  return children
}
