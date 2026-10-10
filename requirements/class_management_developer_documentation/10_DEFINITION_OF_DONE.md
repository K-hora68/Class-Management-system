# 10 — Definition of Done

A feature is considered complete only when the relevant items below are satisfied.

## Backend

- [ ] Route implemented
- [ ] Pydantic request schema implemented
- [ ] Pydantic response schema implemented
- [ ] Authentication checked
- [ ] Authorization checked
- [ ] Business logic placed in service layer
- [ ] Database operations handled correctly
- [ ] Transactions/rollback considered
- [ ] Validation errors handled
- [ ] API contract updated
- [ ] Tests written
- [ ] Sensitive information excluded from logs

## Frontend

- [ ] UI implemented
- [ ] API call matches documented contract
- [ ] Loading state handled
- [ ] Success state handled
- [ ] Validation errors displayed
- [ ] Authentication errors handled
- [ ] Permission errors handled
- [ ] Empty state handled
- [ ] Network/server failure handled

## Chat

- [ ] WebSocket authentication
- [ ] Room authorization
- [ ] Message validation
- [ ] Message persistence
- [ ] Broadcast
- [ ] Reconnection behavior
- [ ] Unauthorized room access tested

## Notifications

- [ ] Event identified
- [ ] Recipient rules defined
- [ ] Notification record created
- [ ] Read/unread state works
- [ ] Duplicate notifications considered
- [ ] Realtime delivery tested where required

## Team

- [ ] Documentation updated
- [ ] Pull request reviewed
- [ ] No unresolved contract disagreement
- [ ] Feature tested with the integrated frontend/backend
