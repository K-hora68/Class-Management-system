# 07 — Roles and Permissions

## Roles

```text
ADMIN
LECTURER
STUDENT
```

## Principle

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to do this?

Both must be handled by the backend.

## Example permission matrix

| Action | Student | Lecturer | Admin |
|---|:---:|:---:|:---:|
| View own profile | ✓ | ✓ | ✓ |
| View enrolled classes | ✓ | ✓ | ✓ |
| Create class | ✗ | ✓* | ✓ |
| Add students to class | ✗ | ✓* | ✓ |
| Create assignment | ✗ | ✓ | ✓ |
| Submit assignment | ✓ | ✗ | ✓* |
| Grade assignment | ✗ | ✓ | ✓ |
| Record attendance | ✗ | ✓ | ✓ |
| Post class announcement | ✗ | ✓ | ✓ |
| Create chat room | ✗ | ✓* | ✓ |
| Send chat message | ✓* | ✓* | ✓ |
| Manage users | ✗ | ✗ | ✓ |

`*` depends on the exact class membership/permission rules.

## Backend authorization example

Conceptually:

```text
Request
  ↓
authenticate_user()
  ↓
get_current_user()
  ↓
require_permission()
  ↓
service operation
```

Never rely on:

```javascript
if (user.role === "admin") {
   // frontend allows button
}
```

The frontend may hide buttons for UX, but the backend must enforce authorization.
