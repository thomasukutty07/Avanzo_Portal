// src/context/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api } from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import type { Notification, PaginatedResponse } from "@/types"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Notification>>(
        "/api/notifications/notifications/"
      )
      setNotifications(res.data.results)
    } catch {
      // Silent fail — non-critical
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchNotifications])

  const markAsRead = async (id: string) => {
    await api.patch(`/api/notifications/notifications/${id}/read/`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const markAllRead = async () => {
    await api.patch("/api/notifications/notifications/read-all/")
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllRead, refresh: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider")
  return ctx
}
