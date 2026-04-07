// src/lib/axios.ts
import axios from "axios"

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    // Don't send token for auth endpoints
    if (config.url?.includes("/api/auth/login/") || config.url?.includes("/api/auth/refresh/")) {
      return config
    }

    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login/")
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) throw new Error("No refresh token")

        const res = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        })

        const newAccessToken = res.data.access
        localStorage.setItem("access_token", newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)
