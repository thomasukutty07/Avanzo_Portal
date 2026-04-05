import { api } from "@/lib/axios";

export const leavesService = {
  getLeaveRequests: async (params?: any) => {
    const response = await api.get("/api/leaves/requests/", { params });
    return response.data;
  },
  createLeaveRequest: async (data: any) => {
    const response = await api.post("/api/leaves/requests/", data);
    return response.data;
  },
  updateLeaveRequest: async (id: string, data: any) => {
    const response = await api.patch(`/api/leaves/requests/${id}/`, data);
    return response.data;
  },
  tlApprove: async (id: string, data: { tl_comment: string }) => {
    const response = await api.patch(`/api/leaves/requests/${id}/tl_approve/`, data);
    return response.data;
  },
  hrApprove: async (id: string, data: { hr_comment: string }) => {
    const response = await api.patch(`/api/leaves/requests/${id}/hr_approve/`, data);
    return response.data;
  },
  rejectRequest: async (id: string, data: { tl_comment?: string; hr_comment?: string }) => {
    const response = await api.patch(`/api/leaves/requests/${id}/reject/`, data);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get("/api/leaves/requests/history/");
    return response.data;
  },
};
