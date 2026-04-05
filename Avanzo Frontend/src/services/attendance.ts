import { api } from "@/lib/axios";

export const attendanceService = {
  getAttendance: async (params?: any) => {
    const response = await api.get("/api/attendance/", { params });
    return response.data;
  },
  getToday: async () => {
    const response = await api.get("/api/attendance/today/");
    return response.data;
  },
  clockIn: async (data: { entries: any[]; general_notes?: string }) => {
    const response = await api.post("/api/attendance/clock-in/", data);
    return response.data;
  },
  clockOut: async (data: { entries: any[]; general_notes?: string }) => {
    const response = await api.patch("/api/attendance/clock-out/", data);
    return response.data;
  },
  getTeamFeed: async () => {
    const response = await api.get("/api/attendance/team-feed/");
    return response.data;
  },
  getPulse: async (params?: { department_id?: string }) => {
    const response = await api.get("/api/attendance/pulse/", { params });
    return response.data;
  },
  getReports: async (params: { from_date: string; to_date: string; department_id?: string; employee_id?: string; format?: "csv" | "json" }) => {
    const response = await api.get("/api/attendance/reports/", { 
      params,
      responseType: params.format === "csv" ? "blob" : "json"
    });
    return response.data;
  },
};
