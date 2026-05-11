import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/Register"
import DashboardRoute from "@/routes/DashboardRoute"
import ProtectedRoute from "@/routes/ProtectedRoute"
import AdminProtectedRoute from "@/routes/AdminProtectedRoute"
import TasksPage from "@/pages/TasksPage"
import ProfilePage from "@/pages/Profile"
import Status from "@/pages/DashboardOverview"
import AdminLoginPage from "@/pages/AdminLogin"
import AdminUsersPage from "@/pages/AdminUsers"
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          }
        >
          <Route path="tasks" element={<TasksPage />} />
          <Route index  element= {<Status/>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}
