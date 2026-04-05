// src/data/mockData.ts
// Mock data for Team Lead Dashboard (Phase 4)

export interface MockTask {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'progress' | 'resolved';
  due: string;
  dept: string;
}

export interface MockProject {
  id: string;
  name: string;
  dept: string;
  progress: number;
  due: string;
  lead: string;
  status: 'active' | 'completed';
}

export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  tasks: { total: number; completed: number; inProgress: number; pending: number };
  status: 'active' | 'inactive';
}

export const cyberTasks: MockTask[] = [
  { id: 'T001', title: 'Firewall rule audit',          assignee: 'Ananya Krishnan', priority: 'high',     status: 'progress', due: '2025-01-18', dept: 'cybersecurity' },
  { id: 'T002', title: 'Penetration test — API layer', assignee: 'Meera Pillai',    priority: 'critical', status: 'open',     due: '2025-01-15', dept: 'cybersecurity' },
  { id: 'T003', title: 'SIEM alert tuning',            assignee: 'Ananya Krishnan', priority: 'medium',   status: 'open',     due: '2025-01-20', dept: 'cybersecurity' },
  { id: 'T004', title: 'VPN certificate renewal',      assignee: 'Ravi Kumar',      priority: 'high',     status: 'resolved', due: '2025-01-12', dept: 'cybersecurity' },
  { id: 'T005', title: 'Patch management cycle Q1',    assignee: 'Meera Pillai',    priority: 'medium',   status: 'progress', due: '2025-01-25', dept: 'cybersecurity' },
];

export const techTasks: MockTask[] = [
  { id: 'TK001', title: 'Cloud Migration Phase 2',    assignee: 'Vikram Iyer',  priority: 'high',   status: 'progress', due: '2025-02-15', dept: 'technical' },
  { id: 'TK002', title: 'CI/CD Pipeline Setup',       assignee: 'Arjun Das',    priority: 'medium', status: 'open',     due: '2025-01-28', dept: 'technical' },
  { id: 'TK003', title: 'API Gateway Refactoring',    assignee: 'Preethi Nair', priority: 'high',   status: 'open',     due: '2025-01-22', dept: 'technical' },
  { id: 'TK004', title: 'Database Optimization',      assignee: 'Vikram Iyer',  priority: 'medium', status: 'resolved', due: '2025-01-10', dept: 'technical' },
  { id: 'TK005', title: 'Load Balancer Configuration',assignee: 'Arjun Das',    priority: 'critical',status: 'progress', due: '2025-01-30', dept: 'technical' },
];

export const projects: MockProject[] = [
  { id: 'P001', name: 'SOC 2 Compliance Audit',  dept: 'Cybersecurity', progress: 65, due: '2025-03-31', lead: 'Suresh Babu',  status: 'active'    },
  { id: 'P002', name: 'Zero Trust Architecture', dept: 'Cybersecurity', progress: 30, due: '2025-06-30', lead: 'Suresh Babu',  status: 'active'    },
  { id: 'P003', name: 'Cloud Migration Phase 2', dept: 'Technical',     progress: 80, due: '2025-02-15', lead: 'Karthik Raja', status: 'active'    },
  { id: 'P004', name: 'Internal Dev Portal',     dept: 'Technical',     progress: 45, due: '2025-04-30', lead: 'Karthik Raja', status: 'active'    },
  { id: 'P005', name: 'API Gateway Upgrade',     dept: 'Technical',     progress: 100,due: '2025-01-10', lead: 'Karthik Raja', status: 'completed' },
];

