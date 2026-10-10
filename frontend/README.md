# Campus Frontend Routes

## Chat Routes

| Frontend route | Role | Purpose |
| --- | --- | --- |
| `/workspace/student/chat` | `STUDENT` | Join rooms returned for the student's enrolled classes. |
| `/workspace/lecturer/chat` | `LECTURER` | Join rooms returned for classes the lecturer can access. |

Navigation is filtered by role for usability. The backend must authenticate the user and verify class membership and room access for every HTTP request and WebSocket connection.

## Chat HTTP Contract

The API base defaults to `http://localhost:8000/api/v1`. Set `VITE_API_BASE_URL` to override it.

All API requests use `credentials: "include"`. The backend should set an HttpOnly session cookie on successful login; the frontend does not read or persist session secrets. `GET /auth/me` supplies the authenticated profile and authoritative role. `POST /auth/logout` clears the server session.

For production, session cookies should be `HttpOnly`, `Secure`, and `SameSite=Lax` for same-site deployments. Cross-site deployments need `SameSite=None; Secure`, an explicit allowed frontend origin with credentialed CORS, and CSRF protection for state-changing HTTP requests. Validate the `Origin` on WebSocket upgrades. In local development, open the frontend and API through the same hostname (for example, both on `localhost`) so the browser can send the session cookie.

1. Load the user's classes:
   - Student: `GET /students/me/classes`
   - Lecturer: `GET /classes`
2. For each returned class, load rooms: `GET /classes/{class_id}/chat-rooms`
3. For a selected room, load message history: `GET /chat-rooms/{room_id}/messages`

Successful API responses use the documented `{ "data": ... }` envelope. List data may be an array or `{ "items": [] }`. The API contract does not define room or history item schemas; the frontend reads room `id`/`room_id`, `name`/`title`, and message `id`, `room_id`, `sender.name`, `content`, and `created_at`. Coordinate field changes with the backend team.

Errors use the shared contract shape:

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "The request contains invalid data.",
		"details": {}
	}
}
```

## Chat WebSocket Contract

The socket URL is `ws://<api-host>/ws/chat/{room_id}` or `wss://<api-host>/ws/chat/{room_id}` for HTTPS. Set `VITE_CHAT_WS_BASE_URL` to a WebSocket or HTTP(S) origin when the socket host differs from the REST API host. The client sends messages only when the socket is open.

Frontend to backend:

```json
{
	"type": "message",
	"content": "Has anyone finished the ERD?"
}
```

Backend to frontend:

```json
{
	"type": "message",
	"data": {
		"id": 901,
		"room_id": 12,
		"sender": {
			"id": 44,
			"name": "Kahora"
		},
		"content": "Has anyone finished the ERD?",
		"created_at": "2026-10-06T10:30:00Z"
	}
}
```

The client also handles `message_edited`, `message_deleted`, and `system` events. The requirements list `user_joined`, `user_left`, and typing events, but do not define their payloads, so they are not interpreted yet. The browser sends eligible session cookies during the WebSocket handshake. For cross-origin deployments, configure the cookie for the deployment's site and validate the frontend origin on the backend. Never put a session secret in the WebSocket URL.

The server remains responsible for authentication, room authorization, payload validation, persistence, and broadcasting the saved message ID and timestamp. Client payloads must not contain a trusted sender ID or client-generated message ID.

## Lecturer Capability Map

| Requirement | Frontend route | Documented backend route(s) | Status |
| --- | --- | --- | --- |
| View/manage teaching classes | `/workspace/lecturer/classes` | `GET/POST /classes`, `GET/PATCH/DELETE /classes/{class_id}` | Listing is connected; create/edit/delete request schemas and controls are not specified yet. |
| View enrolled students | `/workspace/lecturer/roster` | `GET /classes/{class_id}/students` | Connected as class roster reads. |
| Create assignments | `/workspace/lecturer/assignments` and overview | `POST /classes/{class_id}/assignments` | Create form sends the example feature request fields. |
| Review submissions | Lecturer overview | `GET /assignments/{assignment_id}/submissions` | Connected as a read-only submission summary. |
| Grade submissions | Lecturer assignments | `PATCH /submissions/{submission_id}/grade` | Route exists, but the request body/response schema is not documented; no guessed write is sent. |
| Manage enrolled students | Lecturer roster | `POST/DELETE /classes/{class_id}/students...` | Request body and enrollment workflow are not documented. |
| Quizzes, attendance, announcements, timetable, resources, analytics | Corresponding lecturer workspace sections | No complete route/payload contracts in `04_API_CONTRACT.md` | Backend contract needs endpoints and schemas before the frontend can implement real reads/writes. |
| Class chat | `/workspace/lecturer/chat` | Class chat HTTP routes and `WS /ws/chat/{room_id}` | Connected using the authenticated cookie session and documented message event. |

The role in the workspace URL only controls navigation. Every route and mutation still requires backend authentication and permission checks; the frontend treats `GET /auth/me` as display state, not authorization enforcement.

## React + Vite
This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
