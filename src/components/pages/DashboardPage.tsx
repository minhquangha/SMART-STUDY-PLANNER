import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Trash2, Calendar, Loader2, Pencil, FilterX, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getTasks, createTask, deleteTask, updateTask, generateTasks } from "@/service/taskService.ts"
import type { GeneratedTaskDraft, Task } from "@/service/taskService.ts"
import { motion, AnimatePresence } from "motion/react"
import { useSearchParams } from "react-router-dom"

const priorityColor: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  medium: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  high: "bg-red-100 text-red-700 hover:bg-red-100",
}
const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "in progress": "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  completed: "bg-green-100 text-green-700 hover:bg-green-100",
}

export default function TaskPage() {
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
  const [aiFormData, setAiFormData] = useState({
    prompt: "",
    targetDate: "",
    dailyMinutes: "",
  })

  // State quản lý Filters (Khớp logic Backend)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    sort: "recent",
    page: 1,
    isToday: false,
    date: "",
  })

  // State cho Form (Dùng chung cho cả Create và Edit)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
  })

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await getTasks(filters)
      setTasks(response.data)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách task:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task._id, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", error);
    }
  };

  useEffect(() => {
    fetchTasks()
  }, [filters])

  // Logic Dialog
  const openCreateDialog = () => {
    setEditingTask(null)
    setFormData({ title: "", description: "", priority: "medium", status: "pending", dueDate: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.split('T')[0],
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData)
      } else {
        await createTask(formData)
      }
      setIsDialogOpen(false)
      fetchTasks()
    } catch (error) {
      console.error("Lỗi xử lý task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa task này?")) {
      try {
        await deleteTask(id)
        fetchTasks()
      } catch (error) {
        console.error("Lỗi khi xóa task:", error)
      }
    }
  }

  const openAiDialog = () => {
    setAiError(null)
    setAiDrafts([])
    setSelectedDraftIndexes([])
    setIsAiDialogOpen(true)
  }

  const handleGenerateTasks = async (e: React.FormEvent) => {
    e.preventDefault()

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

  const updateAiDraft = (
    index: number,
    patch: Partial<GeneratedTaskDraft>
  ) => {
    setAiDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, ...patch } : draft
      )
    )
  }

  const toggleDraftSelection = (index: number) => {
    setSelectedDraftIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
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
      fetchTasks()
    } catch (error) {
      console.error("Lỗi khi lưu task AI:", error)
      setAiError("Không thể lưu các task đã chọn. Vui lòng thử lại.")
    } finally {
      setIsSavingDrafts(false)
    }
  }

  const resetFilters = () => {
    setFilters({ search: "", status: "all", priority: "all", sort: "recent", page: 1, isToday: false, date: "" })
  }

  useEffect(() => {
    const createParam = searchParams.get("create")
    const aiPromptParam = searchParams.get("aiPrompt")
    const searchParam = searchParams.get("search")
    const dateParam = searchParams.get("date")

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
  }, [queryString])

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN")

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lộ trình học tập</h1>
          <p className="text-muted-foreground">Quản lý các task trong Smart Study Planner</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="flex gap-2" onClick={openAiDialog}>
            <Sparkles className="h-4 w-4" /> AI tạo kế hoạch
          </Button>
          <Button className="flex gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Tạo Task mới
          </Button>
        </div>
      </div>

      {/* Toolbar Filter */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tiêu đề..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1, isToday: false, date: "" })}
            />
          </div>

          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v, page: 1, isToday: false, date: "" })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="in progress">Đang làm</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v, page: 1, isToday: false, date: "" })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Độ ưu tiên" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => setFilters({ ...filters, sort: v, page: 1, isToday: false, date: "" })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mới nhất</SelectItem>
              <SelectItem value="deadline">Hạn chót</SelectItem>
              <SelectItem value="priority">Độ ưu tiên</SelectItem>
              <SelectItem value="recommended">Gợi ý</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={filters.isToday ? "default" : "outline"}
            className="flex gap-2"
            onClick={() => setFilters({ ...filters, isToday: !filters.isToday, date: "", page: 1 })}
          >
            <Calendar className="h-4 w-4" /> Hôm nay
          </Button>

          {filters.date && (
            <Button variant="secondary" onClick={() => setFilters({ ...filters, date: "", page: 1 })}>
              Ngày {formatDate(filters.date)}
            </Button>
          )}

          {(filters.search || filters.status !== "all" || filters.priority !== "all" || filters.isToday || filters.date) && (
            <Button variant="ghost" size="icon" onClick={resetFilters} title="Xóa lọc">
              <FilterX className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Task Table */}
      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[350px]">Tiêu đề & Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Hạn chót</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">Đang tải danh sách...</TableCell></TableRow>
            ) : tasks.length > 0 ? (
              <AnimatePresence>
                {[...tasks].sort((a, b) => {
                  if (a.status === 'completed' && b.status !== 'completed') return 1;
                  if (a.status !== 'completed' && b.status === 'completed') return -1;
                  return 0;
                }).map((task) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    key={task._id} 
                    className="border-b transition-colors cursor-pointer hover:bg-slate-50/50" 
                    onClick={() => openEditDialog(task)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleToggleTaskStatus(task)}
                          />
                        </div>
                        <div>
                          <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          <div className={`text-xs truncate max-w-[250px] ${task.status === 'completed' ? 'line-through text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {task.description || "Không có mô tả"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Badge className={`${statusColor[task.status] || ''} border-none shadow-none capitalize`}>{task.status}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Badge className={`${priorityColor[task.priority] || ''} border-none shadow-none capitalize`}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatDate(task.dueDate)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(task)}>
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => handleDelete(task._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>            ) : (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Không tìm thấy công việc nào.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Trang <strong>{filters.page}</strong></p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={filters.page === 1} onClick={() => setFilters({...filters, page: filters.page - 1})}>Trước</Button>
          <Button variant="outline" size="sm" disabled={tasks.length < 10} onClick={() => setFilters({...filters, page: filters.page + 1})}>Sau</Button>
        </div>
      </div>

      {/* Dialog chung cho cả Create và Edit */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI tạo kế hoạch học tập</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGenerateTasks} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Mục tiêu học tập</Label>
              <Textarea
                id="ai-prompt"
                required
                rows={4}
                value={aiFormData.prompt}
                onChange={(e) =>
                  setAiFormData({ ...aiFormData, prompt: e.target.value })
                }
                placeholder="VD: Tôi muốn ôn thi JavaScript trong 2 tuần, tập trung vào async, DOM và React cơ bản."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-target-date">Hạn hoàn thành</Label>
                <Input
                  id="ai-target-date"
                  type="date"
                  value={aiFormData.targetDate}
                  onChange={(e) =>
                    setAiFormData({ ...aiFormData, targetDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-daily-minutes">Phút học mỗi ngày</Label>
                <Input
                  id="ai-daily-minutes"
                  type="number"
                  min={15}
                  step={15}
                  value={aiFormData.dailyMinutes}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      dailyMinutes: e.target.value,
                    })
                  }
                  placeholder="60"
                />
              </div>
            </div>

            {aiError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {aiError}
              </p>
            )}

            <Button type="submit" disabled={isGeneratingTasks} className="w-full gap-2">
              {isGeneratingTasks ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Tạo bản nháp
            </Button>
          </form>

          {aiDrafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Task AI đề xuất</h3>
                <p className="text-xs text-muted-foreground">
                  Đã chọn {selectedDraftIndexes.length}/{aiDrafts.length}
                </p>
              </div>

              <div className="space-y-3">
                {aiDrafts.map((draft, index) => (
                  <div key={index} className="rounded-md border bg-white p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        className="mt-2"
                        checked={selectedDraftIndexes.includes(index)}
                        onCheckedChange={() => toggleDraftSelection(index)}
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`ai-title-${index}`}>Tiêu đề</Label>
                          <Input
                            id={`ai-title-${index}`}
                            value={draft.title}
                            onChange={(e) =>
                              updateAiDraft(index, { title: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ai-description-${index}`}>Mô tả</Label>
                          <Textarea
                            id={`ai-description-${index}`}
                            rows={2}
                            value={draft.description}
                            onChange={(e) =>
                              updateAiDraft(index, {
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Độ ưu tiên</Label>
                            <Select
                              value={draft.priority}
                              onValueChange={(value) =>
                                updateAiDraft(index, {
                                  priority: value as GeneratedTaskDraft["priority"],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Thấp</SelectItem>
                                <SelectItem value="medium">Trung bình</SelectItem>
                                <SelectItem value="high">Cao</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`ai-due-date-${index}`}>Hạn chót</Label>
                            <Input
                              id={`ai-due-date-${index}`}
                              type="date"
                              value={draft.dueDate}
                              onChange={(e) =>
                                updateAiDraft(index, { dueDate: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${priorityColor[draft.priority]} border-none shadow-none`}>
                            {draft.priority}
                          </Badge>
                          <Badge className={`${statusColor[draft.status]} border-none shadow-none`}>
                            {draft.status}
                          </Badge>
                          {draft.dueDate && (
                            <Badge variant="outline">{formatDate(draft.dueDate)}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAiDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={aiDrafts.length === 0 || isSavingDrafts}
              onClick={handleSaveGeneratedTasks}
              className="gap-2"
            >
              {isSavingDrafts && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu task đã chọn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Chi tiết & Chỉnh sửa Task" : "Thêm công việc mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="VD: Học Machine Learning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea
                id="desc"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập chi tiết công việc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="in progress">Đang làm</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Hạn chót</Label>
              <Input
                id="date" type="date" required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              {editingTask && (
                <Button type="button" variant="destructive" onClick={() => { handleDelete(editingTask._id); setIsDialogOpen(false); }}>
                  Xóa Task
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTask ? "Cập nhật" : "Lưu công việc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
