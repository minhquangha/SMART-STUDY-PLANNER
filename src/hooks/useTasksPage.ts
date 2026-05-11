import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  createTask,
  deleteTask,
  generateTasks,
  getTasks,
  updateTask,
} from "@/services/taskService"
import type { GeneratedTaskDraft, Task } from "@/services/taskService"
import {
  defaultAiTaskFormData,
  defaultFilters,
  defaultTaskFormData,
} from "@/utils/taskConstants"
import type {
  AiTaskFormData,
  TaskFormData,
  TasksPageFilters,
} from "@/utils/taskConstants"
import type { FormEvent } from "react"

export function useTasksPage() {
  const [searchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [isSavingDrafts, setIsSavingDrafts] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiDrafts, setAiDrafts] = useState<GeneratedTaskDraft[]>([])
  const [selectedDraftIndexes, setSelectedDraftIndexes] = useState<number[]>([])
  const [aiFormData, setAiFormData] = useState<AiTaskFormData>(
    defaultAiTaskFormData,
  )
  const [filters, setFilters] = useState<TasksPageFilters>(defaultFilters)
  const [formData, setFormData] = useState<TaskFormData>(defaultTaskFormData)

  const fetchTasks = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getTasks(filters)
      setTasks(response.data)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách task:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  const openCreateDialog = useCallback(() => {
    setEditingTask(null)
    setFormData(defaultTaskFormData)
    setIsDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.split("T")[0],
    })
    setIsDialogOpen(true)
  }, [])

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed"
      await updateTask(task._id, { status: newStatus })
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? { ...item, status: newStatus } : item,
        ),
      )
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", error)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData)
      } else {
        await createTask(formData)
      }

      setIsDialogOpen(false)
      await fetchTasks()
    } catch (error) {
      console.error("Lỗi xử lý task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) {
      return
    }

    try {
      await deleteTask(id)
      await fetchTasks()
    } catch (error) {
      console.error("Lỗi khi xóa task:", error)
    }
  }

  const openAiDialog = useCallback(() => {
    setAiError(null)
    setAiDrafts([])
    setSelectedDraftIndexes([])
    setIsAiDialogOpen(true)
  }, [])

  const handleGenerateTasks = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const prompt = aiFormData.prompt.trim()
    if (!prompt) {
      setAiError("Vui lòng nhập mục tiêu học tập.")
      return
    }

    setIsGeneratingTasks(true)
    setAiError(null)

    try {
      const dailyMinutes = aiFormData.dailyMinutes
        ? Number(aiFormData.dailyMinutes)
        : undefined
      const response = await generateTasks({
        prompt,
        targetDate: aiFormData.targetDate || undefined,
        dailyMinutes,
      })
      const drafts = response.data.tasks

      setAiDrafts(drafts)
      setSelectedDraftIndexes(drafts.map((_, index) => index))
    } catch (error) {
      console.error("Lỗi khi tạo kế hoạch AI:", error)
      setAiError("Không thể tạo kế hoạch AI. Vui lòng thử lại.")
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const updateAiDraft = (index: number, patch: Partial<GeneratedTaskDraft>) => {
    setAiDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, ...patch } : draft,
      ),
    )
  }

  const toggleDraftSelection = (index: number) => {
    setSelectedDraftIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    )
  }

  const handleSaveGeneratedTasks = async () => {
    const selectedTasks = [...selectedDraftIndexes]
      .sort((a, b) => a - b)
      .map((index) => aiDrafts[index])
      .filter((task): task is GeneratedTaskDraft => Boolean(task))

    if (selectedTasks.length === 0) {
      setAiError("Vui lòng chọn ít nhất một task để lưu.")
      return
    }

    setIsSavingDrafts(true)
    setAiError(null)

    try {
      await Promise.all(selectedTasks.map((task) => createTask(task)))
      setIsAiDialogOpen(false)
      setAiDrafts([])
      setSelectedDraftIndexes([])
      await fetchTasks()
    } catch (error) {
      console.error("Lỗi khi lưu task AI:", error)
      setAiError("Không thể lưu các task đã chọn. Vui lòng thử lại.")
    } finally {
      setIsSavingDrafts(false)
    }
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  useEffect(() => {
    const currentSearchParams = new URLSearchParams(queryString)
    const createParam = currentSearchParams.get("create")
    const aiPromptParam = currentSearchParams.get("aiPrompt")
    const searchParam = currentSearchParams.get("search")
    const dateParam = currentSearchParams.get("date")

    if (searchParam || dateParam) {
      setFilters((current) => ({
        ...current,
        search: searchParam ?? current.search,
        date: dateParam ?? "",
        page: 1,
        isToday: false,
      }))
    }

    if (createParam === "1") {
      openCreateDialog()
    }

    if (aiPromptParam) {
      setAiFormData({
        prompt: aiPromptParam,
        targetDate: "",
        dailyMinutes: "",
      })
      openAiDialog()
    }
  }, [queryString, openCreateDialog, openAiDialog])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN")

  return {
    aiDrafts,
    aiError,
    aiFormData,
    editingTask,
    filters,
    formData,
    formatDate,
    handleDelete,
    handleGenerateTasks,
    handleSaveGeneratedTasks,
    handleSubmit,
    handleToggleTaskStatus,
    isAiDialogOpen,
    isDialogOpen,
    isGeneratingTasks,
    isSavingDrafts,
    isSubmitting,
    loading,
    openAiDialog,
    openCreateDialog,
    openEditDialog,
    resetFilters,
    selectedDraftIndexes,
    setAiFormData,
    setFilters,
    setFormData,
    setIsAiDialogOpen,
    setIsDialogOpen,
    tasks,
    toggleDraftSelection,
    updateAiDraft,
  }
}
