import { z } from "zod"

// ─── Shared sanitization ───────────────────────────────────────────────────
// Strips HTML tags and trims whitespace to prevent stored XSS.
// Applied to every user-supplied text field before validation.
const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, "").trim()

/**
 * A reusable Zod transform that strips HTML from any string field.
 * Use `.pipe(sanitized)` on any z.string() field.
 *
 * Example:
 *   z.string().pipe(sanitized)
 */
export const sanitized = z.string().transform(stripHtml)

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  // Email: use proper email format validation, not just min-length.
  // Prevents username-enumeration via obviously invalid inputs and
  // rejects HTML injection in the username field.
  email: z
    .string()
    .min(5, "Email is required")
    .max(254, "Email address is too long")     // RFC 5321 limit
    .email("Enter a valid email address")
    .transform(stripHtml),

  // Password: enforce a realistic min-length matching the backend validator.
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password is too long"),          // Prevents bcrypt DoS (long inputs)
})

// ─── LEAVES ────────────────────────────────────────────────────────────────
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
      .max(500, "Reason is too long")
      .transform(stripHtml),   // Strip any HTML from the reason field
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date cannot be earlier than start date",
    path: ["end_date"],
  })

// ─── GENERAL TEXT FIELD HELPERS ────────────────────────────────────────────
// Use these for any free-text input across the app.

/** Short single-line text (e.g. names, titles). Max 255 chars. */
export const safeShortText = (label = "Field") =>
  z
    .string()
    .min(1, `${label} is required`)
    .max(255, `${label} is too long`)
    .transform(stripHtml)

/** Long text (e.g. descriptions, comments). Max 2000 chars. */
export const safeLongText = (label = "Field") =>
  z
    .string()
    .max(2000, `${label} must be under 2000 characters`)
    .transform(stripHtml)

export type LoginFormValues = z.infer<typeof loginSchema>
export type LeaveFormValues = z.infer<typeof leaveSchema>
