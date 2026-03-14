import { api } from "@/lib/api.ts";

// service/taskService.ts

export const getTasks = async (filters: any) => {
  // Nếu filter có flag isToday, gọi route today
  if (filters.isToday) {
    const res = await api.get("/tasks/today");
    return res.data;
  }

  // Ngược lại gọi route chính với params
  const res = await api.get("/tasks", {
    params: {
      status: filters.status !== "all" ? filters.status : undefined,
      priority: filters.priority !== "all" ? filters.priority : undefined,
      search: filters.search || undefined,
      sort: filters.sort || "recent",
      page: filters.page,
      limit: 10
    }
  });
  return res.data;
};

export const createTask = (taskData) => {
    return api.post("/tasks", taskData)
}

export const updateTask = (taskId, taskData) => {
    return api.put(`/tasks/${taskId}`, taskData)
}

export const deleteTask = (taskId) => {
    return api.delete(`/tasks/${taskId}`)
}