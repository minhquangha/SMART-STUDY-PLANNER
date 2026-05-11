import {
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/services/taskService"
import { priorityLabel, statusLabel } from "@/utils/taskConstants"
import { cn } from "@/utils/utils"

interface TaskTableProps {
  formatDate: (dateString: string) => string
  handleDelete: (id: string) => Promise<void>
  handleToggleTaskStatus: (task: Task) => Promise<void>
  loading: boolean
  openAiDialog?: () => void
  openCreateDialog?: () => void
  openEditDialog: (task: Task) => void
  tasks: Task[]
}

const statusPillClass: Record<Task["status"], string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  "in progress": "border-[#1e1b20] bg-[#1e1b20] text-white",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

const priorityDotClass: Record<Task["priority"], string> = {
  low: "bg-slate-400",
  medium: "bg-sky-500",
  high: "bg-rose-600",
}

function TaskLoadingState() {
  return (
    <tbody>
      {[0, 1, 2].map((item) => (
        <tr key={item} className="border-b border-[#eee7f2]">
          <td className="px-5 py-5">
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-2/3 rounded bg-[#eee7f2]" />
              <div className="h-3 w-4/5 rounded bg-[#eee7f2]" />
            </div>
          </td>
          <td className="px-4 py-5">
            <div className="h-7 w-24 animate-pulse rounded-full bg-[#eee7f2]" />
          </td>
          <td className="px-4 py-5">
            <div className="h-4 w-20 animate-pulse rounded bg-[#eee7f2]" />
          </td>
          <td className="px-4 py-5">
            <div className="h-4 w-24 animate-pulse rounded bg-[#eee7f2]" />
          </td>
          <td className="px-4 py-5">
            <div className="h-8 w-8 animate-pulse rounded bg-[#eee7f2]" />
          </td>
        </tr>
      ))}
    </tbody>
  )
}

function TaskEmptyState({
  openAiDialog,
  openCreateDialog,
}: Pick<TaskTableProps, "openAiDialog" | "openCreateDialog">) {
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="px-5 py-14 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f0f8] text-[#1e1b20]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Chưa có nhiệm vụ phù hợp
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#5e5966]">
              Thử đổi bộ lọc hoặc tạo nhiệm vụ mới để tiếp tục lộ trình học.
            </p>
            {(openCreateDialog || openAiDialog) && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {openCreateDialog && (
                  <Button
                    className="h-10 gap-2 rounded-lg bg-[#1e1b20] px-4 text-sm"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-4 w-4" />
                    Tạo task mới
                  </Button>
                )}
                {openAiDialog && (
                  <Button
                    variant="outline"
                    className="h-10 gap-2 rounded-lg border-[#d8cfdd] px-4 text-sm"
                    onClick={openAiDialog}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI tạo kế hoạch
                  </Button>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  )
}

export function TaskTable({
  formatDate,
  handleDelete,
  handleToggleTaskStatus,
  loading,
  openAiDialog,
  openCreateDialog,
  openEditDialog,
  tasks,
}: TaskTableProps) {
  const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
    if (firstTask.status === "completed" && secondTask.status !== "completed") {
      return 1
    }

    if (firstTask.status !== "completed" && secondTask.status === "completed") {
      return -1
    }

    return 0
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e2dbe8] bg-[#fbfafc] text-xs uppercase tracking-[0.1em] text-[#6b6275]">
            <th className="w-[48%] px-5 py-4 font-semibold">Nhiệm vụ</th>
            <th className="w-[15%] px-4 py-4 font-semibold">Trạng thái</th>
            <th className="w-[15%] px-4 py-4 font-semibold">Độ ưu tiên</th>
            <th className="w-[14%] px-4 py-4 font-semibold">Hạn chót</th>
            <th className="w-[8%] px-4 py-4 font-semibold">Hành động</th>
          </tr>
        </thead>

        {loading ? (
          <TaskLoadingState />
        ) : sortedTasks.length > 0 ? (
          <tbody>
            <AnimatePresence initial={false}>
              {sortedTasks.map((task) => {
                const isCompleted = task.status === "completed"

                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    key={task._id}
                    className="group cursor-pointer border-b border-[#eee7f2] bg-white transition-colors hover:bg-[#fbfafc]"
                    onClick={() => openEditDialog(task)}
                  >
                    <td className="px-5 py-5 align-middle">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="pt-0.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            className="size-4 rounded-md border-[#cfc4d7]"
                            checked={isCompleted}
                            onCheckedChange={() => {
                              void handleToggleTaskStatus(task)
                            }}
                            aria-label={`Đổi trạng thái ${task.title}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={cn(
                              "line-clamp-2 text-base font-semibold leading-6 text-[#15121a]",
                              isCompleted &&
                                "text-[#746d7c] line-through decoration-2",
                            )}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={cn(
                              "mt-1 line-clamp-2 max-w-[540px] text-sm leading-5 text-[#6b6275]",
                              isCompleted && "line-through",
                            )}
                          >
                            {task.description || "Không có mô tả"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 py-5 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Badge
                        className={cn(
                          "h-7 rounded-full border px-3 text-xs font-medium shadow-none",
                          statusPillClass[task.status],
                        )}
                      >
                        {statusLabel[task.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1f1b24]">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            priorityDotClass[task.priority],
                          )}
                        />
                        <span className="leading-5">
                          {priorityLabel[task.priority]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex items-center gap-2 text-sm text-[#51495c]">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td
                      className="px-4 py-5 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-[#5e5966] hover:bg-[#f2edf5]"
                            aria-label={`Mở hành động cho ${task.title}`}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditDialog(task)}>
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              void handleDelete(task._id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        ) : (
          <TaskEmptyState
            openAiDialog={openAiDialog}
            openCreateDialog={openCreateDialog}
          />
        )}
      </table>
    </div>
  )
}
