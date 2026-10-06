# 11 — Example Feature Specification: Assignment Creation

This demonstrates how a team should document a feature before implementation.

## Feature

Lecturer creates an assignment for a class.

## Actor

LECTURER

## Preconditions

- Lecturer is authenticated.
- Lecturer teaches the class.
- Class exists and is active.

## Request

```http
POST /api/v1/classes/{class_id}/assignments
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "ERD Assignment",
  "description": "Design an ER diagram for the library system.",
  "due_at": "2026-10-20T23:59:00Z",
  "max_score": 20
}
```

## Backend processing

```text
HTTP request
    ↓
Authenticate
    ↓
Check lecturer role
    ↓
Check lecturer teaches class
    ↓
Validate Pydantic schema
    ↓
Create assignment
    ↓
Create notifications for enrolled students
    ↓
Commit transaction
    ↓
Return response
```

## Response

```http
201 Created
```

```json
{
  "data": {
    "id": 51,
    "class_id": 15,
    "title": "ERD Assignment",
    "description": "Design an ER diagram for the library system.",
    "due_at": "2026-10-20T23:59:00Z",
    "max_score": 20,
    "created_at": "2026-10-06T10:30:00Z"
  }
}
```

## Errors

```text
401 — not authenticated
403 — lecturer does not have permission
404 — class does not exist
422 — invalid request data
409 — conflicting assignment state
```

## Side effects

After successful creation:

```text
Assignment created
       ↓
Notification records created
       ↓
Students see new notifications
```

## Frontend responsibility

The frontend:
- sends the documented request
- displays validation errors
- displays success
- refreshes/updates assignment list
- displays resulting notifications

The frontend does not:
- assign grades
- decide whether the lecturer owns the class
- directly write to PostgreSQL
- determine authorization

## Backend responsibility

The backend:
- validates data
- authenticates
- authorizes
- persists the assignment
- creates notifications
- returns the documented response
