import { api } from "@/lib/axios";

export const ticketsService = {
  getTickets: async (params?: any) => {
    const response = await api.get("/api/tickets/", { params });
    return response.data;
  },
  getTicket: async (id: string) => {
    const response = await api.get(`/api/tickets/${id}/`);
    return response.data;
  },
  createTicket: async (data: { ticket_type: string; title: string; description: string }) => {
    const response = await api.post("/api/tickets/", data);
    return response.data;
  },
  resolveTicket: async (id: string, data: { resolution_note: string }) => {
    const response = await api.patch(`/api/tickets/${id}/resolve/`, data);
    return response.data;
  },
  reviewTicket: async (id: string) => {
    const response = await api.patch(`/api/tickets/${id}/review/`);
    return response.data;
  },
  getAssignedTickets: async () => {
    const response = await api.get("/api/tickets/assigned/");
    return response.data;
  },
  getMyTickets: async () => {
    const response = await api.get("/api/tickets/mine/");
    return response.data;
  },
};
