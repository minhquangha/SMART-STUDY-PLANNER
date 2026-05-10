import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:3000"
})

api.interceptors.request.use((config) => {

  const isAdminRequest = config.url?.startsWith("/admin")
  const token = isAdminRequest
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
