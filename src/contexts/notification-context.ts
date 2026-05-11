import { createContext, useContext } from "react"
import type { StudyNotification } from "@/services/notificationService"

export type NotificationContextValue = {
  notifications: StudyNotification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (notificationId: string) => Promise<void>
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }

  return context
}
