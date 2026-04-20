// src/types/index.ts

// ─── Enums ───────────────────────────────────────────────
export type UserRole =
  | "Admin"
  | "HR"
  | "Team Lead"
  | "Employee"
  | "Organization"
export type UserStatus = "active" | "on_leave" | "offboarding"
export type LeaveType = "full_day" | "half_day"
export type LeaveStatus = "pending" | "tl_approved" | "approved" | "rejected"
export type NotificationType = "info" | "warning" | "urgent" | "success"
export type BroadcastSeverity = "info" | "critical"
export type TicketType = "capacity" | "compliance" | "general" | "tech"
export type TicketStatus = "open" | "in_review" | "resolved"

// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string // ← NEW: from /me schema
  /** Display name from list/detail serializers (e.g. EmployeeSerializer.role) */
  role?: UserRole
  role_display?: string
  status: UserStatus
  employee_id?: string | null
  /** FK UUID for PATCH/POST employee forms */
  access_role?: string | null
  department?: string | null // UUID (for write)
  department_name?: string // display name (from read)
  designation?: string | null // UUID (for write)
  designation_name?: string // display name (from read)
  team_lead?: string | null // ← NEW: UUID of manager
  team_lead_name?: string | null // ← NEW: display name
  gender?: string // ← NEW: for profile placeholders
  date_of_joining?: string | null
  self_declared_talents?: number[]
  evaluated_talents?: number[]
}

export interface Role {
  id: string
  name: UserRole
  description?: string // ← NEW: from AccessRole schema
}

// ─── Organization ────────────────────────────────────────
export interface Department {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at?: string // ← NEW: from schema
}

export interface Designation {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at?: string // ← NEW: from schema
}

// ─── Attendance ──────────────────────────────────────────
export interface AttendanceLog {
  id: string
  employee?: string // UUID
  employee_name?: string
  date: string
  morning_intent?: string | null
  clock_in_time?: string | null
  evening_summary?: string | null
  clock_out_time?: string | null
  has_clocked_in: boolean
  has_clocked_out: boolean
}

// ─── Leaves ──────────────────────────────────────────────
export interface LeaveRequest {
  id: string
  employee: string // UUID
  employee_name: string
  leave_type: LeaveType
  leave_type_display?: string // ← NEW: "Full Day" | "Half Day"
  start_date: string
  end_date: string
  reason: string
  status: LeaveStatus // ← FIX: was "hr_approved"/"admin_approved", API uses "approved"
  status_display?: string // ← NEW: human-readable status
  tl_reviewer?: string | null // ← NEW: UUID
  tl_reviewer_name?: string // ← NEW
  hr_reviewer?: string | null // ← NEW: UUID
  hr_reviewer_name?: string // ← NEW
  review_remarks?: string | null // ← NEW
  created_at: string
}

// Payload for creating a leave (POST /api/leaves/requests/)
export interface LeaveApplyPayload {
  leave_type: LeaveType
  start_date: string
  end_date: string
  reason: string
}

// ─── Notifications ───────────────────────────────────────
export interface Notification {
  id: string
  title: string
  message: string
  notification_type: NotificationType
  action_url?: string | null
  is_read: boolean
  created_at: string
}

// ─── Broadcasts ──────────────────────────────────────────
export interface Broadcast {
  id: string
  severity: BroadcastSeverity
  target_scope: "org_wide" | "department"
  department?: string | null
  department_name?: string
  title: string
  message: string
  created_by: string
  created_by_name: string
  is_active: boolean
  is_acknowledged: boolean
  created_at: string
}

// ─── Ticketing ───────────────────────────────────────────
export interface Ticket {
  id: string
  ticket_type: TicketType
  ticket_type_display: string
  created_by: string
  created_by_name: string
  assigned_to?: string | null
  assigned_to_name?: string | null
  title: string
  description: string
  status: TicketStatus
  status_display: string
  resolution_note?: string | null
  resolved_by?: string | null
  resolved_by_name?: string | null
  resolved_at?: string | null
  created_at: string
}

// ─── Pagination (all list endpoints return this) ─────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
