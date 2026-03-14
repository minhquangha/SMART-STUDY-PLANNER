import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/components/pages/Home.tsx"
import LoginPage from "@/components/pages/Login.tsx"
import RegisterPage from "@/components/pages/Register.tsx"
import Dashboard from "@/components/pages/Dashboard.tsx"
import ProtectedRoute from "@/components/ProtectedRoute.tsx"
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}