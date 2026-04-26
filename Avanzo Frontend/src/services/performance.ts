import { api } from "@/lib/axios";
import type { LiveScore, PerformanceSnapshot } from "@/types";

export const performanceService = {
  getMyScore: async (): Promise<LiveScore> => {
    const response = await api.get("/api/performance/my-score/");
    return response.data;
  },
  getTeamScores: async (): Promise<PerformanceSnapshot[]> => {
    const response = await api.get("/api/performance/team-scores/");
    return response.data;
  },
  getLeaderboard: async (): Promise<PerformanceSnapshot[]> => {
    const response = await api.get("/api/performance/leaderboard/");
    return response.data;
  },
  getHistory: async (params?: any): Promise<PerformanceSnapshot[]> => {
    const response = await api.get("/api/performance/history/", { params });
    return response.data;
  },
  getConfig: async (): Promise<any> => {
    const response = await api.get("/api/performance/config/");
    return response.data;
  },
  updateConfig: async (data: any): Promise<any> => {
    const response = await api.patch("/api/performance/config/", data);
    return response.data;
  }
};
