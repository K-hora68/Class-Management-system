# 08 — Frontend ↔ Backend Team Workflow

## Before coding a feature

Example: Create Assignment

Frontend and backend agree on:

```text
Feature: Create Assignment

Endpoint:
POST /api/v1/classes/{class_id}/assignments

Authentication:
Required

Role:
LECTURER

Request:
{
  "title": string,
  "description": string,
  "due_at": ISO datetime,
  "max_score": number
}

Success:
201 Created

Response:
{
  "data": {...}
}

Errors:
401 UNAUTHORIZED
403 FORBIDDEN
404 CLASS_NOT_FOUND
422 VALIDATION_ERROR
```

Only after agreeing should both teams implement.

## Seeing frontend data on the backend

During development:

```python
@router.post("/assignments")
async def create_assignment(data: AssignmentCreate):
    print(data.model_dump())
```

Prefer structured logging for a real application:

```python
logger.info(
    "Assignment creation request",
    extra={"class_id": class_id}
)
```

Do not log passwords, access tokens, or sensitive personal information.

## Frontend debugging

Browser DevTools:

```text
F12
 ↓
Network
 ↓
Select request
 ↓
Headers
Request Payload
Response
```

This allows frontend engineers to confirm exactly what they sent and what the backend returned.

## Backend debugging

Backend engineers can inspect:

```text
VS Code debugger
Server logs
FastAPI Swagger UI
Database records
Automated tests
```

## Feature communication template

Every feature should answer:

1. What does it do?
2. Who can use it?
3. Which endpoint(s) are involved?
4. What request data is required?
5. What response is returned?
6. What errors are possible?
7. What database changes occur?
8. Does it create notifications?
9. Does it require WebSocket/realtime behavior?
10. What tests are required?

## Never do this

Frontend:

```text
I assumed the backend returns `username`.
```

Backend:

```text
I assumed the frontend sends `student_id`.
```

Instead, document the contract.
