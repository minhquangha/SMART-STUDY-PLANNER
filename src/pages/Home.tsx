import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

const stats = [
  { value: "3", label: "trạng thái công việc" },
  { value: "AI", label: "gợi ý kế hoạch học" },
  { value: "24/7", label: "theo dõi tiến độ" },
]

const features = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Tạo task nhanh",
    description:
      "Ghi lại bài tập, deadline và mức ưu tiên trong một luồng thao tác gọn gàng.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "AI chia nhỏ mục tiêu",
    description:
      "Biến mục tiêu lớn thành các đầu việc có hạn chót, ưu tiên và mô tả rõ ràng.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Theo dõi tiến độ",
    description:
      "Nhìn nhanh việc đang chờ, đang làm và đã hoàn thành để điều chỉnh lịch học.",
  },
  {
    icon: <LockKeyhole className="h-5 w-5" />,
    title: "Dữ liệu cá nhân",
    description:
      "Tài khoản riêng, xác thực JWT và không trộn lẫn kế hoạch giữa các người dùng.",
  },
]

const previewTasks = [
  {
    title: "Ôn React Hooks",
    subject: "Frontend",
    time: "45 phút",
    priority: "Cao",
    status: "Đang làm",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Làm bài tập MongoDB",
    subject: "Backend",
    time: "60 phút",
    priority: "Trung bình",
    status: "Chờ xử lý",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Tổng kết tuần học",
    subject: "Review",
    time: "30 phút",
    priority: "Thấp",
    status: "Hoàn thành",
    color: "bg-emerald-100 text-emerald-700",
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              SmartStudy
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a className="transition hover:text-slate-950" href="#features">
              Tính năng
            </a>
            <a className="transition hover:text-slate-950" href="#workflow">
              Quy trình
            </a>
            <a className="transition hover:text-slate-950" href="#security">
              Bảo mật
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Bắt đầu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <Badge className="mb-5 gap-1.5 border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                <Sparkles className="h-3.5 w-3.5" />
                AI planner cho lịch học cá nhân
              </Badge>

              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                SmartStudy Planner
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Lập lộ trình học rõ ràng, chia nhỏ mục tiêu thành task hằng
                ngày và theo dõi tiến độ trong một dashboard tập trung.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-5 text-sm" asChild>
                  <Link to="/register">
                    Tạo kế hoạch miễn phí
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-5 text-sm"
                  asChild
                >
                  <a href="#features">
                    <PlayCircle className="h-4 w-4" />
                    Xem tính năng
                  </a>
                </Button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-slate-200 pt-6">
                {stats.map((item) => (
                  <div key={item.label}>
                    <div className="text-2xl font-semibold text-slate-950">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm leading-5 text-slate-500">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DashboardPreview />
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 bg-white">
                Bộ công cụ học tập
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Tập trung vào việc cần học hôm nay.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Trang dashboard được thiết kế cho sinh viên cần quản lý nhiều
                môn học, deadline và ưu tiên mà không bị rối.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="border-y border-slate-200 bg-white py-16 sm:py-20"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <Badge variant="outline" className="mb-4">
                Workflow
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Từ mục tiêu lớn đến lịch học có thể làm ngay.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                SmartStudy giúp bạn đi từ ý tưởng ban đầu đến danh sách task có
                deadline, trạng thái và mức ưu tiên rõ ràng.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StepCard
                icon={<Target className="h-5 w-5" />}
                step="01"
                title="Đặt mục tiêu"
                description="Nhập môn học, kỳ thi hoặc kỹ năng bạn muốn hoàn thành."
              />
              <StepCard
                icon={<ListChecks className="h-5 w-5" />}
                step="02"
                title="Chia task"
                description="AI gợi ý các việc nhỏ kèm thời lượng và hạn chót."
              />
              <StepCard
                icon={<CalendarCheck2 className="h-5 w-5" />}
                step="03"
                title="Theo dõi"
                description="Cập nhật Todo, Doing, Done và lọc việc cần xử lý."
              />
            </div>
          </div>
        </section>

        <section id="security" className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
            <div>
              <Badge variant="outline" className="mb-4 bg-white">
                Bảo mật & ổn định
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Mỗi người dùng có không gian học tập riêng.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Hệ thống dùng xác thực tài khoản, lưu task theo từng người dùng
                và giữ giao diện quản trị đủ rõ cho việc học dài hạn.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <TrustItem icon={<LockKeyhole />} text="Đăng nhập bảo vệ dữ liệu cá nhân" />
              <TrustItem icon={<BookOpenCheck />} text="Task gắn với từng lộ trình học" />
              <TrustItem icon={<CheckCircle2 />} text="Trạng thái rõ ràng cho từng công việc" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 SmartStudy Planner.</p>
          <div className="flex gap-4">
            <Link className="hover:text-slate-950" to="/login">
              Đăng nhập
            </Link>
            <Link className="hover:text-slate-950" to="/register">
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const DashboardPreview = () => (
  <div className="relative">
    <div className="rounded-lg border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-900/20">
      <div className="overflow-hidden rounded-md bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Dashboard
          </Badge>
        </div>

        <div className="grid min-h-[430px] lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-50 p-4 lg:block">
            <div className="mb-6 h-8 w-28 rounded bg-slate-200" />
            <div className="space-y-2">
              {["Lộ trình", "Hôm nay", "Thống kê", "Hồ sơ"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`rounded-md px-3 py-2 text-sm ${
                      index === 0
                        ? "bg-slate-950 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </aside>

          <div className="p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-500">Lộ trình tuần này</div>
                <div className="text-2xl font-semibold text-slate-950">
                  8 task đang mở
                </div>
              </div>
              <Button size="sm" className="w-fit">
                <Sparkles className="h-4 w-4" />
                AI tạo kế hoạch
              </Button>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <Metric
                icon={<Clock3 className="h-4 w-4" />}
                label="Hôm nay"
                value="3 task"
                tone="bg-amber-50 text-amber-700"
              />
              <Metric
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Hoàn thành"
                value="68%"
                tone="bg-emerald-50 text-emerald-700"
              />
              <Metric
                icon={<Target className="h-4 w-4" />}
                label="Ưu tiên cao"
                value="2 task"
                tone="bg-red-50 text-red-700"
              />
            </div>

            <div className="space-y-3">
              {previewTasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-950">
                        {task.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{task.subject}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{task.time}</span>
                      </div>
                    </div>
                    <Badge className={task.color}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {task.status}
                    </span>
                    <div className="h-2 w-24 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${
                          task.status === "Hoàn thành"
                            ? "w-full bg-emerald-500"
                            : task.status === "Đang làm"
                              ? "w-2/3 bg-amber-500"
                              : "w-1/3 bg-blue-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) => (
  <Card className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <CardHeader>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-950">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </CardContent>
  </Card>
)

const StepCard = ({
  icon,
  step,
  title,
  description,
}: {
  icon: ReactNode
  step: string
  title: string
  description: string
}) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950 shadow-sm">
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-400">{step}</span>
    </div>
    <h3 className="font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </div>
)

const Metric = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: string
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <div
      className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}
    >
      {icon}
    </div>
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 font-semibold text-slate-950">{value}</div>
  </div>
)

const TrustItem = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-950 [&_svg]:h-5 [&_svg]:w-5">
      {icon}
    </div>
    <span className="text-sm font-medium text-slate-700">{text}</span>
  </div>
)

export default Home
