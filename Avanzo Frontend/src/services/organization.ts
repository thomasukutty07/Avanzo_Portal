import { api } from "@/lib/axios";

export const organizationService = {
  getDepartments: async () => {
    const response = await api.get("/api/organization/departments/");
    return response.data;
  },
  getDesignations: async () => {
    const response = await api.get("/api/organization/designations/");
    return response.data;
  },
};
