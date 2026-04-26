import { api } from "@/lib/axios";
import type { ActivityEvent, PaginatedResponse } from "@/types";

export const activityService = {
  getFeed: async (params?: any): Promise<PaginatedResponse<ActivityEvent>> => {
    const response = await api.get("/api/activity/feed/", { params });
    return response.data;
  },
  getSummary: async (): Promise<any> => {
    const response = await api.get("/api/activity/summary/");
    return response.data;
  },
};
