# Attendance & Reporting

## GET /api/attendance/reports/

**Description:** Generates an attendance report for a specified date range. Access is restricted to HR and Admin roles.

**Authentication:**

* JWT required in Authorization header

**Query Parameters:**

* `from_date` (string, date, Required): Start date, e.g., `2026-01-01`
* `to_date` (string, date, Required): End date, e.g., `2026-03-30`
* `department_id` (string, uuid): Filter by department
* `employee_id` (string, uuid): Filter to a single employee
* `format` (string, enum): `csv` for download or `json` (default)

**Request Body (JSON):**
None required.

---

## GET /api/attendance/team-feed/

**Description:** The Team Lead's morning view showing today's attendance and intent for all direct reports.

**Authentication:**

* JWT required in Authorization header

**Query Parameters:**
None.

**Request Body (JSON):**
None required.

---

# Leave Approvals (Tiered)

## PATCH /api/leaves/requests/{id}/tl_approve/

**Description:** Tier 1 Approval: Allows a Team Lead to sign off on a request.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "tl_comment": "Covered by the rest of the dev team."
}
```

---

## PATCH /api/leaves/requests/{id}/hr_approve/

**Description:** Tier 2 Approval: HR provides the final system approval for the leave.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "hr_comment": "Processed in payroll."
}
```

---

## PATCH /api/leaves/requests/{id}/reject/

**Description:** Rejection: Can be triggered by either a Team Lead or HR at any stage of the request.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "tl_comment": "Peak season, cannot approve.",
  "hr_comment": ""
}
```

---

# Notifications & Broadcasts

## POST /api/notifications/broadcasts/

**Description:** Allows HR or Admins to create company-wide announcements.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "severity": "critical",
  "target_scope": "department",
  "department": "uuid-here",
  "title": "Office Maintenance",
  "message": "The office will be closed this Friday."
}
```

---

## POST /api/notifications/broadcasts/{id}/acknowledge/

**Description:** Allows an employee to mark a critical broadcast as read/acknowledged.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{}
```

---

# Ticketing System

## POST /api/tickets/

**Description:** Main ticket creation API. Any authenticated user can create a ticket for capacity, compliance, or technical issues.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "ticket_type": "capacity",
  "title": "Backend load issues",
  "description": "API response times are exceeding 2 seconds."
}
```

---

## PATCH /api/tickets/{id}/resolve/

**Description:** Closes the ticket. Requires a resolution note explaining the fix.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**

```json
{
  "resolution_note": "Provisioned additional worker nodes to handle the load."
}
```

---

## GET /api/tickets/assigned/

**Description:** Retrieves a list of tickets specifically assigned to the authenticated user.

**Authentication:**

* JWT required in Authorization header

**Request Body (JSON):**
None required.

