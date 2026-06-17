import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const API_URL = import.meta.env.VITE_API_URL;
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const requestUrl = originalRequest?.url ?? ""

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes("/refresh") ||
      requestUrl.includes("/login")
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    await api.post("/refresh")

    return api(originalRequest)
  },
)