export const cyberTeamMembers: MockTeamMember[] = [
  {
    id: 'M001', name: 'Ananya Krishnan', role: 'Security Analyst',   email: 'ananya@avanzo.com',
    tasks: { total: 3, completed: 1, inProgress: 1, pending: 1 }, status: 'active',
  },
  {
    id: 'M002', name: 'Meera Pillai',    role: 'SOC Lead',           email: 'meera@avanzo.com',
    tasks: { total: 2, completed: 0, inProgress: 1, pending: 1 }, status: 'active',
  },
  {
    id: 'M003', name: 'Ravi Kumar',      role: 'Threat Analyst',     email: 'ravi@avanzo.com',
    tasks: { total: 1, completed: 1, inProgress: 0, pending: 0 }, status: 'active',
  },
  {
    id: 'M004', name: 'Sneha Thomas',    role: 'Incident Responder', email: 'sneha@avanzo.com',
    tasks: { total: 2, completed: 0, inProgress: 0, pending: 2 }, status: 'active',
  },
];

export const techTeamMembers: MockTeamMember[] = [
  {
    id: 'TM001', name: 'Vikram Iyer',   role: 'Senior Engineer',  email: 'vikram@avanzo.com',
    tasks: { total: 2, completed: 1, inProgress: 1, pending: 0 }, status: 'active',
  },
  {
    id: 'TM002', name: 'Arjun Das',     role: 'DevOps Engineer',  email: 'arjun@avanzo.com',
    tasks: { total: 2, completed: 0, inProgress: 1, pending: 1 }, status: 'inactive',
  },
  {
    id: 'TM003', name: 'Preethi Nair',  role: 'Backend Engineer', email: 'preethi@avanzo.com',
    tasks: { total: 1, completed: 0, inProgress: 0, pending: 1 }, status: 'active',
  },
  {
    id: 'TM004', name: 'Sanjay Menon',  role: 'Frontend Engineer',email: 'sanjay@avanzo.com',
    tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 }, status: 'active',
  },
];

export interface MockIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'progress' | 'resolved';
  reported: string;
  reporter: string;
}

export interface MockVulnerability {
  id: string;
  asset: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'progress' | 'resolved';
}

export interface MockAnnouncement {
  id: number;
  title: string;
  body: string;
  date: string;
}

export const incidents: MockIncident[] = [
  { id: 'INC-001', title: 'Brute force attempt on VPN',      severity: 'critical', status: 'open',     reported: '2025-01-13', reporter: 'Meera Pillai'    },
  { id: 'INC-002', title: 'Suspicious login from unknown IP', severity: 'high',     status: 'progress', reported: '2025-01-12', reporter: 'Ananya Krishnan' },
  { id: 'INC-003', title: 'Phishing email detected',          severity: 'medium',   status: 'resolved', reported: '2025-01-11', reporter: 'Divya Rajan'     },
  { id: 'INC-004', title: 'Malware signature in endpoint',    severity: 'high',     status: 'open',     reported: '2025-01-10', reporter: 'Ananya Krishnan' },
];

export const vulnerabilities: MockVulnerability[] = [
  { id: 'VUL-001', asset: 'Web App Gateway',    cve: 'CVE-2024-1234', severity: 'critical', status: 'open'     },
  { id: 'VUL-002', asset: 'Auth Server',         cve: 'CVE-2024-5678', severity: 'high',     status: 'progress' },
  { id: 'VUL-003', asset: 'DB Backup Agent',     cve: 'CVE-2023-9101', severity: 'medium',   status: 'resolved' },
  { id: 'VUL-004', asset: 'Internal DNS Server', cve: 'CVE-2024-1122', severity: 'high',     status: 'open'     },
];

export const announcements: MockAnnouncement[] = [
  { id: 1, title: 'Mandatory security training — Jan 20', body: 'All employees must complete the phishing awareness module by Jan 20.', date: '2025-01-13' },
  { id: 2, title: 'Office closed Jan 26 — Republic Day',  body: 'The office will be closed on January 26, 2025.',                    date: '2025-01-10' },
  { id: 3, title: 'New VPN policy effective Feb 1',       body: 'Please review the updated VPN usage policy on the intranet.',        date: '2025-01-08' },
];

