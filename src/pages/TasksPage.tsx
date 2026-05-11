import { useMemo } from "react"
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AiTaskDialog } from "@/components/tasks/AiTaskDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { TaskTable } from "@/components/tasks/TaskTable"
import { TaskToolbar } from "@/components/tasks/TaskToolbar"
import { useTasksPage } from "@/hooks/useTasksPage"
import { cn } from "@/utils/utils"

interface TaskMetricCardProps {
  description: string
  icon: LucideIcon
  tone: "sky" | "emerald" | "amber" | "rose"
  title: string
  value: string
}

const metricToneClass: Record<TaskMetricCardProps["tone"], string> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
}

function TaskMetricCard({
  description,
  icon: Icon,
  title,
  tone,
  value,
}: TaskMetricCardProps) {
  return (
    <div className="flex min-h-[92px] items-center gap-4 rounded-xl border border-[#e2dbe8] bg-white px-5 py-4 shadow-sm">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1",
          metricToneClass[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b6275]">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-[#15121a]">
            {value}
          </span>
          <span className="truncate text-sm text-[#51495c]">{description}</span>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const {
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
  } = useTasksPage()

  const taskMetrics = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "completed").length
    const inProgress = tasks.filter(
      (task) => task.status === "in progress",
    ).length
    const highPriority = tasks.filter(
      (task) => task.priority === "high" && task.status !== "completed",
    ).length
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      completionRate,
      highPriority,
      inProgress,
      total,
    }
  }, [tasks])

  const pageStart = tasks.length > 0 ? (filters.page - 1) * 10 + 1 : 0
  const pageEnd = tasks.length > 0 ? pageStart + tasks.length - 1 : 0

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-xl border border-[#e2dbe8] bg-[linear-gradient(135deg,#ffffff_0%,#fbf8ff_62%,#f7fbff_100%)] p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border border-[#e6deec]" />
        <div className="pointer-events-none absolute right-14 bottom-8 hidden h-20 w-20 rotate-45 rounded-xl border border-[#e6deec] lg:block" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-4 h-7 rounded-full border-[#d8cfdd] bg-white/80 px-3 text-xs font-medium tracking-[0.12em] text-[#403847] shadow-none"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Smart Study Planner
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-[#15121a] sm:text-4xl">
              Lộ trình học tập
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#4f4759]">
              Quản lý nhiệm vụ học tập, theo dõi tiến độ và ưu tiên deadline
              quan trọng trong một không gian gọn gàng, dễ tập trung.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e1b20] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#2d2930]"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4" />
              Tạo Task mới
            </Button>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-lg border-[#d8cfdd] bg-white/80 px-4 text-sm font-semibold text-[#1e1b20] shadow-none hover:bg-[#f5f0f8]"
              onClick={openAiDialog}
            >
              <Bot className="h-4 w-4" />
              AI tạo kế hoạch
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TaskMetricCard
          description="nhiệm vụ"
          icon={Eye}
          title="Đang hiển thị"
          tone="sky"
          value={String(taskMetrics.total)}
        />
        <TaskMetricCard
          description="tỷ lệ"
          icon={CheckCircle2}
          title="Hoàn thành"
          tone="emerald"
          value={`${taskMetrics.completionRate}%`}
        />
        <TaskMetricCard
          description="tiến trình"
          icon={Clock3}
          title="Đang làm"
          tone="amber"
          value={String(taskMetrics.inProgress)}
        />
        <TaskMetricCard
          description="nhiệm vụ"
          icon={AlertTriangle}
          title="Ưu tiên cao"
          tone="rose"
          value={String(taskMetrics.highPriority)}
        />
      </div>

      <section className="relative overflow-hidden rounded-xl border border-[#e2dbe8] bg-white shadow-sm">
        <TaskToolbar
          filters={filters}
          formatDate={formatDate}
          resetFilters={resetFilters}
          setFilters={setFilters}
        />

        <TaskTable
          formatDate={formatDate}
          handleDelete={handleDelete}
          handleToggleTaskStatus={handleToggleTaskStatus}
          loading={loading}
          openAiDialog={openAiDialog}
          openCreateDialog={openCreateDialog}
          openEditDialog={openEditDialog}
          tasks={tasks}
        />

        <Button
          className="absolute bottom-20 right-5 z-20 hidden h-12 w-12 rounded-xl bg-[#1e1b20] text-white shadow-lg shadow-black/15 hover:bg-[#2d2930] lg:inline-flex"
          size="icon"
          aria-label="Tạo task mới"
          onClick={openCreateDialog}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <div className="flex flex-col gap-4 border-t border-[#e2dbe8] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#5e5966]">
            {tasks.length > 0
              ? `Hiển thị ${pageStart}-${pageEnd} trên trang ${filters.page}`
              : "Chưa có nhiệm vụ để hiển thị"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-[#d8cfdd] bg-white text-[#8a8292]"
              disabled={filters.page === 1}
              onClick={() =>
                setFilters({ ...filters, page: filters.page - 1 })
              }
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-lg bg-[#1e1b20] text-sm font-semibold text-white"
              aria-label={`Trang ${filters.page}`}
            >
              {filters.page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-[#d8cfdd] bg-white text-[#1e1b20]"
              disabled={tasks.length < 10}
              onClick={() =>
                setFilters({ ...filters, page: filters.page + 1 })
              }
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <AiTaskDialog
        aiDrafts={aiDrafts}
        aiError={aiError}
        aiFormData={aiFormData}
        formatDate={formatDate}
        handleGenerateTasks={handleGenerateTasks}
        handleSaveGeneratedTasks={handleSaveGeneratedTasks}
        isGeneratingTasks={isGeneratingTasks}
        isOpen={isAiDialogOpen}
        isSavingDrafts={isSavingDrafts}
        selectedDraftIndexes={selectedDraftIndexes}
        setAiFormData={setAiFormData}
        setIsOpen={setIsAiDialogOpen}
        toggleDraftSelection={toggleDraftSelection}
        updateAiDraft={updateAiDraft}
      />

      <TaskFormDialog
        editingTask={editingTask}
        formData={formData}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        isOpen={isDialogOpen}
        isSubmitting={isSubmitting}
        setFormData={setFormData}
        setIsOpen={setIsDialogOpen}
      />
    </div>
  )
}
