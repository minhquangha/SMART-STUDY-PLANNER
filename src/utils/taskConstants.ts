import type { Task } from "@/services/taskService"

export type TaskPriority = Task["priority"]
export type TaskStatus = Task["status"]
export type TaskSort = "recent" | "deadline" | "priority" | "recommended"

export interface TasksPageFilters {
  search: string
  status: TaskStatus | "all"
  priority: TaskPriority | "all"
  sort: TaskSort
  page: number
  isToday: boolean
  date: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
}

export interface AiTaskFormData {
  prompt: string
  targetDate: string
  dailyMinutes: string
}

export const priorityColor: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  medium: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  high: "bg-red-100 text-red-700 hover:bg-red-100",
}

export const statusColor: Record<TaskStatus, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "in progress": "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  completed: "bg-green-100 text-green-700 hover:bg-green-100",
}

export const priorityLabel: Record<TaskPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
}

export const statusLabel: Record<TaskStatus, string> = {
  pending: "Chờ xử lý",
  "in progress": "Đang làm",
  completed: "Hoàn thành",
}

export const sortLabel: Record<TaskSort, string> = {
  recent: "Mới nhất",
  deadline: "Hạn chót",
  priority: "Độ ưu tiên",
  recommended: "Gợi ý",
}

export const defaultFilters: TasksPageFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "recent",
  page: 1,
  isToday: false,
  date: "",
}

export const defaultTaskFormData: TaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  dueDate: "",
}

export const defaultAiTaskFormData: AiTaskFormData = {
  prompt: "",
  targetDate: "",
  dailyMinutes: "",
}
