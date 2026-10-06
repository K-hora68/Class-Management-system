# Class Management System — Developer Documentation

This documentation pack is the shared source of truth for the Class Management System.

## System scope

The system contains:

- Authentication and role-based access
- Student management
- Lecturer management
- Class/course management
- Timetables
- Learning materials/resources
- Assignments
- Quizzes/exams
- Attendance
- Grades and grade history
- Analytics
- Announcements
- Discussion forums
- Realtime chat rooms
- Notifications
- Administration

## Main user roles

| Role | Main responsibility |
|---|---|
| Student | Attend classes, submit work, view grades, participate in discussions/chat |
| Lecturer | Manage classes, materials, assignments, grades, attendance, announcements |
| Admin | Manage users, classes/courses, roles, permissions and system-level settings |

## Recommended backend stack

- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- WebSockets for realtime chat
- Redis optional for realtime/presence/notification fan-out
- JWT or secure session-based authentication

## Documentation order

1. `01_PRODUCT_REQUIREMENTS.md` — what the system must do
2. `02_ARCHITECTURE.md` — how the system is organized
3. `03_DATABASE_DESIGN.md` — entities and relationships
4. `04_API_CONTRACT.md` — frontend/backend agreement
5. `05_REALTIME_CHAT.md` — chat rooms and WebSocket rules
6. `06_NOTIFICATIONS.md` — notification behavior
7. `07_AUTHORIZATION.md` — roles and permissions
8. `08_FRONTEND_BACKEND_WORKFLOW.md` — how frontend and backend coordinate
9. `09_GIT_TEAM_WORKFLOW.md` — collaboration rules
10. `10_DEFINITION_OF_DONE.md` — when a feature is considered complete

## Golden rule

If implementation and documentation disagree, the team should discuss the difference and update the documentation/API contract before silently changing behavior.
