import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input.tsx"
import { Progress } from "@/components/ui/progress"
import {
  addStudyTime,
  getStatusOverview,
  type StatusOverview,
} from "@/service/statusService.ts"
import { updateTask } from "@/service/taskService.ts"
import type { Task } from "@/service/taskService.ts"

const priorityLabel: Record<Task["priority"], string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
}

const priorityClass: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  medium: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  high: "bg-red-100 text-red-700 hover:bg-red-100",
}

const aiPresets = [
  "Lập kế hoạch ôn thi trong 7 ngày cho môn khó nhất của tôi",
  "Chia nhỏ mục tiêu học React thành các task có deadline rõ ràng",
  "Tạo kế hoạch học 60 phút mỗi ngày cho tuần này",
]

const getCurrentMonth = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN")

const formatStudyTime = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} phút`
  }

  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`
}

const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

export default function StatusPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<StatusOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month] = useState(getCurrentMonth)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isFocusOpen, setIsFocusOpen] = useState(false)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [focusRemaining, setFocusRemaining] = useState(25 * 60)
  const [isFocusRunning, setIsFocusRunning] = useState(false)
  const [isSavingFocus, setIsSavingFocus] = useState(false)
  const [focusError, setFocusError] = useState<string | null>(null)

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const fetchOverview = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      setError(null)
      const response = await getStatusOverview(month)
      setOverview(response.data)
    } catch (err) {
      console.error("Lỗi khi lấy tổng quan học tập:", err)
      setError("Không thể tải tổng quan học tập.")
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [month])

  const finishFocusSession = async (minutes: number) => {
    if (isSavingFocus) {
      return
    }

    setIsFocusRunning(false)
    setIsSavingFocus(true)
    setFocusError(null)

    try {
      const response = await addStudyTime(minutes)
      setOverview((current) =>
        current
          ? {
              ...current,
              metrics: {
                ...current.metrics,
                totalStudyMinutes: response.data.totalStudyMinutes,
              },
            }
          : current
      )
      setIsFocusOpen(false)
      setFocusRemaining(focusMinutes * 60)
    } catch (err) {
      console.error("Lỗi khi lưu thời gian học:", err)
      setFocusError("Không thể lưu thời gian học. Vui lòng thử lại.")
    } finally {
      setIsSavingFocus(false)
    }
  }

  useEffect(() => {
    if (!isFocusRunning) {
      return
    }

    const timer = window.setInterval(() => {
      setFocusRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          void finishFocusSession(focusMinutes)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isFocusRunning, focusMinutes])

  const maxWeeklyTotal = useMemo(() => {
    return Math.max(...(overview?.weeklyActivity.map((item) => item.total) ?? [0]), 1)
  }, [overview])

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed"
      await updateTask(task._id, { status: newStatus })
      await fetchOverview(false)
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", err)
    }
  }

  const openFocusDialog = () => {
    setFocusError(null)
    setIsFocusRunning(false)
    setFocusRemaining(focusMinutes * 60)
    setIsFocusOpen(true)
  }

  const handleFocusMinutesChange = (value: string) => {
    const nextMinutes = Math.max(1, Math.min(480, Number(value) || 1))
    setFocusMinutes(nextMinutes)
    setFocusRemaining(nextMinutes * 60)
  }

  const handleSaveElapsedFocus = () => {
    const elapsedSeconds = focusMinutes * 60 - focusRemaining
    if (elapsedSeconds <= 0) {
      return
    }

    const elapsedMinutes = Math.max(
      1,
      Math.round(elapsedSeconds / 60)
    )
    void finishFocusSession(elapsedMinutes)
  }

  const goToCreateTask = () => {
    navigate("/dashboard/tasks?create=1")
  }

  const goToTaskSearch = (task: Task) => {
    navigate(`/dashboard/tasks?search=${encodeURIComponent(task.title)}`)
  }

  const goToTaskDate = (date: string) => {
    navigate(`/dashboard/tasks?date=${encodeURIComponent(date)}`)
  }

  const openAiPlan = (prompt: string) => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      return
    }

    navigate(`/dashboard/tasks?aiPrompt=${encodeURIComponent(trimmedPrompt)}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium text-destructive">{error || "Không có dữ liệu tổng quan."}</p>
        <Button variant="outline" onClick={() => fetchOverview()}>
          Tải lại
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50 p-6 md:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chào mừng trở lại, {overview.user.displayName}
            </h1>
            <p className="mt-1 text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white gap-2" onClick={openFocusDialog}>
              <Clock3 className="h-4 w-4" />
              Chế độ tập trung
            </Button>
            <Button className="gap-2" onClick={goToCreateTask}>
              <Plus className="h-4 w-4" />
              Tạo Task mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Tổng giờ học</p>
              <h3 className="mt-2 text-2xl font-bold">
                {formatStudyTime(overview.metrics.totalStudyMinutes)}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Cập nhật từ chế độ tập trung</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Hoàn thành hôm nay</p>
              <h3 className="mt-2 text-2xl font-bold">
                {overview.metrics.completion.completed}/{overview.metrics.completion.total}
              </h3>
              <Progress value={overview.metrics.completion.percent} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Flame className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Chuỗi học tập</p>
              <h3 className="mt-2 text-2xl font-bold">
                {overview.metrics.streak.current} ngày
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Kỷ lục: {overview.metrics.streak.best} ngày
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Điểm tập trung</p>
              <h3 className="mt-2 text-2xl font-bold">
                {overview.metrics.focusScore.value}%
              </h3>
              <p className="mt-1 text-xs text-blue-500">
                {overview.metrics.focusScore.label}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nhiệm vụ hôm nay</CardTitle>
            <CardDescription>
              {overview.todayTasks.length} task có hạn trong ngày hôm nay
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {overview.todayTasks.length > 0 ? (
              overview.todayTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
                >
                  <Checkbox
                    id={`task-${task._id}`}
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleToggleTaskStatus(task)}
                  />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <label
                      htmlFor={`task-${task._id}`}
                      className={`min-w-0 cursor-pointer truncate text-sm font-medium ${
                        task.status === "completed"
                          ? "text-muted-foreground line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </label>
                    <Badge className={`${priorityClass[task.priority]} shrink-0 border-none shadow-none`}>
                      {priorityLabel[task.priority]}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Hôm nay không có task nào.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hoạt động học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 w-full items-end justify-between gap-3 rounded-lg bg-gray-100 p-4">
              {overview.weeklyActivity.map((item) => {
                const height = item.total > 0 ? Math.max((item.total / maxWeeklyTotal) * 100, 12) : 6
                const completedPercent = item.total > 0 ? (item.completed / item.total) * 100 : 0

                return (
                  <button
                    key={item.date}
                    type="button"
                    className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center"
                    onClick={() => goToTaskDate(item.date)}
                    title={`${item.completed}/${item.total} task hoàn thành`}
                  >
                    <div className="flex h-full items-end">
                      <div
                        className="relative w-full overflow-hidden rounded-t-sm bg-blue-200 transition-opacity hover:opacity-90"
                        style={{ height: `${height}%` }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-blue-600"
                          style={{ height: `${completedPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-6 md:w-80">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Lịch
            </CardTitle>
            <CardDescription>Tháng {overview.calendar.month}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                <div key={day} className="py-1 font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              {overview.calendar.days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  className={`rounded-md py-1 transition ${
                    day.isToday
                      ? "bg-blue-500 font-bold text-white"
                      : day.total > 0
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "hover:bg-gray-100"
                  }`}
                  onClick={() => goToTaskDate(day.date)}
                  title={`${day.completed}/${day.total} task hoàn thành`}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Trợ lý AI học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Nhập mục tiêu học tập..."
              />
              <Button size="icon" onClick={() => openAiPlan(aiPrompt)} title="Tạo kế hoạch AI">
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {aiPresets.map((preset) => (
                <Button
                  key={preset}
                  variant="secondary"
                  className="h-auto justify-start whitespace-normal text-left text-xs leading-5"
                  onClick={() => openAiPlan(preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task gợi ý tiếp theo</CardTitle>
            <CardDescription>Ưu tiên cao và gần deadline nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.recommendedTask ? (
              <>
                <div className="space-y-2">
                  <Badge className={`${priorityClass[overview.recommendedTask.priority]} border-none shadow-none`}>
                    {priorityLabel[overview.recommendedTask.priority]}
                  </Badge>
                  <h3 className="font-semibold leading-6">
                    {overview.recommendedTask.title}
                  </h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {overview.recommendedTask.description || "Không có mô tả"}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Hạn chót: {formatDate(overview.recommendedTask.dueDate)}
                  </p>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => goToTaskSearch(overview.recommendedTask as Task)}
                >
                  Xem task
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có task đang chờ. Bạn có thể tạo task mới cho mục tiêu tiếp theo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isFocusOpen}
        onOpenChange={(open) => {
          setIsFocusOpen(open)
          if (!open) {
            setIsFocusRunning(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Chế độ tập trung</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label htmlFor="focus-minutes" className="text-sm font-medium">
                Thời lượng (phút)
              </label>
              <Input
                id="focus-minutes"
                type="number"
                min={1}
                max={480}
                value={focusMinutes}
                disabled={isFocusRunning || isSavingFocus}
                onChange={(event) => handleFocusMinutesChange(event.target.value)}
              />
            </div>

            <div className="rounded-lg border bg-slate-50 py-8 text-center">
              <div className="text-5xl font-semibold tracking-tight">
                {formatTimer(focusRemaining)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Thời gian sẽ được cộng vào tổng giờ học khi phiên kết thúc.
              </p>
            </div>

            {focusError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {focusError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSavingFocus}
              onClick={() => setIsFocusRunning((current) => !current)}
            >
              {isFocusRunning ? "Tạm dừng" : "Bắt đầu"}
            </Button>
            <Button
              type="button"
              disabled={isSavingFocus || focusMinutes * 60 === focusRemaining}
              onClick={handleSaveElapsedFocus}
              className="gap-2"
            >
              {isSavingFocus && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu thời gian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
