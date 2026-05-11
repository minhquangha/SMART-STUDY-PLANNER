import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/services/taskService"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import type { TaskFormData } from "@/utils/taskConstants"

interface TaskFormDialogProps {
  editingTask: Task | null
  formData: TaskFormData
  handleDelete: (id: string) => Promise<void>
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  isOpen: boolean
  isSubmitting: boolean
  setFormData: Dispatch<SetStateAction<TaskFormData>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export function TaskFormDialog({
  editingTask,
  formData,
  handleDelete,
  handleSubmit,
  isOpen,
  isSubmitting,
  setFormData,
  setIsOpen,
}: TaskFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Chi tiết & Chỉnh sửa Task" : "Thêm công việc mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              placeholder="VD: Học Machine Learning"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea
              id="desc"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
              placeholder="Nhập chi tiết công việc..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as TaskFormData["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="in progress">Đang làm</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as TaskFormData["priority"],
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Hạn chót</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(event) =>
                setFormData({ ...formData, dueDate: event.target.value })
              }
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            {editingTask && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  void handleDelete(editingTask._id)
                  setIsOpen(false)
                }}
              >
                Xóa Task
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTask ? "Cập nhật" : "Lưu công việc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
