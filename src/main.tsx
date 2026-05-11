import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./styles/index.css"
import { App } from "@/App"
import { ThemeProvider } from "@/contexts/theme-provider"
import { ToastProvider } from "@/contexts/toast"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
)
