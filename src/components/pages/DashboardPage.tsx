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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Trash2, Calendar, Loader2, Pencil, FilterX } from "lucide-react"
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
import { getTasks, createTask, deleteTask, updateTask } from "@/service/taskService.ts"

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

interface Task {
  _id: string; title: string; description: string; status: string;
  priority: string; dueDate: string; userId: string; createdAt: string;
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // State quản lý Filters (Khớp logic Backend)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    sort: "recent",
    page: 1,
    isToday: false,
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

  const resetFilters = () => {
    setFilters({ search: "", status: "all", priority: "all", sort: "recent", page: 1, isToday: false })
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN")

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lộ trình học tập</h1>
          <p className="text-muted-foreground">Quản lý các task trong Smart Study Planner</p>
        </div>
        <Button className="flex gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> Tạo Task mới
        </Button>
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
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1, isToday: false })}
            />
          </div>

          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v, page: 1, isToday: false })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="in progress">Đang làm</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v, page: 1, isToday: false })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Độ ưu tiên" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => setFilters({ ...filters, sort: v, page: 1, isToday: false })}>
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
            onClick={() => setFilters({ ...filters, isToday: !filters.isToday, page: 1 })}
          >
            <Calendar className="h-4 w-4" /> Hôm nay
          </Button>

          {(filters.search || filters.status !== "all" || filters.priority !== "all" || filters.isToday) && (
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
              tasks.map((task) => (
                <TableRow key={task._id} className="cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => openEditDialog(task)}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px]">{task.description || "Không có mô tả"}</div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Badge className={`${statusColor[task.status]} border-none shadow-none capitalize`}>{task.status}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Badge className={`${priorityColor[task.priority]} border-none shadow-none capitalize`}>{task.priority}</Badge>
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
                </TableRow>
              ))
            ) : (
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