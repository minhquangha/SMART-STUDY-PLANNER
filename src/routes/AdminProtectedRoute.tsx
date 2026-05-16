import { Navigate } from "react-router-dom"
import { useEffect, useState, type ReactNode } from "react"
import { getAdminSession } from "@/services/adminService"

export default function AdminProtectedRoute({
  children,
}: {
  children: ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true

    getAdminSession()
      .then(() => {
        if (isMounted) {
          setIsAuthenticated(true)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
