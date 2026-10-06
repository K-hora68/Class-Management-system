# 06 — Notification System

## Notification architecture

```text
System event
    ↓
Event/service operation
    ↓
Notification service
    ↓
Create notification record
    ↓
Deliver
 ┌───────────────┬────────────────┐
 │               │                │
 ▼               ▼                ▼
Database      WebSocket       Optional email
(in-app)      realtime
```

## Events that can create notifications

| Event | Recipient |
|---|---|
| Assignment created | Students in class |
| Assignment due soon | Students with pending work |
| Assignment graded | Student |
| Quiz created | Students in class |
| Class announcement | Students in class |
| New learning material | Students in class |
| Attendance recorded | Student where appropriate |
| New chat message | Relevant room members, depending on notification policy |

## Notification fields

```json
{
  "id": 500,
  "type": "ASSIGNMENT_CREATED",
  "title": "New assignment",
  "message": "ERD Assignment has been posted.",
  "related_entity_type": "assignment",
  "related_entity_id": 51,
  "is_read": false,
  "created_at": "2026-10-06T10:30:00Z"
}
```

## Read flow

```text
Notification appears
        ↓
Student opens notification
        ↓
Frontend sends:
PATCH /notifications/{id}/read
        ↓
Backend marks is_read = true
```

## Important rule

Notification creation belongs to backend business logic.

The frontend should display notifications; it should not decide whether an event deserves a notification.

## Duplicate prevention

If an operation can be retried, notification creation should be designed so the same event does not accidentally create duplicate notifications.
