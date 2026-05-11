import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useToast } from "@/contexts/toast-context"
import { NotificationContext } from "@/contexts/notification-context"
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  streamNotifications,
  type StudyNotification,
} from "@/services/notificationService"

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<StudyNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let retryTimer: number | undefined

    const loadNotifications = async () => {
      try {
        const data = await getNotifications()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    const connect = () => {
      void streamNotifications({
        signal: controller.signal,
        onNotification: (notification) => {
          setNotifications((current) => {
            if (current.some((item) => item._id === notification._id)) {
              return current
            }

            if (!notification.readAt) {
              setUnreadCount((count) => count + 1)
            }

            return [notification, ...current].slice(0, 50)
          })

          toast({
            title: notification.title,
            description: notification.message,
          })
        },
      }).catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        console.error("Notification stream disconnected:", error)
        retryTimer = window.setTimeout(connect, 5000)
      })
    }

    void loadNotifications()
    connect()

    return () => {
      controller.abort()
      if (retryTimer) {
        window.clearTimeout(retryTimer)
      }
    }
  }, [toast])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const currentNotification = notifications.find(
        (notification) => notification._id === notificationId
      )
      const updatedNotification = await markNotificationAsRead(notificationId)

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? updatedNotification : notification
        )
      )

      if (currentNotification && !currentNotification.readAt) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    },
    [notifications]
  )

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead()
    const readAt = new Date().toISOString()

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? readAt,
      }))
    )
    setUnreadCount(0)
  }, [])

  const removeNotification = useCallback(
    async (notificationId: string) => {
      const currentNotification = notifications.find(
        (notification) => notification._id === notificationId
      )
      await deleteNotification(notificationId)
      setNotifications((current) =>
        current.filter((notification) => notification._id !== notificationId)
      )

      if (currentNotification && !currentNotification.readAt) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    },
    [notifications]
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }),
    [markAllAsRead, markAsRead, notifications, removeNotification, unreadCount]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
