import { api } from "@/lib/api.ts"
import type { Task } from "@/service/taskService.ts"

export interface StatusOverview {
  user: {
    displayName: string
    email: string
  }
  metrics: {
    totalStudyMinutes: number
    completion: {
      completed: number
      total: number
      percent: number
    }
    streak: {
      current: number
      best: number
    }
    focusScore: {
      value: number
      label: string
    }
  }
  todayTasks: Task[]
  weeklyActivity: Array<{
    date: string
    label: string
    total: number
    completed: number
  }>
  calendar: {
    month: string
    days: Array<{
      date: string
      day: number
      total: number
      completed: number
      isToday: boolean
    }>
  }
  recommendedTask: Task | null
}

export const getStatusOverview = async (month?: string) => {
  const response = await api.get<{ success: boolean; data: StatusOverview }>(
    "/me/status/overview",
    {
      params: { month },
    }
  )

  return response.data
}

export const addStudyTime = async (minutes: number) => {
  const response = await api.patch<{
    success: boolean
    data: { totalStudyMinutes: number }
  }>("/me/profile/study-time", { minutes })

  return response.data
}
