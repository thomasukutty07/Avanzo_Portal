# Admin Metrics

## GET /api/admin/velocity/

**Description:** Returns "Tasks Completed per Hours Logged" over the last 12 weeks, broken down by department.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

| Name          | Type          | Description                                               |
| ------------- | ------------- | --------------------------------------------------------- |
| department_id | string (uuid) | Filter the velocity metrics by a specific department UUID |

### Request Body

None

---

# Attendance System

## GET /api/attendance/

**Description:** Retrieves personal attendance history for employees. Supports pagination.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

| Name | Type    | Description                                   |
| ---- | ------- | --------------------------------------------- |
| page | integer | A page number within the paginated result set |

### Request Body

None

---

## POST /api/attendance/clock-in/

**Description:** The "Morning Gate" endpoint. Employees must submit structured work items (intent) before starting the day.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

None

### Request Body

```json
{
  "entries": [
    {
      "project": "uuid-of-project",
      "intent_text": "Finish auth PR"
    },
    {
      "custom_label": "Code Reviews",
      "intent_text": "Review 3 PRs"
    }
  ],
  "general_notes": "Team standup at 10am"
}
```

---

## PATCH /api/attendance/clock-out/

**Description:** The "Evening Gate" endpoint. Employees update their morning entries with actual outcomes and progress.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

None

### Request Body

```json
{
  "entries": [
    {
      "entry_id": "uuid",
      "output_text": "Finished the auth middleware PR",
      "outcome": "completed"
    }
  ],
  "general_notes": "Updated sprint board"
}
```

**Outcome Enum:**

* completed
* partial
* blocked
* carried_over
* not_started

---

## GET /api/attendance/pulse/

**Description:** Org-wide attendance status for Admins/CEO. Provides a color-coded overview of who is on-time, late, or missing.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

| Name          | Type          | Description                         |
| ------------- | ------------- | ----------------------------------- |
| department_id | string (uuid) | Filter the pulse view by department |

### Request Body

None

---

# Authentication & User Profile

## POST /api/auth/login/

**Description:** Login endpoint that returns JWT tokens. Role and profile data are embedded in the response to hydrate RoleContext immediately.

### Authentication

None

### Query Parameters

None

### Request Body

```json
{
  "email": "user@avanzo.com",
  "password": "your-password"
}
```

---

## GET /api/auth/me/

**Description:** Retrieves the authenticated user's full profile, including role, department, designation, and team lead details.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

None

### Request Body

None

---

# Projects & Tasks

## PATCH /api/projects/tasks/{id}/progress/

**Description:** Allows an assigned employee to update their task completion percentage. The first update (> 0%) locks the complexity rating.

### Authentication

* JWT required in `Authorization` header

### Path Parameters

| Name | Type          | Description                    |
| ---- | ------------- | ------------------------------ |
| id   | string (uuid) | The UUID of the task to update |

### Request Body

```json
{
  "completion_pct": 75
}
```

---

## GET /api/projects/projects/{id}/progress/

**Description:** Returns a weighted progress breakdown for a project. Used for "Am I on track?" dashboard widgets.

### Authentication

* JWT required in `Authorization` header

### Path Parameters

| Name | Type          | Description             |
| ---- | ------------- | ----------------------- |
| id   | string (uuid) | The UUID of the project |

### Request Body

None

---

# Leave Management

## POST /api/leaves/requests/

**Description:** Allows employees to submit a new leave request.

### Authentication

* JWT required in `Authorization` header

### Query Parameters

None

### Request Body

```json
{
  "leave_type": "sick",
  "start_date": "2026-04-10",
  "end_date": "2026-04-12",
  "is_half_day": false,
  "reason": "Recovery from fever"
}
```

**Leave Type Enum:**

* sick
* casual
* earned
* unpaid

---

## PATCH /api/leaves/requests/{id}/tl_approve/

**Description:** Tier 1 Approval. Allows a Team Lead to approve a leave request.

### Authentication

* JWT required in `Authorization` header

### Path Parameters

| Name | Type          | Description                   |
| ---- | ------------- | ----------------------------- |
| id   | string (uuid) | The UUID of the leave request |

### Request Body

```json
{
  "tl_comment": "Covered by teammates"
}
```

