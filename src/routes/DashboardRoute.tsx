import DashboardLayout from "@/components/layout/DashboardLayout"
import { NotificationProvider } from "@/contexts/notification-provider"
import { Outlet } from "react-router-dom"

export default function DashboardRoute() {
  return (
    <NotificationProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </NotificationProvider>
  )
}
