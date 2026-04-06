import { api } from "@/lib/axios";

export const projectsService = {
  getProjects: async () => {
    const response = await api.get("/api/projects/projects/");
    return response.data;
  },
  createProject: async (data: any) => {
    const response = await api.post("/api/projects/projects/", data);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/api/projects/projects/${id}/`);
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
  createTask: async (data: any) => {
    const response = await api.post("/api/projects/tasks/", data);
    return response.data;
  },
  updateTaskProgress: async (id: string, completion_pct: number) => {
    const response = await api.patch(`/api/projects/tasks/${id}/progress/`, { completion_pct });
    return response.data;
  },
  reviewTask: async (id: string, payload: { approved: boolean }) => {
    const response = await api.post(`/api/projects/tasks/${id}/review/`, payload);
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
