import { api } from "@/lib/axios";

export const projectsService = {
  getProjects: async () => {
    const response = await api.get("/api/projects/projects/");
    return response.data;
  },
  getProject: async (id: string) => {
    const response = await api.get(`/api/projects/projects/${id}/`);
    return response.data;
  },
  getTasks: async (params?: any) => {
    const response = await api.get("/api/projects/tasks/", { params });
    return response.data;
  },
  getTask: async (id: string) => {
    const response = await api.get(`/api/projects/tasks/${id}/`);
    return response.data;
  },
  getClients: async () => {
    const response = await api.get("/api/projects/clients/");
    return response.data;
  },
  getServices: async () => {
    const response = await api.get("/api/projects/services/");
    return response.data;
  },
  getAdminVelocity: async () => {
    const response = await api.get("/api/admin/velocity/");
    return response.data;
  },
};
