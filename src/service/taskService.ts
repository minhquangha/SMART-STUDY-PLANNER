import { api } from "@/lib/api.ts";

// service/taskService.ts
export interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  userId: string
  createdAt: string
}

export interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  sort?: string
  page?: number
  isToday?: boolean
  date?: string
}

export interface GenerateTasksPayload {
  prompt: string
  startDate?: string
  targetDate?: string
  dailyMinutes?: number
}

export interface GeneratedTaskDraft {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending"
  dueDate: string
}

export const getTasks = async (filters: TaskFilters) => {
  // Nếu filter có flag isToday, gọi route today (nếu có, hoặc chỉnh sửa backend sau)
  if (filters.isToday) {
    const res = await api.get("/me/tasks/today");
    return res.data;
  }

  // Ngược lại gọi route chính với params
  const res = await api.get("/me/tasks", {
    params: {
      status: filters.status !== "all" ? filters.status : undefined,
      priority: filters.priority !== "all" ? filters.priority : undefined,
      search: filters.search || undefined,
      sort: filters.sort || "recent",
      page: filters.page,
      limit: 10,
      date: filters.date || undefined,
    }
  });
  return res.data;
};
export const getTaskToday = async () => {
  const res = await api.get("/me/tasks/today");
  return res.data;
}

export const createTask = (taskData: any) => {
    return api.post("/me/tasks", taskData)
}

export const generateTasks = async (payload: GenerateTasksPayload) => {
  const res = await api.post<{
    success: boolean
    data: { tasks: GeneratedTaskDraft[] }
  }>("/me/tasks/generate", payload)

  return res.data
}

export const updateTask = (taskId: string | number, taskData: any) => {
    return api.put(`/me/tasks/${taskId}`, taskData)
}

export const deleteTask = (taskId: string | number) => {
    return api.delete(`/me/tasks/${taskId}`)
}
