import { CalendarDays, FilterX, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Dispatch, SetStateAction } from "react"
import {
  priorityLabel,
  sortLabel,
  statusLabel,
  type TasksPageFilters,
} from "@/utils/taskConstants"
import { cn } from "@/utils/utils"

interface TaskToolbarProps {
  filters: TasksPageFilters
  formatDate: (dateString: string) => string
  resetFilters: () => void
  setFilters: Dispatch<SetStateAction<TasksPageFilters>>
}

export function TaskToolbar({
  filters,
  formatDate,
  resetFilters,
  setFilters,
}: TaskToolbarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.isToday ||
    filters.date

  return (
    <div className="border-b border-[#e2dbe8] bg-[#fbfafc] px-5 py-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_180px_180px_160px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5e5966]" />
          <Input
            placeholder="Tìm kiếm tiêu đề nhiệm vụ..."
            className="h-11 rounded-lg border-[#d8cfdd] bg-white pl-10 text-sm shadow-none placeholder:text-[#8a8292] focus-visible:ring-2 focus-visible:ring-[#d8cfdd]/60"
            value={filters.search}
            onChange={(event) =>
              setFilters({
                ...filters,
                search: event.target.value,
                page: 1,
                isToday: false,
                date: "",
              })
            }
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              status: value as TasksPageFilters["status"],
              page: 1,
              isToday: false,
              date: "",
            })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-lg border-[#d8cfdd] bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-[#d8cfdd]/60">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">{statusLabel.pending}</SelectItem>
            <SelectItem value="in progress">
              {statusLabel["in progress"]}
            </SelectItem>
            <SelectItem value="completed">{statusLabel.completed}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              priority: value as TasksPageFilters["priority"],
              page: 1,
              isToday: false,
              date: "",
            })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-lg border-[#d8cfdd] bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-[#d8cfdd]/60">
            <SelectValue placeholder="Độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="low">{priorityLabel.low}</SelectItem>
            <SelectItem value="medium">{priorityLabel.medium}</SelectItem>
            <SelectItem value="high">{priorityLabel.high}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              sort: value as TasksPageFilters["sort"],
              page: 1,
              isToday: false,
              date: "",
            })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-lg border-[#d8cfdd] bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-[#d8cfdd]/60">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{sortLabel.recent}</SelectItem>
            <SelectItem value="deadline">{sortLabel.deadline}</SelectItem>
            <SelectItem value="priority">{sortLabel.priority}</SelectItem>
            <SelectItem value="recommended">{sortLabel.recommended}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant={filters.isToday ? "default" : "outline"}
          className={cn(
            "h-10 justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
            filters.isToday
              ? "border-[#1e1b20] bg-[#1e1b20] text-white hover:bg-[#2d2930]"
              : "border-[#d8cfdd] bg-white text-[#1f1b24] hover:bg-[#f7f4fa]",
          )}
          onClick={() =>
            setFilters({
              ...filters,
              isToday: !filters.isToday,
              date: "",
              page: 1,
            })
          }
        >
          <CalendarDays className="h-4 w-4" />
          Hôm nay
        </Button>

        {filters.date && (
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-lg border-[#d8cfdd] bg-white px-3 text-sm"
            onClick={() => setFilters({ ...filters, date: "", page: 1 })}
          >
            Ngày {formatDate(filters.date)}
            <FilterX className="h-4 w-4" />
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-lg px-3 text-sm text-[#5e5966]"
            onClick={resetFilters}
          >
            <FilterX className="h-4 w-4" />
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  )
}
