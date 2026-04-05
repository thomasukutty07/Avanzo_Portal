// src/lib/axios.ts
import axios from "axios"
import { DUMMY_ACCESS_TOKEN } from "@/lib/dummyAuth"

// Local backend default. Override with VITE_API_BASE_URL in .env (e.g. team server IP).
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://192.168.220.85:8000"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
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
      const access = localStorage.getItem("access_token")
      if (access === DUMMY_ACCESS_TOKEN) {
        return Promise.reject(error)
      }

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
