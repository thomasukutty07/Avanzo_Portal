import { api } from "@/lib/axios";

export const notificationsService = {
  getNotifications: async () => {
    const response = await api.get("/api/notifications/notifications/");
    return response.data;
  },
  getBroadcasts: async () => {
    const response = await api.get("/api/notifications/broadcasts/");
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/api/notifications/notifications/${id}/read/`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.patch("/api/notifications/notifications/read-all/");
    return response.data;
  },
  createBroadcast: async (data: { severity: string; target_scope: string; department?: string; title: string; message: string }) => {
    const response = await api.post("/api/notifications/broadcasts/", data);
    return response.data;
  },
  acknowledgeBroadcast: async (id: string) => {
    const response = await api.post(`/api/notifications/broadcasts/${id}/acknowledge/`);
    return response.data;
  },
  getBroadcastStats: async (id: string) => {
    const response = await api.get(`/api/notifications/broadcasts/${id}/stats/`);
    return response.data;
  },
};
