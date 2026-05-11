import { Loader2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { GeneratedTaskDraft } from "@/services/taskService"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import {
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from "@/utils/taskConstants"
import type { AiTaskFormData } from "@/utils/taskConstants"

interface AiTaskDialogProps {
  aiDrafts: GeneratedTaskDraft[]
  aiError: string | null
  aiFormData: AiTaskFormData
  formatDate: (dateString: string) => string
  handleGenerateTasks: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSaveGeneratedTasks: () => Promise<void>
  isGeneratingTasks: boolean
  isOpen: boolean
  isSavingDrafts: boolean
  selectedDraftIndexes: number[]
  setAiFormData: Dispatch<SetStateAction<AiTaskFormData>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
  toggleDraftSelection: (index: number) => void
  updateAiDraft: (index: number, patch: Partial<GeneratedTaskDraft>) => void
}

export function AiTaskDialog({
  aiDrafts,
  aiError,
  aiFormData,
  formatDate,
  handleGenerateTasks,
  handleSaveGeneratedTasks,
  isGeneratingTasks,
  isOpen,
  isSavingDrafts,
  selectedDraftIndexes,
  setAiFormData,
  setIsOpen,
  toggleDraftSelection,
  updateAiDraft,
}: AiTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI tạo kế hoạch học tập</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGenerateTasks} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Mục tiêu học tập</Label>
            <Textarea
              id="ai-prompt"
              required
              rows={4}
              value={aiFormData.prompt}
              onChange={(event) =>
                setAiFormData({ ...aiFormData, prompt: event.target.value })
              }
              placeholder="VD: Tôi muốn ôn thi JavaScript trong 2 tuần, tập trung vào async, DOM và React cơ bản."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-target-date">Hạn hoàn thành</Label>
              <Input
                id="ai-target-date"
                type="date"
                value={aiFormData.targetDate}
                onChange={(event) =>
                  setAiFormData({
                    ...aiFormData,
                    targetDate: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-daily-minutes">Phút học mỗi ngày</Label>
              <Input
                id="ai-daily-minutes"
                type="number"
                min={15}
                step={15}
                value={aiFormData.dailyMinutes}
                onChange={(event) =>
                  setAiFormData({
                    ...aiFormData,
                    dailyMinutes: event.target.value,
                  })
                }
                placeholder="60"
              />
            </div>
          </div>

          {aiError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {aiError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isGeneratingTasks}
            className="w-full gap-2"
          >
            {isGeneratingTasks ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Tạo bản nháp
          </Button>
        </form>

        {aiDrafts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Task AI đề xuất</h3>
              <p className="text-xs text-muted-foreground">
                Đã chọn {selectedDraftIndexes.length}/{aiDrafts.length}
              </p>
            </div>

            <div className="space-y-3">
              {aiDrafts.map((draft, index) => (
                <div key={index} className="rounded-md border bg-white p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-2"
                      checked={selectedDraftIndexes.includes(index)}
                      onCheckedChange={() => toggleDraftSelection(index)}
                    />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`ai-title-${index}`}>Tiêu đề</Label>
                        <Input
                          id={`ai-title-${index}`}
                          value={draft.title}
                          onChange={(event) =>
                            updateAiDraft(index, { title: event.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ai-description-${index}`}>
                          Mô tả
                        </Label>
                        <Textarea
                          id={`ai-description-${index}`}
                          rows={2}
                          value={draft.description}
                          onChange={(event) =>
                            updateAiDraft(index, {
                              description: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Độ ưu tiên</Label>
                          <Select
                            value={draft.priority}
                            onValueChange={(value) =>
                              updateAiDraft(index, {
                                priority:
                                  value as GeneratedTaskDraft["priority"],
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

                        <div className="space-y-2">
                          <Label htmlFor={`ai-due-date-${index}`}>
                            Hạn chót
                          </Label>
                          <Input
                            id={`ai-due-date-${index}`}
                            type="date"
                            value={draft.dueDate}
                            onChange={(event) =>
                              updateAiDraft(index, {
                                dueDate: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={`${priorityColor[draft.priority]} border-none shadow-none`}
                        >
                          {priorityLabel[draft.priority]}
                        </Badge>
                        <Badge
                          className={`${statusColor[draft.status]} border-none shadow-none`}
                        >
                          {statusLabel[draft.status]}
                        </Badge>
                        {draft.dueDate && (
                          <Badge variant="outline">
                            {formatDate(draft.dueDate)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={aiDrafts.length === 0 || isSavingDrafts}
            onClick={() => {
              void handleSaveGeneratedTasks()
            }}
            className="gap-2"
          >
            {isSavingDrafts && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu task đã chọn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
