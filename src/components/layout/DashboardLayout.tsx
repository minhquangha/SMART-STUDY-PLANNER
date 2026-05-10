import React, { useState } from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  BookOpen,
  Bell,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Hàm tiện ích của shadcn
import { NavLink, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input.tsx"

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "status" },
  { icon: CheckSquare, label: "Nhiệm vụ", to: "tasks" },
  { icon: Calendar, label: "Lịch học", to: "calendar" },
  { icon: BarChart3, label: "Thống kê", to: "stats" },
  { icon: Settings, label: "Cài đặt", to: "settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const handleLogut = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-20"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-lg bg-primary p-2">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold tracking-tight whitespace-nowrap text-slate-800">
                Smart Study
              </span>
            )}
          </div>

          {/* Navigation */}

          <nav className="mt-4 flex-1 space-y-2 px-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout Section */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-3 text-destructive hover:bg-red-50 hover:text-destructive",
                !isSidebarOpen && "justify-center px-0"
              )}
              onClick={() => handleLogut()}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Navbar for Mobile */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-8 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 max-w-xl">
            <Input placeholder="Tìm kiếm..." />
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <div
              className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80 sm:border-l sm:pl-4"
              onClick={() => navigate("/dashboard/profile")}
              title="Xem hồ sơ"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">Hồ sơ</p>
                <p className="text-xs text-muted-foreground">Xem chi tiết</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-slate-200 font-bold text-slate-600"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
