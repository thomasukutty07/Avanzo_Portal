import { api } from "@/lib/axios";
import type { EmployeeSkill, Skill } from "@/types";

export const skillsService = {
  getCatalog: async (): Promise<Skill[]> => {
    const response = await api.get("/api/skills/catalog/");
    return response.data;
  },
  getEmployeeSkills: async (employeeId?: string): Promise<EmployeeSkill[]> => {
    const response = await api.get("/api/skills/employees/", {
      params: employeeId ? { employee: employeeId } : {}
    });
    return response.data;
  },
  addEmployeeSkill: async (data: { skill: string; proficiency: number }): Promise<EmployeeSkill> => {
    const response = await api.post("/api/skills/employees/", data);
    return response.data;
  },
  getSkillMatches: async (projectId: string): Promise<any> => {
    const response = await api.get("/api/skills/", {
      params: { project: projectId }
    });
    return response.data;
  }
};
