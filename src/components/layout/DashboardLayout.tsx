import React, { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Hàm tiện ích của shadcn
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "#", active: false },
  { icon: CheckSquare, label: "Nhiệm vụ", href: "#", active: true },
  { icon: Calendar, label: "Lịch học", href: "#", active: false },
  { icon: BarChart3, label: "Thống kê", href: "#", active: false },
  { icon: Settings, label: "Cài đặt", href: "#", active: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const handleLogut = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap">
                Smart Study
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </a>
            ))}
          </nav>

          {/* User Profile / Logout Section */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={cn("w-full flex items-center gap-3 justify-start text-destructive hover:text-destructive hover:bg-red-50",
              !isSidebarOpen && "justify-center px-0")}
              onClick={()=>handleLogut()}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar for Mobile */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Lê Văn A</p>
              <p className="text-xs text-muted-foreground">Sinh viên</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200 border flex items-center justify-center font-bold text-slate-600">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}