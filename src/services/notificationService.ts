import { api } from "@/services/api"

export interface StudyNotification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  link: string
  readAt: string | null
  createdAt: string
}

export interface NotificationListData {
  notifications: StudyNotification[]
  unreadCount: number
}

type StreamOptions = {
  signal: AbortSignal
  onNotification: (notification: StudyNotification) => void
}

const getApiBaseUrl = () => {
  return String(api.defaults.baseURL || "").replace(/\/$/, "")
}

const parseSseBlock = (block: string) => {
  let event = "message"
  const dataLines: string[] = []

  block.split(/\r?\n/).forEach((line) => {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart())
    }
  })

  return {
    event,
    data: dataLines.join("\n"),
  }
}

export const getNotifications = async () => {
  const res = await api.get<{ success: boolean; data: NotificationListData }>(
    "/me/notifications"
  )

  return res.data.data
}

export const markNotificationAsRead = async (notificationId: string) => {
  const res = await api.patch<{ success: boolean; data: StudyNotification }>(
    `/me/notifications/${notificationId}/read`
  )

  return res.data.data
}

export const markAllNotificationsAsRead = async () => {
  const res = await api.patch<{ success: boolean; data: { message: string } }>(
    "/me/notifications/read-all"
  )

  return res.data.data
}

export const deleteNotification = async (notificationId: string) => {
  const res = await api.delete<{ success: boolean; data: { message: string } }>(
    `/me/notifications/${notificationId}`
  )

  return res.data.data
}

export const streamNotifications = async ({
  signal,
  onNotification,
}: StreamOptions) => {
  const response = await fetch(`${getApiBaseUrl()}/me/notifications/stream`, {
    credentials: "include",
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error("Unable to connect notification stream")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (!signal.aborted) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\n\n/)
    buffer = blocks.pop() ?? ""

    blocks.forEach((block) => {
      const parsed = parseSseBlock(block)
      if (parsed.event !== "notification" || !parsed.data) {
        return
      }

      onNotification(JSON.parse(parsed.data) as StudyNotification)
    })
  }
}
