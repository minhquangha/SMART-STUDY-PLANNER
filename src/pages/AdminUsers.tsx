import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import {
  Loader2,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import { useToast } from "@/contexts/toast-context"
import { logout } from "@/services/authService"
import {
  deleteAdminUser,
  getAdminSession,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
  type AdminUsersPagination,
} from "@/services/adminService"

const PAGE_LIMIT = 10

const defaultPagination: AdminUsersPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 1,
}

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "-"
  }

  return new Date(dateString).toLocaleDateString("vi-VN")
}

const formatStudyTime = (minutes = 0) => {
  if (minutes < 60) {
    return `${minutes} phut`
  }

  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] =
    useState<AdminUsersPagination>(defaultPagination)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  const resultRange = useMemo(() => {
    if (pagination.total === 0) {
      return "0"
    }

    const start = (pagination.page - 1) * pagination.limit + 1
    const end = Math.min(pagination.page * pagination.limit, pagination.total)
    return `${start}-${end}`
  }, [pagination])

  const loadUsers = useCallback(async () => {
    setLoading(true)

    try {
      setError(null)
      const data = await getAdminUsers({
        search: search || undefined,
        page,
        limit: PAGE_LIMIT,
      })
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      if (
        isAxiosError(err) &&
        [401, 403].includes(err.response?.status ?? 0)
      ) {
        navigate("/login")
        return
      }

      console.error("Error fetching admin users:", err)
      setError("Khong the tai danh sach user.")
    } finally {
      setLoading(false)
    }
  }, [navigate, page, search])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  useEffect(() => {
    let isMounted = true

    getAdminSession()
      .then((session) => {
        if (isMounted) {
          setCurrentAdminId(session.user.userId)
        }
      })
      .catch((err) => {
        if (isAxiosError(err) && [401, 403].includes(err.response?.status ?? 0)) {
          navigate("/login")
        }
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (user._id === currentAdminId) {
      toast({
        title: "Khong the xoa tai khoan hien tai",
        description: "Admin khong duoc tu xoa chinh minh.",
        variant: "error",
      })
      return
    }

    const displayName = user.name?.trim() || user.email
    const confirmed = window.confirm(
      `Xoa user "${displayName}" va tat ca task lien quan?`
    )

    if (!confirmed) {
      return
    }

    setDeletingId(user._id)

    try {
      const result = await deleteAdminUser(user._id)
      toast({
        title: "Da xoa user",
        description: `Da xoa ${result.deletedTaskCount} task lien quan.`,
        variant: "success",
      })

      if (users.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await loadUsers()
      }
    } catch (err) {
      console.error("Error deleting admin user:", err)
      toast({
        title: "Khong the xoa user",
        description: "Vui long thu lai sau.",
        variant: "error",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleRole = async (user: AdminUser) => {
    const nextRole = user.role === "admin" ? "user" : "admin"

    if (user._id === currentAdminId && nextRole !== "admin") {
      toast({
        title: "Khong the ha quyen chinh minh",
        description: "Admin hien tai phai giu role admin.",
        variant: "error",
      })
      return
    }

    setUpdatingRoleId(user._id)

    try {
      const updatedUser = await updateAdminUserRole(user._id, nextRole)
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === updatedUser._id
            ? { ...currentUser, role: updatedUser.role }
            : currentUser
        )
      )
      toast({
        title: "Da cap nhat role",
        description: `${user.email} hien la ${nextRole}.`,
        variant: "success",
      })
    } catch (err) {
      console.error("Error updating user role:", err)
      toast({
        title: "Khong the cap nhat role",
        description: "Vui long thu lai sau.",
        variant: "error",
      })
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handleLogout = async () => {
    await logout().catch((error) => {
      console.error("Admin logout failed:", error)
    })
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Smart Study Admin
              </p>
              <h1 className="truncate text-xl font-semibold tracking-tight">
                Quan ly user
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            Dang xuat
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Danh sach nguoi dung
            </h2>
            <p className="mt-1 text-muted-foreground">
              Xem, tim kiem va xoa user trong he thong.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {pagination.total} user
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <form
              className="flex w-full flex-col gap-2 sm:flex-row md:max-w-xl"
              onSubmit={handleSearchSubmit}
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Tim theo ten hoac email..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Tim
              </Button>
              {(search || searchInput) && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Xoa loc
                </Button>
              )}
            </form>

            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => void loadUsers()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Tai lai
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadUsers()}
            >
              Thu lai
            </Button>
          </div>
        )}

        <div className="overflow-hidden rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Study time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Thao tac</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Dang tai danh sach user...
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex min-w-[240px] items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                          {(user.name?.[0] || user.email[0] || "U").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {user.name || "Chua co ten"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.taskCount}</TableCell>
                    <TableCell>{user.streak ?? 0} ngay</TableCell>
                    <TableCell>
                      {formatStudyTime(user.totalStudyTime ?? 0)}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title={
                            user.role === "admin"
                              ? "Chuyen thanh user"
                              : "Chuyen thanh admin"
                          }
                          disabled={
                            updatingRoleId === user._id ||
                            (user._id === currentAdminId &&
                              user.role === "admin")
                          }
                          onClick={() => void handleToggleRole(user)}
                        >
                          {updatingRoleId === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCog className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          title="Xoa user"
                          disabled={
                            deletingId === user._id || user._id === currentAdminId
                          }
                          onClick={() => void handleDeleteUser(user)}
                        >
                          {deletingId === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Khong tim thay user nao.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Hien thi {resultRange} / {pagination.total} user
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page <= 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Truoc
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
