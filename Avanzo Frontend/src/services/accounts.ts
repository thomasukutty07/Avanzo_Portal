import { api } from "@/lib/axios";

export const accountsService = {
  registerTenant: async (data: any) => {
    const response = await api.post("/api/auth/register/", data);
    return response.data;
  },
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
  updateProfile: async (data: any) => {
    const response = await api.patch("/api/auth/me/", data);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post("/api/auth/login/", credentials);
    return response.data;
  },
  logout: async (refresh: string) => {
    const response = await api.post("/api/auth/logout/", { refresh });
    return response.data;
  },
};
