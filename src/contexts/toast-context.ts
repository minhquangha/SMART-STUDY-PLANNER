import { createContext, useContext } from "react"

export type ToastVariant = "success" | "error"

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

export type ToastItem = ToastInput & {
  id: number
  variant: ToastVariant
}

export type ToastContextValue = {
  toast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return context
}
