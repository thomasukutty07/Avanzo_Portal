import { api } from "@/lib/axios";

export const accountsService = {
  getEmployees: async (params?: any) => {
    const response = await api.get("/api/auth/employees/", { params });
    return response.data;
  },
  getEmployee: async (id: string) => {
    const response = await api.get(`/api/auth/employees/${id}/`);
    return response.data;
  },
  getRoles: async () => {
    const response = await api.get("/api/auth/roles/");
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/api/auth/me/");
    return response.data;
  },
};
