import { z } from "zod"

// ─── AUTH ──────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// ─── LEAVES ────────────────────────────────────────
export const leaveSchema = z
  .object({
    leave_type: z.enum(["full_day", "half_day"]),
    start_date: z.date({
      message: "Start date is required",
    }),
    end_date: z.date({
      message: "End date is required",
    }),
    reason: z
      .string()
      .min(5, "Reason is too short")
      .max(500, "Reason is too long"),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date cannot be earlier than start date",
    path: ["end_date"],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type LeaveFormValues = z.infer<typeof leaveSchema>
