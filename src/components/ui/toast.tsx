import { CheckCircle2, CircleX, X } from "lucide-react"
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ToastContext,
  type ToastInput,
  type ToastItem,
  type ToastVariant,
} from "@/components/ui/toast-context.ts"

const variantStyles: Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2
    iconClassName: string
    borderClassName: string
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    borderClassName: "border-l-emerald-500",
  },
  error: {
    icon: CircleX,
    iconClassName: "text-red-600",
    borderClassName: "border-l-red-500",
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  const toast = useCallback(
    ({ title, description, variant = "success" }: ToastInput) => {
      const id = nextId.current++

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          title,
          description,
          variant,
        },
      ])

      window.setTimeout(() => removeToast(id), 3500)
    },
    [removeToast]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      >
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant]
          const Icon = style.icon

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-md border border-l-4 bg-white p-4 text-slate-950 shadow-lg ${style.borderClassName}`}
            >
              <Icon
                aria-hidden="true"
                className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Đóng thông báo"
                className="rounded-sm p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
