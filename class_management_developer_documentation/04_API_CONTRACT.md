# 04 — API Contract

This document is the agreement between frontend and backend developers.

The frontend must not guess endpoint names, request fields, response fields, or error formats.

## Base URL

Development example:

```text
http://localhost:8000/api/v1
```

Production URL is environment-specific.

## Authentication

```http
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

## Students

```http
GET    /students/me
GET    /students/me/classes
GET    /students/me/grades
GET    /students/me/attendance
```

## Classes

```http
GET    /classes
POST   /classes
GET    /classes/{class_id}
PATCH  /classes/{class_id}
DELETE /classes/{class_id}

POST   /classes/{class_id}/students
DELETE /classes/{class_id}/students/{student_id}
GET    /classes/{class_id}/students
```

## Assignments

```http
GET    /classes/{class_id}/assignments
POST   /classes/{class_id}/assignments
GET    /assignments/{assignment_id}

POST   /assignments/{assignment_id}/submissions
GET    /assignments/{assignment_id}/submissions
PATCH  /submissions/{submission_id}/grade
```

## Chat

```http
GET /classes/{class_id}/chat-rooms
POST /classes/{class_id}/chat-rooms
GET /chat-rooms/{room_id}/messages
```

Realtime:

```text
WS /ws/chat/{room_id}
```

## Notifications

```http
GET   /notifications
PATCH /notifications/{notification_id}/read
PATCH /notifications/read-all
```

## Standard success response

Example:

```json
{
  "data": {
    "id": 123,
    "title": "Database Assignment"
  }
}
```

For lists:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 45
  }
}
```

## Standard error response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": {
      "due_at": ["Invalid date."]
    }
  }
}
```

Frontend developers should depend on documented error codes, not fragile error-message strings.

## Request example

```http
POST /api/v1/classes/15/assignments
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "title": "ERD Assignment",
  "description": "Design an ER diagram.",
  "due_at": "2026-10-20T23:59:00Z",
  "max_score": 20
}
```

Backend response:

```json
{
  "data": {
    "id": 51,
    "class_id": 15,
    "title": "ERD Assignment",
    "max_score": 20,
    "due_at": "2026-10-20T23:59:00Z"
  }
}
```

## Contract rule

Before changing a request/response field:

1. Tell the team.
2. Update this contract.
3. Update backend schema.
4. Update frontend API call.
5. Update tests.
