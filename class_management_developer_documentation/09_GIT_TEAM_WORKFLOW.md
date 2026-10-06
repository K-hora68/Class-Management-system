# 09 — Git Team Workflow

## Branches

Recommended:

```text
main
develop

feature/auth
feature/student-dashboard
feature/classes
feature/assignments
feature/chat
feature/notifications
feature/analytics
feature/admin
```

## Rule

Do not work directly on `main`.

## Feature workflow

```bash
git checkout develop
git pull origin develop

git checkout -b feature/chat
```

Make changes:

```bash
git add .
git commit -m "feat: add class chat rooms"
git push -u origin feature/chat
```

Open a Pull Request into `develop`.

## Commit style

```text
feat: add assignment submission
fix: prevent duplicate attendance records
docs: update API contract
refactor: move grading logic to service
test: add chat authorization tests
```

## Pull request should explain

- What changed
- Why it changed
- API/database changes
- Screenshots if UI changed
- Tests performed
- Any frontend/backend coordination needed

## Shared API changes

If backend changes:

```text
Old:
student_name

New:
student:
  name
```

Do not merge the backend change without notifying the frontend developer and updating the API contract.

## Merge rule

A feature is not complete merely because it works on one developer's machine.

It should be:
- tested
- documented
- reviewed
- integrated
