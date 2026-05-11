import React, { useState } from "react"
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  FileText,
  Grid2X2,
  HelpCircle,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  Trash2,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/contexts/notification-context"
import { logout } from "@/services/authService"
import type { StudyNotification } from "@/services/notificationService"
import { getProfile, type UserProfile } from "@/services/profileService"
import { cn } from "@/utils/utils"

const menuItems = [
  { icon: Grid2X2, label: "Dashboard", to: "/dashboard", end: true },
  { icon: ClipboardList, label: "Tasks", to: "tasks" },
  { icon: CalendarDays, label: "Calendar", to: "calendar" },
  { icon: BarChart3, label: "Progress", to: "stats" },
  { icon: Settings, label: "Settings", to: "settings" },
]

const formatNotificationTime = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getAvatarUrl = (avatar?: UserProfile["avatar"]) => {
  if (!avatar) {
    return ""
  }

  if (typeof avatar === "string") {
    return avatar.trim()
  }

  return avatar.url?.trim() ?? ""
}

const getProfileDisplayName = (profile: UserProfile | null) => {
  const name = profile?.name?.trim()
  if (name) {
    return name
  }

  const emailName = profile?.email?.split("@")[0]?.trim()
  if (emailName) {
    return emailName
  }

  return "Hà Minh Quang"
}

const getProfileInitials = (profile: UserProfile | null) => {
  const parts = getProfileDisplayName(profile)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  return parts.map((part) => part[0]).join("").toUpperCase() || "H"
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications()
  const [isSidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }

    return window.innerWidth >= 1024
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  React.useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const response = await getProfile()
        if (isMounted) {
          setProfile(response.data)
        }
      } catch (error) {
        console.error("Error loading header profile:", error)
        if (isMounted) {
          setProfile(null)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const profileDisplayName = getProfileDisplayName(profile)
  const profileInitials = getProfileInitials(profile)
  const profileAvatarUrl = getAvatarUrl(profile?.avatar)

  const handleLogout = async () => {
    await logout().catch((error) => {
      console.error("Error logging out:", error)
    })
    navigate("/")
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedSearch = searchTerm.trim()
    if (!trimmedSearch) {
      return
    }

    navigate(`/dashboard/tasks?search=${encodeURIComponent(trimmedSearch)}`)
  }

  const handleStartStudySession = () => {
    navigate("/dashboard/tasks?create=1")
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleNotificationClick = async (notification: StudyNotification) => {
    if (!notification.readAt) {
      await markAsRead(notification._id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleDeleteNotification = async (
    event: React.MouseEvent<HTMLButtonElement>,
    notificationId: string,
  ) => {
    event.stopPropagation()
    await removeNotification(notificationId)
  }

  return (
    <div className="flex min-h-screen bg-[#f7f5f8] text-[#1f1b24]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#ded6e6] bg-[#fbf9fc] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-[92px]",
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-center gap-3 px-4">
            <BookOpen className="h-7 w-7 stroke-[2.3]" />
            {isSidebarOpen && (
              <div className="leading-none">
                <p className="text-xl font-bold tracking-tight">
                  Smart Study
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em]">
                  Planner
                </p>
              </div>
            )}
          </div>

          <nav className="mt-10 flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    cn(
                      "flex h-12 items-center gap-3 rounded-lg px-4 text-base transition-colors",
                      isActive
                        ? "bg-[#1e1b20] font-bold text-white shadow-sm"
                        : "text-[#302b35] hover:bg-[#f0eaf5]",
                      !isSidebarOpen && "justify-center px-0",
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className="space-y-5">
            <div className="border-t border-[#ded6e6] pt-4">
              <Button
                type="button"
                className={cn(
                  "h-16 w-full rounded-lg bg-[#1e1b20] text-sm font-semibold leading-5 text-white shadow-none hover:bg-[#2d2930]",
                  !isSidebarOpen && "h-12 px-0",
                )}
                onClick={handleStartStudySession}
              >
                <PlusCircle className="h-5 w-5" />
                {isSidebarOpen && (
                  <span className="whitespace-normal text-center">
                    Start Study
                    <br />
                    Session
                  </span>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className={cn(
                "h-10 w-full justify-start gap-3 px-4 text-base font-normal text-[#302b35] hover:bg-[#f0eaf5]",
                !isSidebarOpen && "justify-center px-0",
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[#ded6e6] bg-[#fbf9fc] px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen((current) => !current)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <form className="min-w-0 flex-1" onSubmit={handleSearchSubmit}>
            <div className="relative max-w-[720px]">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#51495c]" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm nhiệm vụ, tài liệu..."
                className="h-11 rounded-xl border-[#d8cfdd] bg-white pl-10 text-sm shadow-none placeholder:text-[#8a8292] focus-visible:ring-2 focus-visible:ring-[#d8cfdd]/60"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full text-[#282331] hover:bg-[#efe8f4]"
                  aria-label="Mở thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#fbf7ff] bg-destructive px-1 text-[9px] font-semibold leading-none text-destructive-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
                <div className="flex items-center justify-between gap-3 border-b p-4">
                  <div>
                    <p className="text-sm font-semibold">Thông báo</p>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} chưa đọc
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    disabled={unreadCount === 0}
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Đã đọc
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={cn(
                          "group flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/70",
                          !notification.readAt &&
                            "border-primary/10 bg-primary/5",
                        )}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {!notification.readAt && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                            <p className="truncate text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </button>
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-100 transition hover:bg-background hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Xóa thông báo"
                          onClick={(event) =>
                            handleDeleteNotification(event, notification._id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Chưa có thông báo
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="hidden h-10 w-10 rounded-full text-[#282331] hover:bg-[#efe8f4] sm:inline-flex"
              aria-label="Trợ giúp"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            <div className="hidden h-10 w-px bg-[#ded6e6] sm:block" />

            <button
              type="button"
              className="flex min-w-0 items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-80"
              onClick={() => navigate("/dashboard/profile")}
              aria-label="Xem hồ sơ"
            >
              <div className="hidden min-w-0 text-left lg:block">
                <p className="max-w-44 truncate text-base font-bold">
                  {profileDisplayName}
                </p>
                <p className="text-sm text-[#5e5966]">Học viên xuất sắc</p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ded6e6] bg-white text-sm font-bold text-[#5e5966] shadow-sm">
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt={profileDisplayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="h-5 w-5 text-[#9b94a5]" />
                )}
                {!profileAvatarUrl && (
                  <span className="sr-only">{profileInitials}</span>
                )}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f7f5f8]">
          {children}
        </main>
      </div>
    </div>
  )
}
