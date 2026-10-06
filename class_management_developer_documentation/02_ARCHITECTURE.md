# 02 — System Architecture

## High-level architecture

```text
                         ┌─────────────────────┐
                         │      React UI       │
                         │  Student/Lecturer   │
                         │       /Admin        │
                         └──────────┬──────────┘
                                    │
                         HTTP/JSON   │   WebSocket
                                    │
                 ┌──────────────────┴──────────────────┐
                 │             FastAPI                 │
                 │                                     │
                 │  Routers / API endpoints            │
                 │          ↓                          │
                 │  Pydantic schemas                   │
                 │          ↓                          │
                 │  Services / business logic          │
                 │          ↓                          │
                 │  Repositories / data access         │
                 └───────────────┬───────────┬─────────┘
                                 │           │
                                 ▼           ▼
                          ┌───────────┐   ┌───────────┐
                          │PostgreSQL │   │   Redis   │
                          │ Database  │   │ optional  │
                          └───────────┘   └───────────┘
```

## Recommended backend layers

```text
app/
├── main.py
├── core/
│   ├── config.py
│   ├── security.py
│   └── permissions.py
├── database/
│   ├── connection.py
│   └── models/
├── schemas/
├── routers/
├── services/
├── repositories/
├── websocket/
├── notifications/
└── tests/
```

### Router

Receives HTTP requests and returns responses.

### Schema

Defines expected request/response data.

### Service

Contains business rules.

### Repository

Handles database access.

### WebSocket layer

Handles realtime connections and room messaging.

### Notification service

Creates and delivers notifications based on system events.

## Separation rule

Do not put business logic directly into React components.

Do not put large business rules directly inside FastAPI route functions.

Preferred:

```text
router → schema → service → repository → database
```

For realtime:

```text
WebSocket → authentication → room authorization → chat service → persistence/broadcast
```
