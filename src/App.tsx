import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/components/pages/Home.tsx"
import LoginPage from "@/components/pages/Login.tsx"
import RegisterPage from "@/components/pages/Register.tsx"
import Dashboard from "@/components/pages/DashBoard.tsx"
import ProtectedRoute from "@/components/ProtectedRoute.tsx"
import AdminProtectedRoute from "@/components/AdminProtectedRoute.tsx"
import TaskPage from "@/components/pages/DashboardPage.tsx"
import ProfilePage from "@/components/pages/Profile.tsx"
import Status from "@/components/pages/Status.tsx"
import AdminLoginPage from "@/components/pages/AdminLogin.tsx"
import AdminUsersPage from "@/components/pages/AdminUsers.tsx"
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
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="tasks" element={<TaskPage />} />
          <Route index  element= {<Status/>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}
