# 05 — Realtime Chat

## Purpose

Chat provides realtime communication inside authorized class rooms.

## Connection flow

```text
React
  │
  │ WebSocket connection
  ▼
FastAPI WebSocket endpoint
  │
  ├── Authenticate user
  │
  ├── Check room membership
  │
  ├── Accept connection
  │
  ▼
Chat room manager
  │
  ├── Persist message
  │
  └── Broadcast message
       │
       ├── Student A
       ├── Student B
       └── Lecturer
```

## WebSocket endpoint

```text
/ws/chat/{room_id}
```

## Client → server message

```json
{
  "type": "message",
  "content": "Has anyone finished the ERD?"
}
```

## Server → clients

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

## Other event types

```text
message
message_edited
message_deleted
user_joined
user_left
typing_started
typing_stopped
system
```

Typing/presence events do not necessarily need database persistence.

## Authorization

Being able to guess a room ID must never be enough to enter a room.

Backend checks:

```text
authenticated user
        ↓
room exists?
        ↓
user authorized?
        ↓
accept WebSocket
```

## Message persistence

Recommended sequence:

```text
Receive message
     ↓
Validate payload
     ↓
Check room membership
     ↓
Save message
     ↓
Broadcast saved message
```

Broadcasting should preferably use the persisted message ID/timestamp rather than trusting client-generated IDs.

## Reconnection

Frontend should reconnect after an unexpected disconnect.

Backend should not assume a WebSocket connection is permanent.

## Scaling

For a single backend process, an in-memory connection manager can work.

For multiple backend instances, use a shared broker such as Redis so messages can reach users connected to different instances.
