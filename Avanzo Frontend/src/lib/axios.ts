// src/lib/axios.ts
import axios from "axios"
import { jwtDecode } from "jwt-decode"

// ── Helpers ──────────────────────────────────────────────────────────────────

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000"
}

/** Returns true if the token's `exp` claim is in the past (with 30s leeway). */
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return Date.now() >= (exp - 30) * 1000
  } catch {
    return true // Malformed → treat as expired
  }
}

/** Generates a short random request ID for server-side log correlation. */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ── Axios instance ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  // Timeout after 30 seconds — prevents hung requests from blocking the UI
  // and stops slow-loris style server attacks from tying up the browser.
  timeout: 30_000,
  // Never send cookies cross-origin (API is same-origin; prevents CSRF via XHR)
  withCredentials: false,
})

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    // Add a unique request ID to every outbound request.
    // The backend logs this in its error responses for easier debugging.
    config.headers["X-Request-ID"] = generateRequestId()

    // Skip auth header for public endpoints
    const isAuthEndpoint =
      config.url?.includes("/api/auth/login/") ||
      config.url?.includes("/api/auth/refresh/") ||
      config.url?.includes("/api/auth/register/")

    if (isAuthEndpoint) return config

    const token = localStorage.getItem("access_token")
    if (!token) return config

    // ✅ SECURITY: Proactively refresh if the token is about to expire.
    // This avoids sending an already-expired token and getting a 401 back.
    if (isTokenExpired(token)) {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const res = await axios.post(`${getBaseUrl()}/api/auth/refresh/`, {
            refresh: refreshToken,
          })
          const newAccessToken = res.data.access
          localStorage.setItem("access_token", newAccessToken)
          config.headers.Authorization = `Bearer ${newAccessToken}`
          return config
        } catch {
          // Refresh failed → clear tokens and redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
          return Promise.reject(new Error("Session expired"))
        }
      } else {
        // Refresh token also expired → force logout
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(new Error("Session expired"))
      }
    }

    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // ── 401 → try silent token refresh once ──────────────────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login/")
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken || isTokenExpired(refreshToken)) {
          throw new Error("Refresh token expired")
        }

        const res = await axios.post(`${getBaseUrl()}/api/auth/refresh/`, {
          refresh: refreshToken,
        })

        const newAccessToken = res.data.access
        localStorage.setItem("access_token", newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch {
        // Refresh failed → force logout
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(new Error("Session expired"))
      }
    }

    // ✅ SECURITY: Never log raw error objects which may contain sensitive
    // request/response data (auth headers, payloads). Only log safe fields.
    if (import.meta.env.DEV) {
      console.warn(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status}`
      )
    }

    return Promise.reject(error)
  }
)

