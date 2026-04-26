import { api } from "@/lib/axios";
import type { AdminDashboardSummary } from "@/types";

export const analyticsService = {
  getAdminDashboard: async (): Promise<AdminDashboardSummary> => {
    const response = await api.get("/api/analytics/admin/summary/");
    return response.data;
  },
  getDepartmentHealth: async (id: string): Promise<any> => {
    const response = await api.get(`/api/analytics/admin/${id}/health/`);
    return response.data;
  }
};
